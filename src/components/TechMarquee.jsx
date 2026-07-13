import {
  Sparkles,
  Workflow,
  Container,
  Database,
  Server,
  Monitor,
} from "lucide-react";

const technologies = [
  { icon: Sparkles, label: "IA Generativa" },
  { icon: Workflow, label: "n8n" },
  { icon: Container, label: "Docker" },
  { icon: Database, label: "Bases de Datos" },
  { icon: Server, label: "Arquitectura Local" },
  { icon: Monitor, label: "Aplicaciones de Escritorio" },
];

function MarqueeRow({ decorative = false }) {
  return (
    <>
      {technologies.map((tech) => (
        <div
          key={tech.label}
          aria-hidden={decorative || undefined}
          className={`mx-4 inline-flex shrink-0 items-center gap-3 rounded-full border border-white/8 bg-white/[0.03] px-6 py-3 transition-colors duration-300 hover:border-neon-cyan/40 ${
            decorative ? "marquee-dup" : ""
          }`}
        >
          <tech.icon className="h-5 w-5 text-neon-cyan" aria-hidden="true" />
          <span className="whitespace-nowrap font-display text-sm font-medium text-slate-300">
            {tech.label}
          </span>
        </div>
      ))}
    </>
  );
}

export default function TechMarquee() {
  return (
    <section id="tecnologia" className="relative pb-32 pt-20 sm:pb-40">
      <div className="mx-auto mb-10 max-w-2xl px-4 text-center">
        <p className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-neon-emerald">
          Nuestro Stack Tecnológico
        </p>
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Construido sobre tecnología probada
        </h2>
      </div>

      <div className="relative overflow-hidden border-y border-white/5 bg-night-900/50 py-6 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {/* Dos copias para lograr el bucle infinito continuo; la segunda es
              decorativa: oculta para lectores de pantalla y en reduced-motion */}
          <MarqueeRow />
          <MarqueeRow decorative />
        </div>
      </div>

      {/* Transición visual hacia la sección de contacto: halo violeta + divisor */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-[radial-gradient(ellipse_60%_100%_at_50%_100%,rgba(167,139,250,0.07),transparent)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 mx-auto h-px max-w-4xl bg-gradient-to-r from-transparent via-neon-violet/30 to-transparent"
      />
    </section>
  );
}
