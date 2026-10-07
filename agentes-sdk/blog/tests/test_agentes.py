import json
import sys
from pathlib import Path

import pytest

AQUI = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(AQUI))
sys.path.insert(0, str(AQUI.parents[1] / "scripts" / "blog"))

import agentes  # noqa: E402
import flujo  # noqa: E402
from cliente import Respuesta, extraer_json  # noqa: E402
from config import config  # noqa: E402
from reglas_revision import revisar_reglas, temas_sensibles  # noqa: E402
from simulado import BORRADOR, FICHA, consultar_simulado  # noqa: E402


def test_extraer_json_con_y_sin_bloque():
    assert extraer_json('Aquí va:\n```json\n{"a": 1}\n```') == {"a": 1}
    assert extraer_json('{"a": 2}') == {"a": 2}


def test_modelos_por_defecto_barato_para_investigar_y_capaz_para_revisar(monkeypatch):
    monkeypatch.delenv("HM_REVISOR_MODELO", raising=False)
    assert config("investigador").modelo != config("revisor").modelo
    monkeypatch.setenv("HM_REVISOR_MODELO", "otro-modelo")
    assert config("revisor").modelo == "otro-modelo"


def test_el_agente_reintenta_una_vez_si_el_formato_falla():
    llamadas = []

    def consultar(sistema, pedido, **kw):
        llamadas.append(pedido)
        texto = "no es json" if len(llamadas) == 1 else json.dumps(FICHA)
        return Respuesta(texto=texto, costo_usd=0.01, turnos=1)

    ficha, resp = agentes.investigar({"tema_id": "destinos"}, [], consultar)
    assert ficha.tema_id == "destinos"
    assert len(llamadas) == 2 and "no cumplió el formato" in llamadas[1]
    assert resp.costo_usd == pytest.approx(0.02)


def test_el_agente_falla_si_el_segundo_intento_tambien_es_invalido():
    def consultar(sistema, pedido, **kw):
        return Respuesta(texto="basura")

    with pytest.raises(ValueError):
        agentes.investigar({"tema_id": "destinos"}, [], consultar)


def test_reglas_detectan_cifra_sin_cita_y_ingles_faltante():
    ficha = {"hechos": [], "cifras": [{"valor": "1.143.678", "cita": "MinCIT, vía Portal de Datos Abiertos"}]}
    borrador = {"slug": "mal slug", "titulo": {"es": "x", "en": ""}, "cuerpo": {"es": "Llegaron 1.143.678 personas.", "en": ""},
                "fuentes": []}
    tipos = {p["tipo"] for p in revisar_reglas(borrador, ficha)["problemas"]}
    assert {"slug", "idioma", "fuentes", "cita"} <= tipos


def test_reglas_marcan_temas_sensibles():
    assert "visas y permanencia" in temas_sensibles("Los requisitos de la visa cambiaron")
    assert temas_sensibles("Un café en Jardín") == []


def test_flujo_simulado_completo_nunca_se_publica_solo(tmp_path, monkeypatch):
    monkeypatch.setattr(flujo, "SALIDA", tmp_path)
    paquete = flujo.generar("destinos", consultar_simulado, cifras=[])
    assert paquete["estado"] == "borrador"
    assert paquete["requiere_revision_humana"] is True
    assert paquete["aprobado_por_revisor"] is True
    ruta = flujo.guardar(paquete)
    assert json.loads(ruta.read_text(encoding="utf-8"))["borrador"]["slug"] == BORRADOR["slug"]


def test_el_tope_de_costo_detiene_la_corrida(monkeypatch):
    monkeypatch.setattr(flujo, "TOPE_ARTICULO_USD", 0.05)

    def caro(sistema, pedido, **kw):
        return Respuesta(texto=json.dumps(FICHA), costo_usd=0.10, turnos=1)

    with pytest.raises(flujo.TopeExcedido):
        flujo.generar("destinos", caro, cifras=[])
