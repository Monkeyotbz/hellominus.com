import { useMemo, useState } from "react";
import Sidebar from "./demo/Sidebar.jsx";
import BadDebtView from "./demo/BadDebtView.jsx";
import GestionCobroView from "./demo/GestionCobroView.jsx";
import { PERIODOS, datosDelMes, gestionCobroDelMes } from "./data/ficticios.js";

export default function DemoApp() {
  const [pagina, setPagina] = useState("bad-debt");
  const [periodo, setPeriodo] = useState(PERIODOS[PERIODOS.length - 2]); // 2026-05, como en la app real
  const [aseguradoraFiltro, setAseguradoraFiltro] = useState("Todas");
  const [metrica, setMetrica] = useState("Bad Debt");
  const [toast, setToast] = useState(null);

  const datos = useMemo(() => datosDelMes(periodo, aseguradoraFiltro, metrica), [periodo, aseguradoraFiltro, metrica]);
  const gestion = useMemo(() => gestionCobroDelMes(periodo), [periodo]);

  function onAccionAvanzada(label) {
    setToast(label);
    setTimeout(() => setToast(null), 2200);
  }

  return (
    <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-night-700 shadow-2xl">
      <div className="flex flex-col sm:flex-row">
        <Sidebar
          pagina={pagina} setPagina={setPagina}
          periodo={periodo} setPeriodo={setPeriodo}
          aseguradoraFiltro={aseguradoraFiltro} setAseguradoraFiltro={setAseguradoraFiltro}
          metrica={metrica} setMetrica={setMetrica}
          onAccionAvanzada={onAccionAvanzada}
        />
        <div className="relative min-h-[70vh] flex-1 bg-[#f5f3fb]">
          {pagina === "bad-debt"
            ? <BadDebtView periodo={periodo} aseguradoraFiltro={aseguradoraFiltro} datos={datos} />
            : <GestionCobroView periodo={periodo} datos={datos} gestion={gestion} />}

          {toast && (
            <div className="absolute bottom-5 right-5 rounded-lg border border-[#4c1d78]/20 bg-white px-4 py-3 text-xs text-[#3d1466] shadow-lg">
              <strong>{toast}</strong> está disponible en la aplicación completa (uso interno) — no incluido en esta demo de portafolio.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
