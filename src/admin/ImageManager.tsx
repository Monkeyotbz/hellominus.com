import { useEffect, useRef, useState } from 'react';
import { Loader2, Star, Trash2, Upload } from 'lucide-react';
import { supabase, sb, catalogImageUrl } from '../lib/supabase';
import type { ImageConfig } from './types';

interface ImgRow {
  id: string;
  storage_path: string;
  sort_order: number;
  is_cover: boolean;
}

export default function ImageManager({
  config,
  parentId,
  bucketFolder,
}: {
  config: ImageConfig;
  parentId: string | null;
  bucketFolder: string;
}) {
  const [images, setImages] = useState<ImgRow[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    if (!parentId) return;
    const { data } = await sb
      .from(config.table)
      .select('id, storage_path, sort_order, is_cover')
      .eq(config.fk, parentId)
      .order('sort_order');
    setImages((data as ImgRow[]) ?? []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentId]);

  if (!parentId) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
        Guarda primero para poder subir imágenes.
      </div>
    );
  }

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      let order = images.length;
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `${bucketFolder}/${parentId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const up = await supabase.storage.from('catalog').upload(path, file, { upsert: false });
        if (up.error) {
          alert(`Error subiendo ${file.name}: ${up.error.message}`);
          continue;
        }
        const ins = await sb
          .from(config.table)
          .insert({ [config.fk]: parentId, storage_path: path, sort_order: order, is_cover: order === 0 });
        if (ins.error) alert(`Error guardando ${file.name}: ${ins.error.message}`);
        order++;
      }
      await load();
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const remove = async (img: ImgRow) => {
    if (!confirm('¿Eliminar esta imagen?')) return;
    await supabase.storage.from('catalog').remove([img.storage_path]);
    await sb.from(config.table).delete().eq('id', img.id);
    await load();
  };

  const makeCover = async (img: ImgRow) => {
    await sb.from(config.table).update({ is_cover: false }).eq(config.fk, parentId);
    await sb.from(config.table).update({ is_cover: true, sort_order: 0 }).eq('id', img.id);
    await load();
  };

  return (
    <div className="space-y-3">
      <div>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          id="img-mgr-input"
          onChange={(e) => upload(e.target.files)}
        />
        <label
          htmlFor="img-mgr-input"
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Subir imágenes
        </label>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img src={catalogImageUrl(img.storage_path)} alt="" className="h-full w-full object-cover" />
              {img.is_cover && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-yellow-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  Portada
                </span>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 transition group-hover:bg-black/40">
                {!img.is_cover && (
                  <button
                    type="button"
                    onClick={() => makeCover(img)}
                    title="Poner de portada"
                    className="rounded-full bg-white/90 p-2 opacity-0 transition group-hover:opacity-100"
                  >
                    <Star className="h-4 w-4 text-yellow-600" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(img)}
                  title="Eliminar"
                  className="rounded-full bg-white/90 p-2 opacity-0 transition group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
