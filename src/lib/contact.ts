/**
 * Datos de contacto del sitio.
 *
 * El número sale del entorno (`VITE_WHATSAPP_NUMBER`) o de `site_settings` en
 * Supabase. Vacío es un estado válido y esperado: significa "todavía no hay
 * WhatsApp configurado", y la UI debe esconder el canal en vez de generar un
 * enlace roto.
 */
export const WHATSAPP_NUMBER = String(import.meta.env.VITE_WHATSAPP_NUMBER ?? '').replace(/\D/g, '');

export const CONTACT_EMAIL = String(import.meta.env.VITE_CONTACT_EMAIL ?? 'contacto@hellominus.com');

export function buildWhatsappLink(number: string, text?: string): string {
  const digits = String(number ?? '').replace(/\D/g, '');
  if (!digits) return '';
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}
