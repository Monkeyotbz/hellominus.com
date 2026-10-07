import { useEffect } from 'react';

interface Meta {
  title: string;
  description: string;
  /** Ruta del sitio, por ejemplo "/blog/mi-articulo". */
  path: string;
  image?: string;
}

const SITE = 'https://hellominus.com';

function setTag(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Actualiza título, descripción, canonical y Open Graph al navegar dentro de la
 * aplicación. La primera carga ya trae estos datos desde el prerender
 * (scripts/prerender-blog.mjs); esto cubre la navegación sin recargar.
 */
export function useMeta({ title, description, path, image }: Meta): void {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    setTag('meta[name="description"]', 'name', 'description', description);
    setTag('meta[property="og:title"]', 'property', 'og:title', title);
    setTag('meta[property="og:description"]', 'property', 'og:description', description);
    setTag('meta[property="og:url"]', 'property', 'og:url', SITE + path);
    if (image) setTag('meta[property="og:image"]', 'property', 'og:image', image);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = SITE + path;

    return () => {
      document.title = previous;
    };
  }, [title, description, path, image]);
}
