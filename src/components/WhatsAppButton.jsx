import { MessageCircle } from "lucide-react";
import { whatsappConfigured, whatsappUrl } from "../config.js";

// Botón flotante de WhatsApp (patrón Quixy). Solo aparece cuando
// VITE_WHATSAPP_NUMBER está configurado — nunca mostramos un número falso.
export default function WhatsAppButton() {
  if (!whatsappConfigured) return null;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir a Hellominus por WhatsApp"
      className="fixed bottom-6 right-6 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-neon-emerald text-night-950 shadow-[0_0_28px_rgba(52,211,153,0.45)] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_44px_rgba(52,211,153,0.65)]"
    >
      <MessageCircle className="h-7 w-7" aria-hidden="true" />
    </a>
  );
}
