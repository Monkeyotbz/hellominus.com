import { useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Menu, X } from "lucide-react";

const links = [
  { label: "Soluciones", href: "#soluciones" },
  { label: "Software", href: "#software" },
  { label: "Agentes", href: "#agentes" },
  { label: "Contacto", href: "#contacto" },
  { label: "Quiénes somos", href: "#quienes-somos" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-night-950/70 backdrop-blur-xl"
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#" className="flex items-center gap-2">
          <BrainCircuit className="h-7 w-7 text-neon-cyan" aria-hidden="true" />
          <span className="font-display text-lg font-bold tracking-tight text-white">
            Hellominus<span className="text-neon-cyan">.com</span>
          </span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-slate-400 transition-colors duration-200 hover:text-neon-cyan"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#contacto"
          className="hidden rounded-full border border-neon-cyan/40 px-5 py-2 text-sm font-medium text-neon-cyan transition-all duration-300 hover:border-neon-cyan hover:bg-neon-cyan/10 hover:shadow-[0_0_20px_rgba(34,211,238,0.35)] md:inline-block"
        >
          Agendar Demo
        </a>

        <button
          type="button"
          className="text-slate-300 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <motion.ul
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-1 border-t border-white/5 bg-night-900 px-4 pb-4 pt-2 md:hidden"
        >
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-slate-300 transition-colors hover:bg-white/5 hover:text-neon-cyan"
              >
                {link.label}
              </a>
            </li>
          ))}
        </motion.ul>
      )}
    </motion.header>
  );
}
