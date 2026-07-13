import { BrainCircuit, Mail, MapPin, MessageCircle } from "lucide-react";
import { CONTACT_EMAIL, whatsappConfigured, whatsappUrl } from "../config.js";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-night-900/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-10 sm:px-6 md:flex-row lg:px-8">
        <a href="#" className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-neon-cyan" aria-hidden="true" />
          <span className="font-display font-bold text-white">
            Hellominus<span className="text-neon-cyan">.com</span>
          </span>
        </a>

        <div className="flex flex-col items-center gap-2 text-sm text-slate-500 sm:flex-row sm:gap-6">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-2 transition-colors hover:text-neon-cyan"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            {CONTACT_EMAIL}
          </a>
          {whatsappConfigured && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition-colors hover:text-neon-emerald"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp
            </a>
          )}
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Soluciones locales, alcance global
          </span>
        </div>

        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} Hellominus.com — IA y Automatización
        </p>
      </div>
    </footer>
  );
}
