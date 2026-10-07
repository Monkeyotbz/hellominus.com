"""Los tres agentes del blog: Investigador, Redactor y Revisor.

Cada uno es una función que recibe datos, llama a Claude por `consultar` y devuelve un objeto validado.
`consultar` se inyecta: en producción es cliente.consultar_sdk; en las pruebas, una respuesta simulada.
"""
import json
from typing import TypeVar

from pydantic import BaseModel, ValidationError

from cliente import Consultar, Respuesta, extraer_json
from config import config
from esquemas import Borrador, Ficha, Veredicto

T = TypeVar("T", bound=BaseModel)

REGLAS_COMUNES = """Escribes para Hellominus, una plataforma colombiana de estadías cortas para nómadas digitales.
Responde SOLO con un objeto JSON válido, sin texto antes ni después.
Nunca inventes datos, cifras, precios, leyes ni enlaces. Si no tienes fuente, no lo afirmes."""

SISTEMA = {
    "investigador": REGLAS_COMUNES + """
Eres el Investigador. Recibes un tema, cifras ya calculadas con su cita y, si hace falta, puedes buscar y leer
páginas oficiales para completar. Entrega una ficha con:
- enfoque: la pregunta concreta que el artículo responde a un nómada digital.
- hechos: frases cortas y comprobables, cada una con la dirección de su fuente (fuente_url). Un hecho sin fuente no se incluye.
  Marca sensible=true en todo lo de visas, precios, leyes, seguridad o salud.
- cifras: copia las cifras recibidas tal cual, con su cita y licencia. No las modifiques.
Formato: {"tema_id","tema_nombre","enfoque","hechos":[{"texto","fuente_url","sensible"}],"cifras":[{"etiqueta","valor","cita","licencia"}]}""",
    "redactor": REGLAS_COMUNES + """
Eres el Redactor. Escribes un artículo a partir de la ficha y SOLO de ella: no agregues hechos que no estén en la ficha.
- Español neutro de Colombia y versión en inglés, con el mismo contenido. Tono claro, cercano y sobrio. Sin exageraciones.
- Cuando uses una cifra, nombra en el texto a la entidad que la publica (campo cita).
- Estructura: introducción breve, 3 a 5 secciones con encabezado ## y cierre práctico. Entre 450 y 700 palabras.
- slug en minúsculas, con guiones y sin tildes. categoria: destinos, viajeros, finanzas o nomadas.
- fuentes: las direcciones de la ficha que realmente usaste.
Formato: {"slug","categoria","titulo":{"es","en"},"extracto":{"es","en"},"cuerpo":{"es","en"},"minutos","fuentes":[]}""",
    "revisor": REGLAS_COMUNES + """
Eres el Revisor. Auditas un borrador contra su ficha con esta rúbrica:
1. Cada afirmación factual del texto está en la ficha. Marca como problema cualquier dato nuevo o inventado.
2. Las cifras coinciden exactamente con las de la ficha y citan a su entidad.
3. El inglés dice lo mismo que el español.
4. No hay promesas, exageraciones ni consejos legales o médicos.
5. Todo lo de visas, precios, leyes, seguridad o salud queda en motivos_revision: una persona lo aprueba siempre.
aprobado=true solo si no hay problemas. requiere_revision_humana=true si hay motivos_revision.
Formato: {"aprobado","problemas":[{"tipo","detalle"}],"requiere_revision_humana","motivos_revision":[]}""",
}

HERRAMIENTAS = {"investigador": ["WebSearch", "WebFetch"], "redactor": [], "revisor": []}


def _llamar(agente: str, pedido: str, modelo_salida: type[T], consultar: Consultar) -> tuple[T, Respuesta]:
    """Llama al agente, valida la salida y, si el formato falla, reintenta una vez diciéndole el error."""
    cfg = config(agente)
    total = Respuesta(texto="")
    error = ""
    for intento in range(2):
        texto_pedido = pedido if not error else f"{pedido}\n\nTu respuesta anterior no cumplió el formato: {error}\nCorrígela."
        resp = consultar(SISTEMA[agente], texto_pedido, modelo=cfg.modelo, herramientas=HERRAMIENTAS[agente],
                         max_turnos=cfg.max_turnos, max_usd=cfg.max_usd)
        total = Respuesta(resp.texto, total.costo_usd + resp.costo_usd, total.turnos + resp.turnos)
        try:
            return modelo_salida.model_validate(extraer_json(resp.texto)), total
        except (ValueError, ValidationError) as e:
            error = str(e)[:400]
    raise ValueError(f"El {agente} no entregó un formato válido tras reintentar: {error}")


def investigar(tema: dict, cifras: list[dict], consultar: Consultar) -> tuple[Ficha, Respuesta]:
    pedido = json.dumps({"tema": tema, "cifras_disponibles": cifras}, ensure_ascii=False)
    return _llamar("investigador", pedido, Ficha, consultar)


def redactar(ficha: Ficha, consultar: Consultar) -> tuple[Borrador, Respuesta]:
    return _llamar("redactor", ficha.model_dump_json(), Borrador, consultar)


def revisar(ficha: Ficha, borrador: Borrador, consultar: Consultar) -> tuple[Veredicto, Respuesta]:
    pedido = json.dumps({"ficha": ficha.model_dump(), "borrador": borrador.model_dump()}, ensure_ascii=False)
    return _llamar("revisor", pedido, Veredicto, consultar)
