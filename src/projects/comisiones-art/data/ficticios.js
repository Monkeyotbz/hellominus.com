// ─────────────────────────────────────────────────────────────────────────
// Datos 100% ficticios para la demo de portafolio.
// Nombres de "aseguradoras", montos, contactos y credenciales son inventados;
// no representan ninguna compañía, cliente ni dato real.
// ─────────────────────────────────────────────────────────────────────────

export const IIBB_DIV = 1.21;
export const TOTAL_SIN_IIBB_DIV = 1.06;

export const MESES = [
  "", "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export const ASEGURADORAS = [
  { id: "cordillera", nombre: "Cordillera ART", color: "#ef4444", conIibb: false, manual: true },
  { id: "boreal", nombre: "Boreal Riesgos", color: "#f97316", conIibb: false, manual: false },
  { id: "delplata", nombre: "Del Plata ART", color: "#10b981", conIibb: true, manual: false },
  { id: "meridiano", nombre: "Meridiano Seguros", color: "#84cc16", conIibb: true, manual: false },
  { id: "austral", nombre: "Austral Trabajo", color: "#a855f7", conIibb: true, manual: false },
  { id: "nortia", nombre: "Nortia ART", color: "#38bdf8", conIibb: false, manual: false },
  { id: "pampa", nombre: "Pampa Seguros", color: "#a78bfa", conIibb: false, manual: false },
  { id: "constelacion", nombre: "Constelación ART", color: "#14b8a6", conIibb: false, manual: false },
  { id: "faro", nombre: "Faro Riesgos", color: "#fb7185", conIibb: false, manual: false },
  { id: "delta", nombre: "Delta ART", color: "#06b6d4", conIibb: true, manual: false },
  { id: "horizonte", nombre: "Horizonte Seguros", color: "#ec4899", conIibb: false, manual: false },
  { id: "riogrande", nombre: "Río Grande ART", color: "#f59e0b", conIibb: false, manual: false },
  { id: "sudeste", nombre: "Sudeste Trabajo", color: "#3b82f6", conIibb: false, manual: false },
];

// Semilla determinística para que los montos "ficticios" sean estables entre renders.
function seedRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const PERIODOS = [
  { mes: 2, anio: 2026 }, { mes: 3, anio: 2026 }, { mes: 4, anio: 2026 },
  { mes: 5, anio: 2026 }, { mes: 6, anio: 2026 }, { mes: 7, anio: 2026 },
];

// Datos faltantes a propósito, para poder mostrar el fallback "usar mes anterior".
const FALTANTES = new Set(["faro:2026-7", "delta:2026-6"]);

function generarBrutos() {
  const out = {};
  ASEGURADORAS.forEach((a, i) => {
    const rnd = seedRandom(1000 + i * 37);
    const base = 15_000_000 + rnd() * 120_000_000;
    out[a.id] = {};
    PERIODOS.forEach((p, j) => {
      const key = `${p.anio}-${p.mes}`;
      if (FALTANTES.has(`${a.id}:${key}`)) return; // sin datos ese mes
      const variacion = 0.85 + rnd() * 0.4 + j * 0.015;
      out[a.id][key] = Math.round(base * variacion * 100) / 100;
    });
  });
  return out;
}

export const BRUTOS = generarBrutos();

const overridesManuales = {}; // { "2026-7": { faro: 1234.56 } } — se completa en runtime

export function periodKey(mes, anio) {
  return `${anio}-${mes}`;
}

export function construirCuadro(mes, anio, overrides) {
  const key = periodKey(mes, anio);
  const artes = ASEGURADORAS.map((a) => {
    let totalBruto = BRUTOS[a.id][key] ?? null;
    let status = totalBruto !== null ? "ok" : (a.manual ? "manual" : "sin_datos");
    let estimado = false;

    if (a.manual) {
      const manualVal = overrides?.[key]?.[a.id];
      totalBruto = manualVal ?? null;
      status = totalBruto !== null ? "ok" : "manual";
    } else if (totalBruto === null) {
      const overrideVal = overrides?.[key]?.[a.id];
      if (overrideVal !== undefined && overrideVal !== null) {
        totalBruto = overrideVal;
        status = "ok";
        estimado = true;
      }
    }

    const totalNeto = totalBruto !== null && a.conIibb ? totalBruto / IIBB_DIV : totalBruto;

    return {
      id: a.id,
      nombre: a.nombre,
      color: a.color,
      conIibb: a.conIibb,
      manual: a.manual,
      estimado,
      totalBruto: totalBruto !== null ? Math.round(totalBruto * 100) / 100 : null,
      totalNeto: totalNeto !== null ? Math.round(totalNeto * 100) / 100 : null,
      disponible: status === "ok",
      status,
    };
  });

  const subTotal = artes.reduce((acc, a) => acc + (a.totalNeto ?? 0), 0);
  const totalSinIibb = subTotal / TOTAL_SIN_IIBB_DIV;

  return {
    mes, anio,
    mesNombre: MESES[mes],
    artes,
    subTotal: Math.round(subTotal * 100) / 100,
    totalSinIibb: Math.round(totalSinIibb * 100) / 100,
  };
}

export function historico(mesActual, anioActual, cantidad, overrides) {
  const out = [];
  let m = mesActual, a = anioActual;
  for (let i = 0; i < cantidad; i++) {
    out.unshift(construirCuadro(m, a, overrides));
    m -= 1;
    if (m === 0) { m = 12; a -= 1; }
  }
  return out;
}

export const CORREOS_DESTINATARIOS = {
  cordillera: "comisiones@cordillera-art.example",
  boreal: "cobranzas@boreal-riesgos.example",
  delplata: "canales@delplata-art.example",
  meridiano: "productores@meridiano-seguros.example",
  austral: "brokers@austral-trabajo.example",
  nortia: null, // sin contacto cargado, a propósito
  pampa: "administracion@pampa-seguros.example",
  constelacion: "comisiones@constelacion-art.example",
  faro: "contacto@faro-riesgos.example",
  delta: "canales@delta-art.example",
  horizonte: "cobranzas@horizonte-seguros.example",
  riogrande: "productores@riogrande-art.example",
  sudeste: "comisiones@sudeste-trabajo.example",
};

export const ACCESOS = ASEGURADORAS.map((a, i) => ({
  id: a.id,
  nombre: a.nombre,
  url: `https://portal.${a.id}-art.example/productores`,
  usuario: `broker.${a.id}`,
  clave: `Demo#${(i + 7) * 311}`,
}));
