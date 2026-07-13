import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, RefreshCw } from "lucide-react";
import { ASEGURADORAS, PERIODOS, periodLabel, periodKey } from "../data/ficticios.js";

export default function Sidebar({
  pagina, setPagina,
  periodo, setPeriodo,
  aseguradoraFiltro, setAseguradoraFiltro,
  metrica, setMetrica,
  onAccionAvanzada,
}) {
  const [avanzadasOpen, setAvanzadasOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  return (
    <aside className="w-full shrink-0 bg-gradient-to-b from-[#5b1e96] to-[#3d1466] text-white sm:w-72 sm:min-h-full">
      <div className="border-b border-white/10 px-6 py-6">
        <p className="font-display text-2xl font-extrabold tracking-tight lowercase">wtw</p>
        <p className="text-[10px] font-semibold tracking-widest text-white/70">COLLECTIONS INTELLIGENCE</p>
      </div>

      <nav className="px-4 py-4 space-y-1">
        {[
          { id: "bad-debt", label: "Análisis Bad Debt" },
          { id: "gestion", label: "Gestión de Cobro" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setPagina(item.id)}
            className={`flex w-full items-center gap-2 rounded-lg border-l-2 px-3 py-2.5 text-left text-sm transition ${
              pagina === item.id
                ? "border-orange-400 bg-white/10 font-semibold text-white"
                : "border-transparent text-white/70 hover:bg-white/5"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${pagina === item.id ? "bg-orange-400" : "bg-white/30"}`} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="px-4 pb-2 pt-3">
        <p className="px-2 text-[10px] font-semibold tracking-widest text-white/50">DATOS</p>
        <div className="mt-2 flex items-center gap-2 px-2 text-xs text-white/70">
          <Folder size={13} /> 5 archivo(s) en memoria
        </div>
        <button
          onClick={() => { setSyncing(true); setTimeout(() => setSyncing(false), 900); }}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-sm font-medium hover:bg-white/20 transition"
        >
          <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Sincronizando..." : "Sincronizar datos"}
        </button>
      </div>

      <div className="px-4 py-2">
        <button
          onClick={() => setAvanzadasOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-2 rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-[#4c1d78]"
        >
          <span className="flex items-center gap-1.5">
            {avanzadasOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />} Opciones avanzadas
          </span>
        </button>
        {avanzadasOpen && (
          <div className="mt-2 space-y-1.5">
            <p className="px-2 text-[10px] font-semibold tracking-widest text-white/50">AUDITORÍA</p>
            {["Cruce de Deuda", "Auditoría Inbroker", "Análisis del Cruce"].map((label) => (
              <button
                key={label}
                onClick={() => onAccionAvanzada(label)}
                className="w-full rounded-lg bg-white/10 px-3 py-2 text-xs text-white/85 hover:bg-white/15 transition"
              >
                {label}
              </button>
            ))}
            <hr className="my-2 border-white/10" />
            <button
              onClick={() => onAccionAvanzada("Reiniciar base de datos")}
              className="w-full rounded-lg bg-white/10 px-3 py-2 text-xs text-white/85 hover:bg-white/15 transition"
            >
              Reiniciar base de datos
            </button>
          </div>
        )}
      </div>

      <div className="px-4 pb-6 pt-3 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/80">Seleccionar Mes:</label>
          <select
            value={periodKey(periodo)}
            onChange={(e) => setPeriodo(PERIODOS.find((p) => periodKey(p) === e.target.value))}
            className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none [color-scheme:dark]"
          >
            {PERIODOS.map((p) => (
              <option key={periodKey(p)} value={periodKey(p)} className="text-night-900">
                {periodLabel(p)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/80">Filtrar Aseguradora:</label>
          <select
            value={aseguradoraFiltro}
            onChange={(e) => setAseguradoraFiltro(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none [color-scheme:dark]"
          >
            <option value="Todas" className="text-night-900">Todas</option>
            {ASEGURADORAS.map((a) => (
              <option key={a.id} value={a.id} className="text-night-900">{a.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-medium text-white/80">Ver por:</p>
          <div className="space-y-1">
            {["Bad Debt", "Prima pendiente"].map((m) => (
              <label key={m} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-white/5">
                <input
                  type="radio"
                  checked={metrica === m}
                  onChange={() => setMetrica(m)}
                  className="accent-orange-400"
                />
                {m}
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
