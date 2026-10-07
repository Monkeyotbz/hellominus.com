import { create } from 'zustand';
import { POSTS, type BlogPost, type Lang } from './data';

interface BlogState {
  /** 'todo' o el slug de una categoría. */
  category: string;
  /** Idioma de la interfaz y del contenido: español con botón para ver en inglés. */
  lang: Lang;
  query: string;
  /** Artículos mostrados: los de la base si hay, si no los ejemplos de data.ts. */
  posts: BlogPost[];
  source: 'ejemplo' | 'base';
  setCategory: (category: string) => void;
  setLang: (lang: Lang) => void;
  setQuery: (query: string) => void;
  setPosts: (posts: BlogPost[]) => void;
}

export const useBlogStore = create<BlogState>((set) => ({
  category: 'todo',
  lang: 'es',
  query: '',
  posts: POSTS,
  source: 'ejemplo',
  setCategory: (category) => set({ category }),
  setLang: (lang) => set({ lang }),
  setQuery: (query) => set({ query }),
  setPosts: (posts) => set({ posts, source: 'base' }),
}));
