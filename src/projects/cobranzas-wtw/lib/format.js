export function money(v) {
  if (v === null || v === undefined) return "—";
  return "$ " + Math.round(v).toLocaleString("en-US");
}

export function pct(v, digits = 0) {
  if (v === null || v === undefined) return "—";
  return `${v.toFixed(digits)}%`;
}
