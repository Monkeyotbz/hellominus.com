# Pipeline de datos del blog (fase 2)

Script de Python con pandas que recolecta fuentes autorizadas, limpia los registros, quita duplicados y puntúa temas para el blog. **No llama a Claude**: es código determinista. Los agentes irán en `agentes-sdk/blog/` (fase 3).

## Problema

Elegir de qué escribir con datos y no a ojo, y que cada artículo nazca con fuentes comprobables.

## Qué hace

1. `recolectar.py` lee las fuentes RSS de `fuentes.json`, respetando `robots.txt`.
2. `pipeline.limpiar` deja las columnas esperadas y descarta registros sin título o URL.
3. `pipeline.deduplicar` quita repetidos por URL y por título.
4. `pipeline.puntuar` asigna cada registro a un tema (`temas.json`) y calcula, por tema, fuentes distintas, registros, recencia y puntaje.
5. `indicadores.py` calcula cifras de turismo con datos abiertos (extranjeros por ciudad y por nacionalidad), con participación y crecimiento contra el año anterior. La suma la hace el servidor de datos.gov.co; pandas compara. Cada tabla trae su fuente y su licencia.
6. `run.py` corre todo y guarda `data/temas-<fecha>.csv` (carpeta ignorada por git).

## Cómo correrlo

```
python -m venv .venv                      # en la raíz del repositorio
.venv\Scripts\pip install -r scripts\blog\requirements.txt
cd scripts\blog
..\..\.venv\Scripts\python run.py --ejemplo    # datos de ejemplo, no reales
..\..\.venv\Scripts\python -m pytest -q        # pruebas
```

## Estado y resultado medible

- `fuentes.json` tiene 2 fuentes revisadas el 7 de octubre de 2026: el consejo de viaje a Colombia del Reino Unido (Open Government Licence v3.0) y las alertas del Departamento de Estado de EE. UU. (dominio público; filtradas por "Colombia" en el título). Cada una lleva su licencia anotada.
- datos.gov.co (conector `socrata`): la TRM, con licencia CC BY-SA 4.0 del propio conjunto de datos (citar a la Superintendencia Financiera vía Portal de Datos Abiertos; lo derivado va bajo la misma licencia). La página general de términos dice "uso libre", pero manda la licencia de cada conjunto.
- Descartadas: la Cancillería de Colombia y El Tiempo (sus términos prohíben copiar, almacenar o recopilar su contenido sin autorización escrita), y El Colombiano y Portafolio (sin permiso expreso). Los medios no se usan ni siquiera como señal de tema.
- Primera corrida real: 3 registros, 3 únicos, 3 temas puntuados. Es poco: son fuentes de seguridad y trámites, no de volumen. La medida "registros por semana" empieza a tener sentido al sumar datos.gov.co y medios como señal de tema.
- Con `--ejemplo` el pipeline procesa 6 registros de ejemplo rotulados (no son reales).

## Pendiente

- Más indicadores: países que no requieren visa (`g7ps-wzb3`, 170 filas) y Registro Nacional de Turismo (`thwd-ivmp`).
- Que los agentes (fase 3) reciban estas cifras junto con la ficha del tema, con su cita.
- Guardar los registros en Postgres (hoy salen a CSV local).
- Programar la corrida (GitHub Actions, fase 6).
