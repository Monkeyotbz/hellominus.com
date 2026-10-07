# Agentes del blog (fase 3)

Tres agentes con `claude_agent_sdk` que convierten un tema del pipeline en un borrador. **Nunca publican**: el borrador queda en `salida/` y una persona lo aprueba en el admin.

## Problema

Pasar de "este tema puntúa alto" a un borrador en español e inglés, con fuentes, sin que se invente nada y con revisión humana obligatoria.

## Flujo

`scripts/blog` (datos y cifras con cita) → **Investigador** → **Redactor** → **Revisor** + reglas deterministas → borrador.

| Pieza | Qué hace | Modelo por defecto |
|---|---|---|
| `investigar` | Arma la ficha del tema: hechos con fuente y cifras con cita. Puede buscar y leer páginas (WebSearch, WebFetch) | Sonnet |
| `redactar` | Escribe el artículo es/en usando solo la ficha | Sonnet |
| `revisar` | Audita el borrador contra la ficha con una rúbrica | Opus |
| `scripts/blog/reglas_revision.py` | Comprueba sin IA: fuentes, cita de cifras, inglés y temas sensibles | no usa modelo |

Cada salida se valida con Pydantic (`esquemas.py`) y, si el formato falla, el agente reintenta una vez.

## Control de costo

- Modelo, turnos y dinero por agente en `config.py`; se cambian con variables (`HM_INVESTIGADOR_MODELO`, `HM_REVISOR_MAX_USD`, etc.).
- `HM_TOPE_ARTICULO_USD` (1,00 por defecto) detiene la corrida si ya se gastó eso antes del siguiente agente. Es un valor provisional.
- Ningún lote automático hasta revisar el costo de una corrida de prueba.

## Cómo correrlo

```
.venv\Scripts\pip install -r agentes-sdk\blog\requirements.txt
cd agentes-sdk\blog
..\..\.venv\Scripts\python -m pytest -q                      # pruebas, sin costo
..\..\.venv\Scripts\python flujo.py --tema destinos --simulado   # recorre el flujo con respuestas de EJEMPLO
..\..\.venv\Scripts\python flujo.py --tema destinos              # corrida real: cuesta dinero
```

La corrida real necesita `ANTHROPIC_API_KEY` en el entorno (nunca en el repositorio ni en el chat).

## Estado

- Construido y probado con respuestas simuladas: 8 pruebas pasan. La corrida `--simulado` guarda un borrador de ejemplo rotulado.
- **No probado con Claude real.** En el equipo de desarrollo, Windows bloquea una dependencia del SDK (`rpds`, por una política de control de aplicaciones), así que `cliente.consultar_sdk` está escrito contra el código del SDK pero no se ejecutó. La primera corrida real hay que hacerla donde el SDK cargue.
- La calidad de lo que escriben los agentes se mide en la fase 4 (evaluaciones).

## Pendiente

- Primera corrida real con tope de tokens y revisión del costo.
- Cargar el borrador como `draft` en `blog_posts` (hoy queda en un archivo local).
- Evaluaciones (fase 4): 30 a 40 borradores calificados por una persona.
