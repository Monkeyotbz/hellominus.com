import { useEffect, useId, useState, type DragEvent } from 'react';
import { ImagePlus, Loader2, Star, Trash2 } from 'lucide-react';
import { supabase, sb, catalogImageUrl } from '../lib/supabase';
import { shrinkImage } from '../dash/images';
import type { ImageConfig } from './types';

interface ImgRow {
  id: string;
  storage_path: string;
  sort_order: number;
  is_cover: boolean;
}

/**
 * Fotos de un ítem del catálogo. Se arrastran o se eligen, se reducen antes de
 * subir y cada una tiene sus acciones siempre visibles (también en celular).
 */
export default function ImageManager({
  config,
  parentId,
  bucketFolder,
}: {
  config: ImageConfig;
  parentId: string | null;
  bucketFolder: string;
}) {
  const inputId = useId();
  const [images, setImages] = useState<ImgRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!parentId) return;
    const { data } = await sb.from(config.table).select('id, storage_path, sort_order, is_cover').eq(config.fk, parentId).order('sort_order');
    const rows = (data as ImgRow[]) ?? [];
    setImages([...rows].sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentId]);

  if (!parentId) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-surface p-6 text-center text-sm text-muted">
        Guarda primero y luego podrás subir las fotos.
      </div>
    );
  }

  const upload = async (files: FileList | File[] | null) => {
    const list = Array.from(files ?? []).filter((f) => f.type.startsWith('image/'));
    if (!list.length) return;
    setError(null);
    let order = images.length;
    const fallos: string[] = [];
    for (const [i, original] of list.entries()) {
      setBusy(`Subiendo ${i + 1} de ${list.length}…`);
      const file = await shrinkImage(original);
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${bucketFolder}/${parentId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const up = await supabase.storage.from('catalog').upload(path, file, { upsert: false, contentType: file.type });
      if (up.error) {
        fallos.push(original.name);
        continue;
      }
      const ins = await sb.from(config.table).insert({ [config.fk]: parentId, storage_path: path, sort_order: order, is_cover: order === 0 });
      if (ins.error) fallos.push(original.name);
      else order++;
    }
    setBusy(null);
    if (fallos.length) setError(`No se pudieron subir: ${fallos.join(', ')}`);
    await load();
  };

  const remove = async (img: ImgRow) => {
    if (!confirm('¿Eliminar esta foto?')) return;
    setBusy('Eliminando…');
    await supabase.storage.from('catalog').remove([img.storage_path]);
    await sb.from(config.table).delete().eq('id', img.id);
    // Si era la portada, la siguiente pasa a serlo.
    const rest = images.filter((x) => x.id !== img.id);
    if (img.is_cover && rest[0]) await sb.from(config.table).update({ is_cover: true }).eq('id', rest[0].id);
    setBusy(null);
    await load();
  };

  const makeCover = async (img: ImgRow) => {
    setBusy('Actualizando portada…');
    await sb.from(config.table).update({ is_cover: false }).eq(config.fk, parentId);
    await sb.from(config.table).update({ is_cover: true, sort_order: 0 }).eq('id', img.id);
    setBusy(null);
    await load();
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    upload(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-4 py-6 text-center transition ${
          dragging ? 'border-brand bg-brand-tint' : 'border-line bg-surface hover:border-brand/50'
        }`}
      >
        {busy ? <Loader2 className="h-6 w-6 animate-spin text-brand" /> : <ImagePlus className="h-6 w-6 text-brand" />}
        <span className="text-sm font-medium text-ink">{busy ?? 'Arrastra tus fotos o toca para elegir'}</span>
        <span className="text-xs text-muted">JPG o PNG. Las reducimos automáticamente.</span>
        <input id={inputId} type="file" multiple accept="image/*" className="sr-only" disabled={Boolean(busy)} onChange={(e) => upload(e.target.files)} />
      </label>

      {error && (
        <p className="text-xs text-alert" role="alert">
          {error}
        </p>
      )}

      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-3">
          {images.map((img) => (
            <li key={img.id} className="overflow-hidden rounded-lg border border-line bg-white">
              <div className="relative aspect-[4/3] bg-stone">
                <img src={catalogImageUrl(img.storage_path)} alt="" className="h-full w-full object-cover" />
                {img.is_cover && <span className="absolute left-2 top-2 rounded-full bg-ink px-2 py-0.5 text-[11px] font-semibold text-surface">Portada</span>}
              </div>
              <div className="flex items-center justify-between gap-1 px-1.5 py-1">
                {img.is_cover ? (
                  <span className="inline-flex min-h-[36px] items-center gap-1 px-1.5 text-xs text-brand">
                    <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" /> Portada
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => makeCover(img)}
                    disabled={Boolean(busy)}
                    aria-label="Usar de portada"
                    title="Usar de portada"
                    className="inline-flex min-h-[36px] items-center gap-1 rounded px-1.5 text-xs text-muted hover:text-brand disabled:opacity-40"
                  >
                    <Star className="h-4 w-4" aria-hidden="true" /> Portada
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(img)}
                  disabled={Boolean(busy)}
                  aria-label="Eliminar foto"
                  className="inline-flex min-h-[36px] items-center rounded px-1.5 text-muted hover:text-alert disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
