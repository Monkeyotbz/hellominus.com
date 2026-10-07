"""Recolección de fuentes autorizadas (RSS). Respeta robots.txt y no usa IA."""
import json
import urllib.robotparser
from pathlib import Path
from urllib.parse import urlparse

import feedparser
import pandas as pd

BASE = Path(__file__).parent
AGENTE = "HellominusBlogBot/0.1 (+https://hellominus.com)"


def cargar_fuentes(ruta: Path = BASE / "fuentes.json") -> list[dict]:
    return json.loads(ruta.read_text(encoding="utf-8"))["fuentes"]


def permitido(url: str) -> bool:
    """True solo si el robots.txt del sitio deja a nuestro agente leer esa URL."""
    partes = urlparse(url)
    robots = urllib.robotparser.RobotFileParser(f"{partes.scheme}://{partes.netloc}/robots.txt")
    try:
        robots.read()
    except OSError:
        return False
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
