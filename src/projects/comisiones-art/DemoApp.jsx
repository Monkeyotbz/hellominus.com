import { useState } from "react";
import { Table2, Mail, KeyRound } from "lucide-react";
import CuadroComisiones from "./demo/CuadroComisiones.jsx";
import Correos from "./demo/Correos.jsx";
import Accesos from "./demo/Accesos.jsx";

const TABS = [
  { id: "cuadro", label: "Cuadro de comisiones", icon: Table2 },
  { id: "correos", label: "Correos", icon: Mail },
  { id: "accesos", label: "Accesos", icon: KeyRound },
];

export default function DemoApp() {
  const [tab, setTab] = useState("cuadro");
  // Overrides ficticios en memoria: { "2026-7": { faro: 1234.56 } }
  const [overrides, setOverrides] = useState({});

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-white">Panel de Comisiones ART</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Réplica funcional de la app real — mismos flujos, datos completamente ficticios.
          </p>
        </div>
        <div className="flex gap-1 rounded-xl border border-night-700 bg-night-900/60 p-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  tab === t.id ? "bg-neon-cyan/10 text-neon-cyan" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon size={13} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "cuadro" && <CuadroComisiones overrides={overrides} setOverrides={setOverrides} />}
      {tab === "correos" && <Correos overrides={overrides} />}
      {tab === "accesos" && <Accesos />}
    </div>
  );
}
