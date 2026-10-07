/**
 * Prerender del blog para buscadores y redes sociales. Script determinista:
 * no llama a ningún modelo de IA. Corre después de `vite build`.
 *
 * Qué genera en dist/:
 *   - blog/index.html y blog/<slug>/index.html: copia de index.html con título,
 *     descripción, Open Graph, canonical y JSON-LD propios, y el contenido del
 *     artículo en HTML dentro de #root (React lo reemplaza al cargar).
 *   - sitemap.xml y robots.txt.
 *
 * Lee los artículos publicados con la clave pública (anon) de Supabase. Si no
 * hay variables o la consulta falla, no rompe el build: genera solo las rutas
 * fijas y avisa por consola.
 *
 * Variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY y SITE_URL (opcional,
 * por defecto https://hellominus.com).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

/** Lee .env y .env.local para builds locales; en Vercel las variables ya vienen en process.env. */
function loadEnv() {
  const env = { ...process.env };
  for (const name of ['.env', '.env.local']) {
    const file = join(ROOT, name);
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && env[m[1]] === undefined) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  }
  return env;
}

const env = loadEnv();
const SITE = (env.SITE_URL || 'https://hellominus.com').replace(/\/$/, '');
const SB_URL = (env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SB_KEY = env.VITE_SUPABASE_ANON_KEY || '';
const BRAND = 'Hellominus';
const BLOG_TITLE = 'Blog — Hellominus';
const BLOG_DESC =
  'Destinos en Colombia, consejos para viajar y para cuidar el presupuesto, escritos para quien viaja con un portátil en la maleta.';

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const imageUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  if (path.startsWith('/')) return SITE + path;
  return `${SB_URL}/storage/v1/object/public/catalog/${path}`;
};

async function rest(path) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

async function loadData() {
  if (!SB_URL || !SB_KEY || SB_KEY.startsWith('placeholder')) {
    console.warn('[prerender] Sin credenciales de Supabase: se generan solo las rutas fijas.');
    return { posts: [], stays: [], tours: [] };
  }
  try {
    const [posts, stays, tours] = await Promise.all([
      rest('blog_posts?select=slug,title,excerpt,body,cover_image_path,published_at,updated_at,reading_minutes,meta_title,meta_description,category:blog_categories(slug,name)&status=eq.published&order=published_at.desc'),
      rest('accommodations?select=slug,updated_at&status=eq.published'),
      rest('tours?select=slug,updated_at&status=eq.published'),
    ]);
    return { posts, stays, tours };
  } catch (err) {
    console.warn('[prerender] No se pudo leer Supabase, se generan solo las rutas fijas:', err.message);
    return { posts: [], stays: [], tours: [] };
  }
}

const es = (v) => (v && typeof v === 'object' ? v.es || '' : '');

/** Cambia título, descripción, canonical, Open Graph y JSON-LD de la plantilla. */
function page(template, { title, description, url, image, type = 'website', jsonLd, content }) {
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta\s+name="description"[\s\S]*?\/>/, '')
    .replace(/<meta\s+property="og:[a-z:]+"[\s\S]*?\/>/g, '')
    .replace(/<link\s+rel="canonical"[\s\S]*?\/>/, '');
  const head = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:site_name" content="${BRAND}" />`,
    `<meta property="og:locale" content="es_CO" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    image ? `<meta property="og:image" content="${esc(image)}" />` : '',
    `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />`,
    jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>` : '',
  ]
    .filter(Boolean)
    .join('\n    ');
  html = html.replace('</head>', `    ${head}\n  </head>`);
  // Contenido legible sin JavaScript; React lo reemplaza al montar la aplicación.
  return html.replace('<div id="root"></div>', `<div id="root">${content}</div>`);
}

const STATIC_STYLE = 'style="max-width:820px;margin:0 auto;padding:32px 16px;font-family:Georgia,serif;color:#22211e"';

function paragraphs(text) {
  return String(text || '')
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => (b.startsWith('## ') ? `<h2>${esc(b.slice(3))}</h2>` : `<p>${esc(b)}</p>`))
    .join('');
}

function write(route, html) {
  const dir = join(DIST, route);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
}

async function main() {
  const templatePath = join(DIST, 'index.html');
  if (!existsSync(templatePath)) throw new Error('Falta dist/index.html: corre primero `vite build`.');
  const template = readFileSync(templatePath, 'utf8');
  const { posts, stays, tours } = await loadData();

  // /blog
  const list = posts
    .map((p) => `<li><a href="/blog/${esc(p.slug)}">${esc(es(p.title))}</a> — ${esc(es(p.excerpt))}</li>`)
    .join('');
  write(
    'blog',
    page(template, {
      title: BLOG_TITLE,
      description: BLOG_DESC,
      url: `${SITE}/blog`,
      jsonLd: { '@context': 'https://schema.org', '@type': 'Blog', name: BLOG_TITLE, url: `${SITE}/blog`, description: BLOG_DESC },
      content: `<main ${STATIC_STYLE}><h1>Blog</h1><p>${esc(BLOG_DESC)}</p><ul>${list}</ul></main>`,
    }),
  );

  // /blog/<slug>
  for (const p of posts) {
    const title = es(p.meta_title) || es(p.title);
    const description = es(p.meta_description) || es(p.excerpt);
    const url = `${SITE}/blog/${p.slug}`;
    const image = imageUrl(p.cover_image_path);
    write(
      `blog/${p.slug}`,
      page(template, {
        title: `${title} — Blog Hellominus`,
        description,
        url,
        image,
        type: 'article',
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: es(p.title),
          description,
          image: image || undefined,
          datePublished: p.published_at,
          dateModified: p.updated_at || p.published_at,
          inLanguage: 'es-CO',
          articleSection: es(p.category?.name),
          author: { '@type': 'Organization', name: 'Redacción Hellominus' },
          publisher: { '@type': 'Organization', name: BRAND, url: SITE },
          mainEntityOfPage: url,
        },
        content: `<main ${STATIC_STYLE}><p><a href="/blog">Blog</a></p><article><h1>${esc(es(p.title))}</h1><p>${esc(es(p.excerpt))}</p>${paragraphs(es(p.body))}</article></main>`,
      }),
    );
  }

  // sitemap.xml
  const day = (d) => (d ? String(d).slice(0, 10) : undefined);
  const urls = [
    { loc: '/' },
    { loc: '/blog', lastmod: day(posts[0]?.published_at) },
    { loc: '/hospedajes' },
    { loc: '/tours' },
    { loc: '/destinos' },
    { loc: '/nosotros' },
    { loc: '/anfitriones' },
    ...posts.map((p) => ({ loc: `/blog/${p.slug}`, lastmod: day(p.updated_at || p.published_at) })),
    ...stays.map((s) => ({ loc: `/hospedajes/${s.slug}`, lastmod: day(s.updated_at) })),
    ...tours.map((t) => ({ loc: `/tours/${t.slug}`, lastmod: day(t.updated_at) })),
  ];
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => `  <url><loc>${esc(SITE + u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n') +
    '\n</urlset>\n';
  writeFileSync(join(DIST, 'sitemap.xml'), xml);

  // robots.txt: las zonas privadas no se indexan.
  writeFileSync(
    join(DIST, 'robots.txt'),
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /panel\nDisallow: /cuenta\nDisallow: /login\n\nSitemap: ${SITE}/sitemap.xml\n`,
  );

  console.log(`[prerender] ${posts.length} artículos, ${urls.length} URLs en sitemap.xml (${SITE}).`);
}

main().catch((err) => {
  console.error('[prerender] Error:', err);
  process.exit(1);
});
