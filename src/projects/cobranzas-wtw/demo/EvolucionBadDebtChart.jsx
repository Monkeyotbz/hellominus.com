import { MESES, periodKey } from "../data/ficticios.js";
import { money } from "../lib/format.js";

export default function EvolucionBadDebtChart({ evolucion }) {
  const max = Math.max(...evolucion.map((m) => m.pendiente + m.imputada), 1);
  return (
    <div>
      <div className="mb-3 flex items-center gap-4 text-xs text-[#3d1466]/70">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-orange-500" /> Pendiente</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Ya imputada</span>
      </div>
      <div className="flex h-56 items-end gap-3">
        {evolucion.map((m) => {
          const total = m.pendiente + m.imputada;
          const hTotal = Math.max((total / max) * 100, 4);
          const pendPct = total > 0 ? (m.pendiente / total) * 100 : 0;
          return (
            <div key={periodKey(m.periodo)} className="group flex h-full flex-1 flex-col items-center justify-end">
              <span className="mb-1 text-[10px] text-[#3d1466]/60 opacity-0 transition group-hover:opacity-100">
                {money(total)}
              </span>
              <div className="flex w-full flex-col justify-end overflow-hidden rounded-t-md" style={{ height: `${hTotal}%` }}>
                <div className="bg-emerald-500" style={{ height: `${100 - pendPct}%` }} />
                <div className="bg-orange-500" style={{ height: `${pendPct}%` }} />
              </div>
              <span className="mt-2 text-[10px] capitalize text-[#3d1466]/60">
                {MESES[m.periodo.mes].slice(0, 3)}-{String(m.periodo.anio).slice(2)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
