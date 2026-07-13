import { useMemo, useState } from "react";
import { ChevronDown, Mail, Send, AlertTriangle } from "lucide-react";
import { ASEGURADORAS, CORREOS_DESTINATARIOS, construirCuadro } from "../data/ficticios.js";
import { ars, capFirst } from "../lib/format.js";

export default function Correos({ overrides }) {
  const [open, setOpen] = useState(null);
  const periodo = { mes: 7, anio: 2026 };
  const data = useMemo(() => construirCuadro(periodo.mes, periodo.anio, overrides), [overrides]);

  const conDestino = ASEGURADORAS.filter((a) => CORREOS_DESTINATARIOS[a.id]).length;

  return (
    <div>
      <div className="rounded-2xl border border-night-700 bg-night-900/50 p-4 mb-4 flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-slate-500">
          Recordatorios de comisiones — {capFirst(data.mesNombre)} {data.anio}
        </p>
        <span className="text-xs text-slate-400">{conDestino}/{ASEGURADORAS.length} con destinatario cargado</span>
      </div>

      <div className="space-y-2">
        {ASEGURADORAS.map((a) => {
          const dest = CORREOS_DESTINATARIOS[a.id];
          const art = data.artes.find((x) => x.id === a.id);
          const isOpen = open === a.id;
          return (
            <div key={a.id} className="rounded-xl border border-night-700 bg-night-900/50 overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? null : a.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-night-800/40 transition"
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: a.color }} />
                <span className="text-sm font-medium text-slate-200 flex-1">{a.nombre}</span>
                {dest ? (
                  <span className="text-[11px] text-slate-500">{dest}</span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] text-amber-400">
                    <AlertTriangle size={11} /> sin destinatario
                  </span>
                )}
                <ChevronDown size={14} className={`text-slate-500 transition ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="border-t border-night-700 px-4 py-3 bg-night-950/40">
                  <p className="text-[11px] text-slate-500 mb-2">
                    Comisión neta {capFirst(data.mesNombre)}: <span className="text-slate-300 font-mono-num">{art?.disponible ? ars(art.totalNeto) : "sin datos"}</span>
                  </p>
                  <div className="rounded-lg border border-night-700 bg-night-900 p-3 text-[12px] text-slate-400 mb-3 leading-relaxed">
                    Buen día, te recordamos que a la fecha no tenemos el reporte de comisiones de {a.nombre}{" "}
                    correspondiente a {data.mesNombre} {data.anio}. Quedamos atentos.
                  </div>
                  <button
                    disabled={!dest}
                    className="flex items-center gap-1.5 rounded-lg border border-neon-cyan/40 bg-neon-cyan/10 px-3 py-1.5 text-[11px] text-neon-cyan disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neon-cyan/20 transition"
                    onClick={() => alert(`Demo: se abriría Outlook con este mail a ${dest}`)}
                  >
                    <Send size={12} /> Simular envío
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-600">
        <Mail size={12} /> En la app real este listado se arma leyendo <code className="text-slate-500">config/contactos.json</code> y abre Outlook con la firma del usuario ya insertada.
      </p>
    </div>
  );
}
