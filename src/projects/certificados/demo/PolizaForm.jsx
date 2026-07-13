import { PLANTILLAS, MONEDAS } from "../data/ficticios.js";

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-400">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-night-600 bg-night-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30"
      />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-night-600 bg-night-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30"
      >
        {options.map((o) => (
          <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
    </label>
  );
}

export default function PolizaForm({ form, setForm }) {
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="rounded-2xl border border-night-700 bg-night-800/60 p-6 backdrop-blur">
      <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-neon-cyan mb-4">
        Datos de la póliza
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Póliza" value={form.poliza} onChange={set("poliza")} placeholder="AR-00000" />
        <Field label="Fecha" type="date" value={form.fecha} onChange={set("fecha")} />
        <Field label="Cliente (contratante)" value={form.cliente} onChange={set("cliente")} placeholder="Razón social" />
        <Select
          label="Tipo de cliente"
          value={form.clienteTipo}
          onChange={set("clienteTipo")}
          options={["Empresa (contratante)", "Persona"]}
        />
        <Field label="Vigencia" value={form.vigencia} onChange={set("vigencia")} placeholder="01/01/2026 - 31/12/2026" />
        <Field label="Ámbito de cobertura" value={form.ambito} onChange={set("ambito")} placeholder="Argentina / Regional" />
        <Field label="Actividad" value={form.actividad} onChange={set("actividad")} placeholder="Rubro del contratante" />
        <Field label="Beneficiario" value={form.beneficiario} onChange={set("beneficiario")} />
        <Field label="Tomador" value={form.tomador} onChange={set("tomador")} />
        <Select label="Moneda" value={form.moneda} onChange={set("moneda")} options={MONEDAS} />
        <Select
          label="Tipo de plantilla"
          value={form.plantilla}
          onChange={set("plantilla")}
          options={PLANTILLAS.map((p) => ({ value: p.id, label: p.nombre }))}
        />
      </div>
    </div>
  );
}
