import { money } from "../lib/format.js";

export default function TopEmpresasChart({ empresas }) {
  const max = Math.max(...empresas.map((e) => e.monto), 1);
  return (
    <div className="space-y-2.5">
      {empresas.map((e) => (
        <div key={e.nombre} className="flex items-center gap-3">
          <span className="w-40 shrink-0 truncate text-right text-xs text-[#3d1466]/70 sm:w-56" title={e.nombre}>
            {e.nombre}
          </span>
          <div className="h-6 flex-1 rounded bg-[#f0ebfa]">
            <div
              className="flex h-full items-center justify-end rounded px-2 text-[11px] font-semibold text-white"
              style={{ width: `${Math.max((e.monto / max) * 100, 8)}%`, backgroundColor: e.color }}
            >
              {money(e.monto)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
