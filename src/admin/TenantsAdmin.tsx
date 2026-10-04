import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Row } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type Tenant = Pick<Row<'tenants'>, 'id' | 'name' | 'slug' | 'status' | 'kinds' | 'city' | 'contact_email' | 'contact_whatsapp' | 'created_at'>;

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  active: 'bg-green-100 text-green-700',
  suspended: 'bg-red-100 text-red-700',
};
const STATUS_LABEL: Record<string, string> = { pending: 'En revisión', active: 'Activo', suspended: 'Suspendido' };
const ORDER: Record<string, number> = { pending: 0, active: 1, suspended: 2 };

/** Espacios de propietarios: el equipo los revisa y los activa o suspende. */
export default function TenantsAdmin() {
  const { isAdmin } = useAuth();
  const [rows, setRows] = useState<Tenant[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from('tenants')
      .select('id, name, slug, status, kinds, city, contact_email, contact_whatsapp, created_at')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    setRows((data ?? []).sort((a, b) => (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9)));
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id: string, status: string) => {
    setBusy(id);
    setError(null);
    const { error } = await supabase.rpc('set_tenant_status', { p_tenant: id, p_status: status });
    setBusy(null);
    if (error) setError(error.message);
    else load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Espacios de propietarios</h1>
      <p className="text-sm text-gray-600">
        Un espacio nuevo queda en revisión. Al activarlo, todo lo que su dueño marque como publicado aparece en Hellominus.
        {!isAdmin && ' Solo un admin puede cambiar el estado.'}
      </p>
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {rows === null ? (
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          Todavía no hay espacios registrados.
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {rows.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <p className="font-medium text-gray-900">
                  {t.name}{' '}
                  <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[t.status] ?? ''}`}>
                    {STATUS_LABEL[t.status] ?? t.status}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  /anfitrion/{t.slug} · {t.kinds.join(', ') || 'sin tipo'}
                  {t.city && ` · ${t.city}`} · {[t.contact_email, t.contact_whatsapp].filter(Boolean).join(' · ')}
                </p>
              </div>
              {isAdmin && (
                <div className="flex gap-2">
                  {t.status !== 'active' && (
                    <button
                      type="button"
                      disabled={busy === t.id}
                      onClick={() => setStatus(t.id, 'active')}
                      className="rounded-lg bg-ink px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
                    >
                      {t.status === 'pending' ? 'Aprobar' : 'Reactivar'}
                    </button>
                  )}
                  {t.status === 'active' && (
                    <button
                      type="button"
                      disabled={busy === t.id}
                      onClick={() => {
                        if (confirm(`¿Suspender "${t.name}"? Dejará de verse en Hellominus.`)) setStatus(t.id, 'suspended');
                      }}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                    >
                      Suspender
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
