import { useState } from "react";
import { ChevronDown, ArrowRight, ShieldAlert, GitBranch, Layers, Terminal } from "lucide-react";

const STACK = ["Python", "Streamlit", "pandas", "SQLite", "Plotly", "fpdf2", "openpyxl / xlrd"];

const CODE_INGESTA = `# procesar_archivos() — cada corrida de "Sincronizar datos"
def procesar_archivos(ruta_carpeta):
    """Los reportes de Finanzas e Inbroker llegan como Excel sueltos,
    con nombre de archivo variable. Se detecta el período (AAAA-MM) a
    partir del nombre, se identifica la hoja de datos real (no todos
    los libros la traen en la hoja 0) y se normalizan columnas antes
    de escribir a SQLite."""
    for archivo in glob.glob(f"{ruta_carpeta}/*.xlsx"):
        periodo = extraer_periodo(archivo)
        hoja = encontrar_hoja_datos(cargar_excel(archivo))
        df = normalizar_df(leer_hoja(archivo, hoja), MAPA_COLUMNAS)
        validar_df(df, tipo="bad_debt", nombre_archivo=archivo)
        guardar_en_sqlite(df, tabla="bad_debt", periodo=periodo)`;

const CODE_CRUCE = `# Análisis del Cruce — Finanzas vs. Inbroker
# Dos sistemas independientes describen la misma deuda; no siempre
# coinciden. El cruce identifica facturas que Finanzas reporta pero
# Inbroker no tiene registradas (o viceversa) para auditar el saldo.
def cruzar(df_finanzas, df_inbroker, llave="idoperacion"):
    cruce = df_finanzas.merge(df_inbroker, on=llave, how="outer", indicator=True)
    solo_finanzas = cruce[cruce["_merge"] == "left_only"]
    saldo_no_confirmado = solo_finanzas["monto"].sum()
    return cruce, solo_finanzas, saldo_no_confirmado`;

const CODE_RIESGO = `# clasificar_riesgo() + ageing_a_meses()
# La antigüedad de cada factura (en meses) determina el tramo de
# ageing y una heurística de riesgo (alto / medio / bajo) usada
# para priorizar la gestión de cobro.
def ageing_a_meses(fecha_factura):
    return (hoy() - fecha_factura).days // 30

def clasificar_riesgo(seccion, ageing_meses):
    if ageing_meses >= 12 or seccion in SECCIONES_ALTO_RIESGO:
        return "Alto"
    if ageing_meses >= 6:
        return "Medio"
    return "Bajo"`;

const FAQ = [
  {
    q: "¿Por qué SQLite y no una base de datos gestionada?",
    a: "El dashboard corre on-premise, sobre los mismos archivos Excel que ya se reciben por correo cada mes. SQLite evita depender de un servidor de base de datos: un solo archivo versionable, fácil de respaldar y de inspeccionar directamente si algo no cuadra.",
  },
  {
    q: "¿Cómo se concilian dos sistemas que no siempre están de acuerdo?",
    a: "Finanzas y el sistema Inbroker registran la misma deuda por separado. El módulo 'Análisis del Cruce' hace un merge por número de operación y aísla las facturas que un sistema reporta y el otro no — la alerta de 'saldo sin verificar' es justamente ese descuadre, para que el equipo lo revise antes de dar un monto por cerrado.",
  },
  {
    q: "¿Qué pasa si un reporte mensual llega con columnas distintas a las del mes anterior?",
    a: "normalizar_df() mapea nombres de columna variables (con acentos, mayúsculas o alias distintos) a un esquema fijo interno, y validar_df() corta la carga con un mensaje claro si falta una columna obligatoria — en vez de insertar filas incompletas silenciosamente en la base histórica.",
  },
  {
    q: "¿Por qué separar 'Bad Debt' de 'Gestión de Cobro' si comparten los mismos datos?",
    a: "Bad Debt responde '¿cuánto se debe y a quién?' — es la foto de auditoría. Gestión de Cobro responde '¿qué se está haciendo al respecto?' — tramos de antigüedad, nivel de riesgo, operaciones ya imputadas y monto recuperado en el mes. Mezclar ambas vistas hacía que el usuario de negocio (que solo necesita gestionar) tuviera que navegar controles de auditoría que no le servían.",
  },
];

export default function CaseStudy({ onOpenDemo }) {
  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <div className="mb-14">
        <span className="inline-block rounded-full border border-neon-cyan/30 bg-neon-cyan/5 px-3 py-1 text-[11px] text-neon-cyan mb-4">
          Caso de estudio · Dashboard de cobranzas — WTW
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-white leading-tight mb-4">
          De reportes Excel dispersos a un panel de auditoría de cartera vencida
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
          El equipo de cobranzas gestiona miles de facturas pendientes repartidas entre decenas de aseguradoras y dos
          sistemas que no siempre coinciden (Finanzas e Inbroker). Antes, el seguimiento de cartera vencida ("bad
          debt") se armaba a mano cada mes en Excel. Hoy es un dashboard en Streamlit que sincroniza los reportes,
          concilia ambos sistemas, clasifica riesgo por antigüedad y genera reportes en PDF listos para auditoría.
        </p>
        <button
          onClick={onOpenDemo}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-neon-cyan text-night-950 px-5 py-2.5 text-sm font-medium hover:brightness-110 transition"
        >
          Ver demo interactiva <ArrowRight size={15} />
        </button>
      </div>

      <Section icon={Layers} title="Qué resuelve">
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-400 leading-relaxed">
          <li>Auditoría de Bad Debt: cuánto se debe, a qué aseguradora está atada cada póliza y qué empresas concentran la mayor deuda.</li>
          <li>Gestión de Cobro: la misma deuda vista por tramo de antigüedad y nivel de riesgo, con lo ya imputado y recuperado en el mes.</li>
          <li>Cruce entre Finanzas e Inbroker: detecta facturas que un sistema reporta y el otro no, para no dar un saldo por confirmado sin respaldo.</li>
          <li>Exportación a PDF de cada reporte, con el mismo formato que se distribuye a stakeholders.</li>
        </ul>
      </Section>

      <Section icon={Terminal} title="Stack técnico">
        <div className="flex flex-wrap gap-2">
          {STACK.map((s) => (
            <span key={s} className="rounded-full border border-night-600 bg-night-900/60 px-3 py-1 text-xs text-slate-400">
              {s}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-4 leading-relaxed">
          Corre on-premise sobre los reportes Excel que ya llegan por correo cada mes: sin integraciones externas,
          sin exponer datos de cartera fuera de la infraestructura del cliente.
        </p>
      </Section>

      <Section icon={GitBranch} title="Tres piezas de código (sanitizadas / genéricas)">
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          El código real usa nombres, columnas y rutas de la operación de WTW; acá va el patrón general de cada capa.
        </p>
        <CodeBlock label="Ingesta y normalización" code={CODE_INGESTA} />
        <CodeBlock label="Cruce entre sistemas" code={CODE_CRUCE} />
        <CodeBlock label="Ageing y clasificación de riesgo" code={CODE_RIESGO} />
      </Section>

      <Section icon={ShieldAlert} title="Manual — preguntas frecuentes">
        <div className="space-y-2">
          {FAQ.map((f, i) => (
            <FaqItem key={i} q={f.q} a={f.a} />
          ))}
        </div>
      </Section>

      <div className="mt-14 rounded-2xl border border-neon-cyan/20 bg-neon-cyan/5 p-6 text-center">
        <p className="text-sm text-slate-300 mb-4">
          La demo replica el look real de la app (marca WTW incluida) — todas las aseguradoras, empresas y montos son ficticios.
        </p>
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
