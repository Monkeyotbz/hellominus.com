import { useState } from "react";
import { Download, Info } from "lucide-react";
import { periodLabel } from "../data/ficticios.js";
import { money } from "../lib/format.js";
import TopEmpresasChart from "./TopEmpresasChart.jsx";
import EvolucionBadDebtChart from "./EvolucionBadDebtChart.jsx";
import DonutAseguradoras from "./DonutAseguradoras.jsx";

export default function BadDebtView({ periodo, aseguradoraFiltro, datos }) {
  const [descargando, setDescargando] = useState(false);

  return (
    <div className="px-6 py-8 sm:px-10">
      <h1 className="font-display text-3xl font-bold text-[#4c1d78]">
        Auditoría Bad Debt — {periodLabel(periodo)}
      </h1>
      <div className="mt-3 h-[3px] w-full bg-gradient-to-r from-orange-400 to-transparent" />

      <p className="mt-4 flex items-center gap-2 text-xs text-[#3d1466]/70">
        <Info size={13} /> Los montos mostrados descuentan las operaciones ya imputadas — reflejan el saldo pendiente
        ficticio de esta demo.
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        <Kpi label="Total Bad Debt pendiente" value={money(datos.totalPendiente)} />
        <Kpi label="Facturas sin cobrar" value={datos.totalFacturas.toLocaleString("en-US")} />
        <Kpi label="Compañías aseguradoras" value={String(datos.aseguradorasActivas)} />
      </div>

      <button
        onClick={() => { setDescargando(true); setTimeout(() => setDescargando(false), 1200); }}
        className="mt-6 flex items-center gap-2 rounded-lg border border-[#4c1d78]/20 bg-white px-4 py-2.5 text-sm font-medium text-[#4c1d78] shadow-sm hover:bg-[#f0ebfa] transition"
      >
        <Download size={15} className={descargando ? "animate-bounce" : ""} />
        {descargando ? "Generando reporte..." : "Descargar reporte PDF — Bad Debt"}
      </button>

      <Section title={`Las ${datos.topEmpresas.length} empresas que más deben`} subtitle="Cada barra muestra el saldo pendiente neto. El color indica con qué aseguradora tiene la póliza.">
        <TopEmpresasChart empresas={datos.topEmpresas} />
      </Section>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <Section title={`Cómo cambió la deuda mes a mes — ${aseguradoraFiltro === "Todas" ? "Todas" : datos.topEmpresas[0]?.aseguradora ?? ""}`}>
          <EvolucionBadDebtChart evolucion={datos.evolucion} />
        </Section>
        <Section title="Reparto por aseguradora">
          <DonutAseguradoras porAseguradora={datos.porAseguradora} />
        </Section>
      </div>
    </div>
  );
}

function Kpi({ label, value }) {
  return (
    <div>
      <p className="text-xs text-[#3d1466]/60">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-[#26113f]">{value}</p>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div className="mt-10">
      <h2 className="font-display text-lg font-semibold text-[#4c1d78]">{title}</h2>
      {subtitle && <p className="mt-1 text-xs text-[#3d1466]/70">{subtitle}</p>}
      <div className="mt-4 rounded-xl border border-[#4c1d78]/10 bg-white/70 p-5">{children}</div>
    </div>
  );
}
