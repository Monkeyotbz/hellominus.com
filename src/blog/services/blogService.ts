import { supabase, catalogImageUrl } from '../../lib/supabase';
import type { BlogPost, Pair } from '../data';

interface PostRow {
  slug: string;
  title: Record<string, string> | null;
  excerpt: Record<string, string> | null;
  body: Record<string, string> | null;
  cover_image_path: string | null;
  reading_minutes: number | null;
  published_at: string | null;
  featured: boolean;
  category: { slug: string } | null;
}

const COLUMNS = 'slug, title, excerpt, body, cover_image_path, reading_minutes, published_at, featured, category:blog_categories(slug)';

const pair = (value: Record<string, string> | null): Pair => ({ es: value?.es ?? '', en: value?.en || undefined });

function toPost(row: PostRow): BlogPost | null {
  const title = pair(row.title);
  if (!title.es || !row.cover_image_path) return null;
  return {
    slug: row.slug,
    category: row.category?.slug ?? 'destinos',
    title,
    excerpt: pair(row.excerpt),
    body: pair(row.body),
    minutes: row.reading_minutes ?? 5,
    image: catalogImageUrl(row.cover_image_path),
    alt: title.es,
    position: '50% 50%',
    publishedAt: (row.published_at ?? new Date().toISOString()).slice(0, 10),
    featured: row.featured,
  };
}

/**
 * Artículos publicados, del más reciente al más antiguo. Devuelve [] si falla
 * o no hay datos: quien llama decide qué mostrar (el blog usa los ejemplos).
 */
export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(COLUMNS)
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (error) {
    console.warn('No se pudieron leer los artículos, se usan los ejemplos:', error.message);
    return [];
  }
  return ((data ?? []) as unknown as PostRow[]).map(toPost).filter((p): p is BlogPost => p !== null);
}
