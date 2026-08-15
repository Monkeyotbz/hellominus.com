// Marco sobre todo el viewport que recorre los 3 acentos de marca
// (cyan → violeta → esmeralda, ver @keyframes frame-glow en index.css).
// Fixed (no scrollea con el contenido), decorativo puro: pointer-events-none
// y aria-hidden, igual que UniverseBackground. Con prefers-reduced-motion
// queda fijo en cyan (ver el mismo archivo).
export default function PageFrame() {
  return <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] border-2 animate-frame-glow" />;
}
