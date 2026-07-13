import { Download } from "lucide-react";
import { PLANTILLAS } from "../data/ficticios.js";

export default function Preview({ form, grupos, onGenerar }) {
  const plantilla = PLANTILLAS.find((p) => p.id === form.plantilla)?.nombre ?? "Estándar";
  const totalPersonas = grupos.reduce((acc, g) => acc + g.personas.length, 0);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-neon-cyan">Vista previa</h2>
        <button
          onClick={onGenerar}
          className="flex items-center gap-2 rounded-full bg-neon-cyan px-4 py-2 text-xs font-medium text-night-950 hover:brightness-110 transition"
        >
          <Download size={13} /> Generar certificado (PDF)
        </button>
      </div>

      <div id="certificado-preview" className="rounded-xl bg-white p-8 text-[#1a1a1a] shadow-2xl">
        <div className="mb-6 border-b-2 border-[#4c1d78] pb-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4c1d78]">Certificado de cobertura</p>
          <p className="mt-1 text-xs text-slate-500">Plantilla: {plantilla}</p>
        </div>

        <p className="mb-4 text-sm leading-relaxed">
          Por medio del presente se certifica que <strong>{form.cliente || "[Cliente]"}</strong>, en calidad de{" "}
          {form.clienteTipo.toLowerCase()}, cuenta con cobertura vigente bajo la póliza N° <strong>{form.poliza || "[N° Póliza]"}</strong>,
          con vigencia {form.vigencia || "[vigencia]"}, en {form.moneda}.
        </p>

        <div className="mb-4 grid grid-cols-2 gap-3 text-xs">
          <Row label="Fecha de emisión" value={form.fecha} />
          <Row label="Ámbito de cobertura" value={form.ambito} />
          <Row label="Actividad" value={form.actividad} />
          <Row label="Beneficiario" value={form.beneficiario} />
          <Row label="Tomador" value={form.tomador} />
          <Row label="Total asegurados" value={String(totalPersonas)} />
        </div>

        {grupos.map((g) => g.personas.length > 0 && (
          <div key={g.id} className="mb-4">
            <p className="mb-1.5 text-xs font-semibold text-[#4c1d78]">{g.nombre}</p>
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-slate-300 text-left text-slate-500">
                  <th className="py-1 pr-2 font-medium">Apellido y nombre</th>
                  <th className="py-1 pr-2 font-medium">Documento</th>
                  <th className="py-1 font-medium">Vigencia</th>
                </tr>
              </thead>
              <tbody>
                {g.personas.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="py-1 pr-2">{p.nombre}</td>
                    <td className="py-1 pr-2">{p.documento}</td>
                    <td className="py-1">{p.desde} — {p.hasta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        <p className="mt-6 text-[10px] text-slate-400">
          Documento generado con datos ficticios — demo de portafolio, sin validez legal.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );
}
