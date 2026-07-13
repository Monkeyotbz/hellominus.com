import { useMemo, useState } from "react";
import { RotateCcw, Copy, Send, Pencil, Check, X, History } from "lucide-react";
import { MESES, construirCuadro, historico, periodKey } from "../data/ficticios.js";
import { ars, capFirst } from "../lib/format.js";
import EvolucionChart from "./EvolucionChart.jsx";

const PERIODOS_DISPONIBLES = [
  { mes: 2, anio: 2026 }, { mes: 3, anio: 2026 }, { mes: 4, anio: 2026 },
  { mes: 5, anio: 2026 }, { mes: 6, anio: 2026 }, { mes: 7, anio: 2026 },
];

function prevPeriod(mes, anio) {
  return mes === 1 ? { mes: 12, anio: anio - 1 } : { mes: mes - 1, anio };
}

export default function CuadroComisiones({ overrides, setOverrides }) {
  const [periodo, setPeriodo] = useState({ mes: 7, anio: 2026 });
  const [view, setView] = useState("tabla");
  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [copied, setCopied] = useState(false);
  const [emailPreview, setEmailPreview] = useState(false);

  const data = useMemo(() => construirCuadro(periodo.mes, periodo.anio, overrides), [periodo, overrides]);
  const prevData = useMemo(() => {
    const p = prevPeriod(periodo.mes, periodo.anio);
    return construirCuadro(p.mes, p.anio, overrides);
  }, [periodo, overrides]);
  const hist = useMemo(() => historico(periodo.mes, periodo.anio, 6, overrides), [periodo, overrides]);

  function saveOverride(artId, rawVal) {
    setOverrides((prev) => {
      const key = periodKey(periodo.mes, periodo.anio);
      const next = { ...prev, [key]: { ...(prev[key] || {}) } };
      if (rawVal === null) {
        delete next[key][artId];
      } else {
        const normalized = rawVal.trim().replace(/\./g, "").replace(",", ".");
        const parsed = parseFloat(normalized);
        if (!isNaN(parsed)) next[key][artId] = parsed;
      }
      return next;
    });
    setEditingId(null);
  }

  function usarMesAnterior(artId) {
    const prevArt = prevData.artes.find((a) => a.id === artId);
    if (!prevArt || prevArt.totalBruto === null) {
      alert(`${capFirst(prevData.mesNombre)} ${prevData.anio} tampoco tiene datos cargados para esta aseguradora.`);
      return;
    }
    saveOverride(artId, String(prevArt.totalBruto));
  }

  function copiar() {
    const lineas = [
      `Aseguradora\t${capFirst(data.mesNombre)} ${data.anio}`,
      ...data.artes.map((a) => `${a.nombre}${a.conIibb ? " *" : ""}\t${a.totalNeto !== null ? a.totalNeto.toFixed(2) : "Sin datos"}`),
      "",
      `Sub Total\t${data.subTotal.toFixed(2)}`,
      `Total comisiones sin IIBB\t${data.totalSinIibb.toFixed(2)}`,
    ].join("\n");
    navigator.clipboard?.writeText(lineas);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="rounded-2xl border border-night-700 bg-night-900/50 p-4 sm:p-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select
          value={periodo.mes}
          onChange={(e) => setPeriodo((p) => ({ ...p, mes: Number(e.target.value) }))}
          className="rounded-lg border border-night-600 bg-night-800 px-2.5 py-1.5 text-xs text-slate-200"
        >
          {PERIODOS_DISPONIBLES.map((p) => (
            <option key={p.mes} value={p.mes}>{capFirst(MESES[p.mes])}</option>
          ))}
        </select>
        <select
          value={periodo.anio}
          onChange={(e) => setPeriodo((p) => ({ ...p, anio: Number(e.target.value) }))}
          className="rounded-lg border border-night-600 bg-night-800 px-2.5 py-1.5 text-xs text-slate-200"
        >
          <option value={2026}>2026</option>
        </select>
        <button
          onClick={() => setPeriodo((p) => ({ ...p }))}
          className="flex items-center gap-1.5 rounded-lg border border-night-600 px-2.5 py-1.5 text-xs text-slate-300 hover:border-neon-cyan/40 hover:text-neon-cyan transition"
        >
          <RotateCcw size={12} /> Refrescar
        </button>

        <div className="flex-1" />

        <div className="flex rounded-lg border border-night-600 overflow-hidden text-xs">
          <button
            onClick={() => setView("tabla")}
            className={`px-3 py-1.5 ${view === "tabla" ? "bg-neon-cyan/10 text-neon-cyan" : "text-slate-400"}`}
          >
            Tabla
          </button>
          <button
            onClick={() => setView("grafico")}
            className={`px-3 py-1.5 border-l border-night-600 ${view === "grafico" ? "bg-neon-cyan/10 text-neon-cyan" : "text-slate-400"}`}
          >
            Evolución
          </button>
        </div>

        <button
          onClick={copiar}
          className="flex items-center gap-1.5 rounded-lg border border-night-600 px-2.5 py-1.5 text-xs text-slate-300 hover:border-neon-cyan/40 hover:text-neon-cyan transition"
        >
          <Copy size={12} /> {copied ? "Copiado" : "Copiar"}
        </button>
        <button
          onClick={() => setEmailPreview(true)}
          className="flex items-center gap-1.5 rounded-lg bg-neon-cyan/15 border border-neon-cyan/40 px-2.5 py-1.5 text-xs text-neon-cyan hover:bg-neon-cyan/25 transition"
        >
          <Send size={12} /> Enviar por correo
        </button>
      </div>

      {view === "tabla" ? (
        <TablaCuadro
          data={data}
          editingId={editingId}
          editVal={editVal}
          setEditVal={setEditVal}
          setEditingId={setEditingId}
          saveOverride={saveOverride}
          usarMesAnterior={usarMesAnterior}
        />
      ) : (
        <EvolucionChart historico={hist} />
      )}

      {emailPreview && <EmailPreviewModal data={data} prevData={prevData} onClose={() => setEmailPreview(false)} />}
    </div>
  );
}

