import { useState } from "react";
import { ChevronDown, ArrowRight, ShieldAlert, GitBranch, Layers, Terminal } from "lucide-react";
import PipelineDiagram from "./PipelineDiagram.jsx";

const STACK = ["Python", "pandas", "openpyxl / xlrd", "FastAPI", "HTML + JS vanilla", "Outlook COM (win32com)", "JSON como store"];

const CODE_HERRAMIENTA = `# Herramienta_<ASEGURADORA>.py — patrón repetido en las 13 herramientas
def detectar_header(path, max_scan=15):
    """El header no siempre está en la fila 0: cada aseguradora mueve
    títulos, logos o filas de merge. Se escanean las primeras filas
    buscando las columnas clave."""
    tmp = leer_sin_header(path, nrows=max_scan)
    for i, fila in enumerate(tmp):
        if {"contrato", "cuit"}.issubset(normalizar(fila)):
            return i
    return 0

def leer_reporte(path):
    header_row = detectar_header(path)
    df = pd.read_excel(path, header=header_row)
    df.columns = [normalizar(c) for c in df.columns]
    # cada aseguradora tiene su propio mapeo columna→campo final
    return df.rename(columns=MAPEO)[COLUMNAS_FINALES]`;

const CODE_MASTER = `# PROCESAR_TODO.py — orquestador
CATALOGO = [
  {"nombre": "ASEGURADORA X", "script": "Herramienta_X.py", ...},
  {"nombre": "ASEGURADORA Y", "script": "Herramienta_Y.py", ...},
  # ... 13 entradas, una por aseguradora
]

for herramienta in CATALOGO:
    if hay_archivo_nuevo(herramienta):
        ejecutar(herramienta["script"], cwd=herramienta["cwd"])
        log(f"{herramienta['nombre']}: procesado")`;

const CODE_APP = `# comisiones.py — el panel no re-implementa el parseo:
# busca en cada carpeta el "final" del mes y suma la columna
# de comisión, sabiendo qué excluir (ej. no confundir "%comision"
# con el monto real de "comision").
ARTES_COMISION = [
  {"id": "x", "carpeta": "ASEGURADORA X",
   "col_specs": [(["comision"], ["porcentaje", "%", "pje"])]},
  ...
]`;

const FAQ = [
  {
    q: "¿Por qué 13 scripts en vez de un parser genérico?",
    a: "Cada aseguradora define su propio Excel: columnas distintas, headers movidos, algunas separan cápitas y masa salarial, otras no las informan. Un parser genérico terminaba lleno de excepciones ilegibles — 13 scripts chicos y explícitos son más fáciles de mantener que uno gigante con ifs por aseguradora.",
  },
  {
    q: "¿Qué pasa cuando una aseguradora cambia el formato de un día para el otro?",
    a: "Pasó en la práctica: una aseguradora reemplazó su reporte detallado (con CUIT, cápitas, masa salarial y alícuotas) por uno reducido que solo trae póliza, razón social, base de cálculo y % de comisión — sin CUIT. La herramienta de esa aseguradora ahora detecta ambos formatos automáticamente y, cuando falta el CUIT, lo reconstruye cruzando el número de póliza contra 40+ reportes históricos guardados. Los campos que la aseguradora ya no informa (cápitas, masa salarial) quedan vacíos y visibles, en vez de inventarse.",
  },
  {
    q: "¿Cómo se evita el error de dividir dos veces el impuesto (IIBB)?",
    a: "Algunas aseguradoras ya entregan el monto de comisión con el impuesto incluido; otras entregan la base y el % por separado. Si una herramienta recalcula el monto \"a mano\" en vez de tomar el que la aseguradora ya calculó, puede terminar generando un neto sin el impuesto — y el panel, que divide por el factor del impuesto para mostrar el neto, lo termina restando dos veces. La regla que quedó documentada: siempre preferir el monto que la fuente ya calculó; recalcular solo como último recurso, y en ese caso replicar el mismo factor.",
  },
  {
    q: "¿Qué pasa si una aseguradora todavía no mandó el reporte del mes?",
    a: "El panel permite marcar esa aseguradora con el total del mes anterior como estimado (queda con una etiqueta visible \"mes anterior\"), para no dejar un hueco en el cuadro mientras se espera el reporte real. Es reversible con un click.",
  },
];

