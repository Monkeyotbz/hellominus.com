import { FileSpreadsheet, Cog, FolderCog, LayoutDashboard, ArrowRight, ArrowDown } from "lucide-react";

const ETAPAS = [
  {
    icon: FileSpreadsheet,
    title: "1. Reportes crudos",
    desc: "Cada aseguradora manda su reporte mensual por mail — 13 formatos distintos (Excel, CSV, a veces PDF), sin estandarizar.",
  },
  {
    icon: Cog,
    title: "2. Herramientas de conversión",
    desc: "Un script Python por aseguradora detecta encabezados, normaliza columnas y filtra filas — cada una con sus propias reglas.",
  },
  {
    icon: FolderCog,
    title: "3. Script maestro",
    desc: "Un orquestador detecta qué carpetas tienen archivos nuevos, corre la herramienta correspondiente y deja el \"final\" en su lugar.",
  },
  {
    icon: LayoutDashboard,
    title: "4. Panel consolidado",
    desc: "Una app web lee los 13 archivos finales, sabe qué columna sumar en cada uno, y arma el cuadro mensual con un click.",
  },
];

export default function PipelineDiagram() {
  return (
    <div className="flex flex-col md:flex-row items-stretch gap-1">
      {ETAPAS.map((e, i) => {
        const Icon = e.icon;
        return (
          <div key={i} className="flex flex-col md:flex-row items-stretch flex-1">
            <div className="rounded-2xl border border-night-700 bg-night-900/50 p-4 flex flex-col gap-2 flex-1">
              <div className="h-9 w-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan">
                <Icon size={17} />
              </div>
              <h3 className="font-display text-sm font-semibold text-slate-100">{e.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{e.desc}</p>
            </div>
            {i < ETAPAS.length - 1 && (
              <>
                <div className="hidden md:flex items-center justify-center text-slate-700 px-1">
                  <ArrowRight size={16} />
                </div>
                <div className="flex md:hidden items-center justify-center text-slate-700 py-1">
                  <ArrowDown size={16} />
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
