// ─────────────────────────────────────────────────────────────────────────
// Datos 100% ficticios para la demo de portafolio.
// Nombres de aseguradoras, empresas, montos y facturas son inventados;
// no representan ninguna compañía, cliente ni cifra real de ningún cliente.
// ─────────────────────────────────────────────────────────────────────────

function seedRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export const MESES = [
  "", "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export const PERIODOS = [
  { mes: 12, anio: 2025 }, { mes: 1, anio: 2026 }, { mes: 2, anio: 2026 },
  { mes: 3, anio: 2026 }, { mes: 4, anio: 2026 }, { mes: 5, anio: 2026 }, { mes: 6, anio: 2026 },
];

export function periodKey(p) {
  return `${p.anio}-${p.mes}`;
}

export function periodLabel(p) {
  return `${p.anio}-${String(p.mes).padStart(2, "0")} (${MESES[p.mes][0].toUpperCase()}${MESES[p.mes].slice(1)})`;
}

export const ASEGURADORAS = [
  { id: "andes", nombre: "Andes Vida Seguros", color: "#7c3aed" },
  { id: "cumbre", nombre: "Cumbre ART", color: "#f97316" },
  { id: "litoral", nombre: "Litoral Seguros S.A.", color: "#a78bfa" },
  { id: "boreal", nombre: "Boreal Compañía de Seguros", color: "#fb923c" },
  { id: "cratos", nombre: "Cratos Seguros Patrimoniales", color: "#8b5cf6" },
  { id: "nortia", nombre: "Nortia Seguros de Vida", color: "#fdba74" },
  { id: "delta", nombre: "Delta Re Seguros", color: "#c4b5fd" },
  { id: "austral", nombre: "Austral Cobertura ART", color: "#ea580c" },
  { id: "meridiano", nombre: "Meridiano Seguros Generales", color: "#6d28d9" },
  { id: "pampa", nombre: "Pampa Re S.A.", color: "#fed7aa" },
];

const EMPRESAS_NOMBRES = [
  "Constructora El Roble S.A.", "Textiles Andinos Ltda.", "Grupo Ferretero Continental",
  "Logística Rápida S.A.S.", "Minerales del Sur S.A.", "Agroindustrias La Pradera",
  "Distribuidora Nacional de Alimentos", "Manufacturas Cordillera", "Servicios Portuarios del Caribe",
  "Tecnología Aplicada S.A.S.", "Cementos del Norte", "Papelera Continental",
  "Autopartes Andinas", "Vidrios y Cristales S.A.", "Transportes Unidos del Pacífico",
  "Editorial Horizonte", "Químicos Industriales del Valle", "Maderas Nativas S.A.S.",
  "Confecciones Modernas Ltda.", "Energía Renovable Andina",
];

function generarEmpresas() {
  return EMPRESAS_NOMBRES.map((nombre, i) => {
    const rnd = seedRandom(500 + i * 53);
    const aseguradora = ASEGURADORAS[i % ASEGURADORAS.length];
    const base = 80_000 + rnd() * 3_200_000;
    const pendientePorMes = {};
    const imputadaPorMes = {};
    let acumulado = base;
    PERIODOS.forEach((p, j) => {
      const variacion = 0.9 + rnd() * 0.25;
      acumulado = Math.max(acumulado * variacion - (rnd() * base * 0.06), base * 0.15);
      pendientePorMes[periodKey(p)] = Math.round(acumulado);
      imputadaPorMes[periodKey(p)] = Math.round(acumulado * (0.04 + rnd() * 0.1));
    });
    const facturas = Math.max(1, Math.round((base / 55_000) * (0.6 + rnd() * 0.8)));
    return { id: `emp-${i}`, nombre, aseguradoraId: aseguradora.id, pendientePorMes, imputadaPorMes, facturas };
  });
}

export const EMPRESAS = generarEmpresas();

export function datosDelMes(periodo, aseguradoraFiltro, metrica) {
  const key = periodKey(periodo);
  const factor = metrica === "Prima pendiente" ? 1.35 : 1;

  const empresasFiltradas = aseguradoraFiltro === "Todas"
    ? EMPRESAS
    : EMPRESAS.filter((e) => e.aseguradoraId === aseguradoraFiltro);

  const totalPendiente = empresasFiltradas.reduce((acc, e) => acc + e.pendientePorMes[key], 0) * factor;
  const totalFacturas = empresasFiltradas.reduce((acc, e) => acc + e.facturas, 0);
  const aseguradorasActivas = new Set(empresasFiltradas.map((e) => e.aseguradoraId)).size;

  const topEmpresas = [...empresasFiltradas]
    .sort((a, b) => b.pendientePorMes[key] - a.pendientePorMes[key])
    .slice(0, 12)
    .map((e) => ({
      nombre: e.nombre,
      monto: Math.round(e.pendientePorMes[key] * factor),
      color: ASEGURADORAS.find((a) => a.id === e.aseguradoraId).color,
      aseguradora: ASEGURADORAS.find((a) => a.id === e.aseguradoraId).nombre,
    }));

  const porAseguradora = ASEGURADORAS.map((a) => {
    const monto = EMPRESAS
      .filter((e) => e.aseguradoraId === a.id && (aseguradoraFiltro === "Todas" || a.id === aseguradoraFiltro))
      .reduce((acc, e) => acc + e.pendientePorMes[key], 0) * factor;
    return { ...a, monto: Math.round(monto) };
  }).filter((a) => a.monto > 0);

  const evolucion = PERIODOS.map((p) => {
    const k = periodKey(p);
    const pend = empresasFiltradas.reduce((acc, e) => acc + e.pendientePorMes[k], 0) * factor;
    const imp = empresasFiltradas.reduce((acc, e) => acc + e.imputadaPorMes[k], 0) * factor;
    return { periodo: p, pendiente: Math.round(pend), imputada: Math.round(imp) };
  });

  return { totalPendiente: Math.round(totalPendiente), totalFacturas, aseguradorasActivas, topEmpresas, porAseguradora, evolucion };
}

export function gestionCobroDelMes(periodo) {
  const rnd = seedRandom(periodo.anio * 100 + periodo.mes);
  const { totalPendiente, totalFacturas } = datosDelMes(periodo, "Todas", "Bad Debt");
  const tramos = [
    { tramo: "6-9 meses", facturas: Math.round(totalFacturas * 0.42), monto: Math.round(totalPendiente * 0.38) },
    { tramo: "9-12 meses", facturas: Math.round(totalFacturas * 0.31), monto: Math.round(totalPendiente * 0.29) },
    { tramo: "12-18 meses", facturas: Math.round(totalFacturas * 0.18), monto: Math.round(totalPendiente * 0.21) },
    { tramo: "+18 meses", facturas: Math.round(totalFacturas * 0.09), monto: Math.round(totalPendiente * 0.12) },
  ];
  const porRiesgo = [
    { riesgo: "Alto", facturas: Math.round(totalFacturas * 0.35), monto: Math.round(totalPendiente * 0.5) },
    { riesgo: "Medio", facturas: Math.round(totalFacturas * 0.4), monto: Math.round(totalPendiente * 0.33) },
    { riesgo: "Bajo", facturas: Math.round(totalFacturas * 0.25), monto: Math.round(totalPendiente * 0.17) },
  ];
  const imputadas = Math.round(totalFacturas * (0.05 + rnd() * 0.05));
  const recuperado = Math.round(totalPendiente * (0.02 + rnd() * 0.04));
  return { tramos, porRiesgo, imputadas, recuperado };
}
