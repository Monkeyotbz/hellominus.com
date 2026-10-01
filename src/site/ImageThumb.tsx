import { Image as ImageIcon } from 'lucide-react';
import { catalogImageUrl } from '../lib/supabase';
import type { ImageRow } from '../lib/queries';

/**
 * Muestra la imagen de portada de un ítem del catálogo, o un placeholder
 * rotulado mientras no haya foto cargada (los assets IA llegan después).
 */
export default function ImageThumb({
  images,
  label,
  className = '',
  rounded = 'rounded-card',
}: {
  images?: ImageRow[] | null;
  label?: string;
  className?: string;
  rounded?: string;
}) {
  const cover = images && images.length ? images[0] : null;
  const src = cover ? catalogImageUrl(cover.storage_path) : '';

  return (
    <div className={`relative overflow-hidden bg-[#E6DFD0] ${rounded} ${className}`}>
      {src ? (
        <img
          src={src}
          alt={label ?? ''}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <ImageIcon className="h-7 w-7 text-[#B7AC97]" />
        </div>
      )}
      {!src && label && (
        <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-2 py-0.5 text-[11px] text-muted">
          {label}
        </span>
      )}
    </div>
  );
}
