"""Respuestas de EJEMPLO para recorrer el flujo sin Claude y sin costo. Nada de esto es contenido real.

Sirve para probar que los agentes, los esquemas, las reglas y el guardado funcionan juntos.
"""
import json

from cliente import Respuesta

FICHA = {
    "tema_id": "destinos", "tema_nombre": "Destinos",
    "enfoque": "[EJEMPLO] Qué ciudad elegir para un mes de trabajo remoto en Colombia.",
    "hechos": [{"texto": "[EJEMPLO] Hecho de muestra sin valor informativo.", "fuente_url": "https://ejemplo.test/fuente", "sensible": False}],
    "cifras": [{"etiqueta": "Extranjeros no residentes en Medellín (2025)", "valor": "1.143.678",
                "cita": "Ministerio de Comercio, Industria y Turismo (MinCIT), vía Portal de Datos Abiertos www.datos.gov.co",
                "licencia": "CC BY-SA 4.0"}],
}
BORRADOR = {
    "slug": "ejemplo-ciudad-para-un-mes", "categoria": "destinos",
    "titulo": {"es": "[EJEMPLO] Qué ciudad elegir para un mes", "en": "[SAMPLE] Which city to pick for a month"},
    "extracto": {"es": "[EJEMPLO] Texto de muestra.", "en": "[SAMPLE] Sample text."},
    "cuerpo": {
        "es": "[EJEMPLO] Según el Ministerio de Comercio, Industria y Turismo (MinCIT), en 2025 llegaron 1.143.678 extranjeros no residentes a Medellín.\n\n## Sección de muestra\n\nTexto de muestra.",
        "en": "[SAMPLE] According to the Ministry of Commerce, Industry and Tourism (MinCIT), 1,143,678 non-resident foreigners arrived in Medellín in 2025.\n\n## Sample section\n\nSample text.",
    },
    "minutos": 3, "fuentes": ["https://ejemplo.test/fuente"],
}
VEREDICTO = {"aprobado": True, "problemas": [], "requiere_revision_humana": False, "motivos_revision": []}


def consultar_simulado(sistema: str, pedido: str, *, modelo: str, herramientas: list[str],
                       max_turnos: int, max_usd: float) -> Respuesta:
    """Devuelve la respuesta de ejemplo del agente que corresponde, según su prompt de sistema."""
    if "Eres el Investigador" in sistema:
        datos = FICHA
    elif "Eres el Redactor" in sistema:
        datos = BORRADOR
    else:
        datos = VEREDICTO
    return Respuesta(texto=json.dumps(datos, ensure_ascii=False), costo_usd=0.0, turnos=1)
