import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ExternalLink, Loader2 } from 'lucide-react';
import { sb } from '../lib/supabase';
import { pickText } from '../lib/i18n';
import { useAuth } from '../contexts/AuthContext';
import { Card, StatusChip } from '../dash/ui';
import { contentStatus } from '../dash/format';
import { ENTITIES } from './entities';
import { renderField, slugify } from './fields';
import ImageManager from './ImageManager';
import { useEntityScope } from './scope';
import type { FieldDef } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Borrador', hint: 'Solo lo ves tú.' },
  { value: 'published', label: 'Publicado', hint: 'Visible en Hellominus.' },
  { value: 'archived', label: 'Archivado', hint: 'Oculto, sin borrarlo.' },
];

/** Grupos que no van en la columna principal. */
const ASIDE_GROUPS = new Set(['Publicación', 'SEO']);

/**
 * Formulario de un ítem del catálogo (admin y panel del anfitrión). Columna
 * principal con los datos; a la derecha, publicación y fotos; en móvil, barra
 * de guardar fija abajo.
 */
export default function EntityForm() {
  const { entity = '', id } = useParams();
  const cfg = ENTITIES[entity];
  const { basePath, tenantId } = useEntityScope();
  const { memberships } = useAuth();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [form, setForm] = useState<AnyRow>({});
  const [saved, setSaved] = useState<string>(''); // instantánea para detectar cambios
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(isNew ? null : id!);
  const [slugTouched, setSlugTouched] = useState(!isNew);

  // Los propietarios no ven los campos reservados al equipo (destacar, ordenar).
  const fields = useMemo(() => (cfg?.fields ?? []).filter((f) => !(tenantId && f.staffOnly)), [cfg, tenantId]);

  useEffect(() => {
    if (!cfg) return;
    if (isNew) {
      const initial = { ...(cfg.defaults ?? {}) };
      setForm(initial);
      setSaved(JSON.stringify(initial));
      return;
    }
    setLoading(true);
    sb.from(cfg.table)
      .select('*')
      .eq('id', id!)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else {
          setForm(data as AnyRow);
          setSaved(JSON.stringify(data));
        }
        setLoading(false);
      });
  }, [entity, id]); // eslint-disable-line react-hooks/exhaustive-deps

  const groups = useMemo(() => {
    const g: Record<string, FieldDef[]> = {};
    for (const f of fields) {
      const key = f.group ?? 'General';
      (g[key] ||= []).push(f);
    }
    // La dirección web va justo después del nombre, que es de donde sale.
    for (const list of Object.values(g)) {
      const slugAt = list.findIndex((f) => f.type === 'slug');
      const titleAt = list.findIndex((f) => f.name === cfg?.titleField);
      if (slugAt !== -1 && titleAt > slugAt) list.splice(titleAt, 0, list.splice(slugAt, 1)[0]);
    }
    return g;
  }, [fields, cfg]);

  if (!cfg) return <p className="text-alert">Sección desconocida: {entity}</p>;
  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-brand" />;

  const dirty = JSON.stringify(form) !== saved;
  const slugField = fields.find((f) => f.type === 'slug');
  const title = pickText(form[cfg.titleField]) || `Nuevo ${cfg.labelSingular.toLowerCase()}`;
  const status = contentStatus(form.status ?? 'draft');
  const tenant = memberships.find((m) => m.tenant.id === tenantId)?.tenant;
  const publicPath = slugField?.prefix && savedId && form.status === 'published' && form.slug ? `${slugField.prefix}${form.slug}` : null;

  const setField = (name: string, value: unknown) => {
    setNotice(null);
    setForm((f) => {
      const next = { ...f, [name]: value };
      // La dirección web se arma sola con el nombre hasta que la editen a mano.
      if (name === cfg.titleField && slugField && !slugTouched) {
        next[slugField.name] = slugify(pickText(value as Record<string, string>) ?? '');
      }
      return next;
    });
    if (slugField && name === slugField.name) setSlugTouched(true);
  };

  const save = async () => {
    setError(null);
    setNotice(null);
    const missing = fields.filter((f) => f.required && !(f.type.startsWith('i18n') ? pickText(form[f.name]) : form[f.name]));
    if (missing.length) {
      setError(`Falta completar: ${missing.map((f) => f.label).join(', ')}.`);
      return;
    }
    setSaving(true);
    const payload: AnyRow = {};
    for (const f of fields) if (form[f.name] !== undefined) payload[f.name] = form[f.name];
    // Lo que crea un propietario queda en su espacio.
    if (tenantId && !savedId) payload.tenant_id = tenantId;

    let resultId = savedId;
    let errMsg: string | null = null;
    if (!resultId) {
      const { data, error } = await sb.from(cfg.table).insert(payload).select('id').single();
      if (error) errMsg = error.message;
      else resultId = (data as { id: string }).id;
    } else {
      const { error } = await sb.from(cfg.table).update(payload).eq('id', resultId);
      if (error) errMsg = error.message;
    }
    setSaving(false);

    if (errMsg) {
      setError(
        errMsg.includes('duplicate key') && errMsg.includes('slug')
          ? 'Esa dirección web ya existe. Cambia la dirección y vuelve a guardar.'
          : errMsg,
      );
      return;
    }
    setSaved(JSON.stringify(form));
    setNotice(isNew ? 'Creado. Ahora puedes subir las fotos.' : 'Cambios guardados.');
    if (resultId) {
      setSavedId(resultId);
      if (isNew) navigate(`${basePath}/${entity}/${resultId}`, { replace: true });
    }
  };

  const saveButton = (className = '') => (
    <button
      type="button"
      onClick={save}
      disabled={saving}
      className={`inline-flex min-h-touch items-center justify-center gap-2 border border-ink bg-ink px-6 text-sm font-medium tracking-[0.04em] text-surface transition hover:border-brand-hover hover:bg-brand-hover disabled:opacity-60 ${className}`}
    >
      {saving && <Loader2 className="h-4 w-4 animate-spin" />}
      {isNew ? `Crear ${cfg.labelSingular.toLowerCase()}` : 'Guardar cambios'}
    </button>
  );

  const renderGroupFields = (list: FieldDef[]) => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {list.map((f) => (
        <div key={f.name} className={f.colSpan === 2 || f.type.startsWith('i18n') || f.type === 'slug' ? 'sm:col-span-2' : ''}>
          {renderField(f, form[f.name], setField)}
        </div>
      ))}
    </div>
  );

  const publicationFields = (groups['Publicación'] ?? []).filter((f) => f.name !== 'status');

  return (
    <div className="mx-auto max-w-6xl pb-24 lg:pb-0">
      <Link to={`${basePath}/${entity}`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> {cfg.labelPlural}
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="min-w-0 font-serif text-[2rem] font-light leading-tight text-ink">{title}</h1>
        {!isNew && <StatusChip tone={status.tone}>{status.label}</StatusChip>}
        {dirty && <span className="text-xs text-warn">Cambios sin guardar</span>}
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-alert/30 bg-alert-tint px-4 py-3 text-sm text-alert">
          {error}
        </p>
      )}
      {notice && !error && (
        <p role="status" className="mt-4 rounded-lg bg-brand-tint px-4 py-3 text-sm text-brand">
          {notice}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          {Object.entries(groups)
            .filter(([name]) => !ASIDE_GROUPS.has(name))
            .map(([name, list]) => (
              <Card key={name} title={name}>
                {renderGroupFields(list)}
              </Card>
            ))}

          {groups['SEO'] && (
            <details className="group rounded-card border border-line bg-white">
              <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 sm:px-6">
                <span>
                  <span className="block font-serif text-[1.35rem] text-ink">Buscadores (SEO)</span>
                  <span className="text-xs text-muted">Opcional. Título y descripción que muestran Google y las redes.</span>
                </span>
                <ChevronDown className="h-5 w-5 text-muted transition group-open:rotate-180" />
              </summary>
              <div className="border-t border-line p-5 sm:p-6">{renderGroupFields(groups['SEO'])}</div>
            </details>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6 lg:h-fit">
          <Card title="Publicación">
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-stone p-1" role="radiogroup" aria-label="Estado">
              {STATUS_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={form.status === o.value}
                  onClick={() => setField('status', o.value)}
                  className={`rounded-md px-2 py-2 text-sm transition ${
                    form.status === o.value ? 'bg-white font-medium text-ink shadow-sm' : 'text-muted hover:text-ink'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">{STATUS_OPTIONS.find((o) => o.value === form.status)?.hint}</p>
            {tenant && tenant.status !== 'active' && form.status === 'published' && (
              <p className="mt-3 rounded-lg bg-warn-tint px-3 py-2 text-xs text-warn">Se verá en Hellominus cuando aprobemos tu espacio.</p>
            )}
            {publicationFields.length > 0 && <div className="mt-5 space-y-4 border-t border-line pt-5">{publicationFields.map((f) => <div key={f.name}>{renderField(f, form[f.name], setField)}</div>)}</div>}
            <div className="mt-5 hidden lg:block">{saveButton('w-full')}</div>
            {publicPath && (
              <a href={publicPath} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm text-brand hover:underline">
                Ver en Hellominus <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </Card>

          {cfg.images && (
            <Card title="Fotos" eyebrow={savedId ? 'La primera es la portada' : undefined}>
              {/* Los propietarios solo pueden subir a catalog/tenants/<su espacio>/… (política de Storage). */}
              <ImageManager config={cfg.images} parentId={savedId} bucketFolder={tenantId ? `tenants/${tenantId}/${cfg.table}` : cfg.table} />
            </Card>
          )}
        </aside>
      </div>

      {/* Barra fija para guardar en móvil y tablet. */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-line bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <span className="text-xs text-muted">{dirty ? 'Cambios sin guardar' : 'Todo guardado'}</span>
        {saveButton()}
      </div>
    </div>
  );
}
