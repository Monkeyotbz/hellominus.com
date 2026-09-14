import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sb } from '../lib/supabase';
import { ENTITIES, ENTITY_ORDER } from './entities';

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Record<string, number | null>>({});

  useEffect(() => {
    ENTITY_ORDER.forEach(async (key) => {
      const { count } = await sb.from(key).select('*', { count: 'exact', head: true });
      setCounts((c) => ({ ...c, [key]: count ?? 0 }));
    });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Panel de contenido</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {ENTITY_ORDER.map((key) => {
          const cfg = ENTITIES[key];
          return (
            <Link
              key={key}
              to={`/admin/${key}`}
              className="rounded-xl border border-gray-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
            >
              <div className="text-3xl font-bold text-gray-900">
                {counts[key] === undefined ? '…' : counts[key]}
              </div>
              <div className="mt-1 text-sm text-gray-500">{cfg.labelPlural}</div>
            </Link>
          );
        })}
      </div>
      <p className="text-sm text-gray-500">
        Crea y edita el contenido del sitio. Los cambios con estado <b>Publicado</b> se ven en la web.
      </p>
    </div>
  );
}
