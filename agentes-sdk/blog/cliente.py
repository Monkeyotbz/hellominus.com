"""Única puerta hacia Claude. Aquí (y solo aquí) se usa claude_agent_sdk.

El SDK se importa dentro de la función: todo lo demás (esquemas, agentes con respuestas simuladas,
pruebas) funciona sin tenerlo instalado o cargado.
"""
import json
import re
from dataclasses import dataclass
from typing import Callable


@dataclass
class Respuesta:
    texto: str
    costo_usd: float = 0.0
    turnos: int = 0


# Firma de una llamada a un modelo: (sistema, pedido, modelo, herramientas, max_turnos, max_usd) -> Respuesta
Consultar = Callable[..., Respuesta]


def consultar_sdk(sistema: str, pedido: str, *, modelo: str, herramientas: list[str],
                  max_turnos: int, max_usd: float) -> Respuesta:
    """Una consulta real a Claude con tope de turnos y de dinero. Requiere ANTHROPIC_API_KEY en el entorno."""
    import anyio
    from claude_agent_sdk import AssistantMessage, ClaudeAgentOptions, ResultMessage, TextBlock, query

    opciones = ClaudeAgentOptions(
        system_prompt=sistema,
        model=modelo,
        tools=herramientas,
        allowed_tools=herramientas,
        max_turns=max_turnos,
        max_budget_usd=max_usd,
        permission_mode="default",
        setting_sources=[],
    )

    async def correr() -> Respuesta:
        partes: list[str] = []
        costo, turnos = 0.0, 0
        async for mensaje in query(prompt=pedido, options=opciones):
            if isinstance(mensaje, AssistantMessage):
                partes += [b.text for b in mensaje.content if isinstance(b, TextBlock)]
            elif isinstance(mensaje, ResultMessage):
                costo = mensaje.total_cost_usd or 0.0
                turnos = mensaje.num_turns
                if mensaje.is_error:
                    raise RuntimeError(f"La consulta terminó con error: {mensaje.subtype} {mensaje.errors or ''}")
        return Respuesta(texto="\n".join(partes), costo_usd=costo, turnos=turnos)

    return anyio.run(correr)


def extraer_json(texto: str) -> dict:
    """Saca el objeto JSON de una respuesta, con o sin bloque ```json."""
    bloque = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", texto, re.S)
    crudo = bloque.group(1) if bloque else texto[texto.find("{"): texto.rfind("}") + 1]
    return json.loads(crudo)
