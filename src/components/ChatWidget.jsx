import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Loader2, Send, Sparkles, X } from "lucide-react";
import { CHAT_ENABLED } from "../config.js";
import { useChatWidget } from "../context/ChatWidgetContext.jsx";

const SALUDO_INICIAL =
  "¡Hola! Soy el asistente de IA de Hellominus. Contame qué proceso te está quitando tiempo hoy y te doy una primera lectura.";

const MENSAJE_ERROR_RED =
  "No pude conectarme en este momento. Escribinos por WhatsApp o el formulario de contacto mientras lo resolvemos.";

async function streamRespuesta(messages, onDelta) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok || !res.body) {
    onDelta(MENSAJE_ERROR_RED);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    onDelta(decoder.decode(value, { stream: true }));
  }
}

export default function ChatWidget() {
  const { isOpen, openChat, closeChat } = useChatWidget();
  const [messages, setMessages] = useState([{ role: "assistant", content: SALUDO_INICIAL }]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isOpen]);

  if (!CHAT_ENABLED) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const texto = input.trim();
    if (!texto || sending) return;

    const historial = [...messages, { role: "user", content: texto }];
    setMessages([...historial, { role: "assistant", content: "" }]);
    setInput("");
    setSending(true);

    try {
      await streamRespuesta(historial, (delta) => {
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: "assistant",
            content: next[next.length - 1].content + delta,
          };
          return next;
        });
      });
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", content: MENSAJE_ERROR_RED };
        return next;
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openChat}
        aria-label="Abrir el asistente de IA de Hellominus"
        className="fixed bottom-6 right-24 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-neon-cyan to-neon-violet text-night-950 shadow-[0_0_28px_rgba(167,139,250,0.4)] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_44px_rgba(167,139,250,0.6)]"
      >
        <Bot className="h-7 w-7" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Chat de Hellominus"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 flex h-[min(600px,calc(100dvh-7rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-night-900/95 shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-white/8 bg-night-800/80 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neon-violet/25 bg-neon-violet/10">
                  <Sparkles className="h-4 w-4 text-neon-violet" aria-hidden="true" />
                </div>
                <p className="font-display text-sm font-semibold text-white">Hellominus</p>
              </div>
              <button
                type="button"
                onClick={closeChat}
                aria-label="Cerrar el asistente"
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Mensajes */}
            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "ml-auto bg-gradient-to-r from-neon-cyan to-neon-violet text-night-950"
                      : "bg-white/5 text-slate-200"
                  }`}
                >
                  {m.content || (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-white/8 px-4 py-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribí tu mensaje…"
                disabled={sending}
                className="min-w-0 flex-1 rounded-full border border-white/10 bg-night-800/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-neon-cyan/60 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                aria-label="Enviar mensaje"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-neon-cyan to-neon-violet text-night-950 transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
