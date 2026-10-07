"""Corre el flujo completo para un tema: Investigador -> Redactor -> Revisor -> borrador en disco.

  python flujo.py --tema destinos --simulado    recorre el flujo con respuestas de ejemplo, sin costo y sin Claude
  python flujo.py --tema destinos               corrida real (necesita el SDK y ANTHROPIC_API_KEY; cuesta dinero)

El resultado queda en agentes-sdk/blog/salida/ como borrador. Nada se publica: la aprobación es humana, en el admin.
"""
import argparse
import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(RAIZ / "scripts" / "blog"))  # reglas_revision y los datos del pipeline

import pandas as pd  # noqa: E402

from agentes import investigar, redactar, revisar  # noqa: E402
from cliente import Consultar, Respuesta  # noqa: E402
from config import TOPE_ARTICULO_USD  # noqa: E402
from reglas_revision import revisar_reglas  # noqa: E402

DATOS = RAIZ / "scripts" / "blog" / "data"
SALIDA = Path(__file__).parent / "salida"


class TopeExcedido(RuntimeError):
    pass


def cifras_disponibles(max_filas: int = 5) -> list[dict]:
    """Cifras del último cálculo de indicadores.py, con su cita. Vacío si no se ha corrido."""
    indicadores = json.loads((RAIZ / "scripts" / "blog" / "indicadores.json").read_text(encoding="utf-8"))["indicadores"]
    cifras = []
    for ind in indicadores:
        archivos = sorted(DATOS.glob(f"indicador-{ind['id']}-*.csv"))
        if not archivos:
            continue
        tabla = pd.read_csv(archivos[-1]).head(max_filas)
        for _, f in tabla.iterrows():
            nombre = f[ind["dimension"]] if ind["dimension"] in tabla.columns else f.iloc[1]
            cifras.append({
                "etiqueta": f"{ind['titulo']} ({int(f['anio'])}): {nombre}",
                "valor": f"{int(f['total']):,}".replace(",", "."),
                "cita": ind["cita"],
                "licencia": ind["licencia"],
            })
    return cifras


def tema_del_ranking(tema_id: str) -> dict:
    """Busca el tema en el último ranking del pipeline; si no hay, usa solo el identificador."""
    archivos = sorted(DATOS.glob("temas-*.csv"))
    if archivos:
        tabla = pd.read_csv(archivos[-1])
        fila = tabla[tabla["tema"] == tema_id]
        if not fila.empty:
            return {"tema_id": tema_id, "tema_nombre": fila.iloc[0]["nombre"], "puntaje": float(fila.iloc[0]["puntaje"])}
    return {"tema_id": tema_id, "tema_nombre": tema_id}


def _controlar_tope(gastado: float) -> None:
    if gastado >= TOPE_ARTICULO_USD:
        raise TopeExcedido(f"Se llevan {gastado:.2f} USD y el tope por artículo es {TOPE_ARTICULO_USD:.2f}. Se detiene.")


def generar(tema_id: str, consultar: Consultar, cifras: list[dict] | None = None) -> dict:
    """Corre los tres agentes y las reglas. Devuelve el paquete completo del borrador."""
    cifras = cifras_disponibles() if cifras is None else cifras
    gastado = 0.0

    ficha, r1 = investigar(tema_del_ranking(tema_id), cifras, consultar)
    gastado += r1.costo_usd
    _controlar_tope(gastado)

    borrador, r2 = redactar(ficha, consultar)
    gastado += r2.costo_usd
    _controlar_tope(gastado)

    veredicto, r3 = revisar(ficha, borrador, consultar)
    gastado += r3.costo_usd

    reglas = revisar_reglas(borrador.model_dump(), ficha.model_dump())
    problemas = [p.model_dump() for p in veredicto.problemas] + reglas["problemas"]
    motivos = sorted(set(veredicto.motivos_revision) | set(reglas["motivos_revision"]))
    return {
        "estado": "borrador",
        "aprobado_por_revisor": veredicto.aprobado and not reglas["problemas"],
        "requiere_revision_humana": True,  # siempre: ningún artículo se publica sin que una persona lo apruebe
        "motivos_revision": motivos,
        "problemas": problemas,
        "costo_usd": round(gastado, 4),
        "ficha": ficha.model_dump(),
        "borrador": borrador.model_dump(),
    }


def guardar(paquete: dict) -> Path:
    SALIDA.mkdir(exist_ok=True)
    ruta = SALIDA / f"{paquete['borrador']['slug']}.json"
    ruta.write_text(json.dumps(paquete, ensure_ascii=False, indent=2), encoding="utf-8")
    return ruta


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--tema", required=True, help="id del tema, por ejemplo destinos")
    parser.add_argument("--simulado", action="store_true", help="respuestas de ejemplo: sin costo y sin Claude")
    args = parser.parse_args()

    if args.simulado:
        from simulado import consultar_simulado as consultar
    else:
        from cliente import consultar_sdk as consultar

    paquete = generar(args.tema, consultar)
    ruta = guardar(paquete)
    print(f"Borrador guardado en {ruta}")
    print(f"Costo: {paquete['costo_usd']} USD | Aprobado por el Revisor: {paquete['aprobado_por_revisor']}")
    print(f"Pasa a revisión humana por: {', '.join(paquete['motivos_revision']) or 'norma general'}")
    for p in paquete["problemas"]:
        print(f"  problema [{p['tipo']}] {p['detalle']}")


if __name__ == "__main__":
    main()
