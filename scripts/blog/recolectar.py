"""Recolección de fuentes autorizadas (RSS y datos abiertos de datos.gov.co). Respeta robots.txt y no usa IA."""
import json
import re
import urllib.robotparser
from pathlib import Path
from urllib.parse import urlparse

import feedparser
import requests
import pandas as pd

BASE = Path(__file__).parent
AGENTE = "HellominusBlogBot/0.1 (+https://hellominus.com)"


def cargar_fuentes(ruta: Path = BASE / "fuentes.json") -> list[dict]:
    return json.loads(ruta.read_text(encoding="utf-8"))["fuentes"]


def permitido(url: str) -> bool:
    """True solo si el robots.txt del sitio deja a nuestro agente leer esa URL.

    El robots.txt se pide con nuestro nombre de agente: algunos sitios responden 403
    a los bots anónimos y eso se leería como "todo prohibido". Si el robots.txt no
    existe (404), se entiende que todo está permitido; ante cualquier otro error, no.
    """
    partes = urlparse(url)
    try:
        resp = requests.get(f"{partes.scheme}://{partes.netloc}/robots.txt",
                            headers={"User-Agent": AGENTE}, timeout=15)
    except requests.RequestException:
        return False
    if resp.status_code == 404:
        return True
    if resp.status_code != 200:
        return False
    robots = urllib.robotparser.RobotFileParser()
    robots.parse(resp.text.splitlines())
    return robots.can_fetch(AGENTE, url)


def leer_rss(fuente: dict) -> pd.DataFrame:
    if not permitido(fuente["url"]):
        print(f"  omitida {fuente['id']}: robots.txt no lo permite")
        return pd.DataFrame()
    feed = feedparser.parse(fuente["url"], agent=AGENTE)
    filas = [{
        "fuente": fuente["id"],
        "titulo": e.get("title", ""),
        "url": e.get("link", ""),
        "resumen": e.get("summary", ""),
        "publicado": e.get("published", e.get("updated", "")),
    } for e in feed.entries]
    return pd.DataFrame(filas).pipe(filtrar, fuente.get("filtro"), fuente.get("filtro_campo", "ambos"))


def filtrar(df: pd.DataFrame, palabras: list[str] | None, campo: str = "ambos") -> pd.DataFrame:
    """Conserva solo los registros que mencionan alguna de las palabras en el título o, según `campo`, en título y resumen."""
    if df.empty or not palabras:
        return df
    base = df["titulo"].fillna("") if campo == "titulo" else df["titulo"].fillna("") + " " + df["resumen"].fillna("")
    texto = base.str.lower()
    patron = "|".join(re.escape(p.lower()) for p in palabras)
    return df[texto.str.contains(patron)].reset_index(drop=True)


def registro_socrata(fuente: dict, fila: dict) -> dict:
    """Convierte la fila más reciente de un conjunto de datos.gov.co en un registro del pipeline."""
    resumen = "; ".join(f"{k}: {v}" for k, v in fila.items())
    fecha = fila.get(fuente.get("campo_fecha", ""), "")
    return {
        "fuente": fuente["id"],
        "titulo": fuente["nombre"],
        "url": f"https://www.datos.gov.co/d/{fuente['dataset']}",
        "resumen": resumen,
        "publicado": fecha,
    }


def leer_socrata(fuente: dict) -> pd.DataFrame:
    """Lee la fila más reciente de un conjunto de datos abiertos (API Socrata). Un registro por corrida."""
    url = f"https://www.datos.gov.co/resource/{fuente['dataset']}.json"
    if not permitido(url):
        print(f"  omitida {fuente['id']}: robots.txt no lo permite")
        return pd.DataFrame()
    params = {"$limit": 1}
    if fuente.get("orden"):
        params["$order"] = fuente["orden"]
    resp = requests.get(url, params=params, headers={"User-Agent": AGENTE}, timeout=30)
    resp.raise_for_status()
    filas = resp.json()
    return pd.DataFrame([registro_socrata(fuente, filas[0])]) if filas else pd.DataFrame()


def recolectar() -> pd.DataFrame:
    partes = []
    for fuente in cargar_fuentes():
        lector = {"rss": leer_rss, "socrata": leer_socrata}.get(fuente.get("tipo"))
        if lector:
            print(f"leyendo {fuente['id']}")
            partes.append(lector(fuente))
    return pd.concat(partes, ignore_index=True) if partes else pd.DataFrame()
