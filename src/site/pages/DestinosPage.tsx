import { useEffect, useState } from 'react';
import { useLocale } from '../../lib/locale';
import { getFeaturedDestinations, type DestinationWithMedia } from '../../lib/queries';
import { Container } from '../ui';
import { DestinationTile } from '../cards';

export default function DestinosPage() {
  const { locale } = useLocale();
  const es = locale === 'es';
  const [rows, setRows] = useState<DestinationWithMedia[] | null>(null);

  useEffect(() => {
    getFeaturedDestinations(30).then(setRows);
  }, []);

  return (
    <Container className="py-10">
      <h1 className="font-serif text-4xl text-ink sm:text-5xl">
        {es ? 'Destinos de Colombia' : 'Destinations in Colombia'}
      </h1>
      <p className="mt-1 text-[15px] text-muted">
        {es
          ? 'Desde el Caribe hasta la montaña cafetera. Cada destino, una puerta de entrada.'
          : 'From the Caribbean to the coffee mountains. Each one a doorway.'}
      </p>

      <div className="mt-8">
        {rows === null ? (
          <p className="text-sm text-muted">{es ? 'Cargando…' : 'Loading…'}</p>
        ) : rows.length === 0 ? (
          <div className="rounded-card border border-dashed border-line py-16 text-center text-muted">
            {es ? 'Todavía no hay destinos publicados.' : 'No destinations published yet.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((d) => (
              <DestinationTile key={d.id} dest={d} />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
