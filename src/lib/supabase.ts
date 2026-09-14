import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anonKey) {
  // Falla temprano y claro si falta configuración
  throw new Error(
    'Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copia .env.example a .env y complétalo.'
  );
}

export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/** URL pública de un archivo del bucket de catálogo. */
export function catalogImageUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path; // ya es URL absoluta (contenido migrado)
  return supabase.storage.from('catalog').getPublicUrl(path).data.publicUrl;
}

/**
 * Cliente SIN tipos de tabla, para acceso dinámico por nombre de tabla
 * (el panel admin genérico). Para código con tabla fija, usa `supabase`.
 */
export const sb: SupabaseClient = supabase as unknown as SupabaseClient;

export type Tables = Database['public']['Tables'];
export type Row<T extends keyof Tables> = Tables[T]['Row'];
export type Insert<T extends keyof Tables> = Tables[T]['Insert'];
export type Update<T extends keyof Tables> = Tables[T]['Update'];
