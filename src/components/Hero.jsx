import { motion } from "framer-motion";
import { Bot, CalendarCheck, ShieldCheck, Sparkles } from "lucide-react";
import { useChatWidget } from "../context/ChatWidgetContext.jsx";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Hero() {
  const { openChat } = useChatWidget();

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-16 sm:px-6 lg:px-8">
      {/* Grid decorativo de fondo */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,black,transparent)]"
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-4xl py-24 text-center"
      >
        <motion.div variants={item} className="mb-6 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-neon-violet/30 bg-neon-violet/10 px-4 py-1.5 text-xs font-medium text-neon-violet">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Inteligencia Artificial aplicada a tu negocio
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
        >
          Escala tu Empresa con{" "}
          <span className="bg-gradient-to-r from-neon-cyan via-sky-400 to-neon-violet bg-clip-text text-transparent">
            Inteligencia Artificial
          </span>{" "}
          y Automatización.
        </motion.h1>

        <motion.h2
          variants={item}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400"
        >
          Transformamos tus datos en decisiones y tus tareas manuales en flujos
          de trabajo inteligentes. Infraestructura local 100% segura y a medida
          para tu sector.
        </motion.h2>

        <motion.div
          variants={item}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <a
            href="#contacto"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-neon-cyan to-sky-500 px-8 py-3.5 font-display text-sm font-semibold text-night-950 shadow-[0_0_24px_rgba(34,211,238,0.35)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(34,211,238,0.55)] sm:w-auto"
          >
            <CalendarCheck className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-6" aria-hidden="true" />
            Agendar una Demostración
          </a>
          <button
            type="button"
            onClick={openChat}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-3.5 font-display text-sm font-semibold text-white backdrop-blur transition-all duration-300 hover:border-neon-violet/60 hover:bg-neon-violet/10 hover:text-neon-violet hover:shadow-[0_0_24px_rgba(167,139,250,0.3)] sm:w-auto"
          >
            <Bot className="h-4 w-4" aria-hidden="true" />
            Hablar con nuestro Asistente IA
          </button>
        </motion.div>

        <motion.p
          variants={item}
          className="mt-10 inline-flex items-center gap-2 text-xs text-slate-500"
        >
          <ShieldCheck className="h-4 w-4 text-neon-emerald" aria-hidden="true" />
          Tus datos nunca salen de tu infraestructura — despliegue 100% local
        </motion.p>
      </motion.div>
    </section>
  );
}
