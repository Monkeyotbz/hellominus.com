import { motion } from "framer-motion";
import { Workflow, BarChart3, Lock } from "lucide-react";

const cards = [
  {
    icon: Workflow,
    accent: "text-neon-cyan",
    glow: "group-hover:shadow-[0_0_32px_rgba(34,211,238,0.18)] group-hover:border-neon-cyan/40",
    iconBg: "bg-neon-cyan/10 border-neon-cyan/20",
    title: "Automatización Avanzada",
    text: "Conectamos tus herramientas y eliminamos el trabajo manual creando flujos inteligentes con n8n.",
    metric: "-70%",
    metricLabel: "de tiempo en tareas repetitivas",
  },
  {
    icon: BarChart3,
    accent: "text-neon-violet",
    glow: "group-hover:shadow-[0_0_32px_rgba(167,139,250,0.18)] group-hover:border-neon-violet/40",
    iconBg: "bg-neon-violet/10 border-neon-violet/20",
    title: "Análisis de Datos con IA",
    text: "Desarrollamos dashboards interactivos con agentes de inteligencia artificial capaces de leer, interpretar y predecir tendencias comerciales.",
    metric: "-60%",
    metricLabel: "de tiempo en reporting mensual",
  },
  {
    icon: Lock,
    accent: "text-neon-emerald",
    glow: "group-hover:shadow-[0_0_32px_rgba(52,211,153,0.18)] group-hover:border-neon-emerald/40",
    iconBg: "bg-neon-emerald/10 border-neon-emerald/20",
    title: "Seguridad y Privacidad Total",
    text: "Blindamos tu información. Diseñamos infraestructuras empresariales mediante Docker, bases de datos robustas y servicios locales integrados en aplicaciones de escritorio.",
    metric: "100%",
    metricLabel: "de tus datos en tu propia infraestructura",
  },
];

export default function ValueProps() {
  return (
    <section id="soluciones" className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <p className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-neon-cyan">
            Nuestra Oferta de Valor
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Tecnología que trabaja mientras tú decides
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((card, i) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: i * 0.12 }}
              className={`group relative rounded-2xl border border-white/8 bg-night-800/60 p-8 backdrop-blur transition-all duration-300 hover:-translate-y-1.5 ${card.glow}`}
            >
              <div
                className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border ${card.iconBg}`}
              >
                <card.icon className={`h-6 w-6 ${card.accent}`} aria-hidden="true" />
              </div>
              <h3 className="mb-3 font-display text-xl font-semibold text-white">
                {card.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-400">{card.text}</p>
              <p className="mt-6 flex items-baseline gap-2 border-t border-white/8 pt-5">
                <span className={`font-display text-2xl font-bold ${card.accent}`}>
                  {card.metric}
                </span>
                <span className="text-xs text-slate-500">{card.metricLabel}</span>
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
