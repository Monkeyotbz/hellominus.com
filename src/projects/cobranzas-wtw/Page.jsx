import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, LayoutGrid, BookOpen } from "lucide-react";
import CaseStudy from "./CaseStudy.jsx";
import DemoApp from "./DemoApp.jsx";

export default function CobranzasWtwPage() {
  const [view, setView] = useState("caso"); // "caso" | "demo"

  return (
    <div className="min-h-screen flex flex-col bg-night-950">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-night-950/85 backdrop-blur">
        <div className="mx-auto max-w-6xl px-5 py-3 flex items-center justify-between gap-4">
          <a href="#/" className="flex items-center gap-2 text-slate-400 hover:text-neon-cyan transition shrink-0">
            <ArrowLeft size={15} />
            <span className="text-xs">Portafolio</span>
          </a>

          <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-night-900/60 p-1">
            <button
              onClick={() => setView("caso")}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                view === "caso" ? "bg-neon-cyan/10 text-neon-cyan" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookOpen size={14} /> Caso de estudio
            </button>
            <button
              onClick={() => setView("demo")}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                view === "demo" ? "bg-neon-cyan/10 text-neon-cyan" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LayoutGrid size={14} /> Demo interactiva
            </button>
          </nav>

          <span className="hidden sm:block text-xs text-slate-600 shrink-0">Hellominus.com</span>
        </div>
      </header>

      <div className="border-b border-amber-500/20 bg-amber-500/5">
        <p className="mx-auto max-w-6xl px-5 py-1.5 text-[11px] text-amber-300/90 text-center">
          Esta página replica el look de un dashboard real desarrollado para WTW. Todas las aseguradoras, empresas,
          montos y facturas mostradas son <strong>100% ficticios</strong> — ningún dato de cliente real aparece acá.
        </p>
      </div>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {view === "caso" ? <CaseStudy onOpenDemo={() => setView("demo")} /> : (
              <div className="px-5 py-8">
                <DemoApp />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-white/5 py-6">
        <p className="text-center text-[11px] text-slate-600">
          Proyecto de portafolio con datos ficticios · React + Vite + Tailwind ·{" "}
          <a href="#/" className="text-slate-500 hover:text-neon-cyan transition">volver a Hellominus.com</a>
        </p>
      </footer>
    </div>
  );
}
