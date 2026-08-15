// Cliente de Supabase para el backend del chat. Server-only: usa la
// service_role key, nunca debe importarse desde src/ (frontend).
// Si el proyecto todavía no está configurado, el chat sigue funcionando
// (ver ejecutarRegistrarLead en tools-runtime) — solo no persiste el lead.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_SERVICE_KEY);

export const supabase = supabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false },
    })
  : null;

export async function guardarLead({ lead, transcripcion }) {
  if (!supabaseConfigured) {
    console.warn("[chat] SUPABASE_URL/SUPABASE_SERVICE_KEY no configurados — lead no persistido:", lead.email);
    return { persisted: false };
  }

  const { error } = await supabase.from("leads").insert({
    nombre: lead.nombre,
    email: lead.email,
    empresa: lead.empresa,
    sector: lead.sector,
    resumen: lead.resumen,
    transcripcion,
    fuente: "chat_web",
  });

  if (error) {
    console.error("[chat] error insertando lead en Supabase:", error.message);
    return { persisted: false };
  }

  return { persisted: true };
}
