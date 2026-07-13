import { useState } from "react";
import PolizaForm from "./demo/PolizaForm.jsx";
import GruposAsegurados from "./demo/GruposAsegurados.jsx";
import Preview from "./demo/Preview.jsx";
import Historial from "./demo/Historial.jsx";
import { FORM_VACIO, HISTORIAL_INICIAL, nextId } from "./data/ficticios.js";

export default function DemoApp() {
  const [form, setForm] = useState(FORM_VACIO);
  const [grupos, setGrupos] = useState([{ id: "g0", nombre: "Empleados", personas: [] }]);
  const [historial, setHistorial] = useState(HISTORIAL_INICIAL);

  function cargarDeHistorial(h) {
    setForm((f) => ({ ...f, poliza: h.poliza, cliente: h.cliente, fecha: h.fecha, plantilla: h.plantilla }));
    setGrupos(h.grupos.map((g) => ({ ...g, id: nextId("grp"), personas: g.personas.map((p) => ({ ...p, id: nextId("per") })) })));
  }

  function generar() {
    setHistorial((hs) => [
      { id: nextId("hist"), poliza: form.poliza || "SIN-POLIZA", cliente: form.cliente || "Sin cliente", fecha: form.fecha, plantilla: form.plantilla, grupos },
      ...hs,
    ]);
    window.print();
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="mb-6">
        <h1 className="font-display text-xl font-semibold text-white">Generador de certificados</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Réplica funcional de la app de escritorio real (rediseñada) — mismos campos y flujo, datos completamente ficticios.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <PolizaForm form={form} setForm={setForm} />
          <GruposAsegurados grupos={grupos} setGrupos={setGrupos} />
          <Historial historial={historial} onCargar={cargarDeHistorial} />
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Preview form={form} grupos={grupos} onGenerar={generar} />
        </div>
      </div>
    </div>
  );
}
