"""Reglas deterministas para revisar un borrador del blog. No llama a Claude.

El Revisor (agente) emite juicio; estas reglas comprueban lo que se puede comprobar sin juicio:
fuentes presentes, cita de las cifras, idioma inglés y temas que siempre pasan por una persona.
Trabaja con diccionarios simples para no depender de otras librerías.
"""
import re

# Temas que nunca se publican sin revisión humana (visas, dinero, leyes, seguridad, salud).
TEMAS_SENSIBLES = {
    "visa": "visas y permanencia",
    "permiso de permanencia": "visas y permanencia",
    "migraci": "visas y permanencia",
    "precio": "precios",
    "tarifa": "precios",
    "tasa de cambio": "dinero",
    "trm": "dinero",
    "impuesto": "impuestos",
    "ley ": "leyes",
    "decreto": "leyes",
    "seguridad": "seguridad",
    "alerta": "seguridad",
    "salud": "salud",
    "seguro médico": "salud",
}

SLUG = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def _texto(valor: dict, idioma: str) -> str:
    return (valor or {}).get(idioma, "") or ""


def temas_sensibles(texto: str) -> list[str]:
    """Temas sensibles que menciona un texto, sin repetir."""
    bajo = texto.lower()
    return sorted({tema for palabra, tema in TEMAS_SENSIBLES.items() if palabra in bajo})


def entidad(cita: str) -> str:
    """Primera parte de una cita ("Migración Colombia, vía Portal..." -> "Migración Colombia")."""
    return re.split(r",| vía ", cita)[0].strip()


def revisar_reglas(borrador: dict, ficha: dict) -> dict:
    """Devuelve {"problemas": [...], "motivos_revision": [...]}. Sin problemas, la lista queda vacía."""
    problemas: list[dict] = []
    cuerpo_es = _texto(borrador.get("cuerpo"), "es")
    cuerpo_en = _texto(borrador.get("cuerpo"), "en")

    if not SLUG.match(borrador.get("slug", "")):
        problemas.append({"tipo": "slug", "detalle": "El slug debe ir en minúsculas, con guiones y sin tildes."})
    if not _texto(borrador.get("titulo"), "es") or not cuerpo_es:
        problemas.append({"tipo": "contenido", "detalle": "Falta el título o el cuerpo en español."})
    if not _texto(borrador.get("titulo"), "en") or not cuerpo_en:
        problemas.append({"tipo": "idioma", "detalle": "Falta la versión en inglés del título o del cuerpo."})
    if not borrador.get("fuentes"):
        problemas.append({"tipo": "fuentes", "detalle": "El borrador no lista ninguna fuente."})

    for hecho in ficha.get("hechos", []):
        if not hecho.get("fuente_url"):
            problemas.append({"tipo": "fuentes", "detalle": f"Hecho sin fuente: {hecho.get('texto', '')[:80]}"})

    # Si el cuerpo usa el valor de una cifra, debe nombrar a la entidad que la publica.
    for cifra in ficha.get("cifras", []):
        valor, cita = str(cifra.get("valor", "")), cifra.get("cita", "")
        if valor and valor in cuerpo_es and entidad(cita).lower() not in cuerpo_es.lower():
            problemas.append({"tipo": "cita", "detalle": f"La cifra {valor} aparece sin citar a {entidad(cita)}."})

    motivos = temas_sensibles(cuerpo_es + " " + cuerpo_en)
    return {"problemas": problemas, "motivos_revision": motivos}