export default function CaseStudy({ onOpenDemo }) {
  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      {/* Hero */}
      <div className="mb-14">
        <span className="inline-block rounded-full border border-neon-cyan/30 bg-neon-cyan/5 px-3 py-1 text-[11px] text-neon-cyan mb-4">
          Caso de estudio · Automatización de datos
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-white leading-tight mb-4">
          De 13 reportes distintos a un cuadro de comisiones en un click
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
          Un bróker de seguros gestiona pólizas de ART (riesgos del trabajo) para cientos de empresas. Cada mes,
          13 aseguradoras distintas mandan su propio reporte de comisiones — sin formato estándar, cada una con sus
          columnas, sus reglas y, a veces, sin avisar cuando cambian el layout. Antes se reconciliaba todo a mano en
          Excel. Ahora es un pipeline de scripts + un panel web que arma el cuadro consolidado automáticamente.
        </p>
        <button
          onClick={onOpenDemo}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-neon-cyan text-night-950 px-5 py-2.5 text-sm font-medium hover:brightness-110 transition"
        >
          Ver demo interactiva <ArrowRight size={15} />
        </button>
      </div>

      {/* Pipeline */}
      <Section icon={Layers} title="Cómo fluye la información">
        <PipelineDiagram />
      </Section>

      {/* Stack */}
      <Section icon={Terminal} title="Stack técnico">
        <div className="flex flex-wrap gap-2">
          {STACK.map((s) => (
            <span key={s} className="rounded-full border border-night-600 bg-night-900/60 px-3 py-1 text-xs text-slate-400">
              {s}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-4 leading-relaxed">
          Sin base de datos: cada "final" es un Excel versionado en la carpeta del mes (auditable a simple vista,
          cero fricción para quien no programa) y el panel lee esos archivos al vuelo. Los overrides manuales
          (aseguradoras 100% manuales o estimaciones de "mes anterior") se guardan en un JSON chico aparte.
        </p>
      </Section>

      {/* Código */}
      <Section icon={GitBranch} title="Tres capas de código (sanitizado / genérico)">
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          El código real usa nombres y rutas de la operación; acá va el patrón general de cada capa.
        </p>
        <CodeBlock label="Herramienta por aseguradora" code={CODE_HERRAMIENTA} />
        <CodeBlock label="Script maestro (orquestador)" code={CODE_MASTER} />
        <CodeBlock label="Panel — suma columna correcta de cada final" code={CODE_APP} />
      </Section>

      {/* Resiliencia */}
      <Section icon={ShieldAlert} title="Manual — preguntas frecuentes">
        <div className="space-y-2">
          {FAQ.map((f, i) => (
            <FaqItem key={i} q={f.q} a={f.a} />
          ))}
        </div>
      </Section>

      <div className="mt-14 rounded-2xl border border-neon-cyan/20 bg-neon-cyan/5 p-6 text-center">
        <p className="text-sm text-slate-300 mb-4">¿Querés tocar el panel vos mismo? Todos los datos son ficticios.</p>
        <button
          onClick={onOpenDemo}
          className="inline-flex items-center gap-2 rounded-full bg-neon-cyan text-night-950 px-5 py-2.5 text-sm font-medium hover:brightness-110 transition"
        >
          Abrir demo interactiva <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="mb-14">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} className="text-neon-cyan" />
        <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function CodeBlock({ label, code }) {
  return (
    <div className="mb-4 rounded-xl border border-night-700 overflow-hidden">
      <div className="bg-night-800 px-4 py-2 text-[11px] text-slate-400 border-b border-night-700">{label}</div>
      <pre className="bg-night-950 p-4 text-[11px] leading-relaxed text-slate-400 overflow-x-auto font-mono-num">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-night-700 bg-night-900/50 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="text-sm text-slate-200 font-medium">{q}</span>
        <ChevronDown size={15} className={`shrink-0 text-slate-500 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="px-4 pb-4 text-xs text-slate-500 leading-relaxed">{a}</p>}
    </div>
  );
}
