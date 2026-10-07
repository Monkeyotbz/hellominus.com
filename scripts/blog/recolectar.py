"""Recolección de fuentes autorizadas (RSS). Respeta robots.txt y no usa IA."""
import json
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
    return pd.DataFrame(filas)


def recolectar() -> pd.DataFrame:
    partes = []
    for fuente in cargar_fuentes():
        if fuente.get("tipo") == "rss":
            print(f"leyendo {fuente['id']}")
            partes.append(leer_rss(fuente))
    return pd.concat(partes, ignore_index=True) if partes else pd.DataFrame()
