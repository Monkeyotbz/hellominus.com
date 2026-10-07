"""Modelos y topes de costo de cada agente. Todo se cambia con variables de entorno, sin tocar código."""
import os
from dataclasses import dataclass


@dataclass(frozen=True)
class ConfigAgente:
    modelo: str
    max_turnos: int
    max_usd: float


def _num(nombre: str, defecto: float) -> float:
    return float(os.environ.get(nombre, defecto))


def config(agente: str) -> ConfigAgente:
    """Modelo barato para investigar y redactar; el más capaz solo para revisar (plan, sección 6)."""
    base = {
        "investigador": ("claude-sonnet-5-5", 8, 0.40),
        "redactor": ("claude-sonnet-5-5", 2, 0.30),
        "revisor": ("claude-opus-5-5", 2, 0.50),
    }[agente]
    pref = f"HM_{agente.upper()}"
    return ConfigAgente(
        modelo=os.environ.get(f"{pref}_MODELO", base[0]),
        max_turnos=int(_num(f"{pref}_MAX_TURNOS", base[1])),
        max_usd=_num(f"{pref}_MAX_USD", base[2]),
    )


# Tope de todo un artículo. La corrida se detiene si ya se gastó esto antes de pasar al siguiente agente.
TOPE_ARTICULO_USD = _num("HM_TOPE_ARTICULO_USD", 1.00)
