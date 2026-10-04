import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ImageOff, Plus, Search } from 'lucide-react';
import { sb, catalogImageUrl } from '../lib/supabase';
import { pickText } from '../lib/i18n';
import { buttonClasses } from '../site/ui';
import { ENTITIES } from '../admin/entities';
import { useEntityScope } from '../admin/scope';
import { EmptyState, PageHeader, Segmented, StatusChip } from '../dash/ui';
import { contentStatus, formatMoney } from '../dash/format';
import { inputCls } from '../dash/fields';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;
type Filter = 'all' | 'published' | 'draft' | 'archived';

function coverOf(row: AnyRow): string | null {
  const imgs = (row.cover ?? []) as { storage_path: string; is_cover: boolean; sort_order: number }[];
  const first = [...imgs].sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order)[0];
  const path = first?.storage_path ?? row.cover_image_path ?? null;
  return path ? catalogImageUrl(path) : null;
}

/** Catálogo del espacio en tarjetas con foto, filtros por estado y búsqueda. */
export default function CatalogList() {
  const { entity = '' } = useParams();
  const cfg = ENTITIES[entity];
  const { basePath, tenantId } = useEntityScope();
  const [rows, setRows] = useState<AnyRow[] | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!cfg || !tenantId) return;
    setRows(null);
    setFilter('all');
    setQuery('');
    const select = cfg.images ? `*, cover:${cfg.images.table}(storage_path, is_cover, sort_order)` : '*';
    sb.from(cfg.table)
      .select(select)
      .eq('tenant_id', tenantId)
      .order('updated_at', { ascending: false })
      .then(({ data }) => setRows((data as unknown as AnyRow[]) ?? []));
  }, [cfg, tenantId]);

  const counts = useMemo(() => {
    const c = { all: 0, published: 0, draft: 0, archived: 0 } as Record<Filter, number>;
    for (const r of rows ?? []) {
      c.all++;
      if (r.status in c) c[r.status as Filter]++;
    }
    return c;
  }, [rows]);

  if (!cfg) return null;

  const slugPrefix = cfg.fields.find((f) => f.type === 'slug')?.prefix;
  const q = query.trim().toLowerCase();
  const visible = (rows ?? []).filter(
    (r) => (filter === 'all' || r.status === filter) && (!q || (pickText(r[cfg.titleField]) ?? '').toLowerCase().includes(q)),
  );
  const newLabel = `Nuevo ${cfg.labelSingular.toLowerCase()}`;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title={cfg.labelPlural}
        meta={rows ? <span>{counts.all === 1 ? '1 publicación' : `${counts.all} publicaciones`}</span> : null}
        actions={
          <Link to={`${basePath}/${entity}/new`} className={buttonClasses('primary', 'md')}>
            <Plus className="h-4 w-4" /> {newLabel}
          </Link>
        }
      />

      {rows === null ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-card bg-stone" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Plus className="h-5 w-5" />}
          title={`Aún no tienes ${cfg.labelPlural.toLowerCase()}`}
          text="Crea el primero con su nombre, precio y fotos. Lo puedes dejar en borrador hasta que esté listo."
          action={
            <Link to={`${basePath}/${entity}/new`} className={buttonClasses('primary', 'md')}>
              {newLabel}
            </Link>
          }
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Segmented
              label="Filtrar por estado"
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: 'Todos', count: counts.all },
                { value: 'published', label: 'Publicados', count: counts.published },
                { value: 'draft', label: 'Borradores', count: counts.draft },
                ...(counts.archived ? [{ value: 'archived' as Filter, label: 'Archivados', count: counts.archived }] : []),
              ]}
            />
            {rows.length > 4 && (
              <label className="relative w-full sm:w-64">
                <span className="sr-only">Buscar</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input className={`${inputCls} pl-9`} placeholder="Buscar por nombre" value={query} onChange={(e) => setQuery(e.target.value)} />
              </label>
            )}
          </div>

          {visible.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">No hay resultados con ese filtro.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((r) => {
                const st = contentStatus(r.status);
                const cover = coverOf(r);
                const price = r.price_from ?? r.price;
                const meta = [r.city, price != null ? `${formatMoney(Number(price), r.currency ?? 'COP')}${r.price_from != null ? ' / noche' : ''}` : null]
                  .filter(Boolean)
                  .join(' · ');
                return (
                  <li key={r.id} className="group overflow-hidden rounded-card border border-line bg-white transition hover:border-ink/30 hover:shadow-card">
                    <Link to={`${basePath}/${entity}/${r.id}`} className="block">
                      <div className="relative aspect-[4/3] bg-stone">
                        {cover ? (
                          <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-1 text-muted">
                            <ImageOff className="h-6 w-6" aria-hidden="true" />
                            <span className="text-xs">Sin fotos</span>
                          </div>
                        )}
                        <StatusChip tone={st.tone} className="absolute left-3 top-3 shadow-sm">
                          {st.label}
                        </StatusChip>
                      </div>
                      <div className="p-4">
                        <p className="truncate font-serif text-[1.2rem] text-ink group-hover:text-brand">{pickText(r[cfg.titleField]) || 'Sin nombre'}</p>
                        <p className="mt-0.5 truncate text-sm text-muted">{meta || 'Completa la información'}</p>
                      </div>
                    </Link>
                    {slugPrefix && r.status === 'published' && (
                      <div className="border-t border-line px-4 py-2.5">
                        <a href={`${slugPrefix}${r.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-brand hover:underline">
                          Ver en Hellominus
                        </a>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
