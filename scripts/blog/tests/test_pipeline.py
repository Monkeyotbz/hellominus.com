import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).parent.parent))
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
