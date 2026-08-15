// Definición de la tool de tool-calling que usa api/chat.js. El modelo la
// invoca cuando ya calificó al visitante (tiene nombre + email + contexto
// suficiente) — el backend valida y ejecuta el guardado, nunca el cliente.

export const registrarLeadTool = {
  name: "registrar_lead",
  description:
    "Registra un lead calificado cuando el visitante ya mostró interés real y compartió su nombre y un email válido para que el equipo humano de Hellominus lo contacte y agende la llamada de diagnóstico. Llamala como máximo una vez por conversación — no la vuelvas a llamar si ya registraste este lead antes en esta misma charla.",
  input_schema: {
    type: "object",
    properties: {
      nombre: {
        type: "string",
        description: "Nombre de la persona, tal como lo dio en la conversación.",
      },
      email: {
        type: "string",
        description: "Correo del visitante para hacer seguimiento.",
      },
      empresa: {
        type: "string",
        description: "Empresa del visitante, si la mencionó. Cadena vacía si no la dio.",
      },
      sector: {
        type: "string",
        enum: ["construccion", "derecho", "ventas", "cobranza", "otro"],
        description: "Sector que mejor describe el negocio del visitante, según lo que él mismo contó.",
      },
      resumen: {
        type: "string",
        description:
          "Resumen de 1 a 3 frases en español del problema o necesidad del visitante y lo conversado, para que el equipo humano tenga contexto antes de la llamada.",
      },
    },
    required: ["nombre", "email", "resumen"],
    additionalProperties: false,
  },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Valida lo que devolvió el modelo antes de tocar la base — el schema garantiza
// la forma del JSON, no que el modelo no haya alucinado o recortado un dato.
export function validarLead(input) {
  const nombre = String(input?.nombre ?? "").trim();
  const email = String(input?.email ?? "").trim();
  const resumen = String(input?.resumen ?? "").trim();

  if (nombre.length < 2 || !EMAIL_RE.test(email) || resumen.length < 5) {
    return null;
  }

  const sectorValido = ["construccion", "derecho", "ventas", "cobranza", "otro"];
  const sector = sectorValido.includes(input?.sector) ? input.sector : "otro";

  return {
    nombre,
    email,
    empresa: String(input?.empresa ?? "").trim() || null,
    sector,
    resumen,
  };
}
