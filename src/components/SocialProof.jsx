import { motion } from "framer-motion";
import { Building2, Quote, TrendingDown, Clock3, PiggyBank, ArrowRight, LayoutGrid, CalendarClock, BarChart3, FileText } from "lucide-react";

// PLACEHOLDERS: sustituir por logos reales (SVG/PNG en /src/assets o /public)
// cuando existan clientes/aliados confirmados. El componente ya está listo:
// basta con cambiar `name` por un <img>.
const partners = [
  { name: "Constructora Andina" },
  { name: "Bufete Legal & Cía." },
  { name: "Grupo Comercial Nova" },
  { name: "Finanzas Cauca" },
  { name: "Distribuciones del Sur" },
];

// Caso representativo basado en un piloto interno de cobranza.
// Al confirmar un caso real: actualizar cliente, sector y cifras verificadas,
// y retirar la etiqueta "Caso representativo".
const caseStudy = {
  tag: "Caso representativo · Sector Cobranza",
  client: "Empresa de servicios financieros",
  problem:
    "El equipo dedicaba jornadas completas a revisar cartera vencida en hojas de cálculo y a redactar recordatorios de pago uno a uno, sin priorización clara de cuentas.",
  solution:
    "Implementamos un flujo automatizado con n8n y un agente de IA local que prioriza cuentas por probabilidad de pago, redacta las comunicaciones y las envía por el canal correcto — todo dentro de la infraestructura del cliente.",
  metrics: [
    {
      icon: Clock3,
      value: "-70%",
      label: "tiempo de gestión manual de cartera",
      accent: "text-neon-cyan",
      border: "border-neon-cyan/20",
      bg: "bg-neon-cyan/10",
    },
    {
      icon: TrendingDown,
      value: "-45%",
      label: "cartera vencida a 90 días",
      accent: "text-neon-violet",
      border: "border-neon-violet/20",
      bg: "bg-neon-violet/10",
    },
    {
      icon: PiggyBank,
      value: "3 sem.",
      label: "de la primera reunión a producción",
      accent: "text-neon-emerald",
      border: "border-neon-emerald/20",
      bg: "bg-neon-emerald/10",
    },
  ],
};

