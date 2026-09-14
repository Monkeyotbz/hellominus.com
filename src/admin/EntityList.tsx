import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { sb } from '../lib/supabase';
import { pickText } from '../lib/i18n';
import { ENTITIES } from './entities';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

const STATUS_STYLE: Record<string, string> = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-600',
  archived: 'bg-amber-100 text-amber-700',
};

export default function EntityList() {
  const { entity = '' } = useParams();
  const cfg = ENTITIES[entity];
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!cfg) return;
    setLoading(true);
    const { data, error } = await sb
      .from(cfg.table)
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) console.error(error);
    setRows((data as AnyRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [entity]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!cfg) return <p className="text-red-600">Entidad desconocida: {entity}</p>;

  const del = async (id: string) => {
    if (!confirm('¿Eliminar este registro?')) return;
    await sb.from(cfg.table).delete().eq('id', id);
    load();
  };

  const renderCell = (row: AnyRow, col: (typeof cfg.listColumns)[number]) => {
    const v = row[col.field];
    switch (col.kind) {
      case 'i18n':
        return pickText(v) || <span className="text-gray-400">— sin título —</span>;
      case 'bool':
        return v ? '✅' : '';
      case 'money':
        return v ? `$${Number(v).toLocaleString('es-CO')}` : '';
      case 'status':
        return (
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[v] ?? 'bg-gray-100'}`}>
            {v}
          </span>
        );
      default:
        return v ?? '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{cfg.labelPlural}</h1>
        <Link
          to={`/admin/${entity}/new`}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Nuevo
        </Link>
      </div>

      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          Aún no hay {cfg.labelPlural.toLowerCase()}. Crea el primero.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {cfg.listColumns.map((c) => (
                  <th key={c.field} className="px-4 py-3 text-left font-semibold text-gray-600">
                    {c.label}
                  </th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {cfg.listColumns.map((c, i) => (
                    <td key={c.field} className="px-4 py-3">
                      {i === 0 ? (
                        <Link to={`/admin/${entity}/${row.id}`} className="font-medium text-blue-700 hover:underline">
                          {renderCell(row, c)}
                        </Link>
                      ) : (
                        renderCell(row, c)
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => del(row.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
