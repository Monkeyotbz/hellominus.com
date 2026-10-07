# Blog Hello Minus: plan de desarrollo

Versión 00, 7 de octubre de 2026. Plan para montar en Hellominus un blog para nómadas digitales y viajeros, con información de turismo local e internacional, donde los agentes de IA investigan, redactan y revisan, y una persona aprueba. Es la única guía de desarrollo del blog. Fuente: `blog-hello-minus-plan.html` (misma carpeta).

## 1. Objetivo y decisiones tomadas

| Decisión | Resultado |
|---|---|
| Dónde se construye | Dentro del repositorio `hellominus.com` |
| Quién publica | Los agentes dejan el post como borrador (`draft`); una persona lo aprueba desde el admin que ya existe |
| Idioma | Español e inglés, como el resto del sitio (campos `{es, en}`) |
| Rama de trabajo | `juanse`, con pull request hacia `main` |

## 2. Qué existe hoy en Hellominus

| Pieza | Estado | Detalle y ruta |
|---|---|---|
| Tablas `blog_posts` y `blog_categories` | Existe | Slug único, título, extracto y cuerpo es/en, estado, etiquetas, portada, meta. `supabase/migrations/20260901120005_content.sql` |
| Seguridad por fila | Existe | Lectura pública solo de lo publicado; escritura para el equipo. Mismo archivo y `20261002120013_multitenant.sql` |
| Admin con CRUD de blog | Existe | Es el lugar de aprobación. `src/admin/entities.ts` |
| Consulta de posts publicados | Parcial | Solo para la home de anfitriones. `src/lib/queries.ts` |
| Páginas `/blog` y `/blog/:slug` | Falta | Hoy `/blog` cae en el comodín y muestra la home. `src/App.tsx` |
| Sección "Blog" de la home | Falta | Es falsa: datos fijos con enlaces a `#blog`. `src/home/Blog.tsx` y `src/home/data.ts` |
| SEO (prerender, sitemap, robots, meta por página) | Falta | Es una aplicación de una sola pantalla con Vite; solo tiene meta fijas en `index.html`. Un blog necesita prerender y sitemap |
| Llamadas a modelos de IA | Falta | No hay ninguna, ni funciones de Supabase |
| `CLAUDE.md` del repositorio | Falta | Se crea con este diseño |

Se reutiliza, no se reescribe: la tabla, la seguridad por fila y el admin.

## 3. Agentes y scripts

Regla del laboratorio: lo que llama a Claude va en Python y es un **agente**; lo determinista es un **script** sin Claude. El agente solo emite juicio con evidencia.

**Agentes**
1. **Investigador**: con herramientas y ciclo de búsqueda. Busca temas y fuentes y entrega una ficha por tema con citas y enlaces.
2. **Redactor**: escribe el post en Markdown, en español e inglés, para nómadas digitales, usando solo lo que trae la ficha.
3. **Revisor**: audita el borrador con una rúbrica. Cada afirmación factual debe tener fuente. Todo lo de visas, precios, leyes o seguridad se marca "requiere revisión humana" y nunca pasa solo. Un segundo modelo (por ejemplo Gemini) puede verificar los hechos de forma cruzada.

**Scripts (sin Claude)**
- Recolección de fuentes (RSS y datos abiertos), limpieza, deduplicación y puntaje de temas con pandas.
- Generación del slug, validación del esquema de `blog_posts` y carga con `status = 'draft'`.
- Prerender de `/blog/:slug`, `sitemap.xml` y `robots.txt`.
- Métricas del panel y registro de tokens por corrida.

## 4. Flujo de publicación

Recolección (script) → Investigador → Redactor → Revisor → borrador en `blog_posts` → **aprobación humana en el admin** → publicación → prerender y sitemap → panel y agente analista.

## 5. Fases

| Fase | Qué se hace | Resultado medible | Estado |
|---|---|---|---|
| 0. Preparación | Rama `juanse`; `CLAUDE.md` del repositorio con este diseño; confirmar que `blog_posts` esté aplicada en la base real | Rama y migración verificadas | Pendiente |
| 1. Blog público | Páginas `/blog` y `/blog/:slug`; reemplazar la sección falsa de la home; prerender, sitemap, robots y meta por página | `/blog` publicado con un post real y HTML con meta propios | Pendiente |
| 2. Pipeline de datos | Python con pandas: recolección, limpieza, deduplicación y puntaje de temas | Registros procesados por semana | Pendiente |
| 3. Agentes | Investigador, Redactor y Revisor con `claude_agent_sdk`, salida validada con Pydantic | Una corrida de prueba deja un borrador con fuentes | Pendiente |
| 4. Evaluaciones | 30 a 40 posts calificados por una persona; comparar dos prompts y dos modelos | Porcentaje de aceptación por versión | Pendiente |
| 5. Panel con IA | Panel del blog con un agente que interpreta los datos y recomienda temas (cuando ya haya posts publicados) | Panel con datos reales | Pendiente |
| 6. Despliegue y pruebas | GitHub Actions programado, pytest, integración continua y URL pública | Una corrida programada real | Pendiente |

Cada fase termina con un README y un resultado medible.

## 6. Control de costo
- Modelo barato (Sonnet o Haiku) para el Investigador y el Redactor; el más capaz solo para el Revisor.
- Tope de tokens por corrida.
- Ningún lote automático hasta revisar el costo de una corrida de prueba.

## 7. Verificación
- **Fase 1:** abrir `/blog` y `/blog/<slug>` con un post de prueba; ver el código fuente (debe traer título y meta propios); validar `sitemap.xml`.
- **Fases 2 y 3:** corrida de prueba con un tema; confirmar borrador, fuente en cada afirmación factual y temas de visas o precios marcados.
- **Fase 4:** el reporte de evaluaciones da el porcentaje de aceptación por versión de prompt.
- **Fase 6:** una corrida programada real en GitHub Actions y el panel con datos.

## 8. Pendientes antes de ejecutar
- [ ] Abrir Claude Code desde la carpeta `hellominus.com` (cada proyecto es su propia raíz).
- [ ] Confirmar que `blog_posts` esté aplicada en la base real.
- [ ] Validar qué es agente y qué es script con el agente `seleccionar-forma` (modo incremental).
- [ ] Definir las fuentes permitidas y revisar sus términos de uso antes de recolectar.

## 9. Control de versiones

| Versión | Fecha | Cambios |
|---|---|---|
| 00 | 7 de octubre de 2026 | Creación. Plan del blog en 7 fases (0 a 6) |
