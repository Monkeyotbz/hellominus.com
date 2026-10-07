"""Corre el pipeline completo: recolectar, limpiar, deduplicar y puntuar temas.

  python run.py              usa las fuentes de fuentes.json
  python run.py --ejemplo    usa ejemplo/registros-ejemplo.csv (datos de ejemplo, no reales)
"""
import argparse
from datetime import datetime, timezone

import pandas as pd

from pipeline import BASE, cargar_temas, deduplicar, limpiar, puntuar
from recolectar import recolectar

DATOS = BASE / "data"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--ejemplo", action="store_true")
    args = parser.parse_args()

    crudo = pd.read_csv(BASE / "ejemplo" / "registros-ejemplo.csv") if args.ejemplo else recolectar()
    if crudo.empty:
        print("Sin registros. Agrega fuentes autorizadas en fuentes.json o usa --ejemplo.")
        return

    limpio = limpiar(crudo)
    unico = deduplicar(limpio)
    temas = puntuar(unico, cargar_temas())

    DATOS.mkdir(exist_ok=True)
    sello = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    temas.to_csv(DATOS / f"temas-{sello}.csv", index=False)
    print(f"registros: {len(crudo)} crudos -> {len(limpio)} limpios -> {len(unico)} únicos")
    print(temas.to_string(index=False))


if __name__ == "__main__":
    main()
