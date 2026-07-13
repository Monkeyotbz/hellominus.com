// ─────────────────────────────────────────────────────────────────────────
// Datos 100% ficticios para la demo de portafolio.
// Aseguradora, pólizas, personas y montos son inventados; no representan
// ninguna compañía, cliente ni certificado real.
// ─────────────────────────────────────────────────────────────────────────

export const PLANTILLAS = [
  { id: "estandar", nombre: "Estándar" },
  { id: "no_repeticion", nombre: "No repetición (CNR)" },
  { id: "lista", nombre: "Lista de asegurados" },
];

export const MONEDAS = ["ARS (pesos)", "USD (dólares)", "EUR (euros)"];

export const FORM_VACIO = {
  poliza: "",
  fecha: new Date().toISOString().slice(0, 10),
  cliente: "",
  clienteTipo: "Empresa (contratante)",
  vigencia: "",
  ambito: "",
  actividad: "",
  beneficiario: "",
  tomador: "",
  moneda: MONEDAS[0],
  plantilla: PLANTILLAS[0].id,
};

export const HISTORIAL_INICIAL = [
  {
    id: "h1",
    poliza: "AR-88214",
    cliente: "Manufacturas Cordillera S.A.",
    fecha: "2026-05-12",
    plantilla: "estandar",
    grupos: [
      { nombre: "Empleados", personas: [
        { nombre: "GÓMEZ MARÍA", documento: "30.221.884", desde: "2026-01-01", hasta: "2026-12-31" },
        { nombre: "PÉREZ LUIS", documento: "28.774.112", desde: "2026-01-01", hasta: "2026-12-31" },
      ] },
    ],
  },
  {
    id: "h2",
    poliza: "AR-77930",
    cliente: "Transportes Unidos del Pacífico Ltda.",
    fecha: "2026-04-03",
    plantilla: "no_repeticion",
    grupos: [
      { nombre: "Conductores", personas: [
        { nombre: "RAMÍREZ JORGE", documento: "27.114.550", desde: "2026-01-01", hasta: "2026-12-31" },
      ] },
    ],
  },
];

let idCounter = 100;
export function nextId(prefix) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}
