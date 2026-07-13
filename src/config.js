// Configuración de canales de contacto y analítica.
// Los valores reales se definen en un archivo .env (ver .env.example).
// Cada canal expone un flag `configured` para que la UI degrade con elegancia
// mientras no exista el dato real (sin números ni URLs inventados en producción).

const env = import.meta.env;

export const CONTACT_EMAIL = env.VITE_CONTACT_EMAIL || "contacto@hellominus.com";

// Número en formato internacional sin "+" ni espacios, ej: 573001234567
export const WHATSAPP_NUMBER = env.VITE_WHATSAPP_NUMBER || "";
export const whatsappConfigured = WHATSAPP_NUMBER.length > 6;
export const whatsappUrl = whatsappConfigured
  ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      "Hola, quiero agendar una demostración de Hellominus."
    )}`
  : null;

// URL pública de Calendly, ej: https://calendly.com/hellominus/demo
export const CALENDLY_URL = env.VITE_CALENDLY_URL || "";
export const calendlyConfigured = /^https:\/\/calendly\.com\//.test(CALENDLY_URL);

// Endpoint de Formspree, ej: https://formspree.io/f/xxxxxxxx
export const FORM_ENDPOINT = env.VITE_FORM_ENDPOINT || "";
export const formConfigured = /^https:\/\//.test(FORM_ENDPOINT);

// Analítica (se carga SOLO tras consentimiento explícito del banner de cookies)
export const CLARITY_ID = env.VITE_CLARITY_ID || "";
export const GA_ID = env.VITE_GA_ID || "";
export const analyticsConfigured = Boolean(CLARITY_ID || GA_ID);
