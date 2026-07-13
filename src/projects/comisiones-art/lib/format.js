export function ars(v) {
  if (v === null || v === undefined) return "—";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

export function arsM(v) {
  if (v === null || v === undefined) return "—";
  return "$" + (v / 1_000_000).toFixed(2) + "M";
}

export function capFirst(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
