import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HardHat,
  Scale,
  TrendingUp,
  Wallet,
  CheckCircle2,
} from "lucide-react";

const sectors = [
  {
    id: "construccion",
    label: "Construcción",
    icon: HardHat,
    headline: "Obras bajo control, datos en tiempo real",
    description:
      "Gestión de proyectos, control de inventarios y presupuestos automatizados.",
    bullets: [
      "Seguimiento automático del avance de obra y cronogramas",
      "Alertas inteligentes de inventario y compras de material",
      "Presupuestos que se actualizan solos con cada movimiento",
    ],
  },
  {
    id: "derecho",
    label: "Derecho",
    icon: Scale,
    headline: "Tu despacho, potenciado por IA",
    description:
      "Análisis rápido de documentos legales, gestión de expedientes y recordatorios automatizados.",
    bullets: [
      "Lectura y resumen de contratos y sentencias en segundos",
      "Expedientes digitales organizados y siempre accesibles",
      "Recordatorios automáticos de plazos y audiencias",
    ],
  },
  {
    id: "ventas",
    label: "Ventas",
    icon: TrendingUp,
    headline: "Convierte más, persigue menos",
    description:
      "Embudos de conversión potenciados por IA y calificación automática de leads.",
    bullets: [
      "Scoring automático de leads según probabilidad de cierre",
      "Seguimientos personalizados sin intervención manual",
      "Embudos que aprenden y se optimizan con cada venta",
    ],
  },
  {
    id: "cobranza",
    label: "Cobranza",
    icon: Wallet,
    headline: "Recupera cartera con inteligencia",
    description:
      "Seguimiento inteligente de cartera, proyecciones de recuperación y automatización de comunicaciones.",
    bullets: [
      "Priorización de cuentas según probabilidad de pago",
      "Proyecciones de flujo de recuperación con IA predictiva",
      "Comunicaciones automatizadas por el canal correcto",
    ],
  },
];

export default function Sectors() {
  const [active, setActive] = useState(sectors[0]);

  return (
    <section id="sectores" className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <p className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-neon-violet">
            Soluciones por Sector
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            IA a la medida de tu industria
          </h2>
          <p className="mt-4 text-slate-400">
            Selecciona tu sector y descubre cómo automatizamos sus procesos clave.
          </p>
        </motion.div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Sectores"
          className="mb-8 flex flex-wrap justify-center gap-3"
        >
          {sectors.map((sector) => {
            const isActive = active.id === sector.id;
            return (
              <button
                key={sector.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${sector.id}`}
                onClick={() => setActive(sector)}
                className={`relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-display text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "text-night-950"
                    : "border border-white/10 bg-white/5 text-slate-300 hover:border-neon-violet/40 hover:text-neon-violet"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="sector-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-cyan to-neon-violet shadow-[0_0_24px_rgba(167,139,250,0.4)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <sector.icon className="relative z-10 h-4 w-4" aria-hidden="true" />
                <span className="relative z-10">{sector.label}</span>
              </button>
            );
          })}
        </div>

        {/* Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            id={`panel-${active.id}`}
            role="tabpanel"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="rounded-2xl border border-white/8 bg-night-800/60 p-8 backdrop-blur sm:p-10"
          >
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div>
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-neon-violet/25 bg-neon-violet/10">
                  <active.icon className="h-7 w-7 text-neon-violet" aria-hidden="true" />
                </div>
                <h3 className="mb-3 font-display text-2xl font-semibold text-white">
                  {active.headline}
                </h3>
                <p className="leading-relaxed text-slate-400">{active.description}</p>
              </div>
              <ul className="space-y-4">
                {active.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3">
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 shrink-0 text-neon-cyan"
                      aria-hidden="true"
                    />
                    <span className="text-sm leading-relaxed text-slate-300">
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
