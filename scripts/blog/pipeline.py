"""Limpieza, deduplicación y puntaje de temas. Código determinista: no llama a Claude."""
import json
import re
import unicodedata
from pathlib import Path

import pandas as pd

BASE = Path(__file__).parent
COLUMNAS = ["fuente", "titulo", "url", "resumen", "publicado"]


def normalizar(texto: str) -> str:
    """Minúsculas, sin tildes ni signos, con espacios simples."""
    texto = unicodedata.normalize("NFD", str(texto).lower())
    texto = "".join(c for c in texto if unicodedata.category(c) != "Mn")
    return " ".join(re.sub(r"[^a-z0-9 ]+", " ", texto).split())


def limpiar(df: pd.DataFrame) -> pd.DataFrame:
    """Deja solo las columnas esperadas, descarta registros sin título o URL y fija el formato de fecha."""
    out = df.reindex(columns=COLUMNAS).copy()
    for col in ("titulo", "url", "resumen"):
        out[col] = out[col].fillna("").astype(str).str.strip()
    out["publicado"] = pd.to_datetime(out["publicado"], errors="coerce", utc=True)
    out = out[(out["titulo"] != "") & (out["url"] != "")]
    return out.reset_index(drop=True)


def deduplicar(df: pd.DataFrame) -> pd.DataFrame:
    """Quita repetidos por URL y por título normalizado. Conserva el más reciente."""
    out = df.copy()
    out["titulo_norm"] = out["titulo"].map(normalizar)
    out = out.sort_values("publicado", ascending=False)
    out = out.drop_duplicates(subset="url").drop_duplicates(subset="titulo_norm")
    return out.reset_index(drop=True)


def cargar_temas(ruta: Path = BASE / "temas.json") -> list[dict]:
    return json.loads(ruta.read_text(encoding="utf-8"))["temas"]


def asignar_tema(texto: str, temas: list[dict]) -> str | None:
    """Devuelve el tema con más palabras clave presentes, o None si ninguno coincide."""
    norm = normalizar(texto)
    mejor, mejores = None, 0
    for tema in temas:
        aciertos = sum(1 for p in tema["palabras"] if normalizar(p) in norm)
        if aciertos > mejores:
            mejor, mejores = tema["id"], aciertos
    return mejor


def puntuar(df: pd.DataFrame, temas: list[dict], hoy: pd.Timestamp | None = None) -> pd.DataFrame:
    """Un renglón por tema: fuentes distintas, registros, recencia y puntaje final."""
    hoy = hoy or pd.Timestamp.now(tz="UTC")
    pesos = {t["id"]: t["peso"] for t in temas}
    nombres = {t["id"]: t["nombre"] for t in temas}
    datos = df.copy()
    datos["tema"] = (datos["titulo"] + " " + datos["resumen"]).map(lambda t: asignar_tema(t, temas))
    datos = datos.dropna(subset=["tema"])
    if datos.empty:
        return pd.DataFrame(columns=["tema", "nombre", "fuentes", "registros", "dias_ultimo", "puntaje"])
    datos["dias"] = (hoy - datos["publicado"]).dt.days.clip(lower=0)
    resumen = datos.groupby("tema").agg(
        fuentes=("fuente", "nunique"), registros=("url", "count"), dias_ultimo=("dias", "min")
    ).reset_index()
    recencia = 1 / (1 + resumen["dias_ultimo"].fillna(365) / 14)
    resumen["puntaje"] = ((resumen["fuentes"] * 2 + resumen["registros"] * 0.5 + recencia * 3)
                          * resumen["tema"].map(pesos)).round(2)
    resumen["nombre"] = resumen["tema"].map(nombres)
    columnas = ["tema", "nombre", "fuentes", "registros", "dias_ultimo", "puntaje"]
    return resumen[columnas].sort_values("puntaje", ascending=False).reset_index(drop=True)
