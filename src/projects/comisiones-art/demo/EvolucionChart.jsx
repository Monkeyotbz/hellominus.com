import { capFirst, arsM, ars } from "../lib/format.js";

export default function EvolucionChart({ historico }) {
  const totales = historico.map((m) => m.subTotal);
  const max = Math.max(...totales, 1);

  return (
    <div>
      <p className="text-xs text-slate-500 mb-4">Evolución mensual — comisiones netas totales (en millones de ARS)</p>

      <div className="flex items-end gap-3 h-48 mb-2 px-1">
        {historico.map((m) => {
          const h = Math.max((m.subTotal / max) * 100, 3);
          return (
            <div key={`${m.anio}-${m.mes}`} className="flex-1 flex flex-col items-center justify-end h-full group">
              <span className="text-[10px] text-slate-400 mb-1 font-mono-num opacity-0 group-hover:opacity-100 transition">
                {arsM(m.subTotal)}
              </span>
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-neon-cyan/20 to-neon-cyan/70 border border-neon-cyan/40 transition-all"
                style={{ height: `${h}%` }}
              />
              <span className="text-[10px] text-slate-500 mt-2 capitalize">
                {capFirst(m.mesNombre).slice(0, 3)}-{String(m.anio).slice(2)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-6">
        {historico.map((m, i) => {
          const prev = historico[i - 1];
          const delta = prev ? ((m.subTotal - prev.subTotal) / prev.subTotal) * 100 : null;
          return (
            <div key={`${m.anio}-${m.mes}`} className="rounded-lg border border-night-700 bg-night-800/60 p-2.5">
              <p className="text-[10px] text-slate-500 capitalize">{capFirst(m.mesNombre)} {m.anio}</p>
              <p className="text-sm font-semibold text-slate-100 mt-0.5">{ars(m.subTotal)}</p>
              {delta !== null && (
                <p className={`text-[10px] mt-0.5 ${delta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
