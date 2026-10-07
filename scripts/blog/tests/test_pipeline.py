import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).parent.parent))
from recolectar import filtrar, registro_socrata  # noqa: E402
from pipeline import asignar_tema, cargar_temas, deduplicar, limpiar, normalizar, puntuar  # noqa: E402

EJEMPLO = Path(__file__).parent.parent / "ejemplo" / "registros-ejemplo.csv"
HOY = pd.Timestamp("2026-10-07", tz="UTC")


def datos():
    return pd.read_csv(EJEMPLO)


def test_normalizar_quita_tildes_y_signos():
    assert normalizar("¡Visa de Nómada, Digital!") == "visa de nomada digital"


def test_limpiar_descarta_registros_sin_titulo():
    assert len(datos()) == 6
    assert len(limpiar(datos())) == 5


def test_deduplicar_quita_url_repetida_y_titulo_parecido_exacto():
    unico = deduplicar(limpiar(datos()))
    assert unico["url"].is_unique
    assert len(unico) == 4


def test_asignar_tema():
    temas = cargar_temas()
    assert asignar_tema("Nueva visa de nómada digital", temas) == "visas"
    assert asignar_tema("receta de arepas", temas) is None


def test_puntuar_pone_primero_el_tema_con_mas_fuentes():
    ranking = puntuar(deduplicar(limpiar(datos())), cargar_temas(), hoy=HOY)
    assert ranking.iloc[0]["tema"] == "visas"
    assert ranking.iloc[0]["fuentes"] == 2
    assert ranking["puntaje"].is_monotonic_decreasing


def test_puntuar_sin_datos_devuelve_tabla_vacia():
    vacio = limpiar(pd.DataFrame(columns=["fuente", "titulo", "url", "resumen", "publicado"]))
    assert puntuar(vacio, cargar_temas(), hoy=HOY).empty


def test_filtrar_deja_solo_lo_que_menciona_la_palabra():
    df = pd.DataFrame({"titulo": ["Alerta en Colombia", "Alerta en Perú"], "resumen": ["", ""]})
    assert list(filtrar(df, ["colombia"])["titulo"]) == ["Alerta en Colombia"]
    assert len(filtrar(df, None)) == 2


def test_filtrar_por_titulo_ignora_los_vecinos_del_resumen():
    df = pd.DataFrame({"titulo": ["Perú - Nivel 2"], "resumen": ["Frontera con Colombia"]})
    assert len(filtrar(df, ["colombia"], "titulo")) == 0
    assert len(filtrar(df, ["colombia"])) == 1


def test_limpiar_lee_fechas_de_rss():
    df = pd.DataFrame({"fuente": ["x", "x"], "titulo": ["a", "b"], "url": ["u1", "u2"], "resumen": ["", ""],
                       "publicado": ["Fri, 04 Sep 2026", "2026-10-06T13:48:58+01:00"]})
    fechas = limpiar(df)["publicado"]
    assert fechas.notna().all()
    assert fechas.iloc[0].date().isoformat() == "2026-09-04"


def test_registro_socrata_arma_un_registro_del_pipeline():
    fuente = {"id": "datos-gov-trm", "nombre": "TRM", "dataset": "32sa-8pi3", "campo_fecha": "vigenciadesde"}
    r = registro_socrata(fuente, {"valor": "3216.01", "unidad": "COP", "vigenciadesde": "2026-10-07T00:00:00.000"})
    assert r["url"] == "https://www.datos.gov.co/d/32sa-8pi3"
    assert "valor: 3216.01" in r["resumen"]
    assert r["publicado"] == "2026-10-07T00:00:00.000"
