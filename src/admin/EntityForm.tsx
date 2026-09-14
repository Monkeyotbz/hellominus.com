import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { sb } from '../lib/supabase';
import { ENTITIES } from './entities';
import { renderField } from './fields';
import ImageManager from './ImageManager';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

export default function EntityForm() {
  const { entity = '', id } = useParams();
  const cfg = ENTITIES[entity];
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [form, setForm] = useState<AnyRow>({});
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(isNew ? null : id!);

  useEffect(() => {
    if (!cfg) return;
    if (isNew) {
      setForm({ ...(cfg.defaults ?? {}) });
      return;
    }
    setLoading(true);
    sb.from(cfg.table)
      .select('*')
      .eq('id', id!)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setForm(data as AnyRow);
        setLoading(false);
      });
  }, [entity, id]); // eslint-disable-line react-hooks/exhaustive-deps

  const groups = useMemo(() => {
    const g: Record<string, typeof cfg.fields> = {};
    for (const f of cfg?.fields ?? []) {
      const key = f.group ?? 'General';
      (g[key] ||= []).push(f);
    }
    return g;
  }, [cfg]);

  if (!cfg) return <p className="text-red-600">Entidad desconocida: {entity}</p>;
  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-blue-600" />;

  const setField = (name: string, value: unknown) => setForm((f) => ({ ...f, [name]: value }));

  const save = async () => {
    setSaving(true);
    setError(null);
    const payload: AnyRow = {};
    for (const f of cfg.fields) if (form[f.name] !== undefined) payload[f.name] = form[f.name];

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
      setError(errMsg);
      return;
    }
    if (resultId) {
      setSavedId(resultId);
      if (isNew) navigate(`/admin/${entity}/${resultId}`, { replace: true });
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/admin/${entity}`)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" /> {cfg.labelPlural}
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar
        </button>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">
        {isNew ? `Nuevo · ${cfg.labelSingular}` : `Editar · ${cfg.labelSingular}`}
      </h1>

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {Object.entries(groups).map(([groupName, fields]) => (
        <section key={groupName} className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">{groupName}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.name} className={f.colSpan === 2 ? 'sm:col-span-2' : ''}>
                {renderField(f, form[f.name], setField)}
              </div>
            ))}
          </div>
        </section>
      ))}

      {cfg.images && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Imágenes</h2>
          <ImageManager config={cfg.images} parentId={savedId} bucketFolder={cfg.table} />
        </section>
      )}
    </div>
  );
}
