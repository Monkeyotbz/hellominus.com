// Backend del chat de ventas. Función serverless de Vercel (runtime Node.js,
// sin vercel.json — Web Handler estándar). Stateless por turno: el cliente
// reenvía todo el historial en texto plano en cada request; el tool-calling
// (registrar_lead) se resuelve por completo acá adentro, nunca se expone al
// cliente un bloque tool_use/tool_result.

import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./_lib/systemPrompt.js";
import { registrarLeadTool, validarLead } from "./_lib/tools.js";
import { guardarLead } from "./_lib/supabase.js";
import { notificarLead } from "./_lib/notify.js";

export const config = { maxDuration: 60 };

const anthropic = new Anthropic(); // lee ANTHROPIC_API_KEY del entorno

const MODEL = "claude-sonnet-5";
const MAX_TURNS = 30;
const MAX_TOTAL_CHARS = 12000;

const FALLBACK_MESSAGE =
  "Uy, no pude conectarme en este momento. Mientras lo resolvemos, escribinos por WhatsApp o el formulario de contacto — el equipo responde igual.";

function isAllowedOrigin(origin) {
  if (!origin) return true; // algunos requests same-origin legítimos no mandan Origin
  try {
    const { hostname } = new URL(origin);
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "hellominus.com" ||
      hostname.endsWith(".hellominus.com") ||
      hostname.endsWith(".vercel.app")
    );
  } catch {
    return false;
  }
}

function sanitizeHistory(messages) {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_TURNS) {
    return null;
  }

  let totalChars = 0;
  const history = [];

  for (const m of messages) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") {
      return null;
    }
    const content = m.content.trim();
    if (!content) continue;
    totalChars += content.length;
    history.push({ role: m.role, content });
  }

  if (totalChars === 0 || totalChars > MAX_TOTAL_CHARS) return null;
  return history;
}

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    if (!isAllowedOrigin(request.headers.get("origin"))) {
      return new Response("Forbidden", { status: 403 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response("Body inválido", { status: 400 });
    }

    const history = sanitizeHistory(body?.messages);
    if (!history) {
      return new Response("Formato de mensajes inválido", { status: 400 });
    }

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        const send = (text) => controller.enqueue(encoder.encode(text));

        try {
          const stream = anthropic.messages.stream({
            model: MODEL,
            max_tokens: 700,
            system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
            tools: [registrarLeadTool],
            messages: history,
          });

          stream.on("text", send);
          const final = await stream.finalMessage();

          const toolUse = final.content.find((b) => b.type === "tool_use" && b.name === "registrar_lead");

          if (toolUse) {
            const lead = validarLead(toolUse.input);
            let toolResultText;

            if (lead) {
              await guardarLead({ lead, transcripcion: [...history, { role: "assistant", content: final.content }] });
              await notificarLead(lead);
              toolResultText = "ok: lead registrado";
            } else {
              toolResultText = "error: los datos estaban incompletos (falta nombre o email válido) — pedile al visitante que los confirme antes de reintentar";
            }

            const stream2 = anthropic.messages.stream({
              model: MODEL,
              max_tokens: 300,
              system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
              messages: [
                ...history,
                { role: "assistant", content: final.content },
                {
                  role: "user",
                  content: [{ type: "tool_result", tool_use_id: toolUse.id, content: toolResultText }],
                },
              ],
            });

            stream2.on("text", send);
            await stream2.finalMessage();
          }

          controller.close();
        } catch (err) {
          console.error("[api/chat] error:", err);
          try {
            send(FALLBACK_MESSAGE);
          } catch {
            // el stream ya pudo haber emitido texto parcial antes de fallar; no hay mucho más que hacer
          }
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
    });
  },
};
