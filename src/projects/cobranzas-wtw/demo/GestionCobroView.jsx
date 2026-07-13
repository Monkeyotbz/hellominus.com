import { periodLabel } from "../data/ficticios.js";
import { money } from "../lib/format.js";

export default function GestionCobroView({ periodo, datos, gestion }) {
  return (
    <div className="px-6 py-8 sm:px-10">
      <h1 className="font-display text-3xl font-bold text-[#4c1d78]">Gestión de Cobro</h1>
      <div className="mt-3 h-[3px] w-full bg-gradient-to-r from-orange-400 to-transparent" />
      <p className="mt-2 text-xs text-[#3d1466]/70">Deuda +6 meses · {periodLabel(periodo)}</p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Facturas con deuda +6 meses" value={datos.totalFacturas.toLocaleString("en-US")} />
        <Kpi label="Monto total en riesgo" value={money(datos.totalPendiente)} />
        <Kpi label="Operaciones imputadas en el mes" value={gestion.imputadas.toLocaleString("en-US")} />
        <Kpi label="Bad Debt recuperado en el mes" value={money(gestion.recuperado)} />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <Table title="Desglose por tramo de antigüedad" rows={gestion.tramos} labelKey="tramo" />
        <Table title="Desglose por tipo de riesgo" rows={gestion.porRiesgo} labelKey="riesgo" />
      </div>
    </div>
  );
}

function Kpi({ label, value }) {
  return (
    <div className="rounded-xl border border-[#4c1d78]/10 bg-white/70 p-4">
      <p className="text-xs text-[#3d1466]/60">{label}</p>
      <p className="mt-1 font-display text-xl font-bold text-[#26113f]">{value}</p>
    </div>
  );
}

function Table({ title, rows, labelKey }) {
  return (
    <div>
      <h2 className="font-display text-lg font-semibold text-[#4c1d78]">{title}</h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#4c1d78]/10 bg-white/70">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#4c1d78] text-left text-xs text-white">
              <th className="px-4 py-2.5 font-semibold capitalize">{labelKey}</th>
              <th className="px-4 py-2.5 font-semibold">Facturas</th>
              <th className="px-4 py-2.5 text-right font-semibold">Monto</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r[labelKey]} className={i % 2 === 0 ? "bg-white/60" : ""}>
                <td className="px-4 py-2.5 text-[#3d1466]/80">{r[labelKey]}</td>
                <td className="px-4 py-2.5 text-[#3d1466]/80">{r.facturas.toLocaleString("en-US")}</td>
                <td className="px-4 py-2.5 text-right font-medium text-[#26113f]">{money(r.monto)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
