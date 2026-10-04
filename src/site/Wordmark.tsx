/**
 * Marca temporal de Hellominus: el nombre en texto, con el mismo estilo que el
 * encabezado de la portada (src/home/Header.module.css → .wordmark). Reemplaza
 * al logo heredado hasta tener uno definitivo.
 */
export default function Wordmark({ className = 'text-xl', light = false }: { className?: string; light?: boolean }) {
  return (
    <span
      className={`whitespace-nowrap pl-[0.3em] font-['Newsreader',Georgia,serif] font-light uppercase leading-none tracking-[0.3em] ${light ? 'text-white' : 'text-[#22211e]'} ${className}`}
    >
      Hellominus
    </span>
  );
}
