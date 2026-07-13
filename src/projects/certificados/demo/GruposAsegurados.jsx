import { useState } from "react";
import { Plus, Trash2, Users, ClipboardPaste } from "lucide-react";
import { nextId } from "../data/ficticios.js";

export default function GruposAsegurados({ grupos, setGrupos }) {
  const [grupoActivo, setGrupoActivo] = useState(grupos[0]?.id ?? null);
  const [nuevoGrupo, setNuevoGrupo] = useState("");
  const [persona, setPersona] = useState({ nombre: "", documento: "", desde: "", hasta: "" });
  const [bulk, setBulk] = useState("");

  const grupo = grupos.find((g) => g.id === grupoActivo) ?? grupos[0];

  function agregarGrupo() {
    if (!nuevoGrupo.trim()) return;
    const g = { id: nextId("grp"), nombre: nuevoGrupo.trim(), personas: [] };
    setGrupos((gs) => [...gs, g]);
    setGrupoActivo(g.id);
    setNuevoGrupo("");
  }

  function eliminarGrupo(id) {
    setGrupos((gs) => gs.filter((g) => g.id !== id));
    if (grupoActivo === id) setGrupoActivo(null);
  }

  function agregarPersona() {
    if (!grupo || !persona.nombre.trim()) return;
    setGrupos((gs) => gs.map((g) => g.id === grupo.id
      ? { ...g, personas: [...g.personas, { ...persona, id: nextId("per") }] }
      : g));
    setPersona({ nombre: "", documento: "", desde: "", hasta: "" });
  }

  function eliminarPersona(personaId) {
    setGrupos((gs) => gs.map((g) => g.id === grupo.id
      ? { ...g, personas: g.personas.filter((p) => p.id !== personaId) }
      : g));
  }

  function cargarBulk() {
    if (!grupo || !bulk.trim()) return;
    const nuevas = bulk.trim().split("\n").map((line) => {
      const partes = line.split(/\t|\s{2,}/).map((s) => s.trim()).filter(Boolean);
      const [nombre = "", documento = "", desde = "", hasta = ""] = partes;
      return { id: nextId("per"), nombre, documento, desde, hasta };
    }).filter((p) => p.nombre);
    setGrupos((gs) => gs.map((g) => g.id === grupo.id
      ? { ...g, personas: [...g.personas, ...nuevas] }
      : g));
    setBulk("");
  }

  return (
    <div className="rounded-2xl border border-night-700 bg-night-800/60 p-6 backdrop-blur">
      <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-neon-cyan mb-4 flex items-center gap-2">
        <Users size={14} /> Asegurados por grupo
      </h2>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {grupos.map((g) => (
          <button
            key={g.id}
            onClick={() => setGrupoActivo(g.id)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              grupo?.id === g.id ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30" : "text-slate-400 border border-night-600 hover:text-slate-200"
            }`}
          >
            {g.nombre} <span className="text-[10px] opacity-70">({g.personas.length})</span>
          </button>
        ))}
        <div className="flex items-center gap-1.5">
          <input
            value={nuevoGrupo}
            onChange={(e) => setNuevoGrupo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && agregarGrupo()}
            placeholder="Nuevo grupo..."
            className="w-32 rounded-full border border-night-600 bg-night-900/60 px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-neon-cyan/50"
          />
          <button onClick={agregarGrupo} className="rounded-full bg-neon-cyan/10 p-1.5 text-neon-cyan hover:bg-neon-cyan/20 transition">
            <Plus size={13} />
          </button>
        </div>
      </div>

      {grupo ? (
        <>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs text-slate-500">Grupo: <span className="text-slate-300 font-medium">{grupo.nombre}</span></p>
            <button onClick={() => eliminarGrupo(grupo.id)} className="flex items-center gap-1 text-[11px] text-rose-400/80 hover:text-rose-400">
              <Trash2 size={12} /> eliminar grupo
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-night-700">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-night-900/80 text-left text-slate-400">
                  <th className="px-3 py-2 font-medium">Apellido y nombre</th>
                  <th className="px-3 py-2 font-medium">Documento</th>
                  <th className="px-3 py-2 font-medium">Desde</th>
                  <th className="px-3 py-2 font-medium">Hasta</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {grupo.personas.map((p) => (
                  <tr key={p.id} className="border-t border-night-700/60">
                    <td className="px-3 py-2 text-slate-200">{p.nombre}</td>
                    <td className="px-3 py-2 text-slate-400">{p.documento}</td>
                    <td className="px-3 py-2 text-slate-400">{p.desde}</td>
                    <td className="px-3 py-2 text-slate-400">{p.hasta}</td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => eliminarPersona(p.id)} className="text-slate-500 hover:text-rose-400">
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
                {grupo.personas.length === 0 && (
                  <tr><td colSpan={5} className="px-3 py-4 text-center text-slate-600">Sin personas cargadas todavía</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
            <input placeholder="Apellido Nombre" value={persona.nombre} onChange={(e) => setPersona((p) => ({ ...p, nombre: e.target.value }))} className="col-span-2 rounded-lg border border-night-600 bg-night-900/60 px-2.5 py-1.5 text-xs text-slate-100 outline-none focus:border-neon-cyan/50 sm:col-span-1" />
            <input placeholder="Documento" value={persona.documento} onChange={(e) => setPersona((p) => ({ ...p, documento: e.target.value }))} className="rounded-lg border border-night-600 bg-night-900/60 px-2.5 py-1.5 text-xs text-slate-100 outline-none focus:border-neon-cyan/50" />
            <input type="date" value={persona.desde} onChange={(e) => setPersona((p) => ({ ...p, desde: e.target.value }))} className="rounded-lg border border-night-600 bg-night-900/60 px-2.5 py-1.5 text-xs text-slate-100 outline-none focus:border-neon-cyan/50" />
            <input type="date" value={persona.hasta} onChange={(e) => setPersona((p) => ({ ...p, hasta: e.target.value }))} className="rounded-lg border border-night-600 bg-night-900/60 px-2.5 py-1.5 text-xs text-slate-100 outline-none focus:border-neon-cyan/50" />
            <button onClick={agregarPersona} className="flex items-center justify-center gap-1 rounded-lg bg-neon-cyan/10 px-2.5 py-1.5 text-xs font-medium text-neon-cyan hover:bg-neon-cyan/20 transition">
              <Plus size={13} /> Agregar
            </button>
          </div>

          <div className="mt-4">
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <ClipboardPaste size={12} /> Carga masiva (pegar desde Excel: Nombre · Documento · Desde · Hasta)
            </label>
            <textarea
              value={bulk}
              onChange={(e) => setBulk(e.target.value)}
              rows={3}
              placeholder={"GÓMEZ MARÍA\t30.221.884\t2026-01-01\t2026-12-31"}
              className="w-full rounded-lg border border-night-600 bg-night-900/60 px-3 py-2 text-xs text-slate-100 outline-none focus:border-neon-cyan/50 font-mono-num"
            />
            <button onClick={cargarBulk} className="mt-2 rounded-lg border border-night-600 px-3 py-1.5 text-xs text-slate-300 hover:border-neon-cyan/40 hover:text-neon-cyan transition">
              Cargar lista
            </button>
          </div>
        </>
      ) : (
        <p className="text-xs text-slate-600">Creá un grupo para empezar a cargar asegurados.</p>
      )}
    </div>
  );
}
