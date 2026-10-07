"""Indicadores de turismo con datos abiertos de datos.gov.co. Código determinista: no llama a Claude.

  python indicadores.py            último año completo contra el anterior
  python indicadores.py --anio 2024
"""
import argparse
import json
from datetime import datetime, timezone

import pandas as pd
import requests

from pipeline import BASE
from recolectar import AGENTE, permitido

DATOS = BASE / "data"


def cargar_indicadores() -> list[dict]:
    return json.loads((BASE / "indicadores.json").read_text(encoding="utf-8"))["indicadores"]


def consultar(ind: dict, anio: int) -> pd.DataFrame:
    """Suma la medida por dimensión para un año. La suma la hace el servidor, no se baja la tabla entera."""
    url = f"https://www.datos.gov.co/resource/{ind['dataset']}.json"
    if not permitido(url):
        raise PermissionError(f"robots.txt no permite leer {url}")
    params = {
        "$select": f"{ind['dimension']}, {ind['medida']} as total",
        "$where": f"{ind['campo_anio']} = '{anio}'",
        "$group": ind["dimension"],
        "$order": "total DESC",
        "$limit": 500,
    }
    resp = requests.get(url, params=params, headers={"User-Agent": AGENTE}, timeout=60)
    resp.raise_for_status()
    df = pd.DataFrame(resp.json(), columns=[ind["dimension"], "total"])
    df["total"] = pd.to_numeric(df["total"], errors="coerce").fillna(0).astype(int)
    return df


def comparar(actual: pd.DataFrame, anterior: pd.DataFrame, dimension: str, limite: int = 15) -> pd.DataFrame:
    """Une dos años y calcula participación en el total y crecimiento. Devuelve las `limite` primeras filas."""
    out = actual.merge(anterior, on=dimension, how="left", suffixes=("", "_anterior"))
    out["total_anterior"] = out["total_anterior"].fillna(0).astype(int)
    suma = out["total"].sum()
    out["participacion_pct"] = (out["total"] / suma * 100).round(1) if suma else 0.0
    base = out["total_anterior"].where(out["total_anterior"] > 0)
    out["crecimiento_pct"] = ((out["total"] / base - 1) * 100).round(1)
    return out.sort_values("total", ascending=False).head(limite).reset_index(drop=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--anio", type=int, default=datetime.now(timezone.utc).year - 1)
    args = parser.parse_args()

    DATOS.mkdir(exist_ok=True)
    sello = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    for ind in cargar_indicadores():
        tabla = comparar(consultar(ind, args.anio), consultar(ind, args.anio - 1), ind["dimension"], ind["limite"])
        tabla.insert(0, "anio", args.anio)
        tabla.to_csv(DATOS / f"indicador-{ind['id']}-{sello}.csv", index=False)
        print(f"\n{ind['titulo']} ({args.anio})\nFuente: {ind['cita']}. Licencia {ind['licencia']}.")
        print(tabla.head(8).to_string(index=False))


if __name__ == "__main__":
    main()
