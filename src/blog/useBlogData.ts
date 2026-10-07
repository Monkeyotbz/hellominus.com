import { useEffect, useState } from 'react';
import { fetchBlogPosts } from './services/blogService';
import { useBlogStore } from './store';

/**
 * Carga los artículos publicados una vez. Mientras no haya artículos en la base
 * se queda con los ejemplos. `ready` pasa a true cuando termina la consulta.
 */
export function useBlogData(): { ready: boolean } {
  const setPosts = useBlogStore((s) => s.setPosts);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    fetchBlogPosts().then((posts) => {
      if (!active) return;
      if (posts.length > 0) setPosts(posts);
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, [setPosts]);

  return { ready };
}

export function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}