export default function SocialProof() {
  return (
    <section id="casos" className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Logos de clientes/aliados */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-20 text-center"
        >
          <p className="mb-8 font-display text-sm font-semibold uppercase tracking-widest text-slate-500">
            Empresas que confían en la automatización local
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {partners.map((partner) => (
              <li
                key={partner.name}
                className="inline-flex items-center gap-2 text-slate-500 opacity-70 transition-opacity duration-300 hover:opacity-100"
              >
                <Building2 className="h-5 w-5" aria-hidden="true" />
                <span className="font-display text-sm font-semibold tracking-wide">
                  {partner.name}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Caso de estudio */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <p className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-neon-violet">
            Resultados Reales
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Del problema al resultado medible
          </h2>
        </motion.div>

        <motion.article
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto max-w-5xl rounded-3xl border border-white/8 bg-night-800/60 p-8 backdrop-blur sm:p-12"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-neon-violet/30 bg-neon-violet/10 px-4 py-1.5 text-xs font-medium text-neon-violet">
            <Quote className="h-3.5 w-3.5" aria-hidden="true" />
            {caseStudy.tag}
          </span>

          <h3 className="mt-5 font-display text-2xl font-semibold text-white">
            {caseStudy.client}
          </h3>

          <div className="mt-6 grid gap-8 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-display text-sm font-semibold uppercase tracking-widest text-slate-500">
                El problema
              </h4>
              <p className="text-sm leading-relaxed text-slate-400">
                {caseStudy.problem}
              </p>
            </div>
            <div>
              <h4 className="mb-2 font-display text-sm font-semibold uppercase tracking-widest text-slate-500">
                La solución
              </h4>
              <p className="text-sm leading-relaxed text-slate-400">
                {caseStudy.solution}
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {caseStudy.metrics.map((metric) => (
              <div
                key={metric.label}
                className={`rounded-2xl border ${metric.border} ${metric.bg} p-6 text-center`}
              >
                <metric.icon
                  className={`mx-auto mb-3 h-6 w-6 ${metric.accent}`}
                  aria-hidden="true"
                />
                <p className={`font-display text-3xl font-bold ${metric.accent}`}>
                  {metric.value}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </motion.article>

        {/* Proyecto propio interactivo */}
        <motion.a
          href="#/proyectos/comisiones-art"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="group mx-auto mt-6 flex max-w-5xl flex-col items-start gap-5 rounded-3xl border border-neon-cyan/20 bg-night-800/60 p-8 backdrop-blur transition-colors hover:border-neon-cyan/40 sm:flex-row sm:items-center sm:p-10"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan">
            <LayoutGrid className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-1 text-[11px] font-medium text-neon-cyan">
              Proyecto propio · Automatización de datos
            </span>
            <h3 className="mt-3 font-display text-xl font-semibold text-white">
              De 13 reportes de comisiones a un panel único — probalo vos mismo
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Pipeline de scripts que convierte reportes de comisiones de 13 aseguradoras, cada uno con su propio
              formato, en un panel web consolidado. Incluye el caso de estudio completo y una demo 100% interactiva
              con datos ficticios.
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-2 self-start rounded-full border border-neon-cyan/40 px-5 py-2.5 text-sm font-medium text-neon-cyan transition-all group-hover:border-neon-cyan group-hover:bg-neon-cyan/10 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.35)] sm:self-center">
            Ver caso de estudio <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </motion.a>

        {/* Proyecto propio: Dashboard de cobranzas (WTW) */}
        <motion.a
          href="#/proyectos/cobranzas-wtw"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.18 }}
          className="group mx-auto mt-6 flex max-w-5xl flex-col items-start gap-5 rounded-3xl border border-neon-emerald/20 bg-night-800/60 p-8 backdrop-blur transition-colors hover:border-neon-emerald/40 sm:flex-row sm:items-center sm:p-10"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-neon-emerald/30 bg-neon-emerald/10 text-neon-emerald">
            <BarChart3 className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-neon-emerald/30 bg-neon-emerald/10 px-3 py-1 text-[11px] font-medium text-neon-emerald">
              Proyecto propio · Auditoría de cartera vencida
            </span>
            <h3 className="mt-3 font-display text-xl font-semibold text-white">
              Dashboard de cobranzas — WTW: bad debt, cruce y gestión de cobro
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Panel en Streamlit que sincroniza reportes de Finanzas e Inbroker, concilia ambos sistemas, clasifica
              deuda por antigüedad y riesgo, y exporta reportes en PDF. Incluye el caso de estudio completo y una
              demo interactiva con el mismo look de la app real y datos 100% ficticios.
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-2 self-start rounded-full border border-neon-emerald/40 px-5 py-2.5 text-sm font-medium text-neon-emerald transition-all group-hover:border-neon-emerald group-hover:bg-neon-emerald/10 group-hover:shadow-[0_0_20px_rgba(52,211,153,0.35)] sm:self-center">
            Ver caso de estudio <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </motion.a>

        {/* Proyecto propio: Generador de certificados */}
        <motion.a
          href="#/proyectos/certificados"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.22 }}
          className="group mx-auto mt-6 flex max-w-5xl flex-col items-start gap-5 rounded-3xl border border-neon-cyan/20 bg-night-800/60 p-8 backdrop-blur transition-colors hover:border-neon-cyan/40 sm:flex-row sm:items-center sm:p-10"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan">
            <FileText className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-1 text-[11px] font-medium text-neon-cyan">
              Proyecto propio · Automatización documental
            </span>
            <h3 className="mt-3 font-display text-xl font-semibold text-white">
              Generador de certificados de seguro — de Word manual a app instalable
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              App de escritorio que arma certificados de cobertura editando directamente el XML del Word original
              (sin perder formato), con grupos de asegurados, carga masiva desde Excel e historial. Esta demo
              rediseña la interfaz con un look moderno — datos 100% ficticios.
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-2 self-start rounded-full border border-neon-cyan/40 px-5 py-2.5 text-sm font-medium text-neon-cyan transition-all group-hover:border-neon-cyan group-hover:bg-neon-cyan/10 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.35)] sm:self-center">
            Ver caso de estudio <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </motion.a>

        {/* Proyecto propio: KAIROS (app en producción) */}
        <motion.a
          href="https://kairosplanner.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="group mx-auto mt-6 flex max-w-5xl flex-col items-start gap-5 rounded-3xl border border-neon-violet/20 bg-night-800/60 p-8 backdrop-blur transition-colors hover:border-neon-violet/40 sm:flex-row sm:items-center sm:p-10"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-neon-violet/30 bg-neon-violet/10 text-neon-violet">
            <CalendarClock className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-neon-violet/30 bg-neon-violet/10 px-3 py-1 text-[11px] font-medium text-neon-violet">
              Proyecto propio · App en producción
            </span>
            <h3 className="mt-3 font-display text-xl font-semibold text-white">
              KAIROS — planificador personal con IA
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              App de productividad personal con enfoque (focus timer), kanban, calendario, finanzas y reproductor de
              música integrados, potenciada por ABAD, un asistente de IA conversacional con voz que ayuda a organizar
              el día. Frontend React + backend Express, sobre Supabase.
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-2 self-start rounded-full border border-neon-violet/40 px-5 py-2.5 text-sm font-medium text-neon-violet transition-all group-hover:border-neon-violet group-hover:bg-neon-violet/10 group-hover:shadow-[0_0_20px_rgba(167,139,250,0.35)] sm:self-center">
            Ver app en vivo <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </motion.a>
      </div>
    </section>
  );
}
