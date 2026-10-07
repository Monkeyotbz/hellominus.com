# Hellominus.com

Plataforma colombiana de estadías cortas para nómadas digitales y público general: hospedajes, planes de turismo y un mercado con comisión. Los anfitriones suelen tener entre 15 y 40 propiedades. Este repositorio es el **sitio público** (vitrina, catálogo, anfitriones, blog, boletín y leads). La disponibilidad, los precios, las reservas y los cobros en COP los lleva Zuhay, el CRM de ventas del socio; Hellominus guarda un espejo de las reservas.

El repositorio es **público** (`Monkeyotbz/hellominus.com`). Estrategia, precios, datos de clientes y credenciales no van aquí.

## Stack

React 18, Vite 5 y TypeScript. Tailwind en el sitio general y CSS Modules con tokens en la portada y el blog (`src/home/tokens.css`). Zustand con un store por dominio, React Router 6 y Supabase. Se despliega en Vercel y está previsto migrar a Cloudflare, así que no se agrega nada específico de Vercel.

Comandos: `npm run dev`, `npm run build` (compila y prerenderiza el blog), `npm run preview`.

## Flujo de git

- Se trabaja en la rama `juanse`. Cada cambio se confirma ahí y se abre un pull request hacia `main`.
- Nunca se hace commit ni push directo a `main`. Quien fusiona es el usuario o Gabriel (`Monkeyotbz`, dueño del repositorio y del despliegue).
- El código anterior es en su mayoría de Gabriel. Lo nuevo del blog queda en carpetas y commits propios (`src/blog/`, `scripts/prerender-blog.mjs`, `planes/`).

## Base de datos y secretos

- Hay dos proyectos de Supabase. `hellominus-web` (ref `vututvrdmtzjmoufuili`) es el de desarrollo y lo que lee `.env` en local. Producción lee el de Gabriel. Hay un plan para unirlos; mientras tanto, cualquier cambio de esquema va como migración en `supabase/migrations/` y debe ser **solo de agregar**.
- Nunca se pide, se recibe ni se escribe la clave `service_role` ni la contraseña de la base: ni en el chat, ni en el repositorio, ni en variables `VITE_`. La clave `anon` es pública. `.env` está ignorado por git.
- Las claves de Zuhay y de la pasarela de pagos viven solo en el servidor.
- No se construye el módulo de pagos antes de cerrar el modelo legal y el reparto del dinero.

## Convenciones

- Interfaz, comentarios y mensajes de commit en español. El contenido va en español e inglés con campos `{es, en}`; no hay traducción automática.
- Los datos de ejemplo se rotulan como ejemplo y llevan slug `demo-*`. Nunca se siembran reseñas inventadas como si fueran reales.
- Estética sobria y prolija: crema `#F6F3EC`, verde hoja `#2F4B37`, tipografías Newsreader, Figtree y Caveat, botones rectos.
- Un store de Zustand por dominio. Las consultas a Supabase van en servicios, no en los componentes.
- La carpeta `Docs/` es local y está ignorada por git. Ahí van resúmenes y documentos de trabajo; el plan del blog en el repositorio está en `planes/blog-hello-minus-plan.md`.

## El blog

- Páginas `/blog` y `/blog/:slug` en `src/blog/`. Leen `blog_posts` y `blog_categories`; si la base está vacía o falla, muestran los artículos de ejemplo de `src/blog/data.ts`.
- SEO: `scripts/prerender-blog.mjs` corre después de `vite build` y genera el HTML de cada página, `sitemap.xml` y `robots.txt`. Sin credenciales de Supabase no rompe el build. Los artículos publicados después de un despliegue no se prerenderizan hasta el siguiente build.
- Autoría visible: "Redacción Hellominus — escrito con IA y revisado por una persona". Un artículo no se publica sin aprobación humana en el admin.
- Todo lo de visas, precios, leyes o seguridad lo revisa una persona antes de publicarse.
- El pipeline de datos y los agentes del blog viven en este mismo repositorio, separados de la web. Si llama a Claude es un agente; si no, es un script determinista. Python con pandas va en `scripts/blog/` (fase 2) y los agentes (investigador, redactor, revisor) irán en `agentes-sdk/blog/` (fase 3 en adelante). Cada carpeta lleva su `README.md` y su `requirements.txt`.
- Los datos recolectados, los entornos de Python (`.venv`) y las claves nunca se suben: el repositorio es público. Solo se sube código.
- Flujo: recolección (script) → Investigador → Redactor → Revisor → borrador `draft` → aprobación humana en el admin → publicación → prerender.
- Plan completo y fases: `planes/blog-hello-minus-plan.md`.

## Deuda conocida (no la arregles de paso)

- ESLint no corre y `tsc -p tsconfig.app.json` tiene errores anteriores en admin y ChatBot.
- El README dice "sin comisiones", y eso contradice el modelo de negocio.
- Faltan políticas reales (cancelación, términos, privacidad) y el contrato de la API con Zuhay.
