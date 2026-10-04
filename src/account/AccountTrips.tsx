import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Luggage } from 'lucide-react';
import { buttonClasses } from '../site/ui';
import { EmptyState, Segmented } from '../dash/ui';
import { TripRow } from './TripCards';
import { tripGroup, type TripGroup } from './useMyBookings';
import { useAccount } from './AccountLayout';

const EMPTY: Record<TripGroup, { title: string; text: string }> = {
  upcoming: { title: 'No tienes viajes próximos', text: 'Cuando reserves un hospedaje, un plan o un producto, aparecerá aquí.' },
  past: { title: 'Todavía no hay viajes pasados', text: 'Aquí quedará el historial de tus viajes con Hellominus.' },
  cancelled: { title: 'Nada cancelado', text: 'Las reservas canceladas aparecerán aquí.' },
};

/** Todas las reservas y compras del viajero, por grupo. */
export default function AccountTrips() {
  const { bookings } = useAccount();
  const [group, setGroup] = useState<TripGroup>('upcoming');

  const grouped = useMemo(() => {
    const g: Record<TripGroup, NonNullable<typeof bookings>> = { upcoming: [], past: [], cancelled: [] };
    for (const b of bookings ?? []) g[tripGroup(b)].push(b);
    g.past.reverse(); // lo más reciente primero
    return g;
  }, [bookings]);

  if (bookings === null) return <div className="h-40 animate-pulse rounded-card bg-stone" aria-label="Cargando tus viajes" />;

  const list = grouped[group];
  return (
    <div className="space-y-6">
      <Segmented
        label="Filtrar viajes"
        value={group}
        onChange={setGroup}
        options={[
          { value: 'upcoming', label: 'Próximos', count: grouped.upcoming.length },
          { value: 'past', label: 'Pasados', count: grouped.past.length },
          { value: 'cancelled', label: 'Cancelados', count: grouped.cancelled.length },
        ]}
      />
      {list.length === 0 ? (
        <EmptyState
          icon={<Luggage className="h-5 w-5" />}
          title={EMPTY[group].title}
          text={EMPTY[group].text}
          action={
            group === 'upcoming' ? (
              <Link to="/hospedajes" className={buttonClasses('primary', 'md')}>
                Buscar hospedaje
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {list.map((b) => (
            <TripRow key={b.id} booking={b} />
          ))}
        </div>
      )}
    </div>
  );
}
