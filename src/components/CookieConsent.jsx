import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";
import { analyticsConfigured } from "../config.js";
import { loadAnalytics } from "../lib/analytics.js";

const STORAGE_KEY = "hellominus-cookie-consent"; // "accepted" | "rejected"

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!analyticsConfigured) return; // sin analítica configurada no hay nada que consentir
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "accepted") {
      loadAnalytics();
    } else if (stored !== "rejected") {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const decide = (choice) => {
    localStorage.setItem(STORAGE_KEY, choice);
    setVisible(false);
    if (choice === "accepted") loadAnalytics();
  };

  return (
    <div
      role="dialog"
      aria-label="Preferencias de cookies"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-2xl border border-white/10 bg-night-800/95 p-5 shadow-2xl backdrop-blur sm:inset-x-6"
    >
      <div className="flex items-start gap-3">
        <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-neon-cyan" aria-hidden="true" />
        <div>
          <p className="text-sm text-slate-300">
            Usamos cookies de analítica para entender cómo se usa el sitio y
            mejorarlo. Si las rechazas, no se cargará ningún script de
            seguimiento.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => decide("accepted")}
              className="rounded-full bg-gradient-to-r from-neon-cyan to-sky-500 px-5 py-2 font-display text-xs font-semibold text-night-950 transition-transform hover:scale-105"
            >
              Aceptar analítica
            </button>
            <button
              type="button"
              onClick={() => decide("rejected")}
              className="rounded-full border border-white/15 px-5 py-2 font-display text-xs font-semibold text-slate-300 transition-colors hover:border-white/40 hover:text-white"
            >
              Rechazar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
