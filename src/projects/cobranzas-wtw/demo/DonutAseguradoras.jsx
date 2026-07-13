import { money, pct } from "../lib/format.js";

export default function DonutAseguradoras({ porAseguradora }) {
  const total = porAseguradora.reduce((acc, a) => acc + a.monto, 0) || 1;
  let acc = 0;
  const stops = porAseguradora.map((a) => {
    const start = (acc / total) * 360;
    acc += a.monto;
    const end = (acc / total) * 360;
    return `${a.color} ${start}deg ${end}deg`;
  });

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
      <div
        className="h-48 w-48 shrink-0 rounded-full"
        style={{
          background: `conic-gradient(${stops.join(", ")})`,
          WebkitMaskImage: "radial-gradient(circle, transparent 58%, black 59%)",
          maskImage: "radial-gradient(circle, transparent 58%, black 59%)",
        }}
      />
      <ul className="w-full space-y-1.5 text-xs">
        {porAseguradora
          .slice()
          .sort((a, b) => b.monto - a.monto)
          .map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 text-[#3d1466]/80">
              <span className="flex items-center gap-2 truncate">
                <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: a.color }} />
                <span className="truncate">{a.nombre}</span>
              </span>
              <span className="shrink-0 font-medium">{pct((a.monto / total) * 100, 1)} · {money(a.monto)}</span>
            </li>
          ))}
      </ul>
    </div>
  );
}
