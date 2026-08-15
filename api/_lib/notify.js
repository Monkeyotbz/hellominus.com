// Notificación por correo cuando el chat registra un lead — reusa el mismo
// endpoint de Formspree que ya usa src/components/Contact.jsx (server-side,
// por eso lee process.env.FORM_ENDPOINT y no import.meta.env.VITE_FORM_ENDPOINT,
// que no existe dentro de una función de Vercel).

const FORM_ENDPOINT = process.env.FORM_ENDPOINT || "";
export const notifyConfigured = /^https:\/\//.test(FORM_ENDPOINT);

export async function notificarLead(lead) {
  if (!notifyConfigured) return;

  try {
    await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        nombre: lead.nombre,
        email: lead.email,
        empresa: lead.empresa || "—",
        mensaje: `[Chat IA] ${lead.resumen}`,
      }),
    });
  } catch (err) {
    console.error("[chat] error notificando lead por Formspree:", err.message);
  }
}
