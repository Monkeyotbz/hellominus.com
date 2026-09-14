import { createClient } from '@supabase/supabase-js';

/**
 * Cliente separado hacia candyCRM (proyecto Supabase propio, distinto del
 * `supabase` de este sitio) — de acá sale el catálogo real (destinos,
 * hospedajes, tours). `supabase` (lib/supabase.ts) sigue siendo para
 * leads/newsletter/testimonios/site_settings, que NO viven en el CRM.
 */

const url = import.meta.env.VITE_CRM_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_CRM_SUPABASE_ANON_KEY as string;
export const CRM_TENANT_ID = import.meta.env.VITE_CRM_TENANT_ID as string;

if (!url || !anonKey || !CRM_TENANT_ID) {
  throw new Error(
    'Faltan VITE_CRM_SUPABASE_URL / VITE_CRM_SUPABASE_ANON_KEY / VITE_CRM_TENANT_ID. Copia .env.example a .env y complétalo.'
  );
}

export const crm = createClient(url, anonKey, {
  auth: { persistSession: false },
});

/** URL pública de una imagen del catálogo, en el bucket `catalog` de candyCRM. */
export function crmImageUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  return crm.storage.from('catalog').getPublicUrl(path).data.publicUrl;
}
