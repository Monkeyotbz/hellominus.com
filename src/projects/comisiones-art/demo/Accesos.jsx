import { useState } from "react";
import { Eye, EyeOff, Copy, ExternalLink } from "lucide-react";
import { ACCESOS } from "../data/ficticios.js";

export default function Accesos() {
  const [revealed, setRevealed] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  function toggle(id) {
    setRevealed((r) => ({ ...r, [id]: !r[id] }));
  }

  function copy(text, key) {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1200);
  }

  return (
    <div>
      <div className="rounded-2xl border border-night-700 bg-night-900/50 p-4 mb-4">
        <p className="text-xs text-slate-500">
          Acceso directo a los portales de cada aseguradora. Usuario y clave ocultos por defecto — click en el ojo
          para revelar, o copiá directamente. (Credenciales ficticias)
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ACCESOS.map((a) => {
          const shown = !!revealed[a.id];
          return (
            <div key={a.id} className="rounded-xl border border-night-700 bg-night-900/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-200">{a.nombre}</span>
                <a
                  href={a.url}
                  onClick={(e) => e.preventDefault()}
                  title={a.url}
                  className="text-slate-500 hover:text-neon-cyan transition"
                >
                  <ExternalLink size={13} />
                </a>
              </div>

              <Campo label="Usuario" value={a.usuario} shown={shown} k={`${a.id}-u`} copy={copy} copiedKey={copiedKey} />
              <Campo label="Clave" value={a.clave} shown={shown} secret k={`${a.id}-p`} copy={copy} copiedKey={copiedKey} />

              <button
                onClick={() => toggle(a.id)}
                className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 transition"
              >
                {shown ? <EyeOff size={12} /> : <Eye size={12} />} {shown ? "Ocultar" : "Revelar"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Campo({ label, value, shown, secret, k, copy, copiedKey }) {
  const display = shown || !secret ? value : "•".repeat(Math.min(value.length, 10));
  return (
    <div className="flex items-center justify-between text-[12px] py-1">
      <span className="text-slate-500 w-14 shrink-0">{label}</span>
      <span className="font-mono-num text-slate-300 flex-1 truncate">
        {secret && !shown ? "•".repeat(Math.min(value.length, 10)) : display}
      </span>
      <button onClick={() => copy(value, k)} className="ml-2 text-slate-500 hover:text-neon-cyan transition">
        <Copy size={12} />
      </button>
      {copiedKey === k && <span className="ml-1 text-[10px] text-emerald-400">✓</span>}
    </div>
  );
}
