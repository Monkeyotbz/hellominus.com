import { History } from "lucide-react";
import { PLANTILLAS } from "../data/ficticios.js";

export default function Historial({ historial, onCargar }) {
  if (historial.length === 0) return null;
  return (
    <div className="rounded-2xl border border-night-700 bg-night-800/60 p-6 backdrop-blur">
      <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-neon-cyan mb-4 flex items-center gap-2">
        <History size={14} /> Historial de certificados
      </h2>
      <ul className="space-y-2">
        {historial.map((h) => (
          <li key={h.id}>
            <button
              onClick={() => onCargar(h)}
              className="flex w-full items-center justify-between gap-3 rounded-lg border border-night-700 bg-night-900/50 px-3 py-2.5 text-left text-xs hover:border-neon-cyan/30 transition"
            >
              <span>
                <span className="block font-medium text-slate-200">{h.poliza} · {h.cliente}</span>
                <span className="text-slate-500">{h.fecha} · {PLANTILLAS.find((p) => p.id === h.plantilla)?.nombre}</span>
              </span>
              <span className="shrink-0 text-neon-cyan">Cargar</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
