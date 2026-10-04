import { useEffect, useState } from 'react';
import { Camera, ExternalLink, Loader2 } from 'lucide-react';
import { supabase, catalogImageUrl } from '../lib/supabase';
import type { Row, Update } from '../lib/supabase';
import { pickText } from '../lib/i18n';
import { renderField } from '../admin/fields';
import type { FieldDef } from '../admin/types';
import { useAuth } from '../contexts/AuthContext';
import { Card, PageHeader } from '../dash/ui';
import { shrinkImage } from '../dash/images';

type Tenant = Row<'tenants'>;
type ImageField = 'logo_path' | 'cover_path';

const PRESENTATION: FieldDef[] = [
  { name: 'name', label: 'Nombre del espacio', type: 'text', required: true },
  { name: 'tagline', label: 'Frase corta', type: 'i18n-text', help: 'Aparece bajo el nombre. Ej.: "Casas frente al mar en El Laguito".' },
  { name: 'description', label: 'Quiénes son y qué ofrecen', type: 'i18n-textarea' },
];
const CONTACT: FieldDef[] = [
  { name: 'city', label: 'Ciudad', type: 'text' },
  { name: 'region', label: 'Departamento', type: 'text' },
  { name: 'contact_whatsapp', label: 'WhatsApp', type: 'text' },
  { name: 'contact_email', label: 'Correo de contacto', type: 'text' },
  { name: 'website', label: 'Sitio web', type: 'text', colSpan: 2 },
];
const SOCIAL = ['instagram', 'facebook', 'tiktok', 'youtube'] as const;
const SOCIAL_LABEL: Record<(typeof SOCIAL)[number], string> = { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube' };

/** Lo que el propietario puede editar de su espacio (estado y dirección los fija el equipo). */
const EDITABLE: (keyof Tenant)[] = ['name', 'tagline', 'description', 'city', 'region', 'contact_email', 'contact_whatsapp', 'website', 'social', 'logo_path', 'cover_path'];

/** "Mi espacio": cómo se presenta el anfitrión, con vista previa en vivo. */
export default function TenantProfile({ tenantId }: { tenantId: string }) {
  const { refreshMemberships } = useAuth();
  const [form, setForm] = useState<Tenant | null>(null);
  const [saved, setSaved] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<ImageField | null>(null);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single()
      .then(({ data, error }) => {
        if (error) setMessage({ kind: 'error', text: error.message });
        else {
          setForm(data);
          setSaved(JSON.stringify(data));
        }
      });
  }, [tenantId]);

  if (!form) return <div className="mx-auto h-96 max-w-6xl animate-pulse rounded-card bg-stone" />;

  const dirty = JSON.stringify(form) !== saved;
  const set = (name: string, value: unknown) => {
    setMessage(null);
    setForm((f) => (f ? { ...f, [name]: value } : f));
  };
  const social = (form.social ?? {}) as Record<string, string>;

  const upload = async (field: ImageField, original: File | undefined) => {
    if (!original) return;
    setUploading(field);
    const file = await shrinkImage(original, field === 'logo_path' ? 600 : 2000);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    // Solo se puede escribir en catalog/tenants/<este espacio>/… (política de Storage).
    const path = `tenants/${tenantId}/perfil/${field === 'logo_path' ? 'logo' : 'portada'}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('catalog').upload(path, file, { upsert: false, contentType: file.type });
    setUploading(null);
    if (error) setMessage({ kind: 'error', text: `No se pudo subir la imagen: ${error.message}` });
    else set(field, path);
  };

  const save = async () => {
    if (!form.name?.trim()) return setMessage({ kind: 'error', text: 'El nombre del espacio no puede quedar vacío.' });
    setSaving(true);
    setMessage(null);
    const payload: Update<'tenants'> = {};
    for (const key of EDITABLE) (payload as Record<string, unknown>)[key] = form[key];
    const { error } = await supabase.from('tenants').update(payload).eq('id', tenantId);
    setSaving(false);
    if (error) return setMessage({ kind: 'error', text: error.message });
    setSaved(JSON.stringify(form));
    await refreshMemberships();
    setMessage({ kind: 'ok', text: 'Cambios guardados.' });
  };

  const saveButton = (className = '') => (
    <button
      type="button"
      onClick={save}
      disabled={saving}
      className={`inline-flex min-h-touch items-center justify-center gap-2 border border-ink bg-ink px-6 text-sm font-medium tracking-[0.04em] text-surface transition hover:border-brand-hover hover:bg-brand-hover disabled:opacity-60 ${className}`}
    >
      {saving && <Loader2 className="h-4 w-4 animate-spin" />} Guardar cambios
    </button>
  );

  const grid = (list: FieldDef[]) => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {list.map((f) => (
        <div key={f.name} className={f.colSpan === 2 || f.type.startsWith('i18n') || f.name === 'name' ? 'sm:col-span-2' : ''}>
          {renderField(f, form[f.name as keyof Tenant], set)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl pb-24 lg:pb-0">
      <PageHeader
        title="Mi espacio"
        meta={
          <>
            <span>Así te presentas en Hellominus.</span>
            {dirty && <span className="text-warn">Cambios sin guardar</span>}
          </>
        }
      />

      {message && (
        <p
          role={message.kind === 'error' ? 'alert' : 'status'}
          className={`mt-4 rounded-lg px-4 py-3 text-sm ${message.kind === 'error' ? 'border border-alert/30 bg-alert-tint text-alert' : 'bg-brand-tint text-brand'}`}
        >
          {message.text}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          <Card title="Cómo te presentas">{grid(PRESENTATION)}</Card>
          <Card title="Contacto y ubicación">{grid(CONTACT)}</Card>
          <Card title="Redes sociales">
            {/* Las redes viven dentro de `social` (jsonb), no como columnas del espacio. */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {SOCIAL.map((key) => (
                <div key={key}>
                  {renderField(
                    { name: key, label: SOCIAL_LABEL[key], type: 'text', help: 'Enlace completo (https://…)' },
                    social[key] ?? '',
                    (name, value) => set('social', { ...social, [name]: value ?? '' }),
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6 lg:h-fit">
          <Card title="Vista previa" bodyClassName="p-0">
            <label className="group relative block h-36 cursor-pointer bg-stone">
              {form.cover_path && <img src={catalogImageUrl(form.cover_path)} alt="" className="h-full w-full object-cover" />}
              <span className="absolute inset-0 flex items-center justify-center gap-1.5 bg-ink/0 text-sm font-medium text-white opacity-0 transition group-hover:bg-ink/40 group-hover:opacity-100 group-focus-within:bg-ink/40 group-focus-within:opacity-100">
                <Camera className="h-4 w-4" /> Cambiar portada
              </span>
              {!form.cover_path && (
                <span className="absolute inset-0 flex items-center justify-center gap-1.5 text-sm text-muted">
                  <Camera className="h-4 w-4" /> Subir portada
                </span>
              )}
              {uploading === 'cover_path' && (
                <span className="absolute inset-0 flex items-center justify-center bg-white/70">
                  <Loader2 className="h-5 w-5 animate-spin text-brand" />
                </span>
              )}
              <input type="file" accept="image/*" className="sr-only" aria-label="Cambiar portada" onChange={(e) => upload('cover_path', e.target.files?.[0])} />
            </label>
            <div className="relative px-5 pb-5 pt-10">
              <label className="group absolute -top-8 left-5 block h-16 w-16 cursor-pointer overflow-hidden rounded-lg border-2 border-white bg-surface shadow-sm">
                {form.logo_path ? (
                  <img src={catalogImageUrl(form.logo_path)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-muted">
                    <Camera className="h-4 w-4" />
                  </span>
                )}
                {uploading === 'logo_path' && (
                  <span className="absolute inset-0 flex items-center justify-center bg-white/70">
                    <Loader2 className="h-4 w-4 animate-spin text-brand" />
                  </span>
                )}
                <input type="file" accept="image/*" className="sr-only" aria-label="Cambiar logo" onChange={(e) => upload('logo_path', e.target.files?.[0])} />
              </label>
              <p className="font-serif text-xl text-ink">{form.name || 'Tu espacio'}</p>
              <p className="text-sm text-muted">{pickText(form.tagline) || 'Tu frase corta aparecerá aquí.'}</p>
              {pickText(form.description) && <p className="mt-3 line-clamp-4 text-sm text-ink">{pickText(form.description)}</p>}
              <p className="mt-4 text-xs text-muted">hellominus.com/anfitrion/{form.slug}</p>
              <p className="mt-1 text-xs text-muted">Toca la portada o el logo para cambiarlos.</p>
            </div>
          </Card>
          <div className="hidden lg:block">{saveButton('w-full')}</div>
          {form.status === 'active' && (
            <a href={`/anfitrion/${form.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-brand hover:underline">
              Ver mi página pública <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-line bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <span className="text-xs text-muted">{dirty ? 'Cambios sin guardar' : 'Todo guardado'}</span>
        {saveButton()}
      </div>
    </div>
  );
}