function TablaCuadro({ data, editingId, editVal, setEditVal, setEditingId, saveOverride, usarMesAnterior }) {
  return (
    <>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-night-700">
            <th className="pb-2 font-medium">Aseguradora</th>
            <th className="pb-2 font-medium text-right">{capFirst(data.mesNombre)} {data.anio}</th>
            <th className="pb-2 font-medium w-10"></th>
          </tr>
        </thead>
        <tbody>
          {data.artes.map((a) => (
            <tr
              key={a.id}
              className={`group border-b border-night-800 ${a.conIibb ? "bg-neon-cyan/[0.03]" : ""}`}
            >
              <td className="py-2 pr-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full mr-2" style={{ background: a.color }} />
                {a.nombre}
                {a.conIibb && (
                  <span className="ml-2 rounded border border-neon-cyan/40 text-neon-cyan text-[9px] px-1 py-0.5 uppercase">÷1,21</span>
                )}
                {a.estimado && (
                  <span className="ml-2 rounded border border-amber-400/40 text-amber-300 text-[9px] px-1 py-0.5 uppercase">mes anterior</span>
                )}
                {a.manual && !a.disponible && (
                  <span className="ml-2 rounded border border-amber-400/40 text-amber-300 text-[9px] px-1 py-0.5 uppercase">manual</span>
                )}
              </td>
              <td className="py-2 text-right font-mono-num">
                {editingId === a.id ? (
                  <input
                    autoFocus
                    value={editVal}
                    onChange={(e) => setEditVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveOverride(a.id, editVal);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="w-36 rounded border border-neon-cyan/50 bg-night-800 px-2 py-1 text-right text-xs"
                    placeholder="0,00"
                  />
                ) : (
                  <span className={a.disponible ? "text-slate-200" : "italic text-slate-600"}>
                    {a.disponible ? ars(a.totalNeto) : "—"}
                  </span>
                )}
              </td>
              <td className="py-2 text-right">
                {editingId === a.id ? (
                  <span className="flex justify-end gap-1">
                    <button onClick={() => saveOverride(a.id, editVal)} className="text-emerald-400 hover:text-emerald-300"><Check size={14} /></button>
                    <button onClick={() => setEditingId(null)} className="text-rose-400 hover:text-rose-300"><X size={14} /></button>
                  </span>
                ) : a.manual ? (
                  <button
                    onClick={() => { setEditingId(a.id); setEditVal(a.totalNeto ?? ""); }}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-neon-cyan transition"
                  >
                    <Pencil size={13} />
                  </button>
                ) : !a.disponible ? (
                  <button
                    onClick={() => usarMesAnterior(a.id)}
                    title="Usar el total del mes anterior"
                    className="flex items-center gap-1 text-[10px] text-amber-300 hover:text-amber-200"
                  >
                    <History size={12} /> mes anterior
                  </button>
                ) : a.estimado ? (
                  <button
                    onClick={() => saveOverride(a.id, null)}
                    title="Quitar estimado"
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <X size={13} />
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
          <tr className="border-t border-night-700">
            <td className="pt-3 font-semibold text-slate-200">Sub Total</td>
            <td className="pt-3 text-right font-mono-num font-semibold text-slate-200">{ars(data.subTotal)}</td>
            <td></td>
          </tr>
          <tr className="bg-neon-cyan/[0.06]">
            <td className="py-2 font-semibold text-neon-cyan">
              Total comisiones sin IIBB <span className="text-[10px] font-normal">(÷1,06)</span>
            </td>
            <td className="py-2 text-right font-mono-num font-bold text-neon-cyan">{ars(data.totalSinIibb)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-slate-500">
        <span>🔷 Fila celeste = comisión con IIBB (÷1,21 aplicado)</span>
        <span>✎ Hover en filas manuales para editar</span>
        <span>↺ "mes anterior" = fallback cuando la aseguradora todavía no entregó el reporte</span>
      </div>
    </>
  );
}

function EmailPreviewModal({ data, prevData, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-night-700 bg-night-900 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-sm font-semibold text-white">Vista previa del correo</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X size={16} /></button>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          En la app real esto abre Outlook con el mail pre-armado (destinatario, asunto y tabla HTML) para revisar
          antes de enviar. En esta demo solo se simula la vista.
        </p>
        <div className="rounded-lg border border-night-700 bg-night-800 p-3 text-xs space-y-2 max-h-64 overflow-y-auto">
          <p><span className="text-slate-500">Para:</span> destinatario@ejemplo.example</p>
          <p><span className="text-slate-500">Asunto:</span> Cuadro de comisiones ART - {capFirst(data.mesNombre)} - {data.anio}</p>
          <table className="w-full mt-2 text-[11px]">
            <thead>
              <tr className="text-slate-500 text-left">
                <th className="font-normal">Aseguradora</th>
                <th className="font-normal text-right">{capFirst(prevData.mesNombre).slice(0,3)}-{String(prevData.anio).slice(2)}</th>
                <th className="font-normal text-right">{capFirst(data.mesNombre).slice(0,3)}-{String(data.anio).slice(2)}</th>
              </tr>
            </thead>
            <tbody>
              {data.artes.map((a) => {
                const p = prevData.artes.find((x) => x.id === a.id);
                return (
                  <tr key={a.id} className="border-t border-night-700/60">
                    <td className="py-1">{a.nombre}</td>
                    <td className="py-1 text-right font-mono-num">{p?.totalNeto != null ? ars(p.totalNeto) : "—"}</td>
                    <td className="py-1 text-right font-mono-num">{a.totalNeto != null ? ars(a.totalNeto) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-neon-cyan/15 border border-neon-cyan/40 py-2 text-xs text-neon-cyan hover:bg-neon-cyan/25 transition"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
