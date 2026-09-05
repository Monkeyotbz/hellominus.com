# Hellominus.com — contexto del ecosistema

Este repo es la landing pública de Hellominus, una consultora de IA/automatización. Es también el "cerebro" del ecosistema: acá vive la identidad de marca y el sistema de diseño que el resto de las aplicaciones del ecosistema deberían compartir.

## Ecosistema multi-repo

El ecosistema incluye otras aplicaciones (ej. un CRM de ventas) que:
- viven en **repos propios de GitHub**, independientes de este repo;
- **no se deployan** junto a esta landing (deploys separados);
- durante el desarrollo local se clonan dentro de `projects/`, que está en `.gitignore` — nada de lo que haya ahí se versiona ni se sube desde este repo.

`projects/` es solo una carpeta de trabajo para poder tener varios repos hermanos abiertos en el mismo workspace. Si en algún momento se decide vincular formalmente algún repo (submodule, symlink, etc.), documentarlo acá.

No confundir con `src/projects/`: esa carpeta es interna a la landing, contiene las páginas de casos del portafolio (`src/projects/*.html`) y sí se deploya como parte de este sitio.

## Sistema de diseño compartido

Al trabajar dentro de cualquier repo bajo `projects/`, mantené consistencia con la identidad visual de Hellominus salvo que ese proyecto defina explícitamente su propia identidad:
- Tipografías: Clash Display / General Sans.
- Paleta: variaciones dentro de cyan / violeta / esmeralda. Nunca amarillo/ámbar.

## Roadmap (no implementado todavía)

La idea de largo plazo es que Hellominus.com tenga un sistema agéntico capaz de operar de forma más autónoma sobre las apps del ecosistema (aplicar cambios, análisis, e incluso construir MVPs nuevos). Hoy eso no existe: el único "agente" operando sobre `projects/` es Claude Code trabajando manualmente, sesión por sesión, con supervisión del usuario. Un agente standalone con push autónomo a GitHub es una fase futura que requiere guardrails explícitos antes de construirse.
