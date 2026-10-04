import { useEffect, useRef, useState } from 'react';

/** Devuelve el id de la sección que está en la zona central de la pantalla. */
export function useScrollSpy(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

/** Cierra algo (paneles, menús) con Escape o con un clic fuera del contenedor. */
export function useDismiss(active: boolean, containerId: string, onDismiss: () => void): void {
  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismiss();
    };
    const onClick = (event: MouseEvent) => {
      const container = document.getElementById(containerId);
      if (container && !container.contains(event.target as Node)) onDismiss();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, [active, containerId, onDismiss]);
}

/**
 * Video de fondo que solo se descarga cuando su sección se acerca a la
 * pantalla, y se pausa al salir de ella. Con "reducir movimiento" no se carga:
 * queda el póster.
 */
export function useLazyVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSrc(true);
          if (el.currentSrc) el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, load: src };
}

export function scrollToId(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}
