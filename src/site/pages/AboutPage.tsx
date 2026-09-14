import { useLocale } from '../../lib/locale';
import { useSettings } from '../SettingsContext';
import { Container, Eyebrow, buttonClasses } from '../ui';
import { Users, Wallet, MessageCircle } from 'lucide-react';

export default function AboutPage() {
  const { locale } = useLocale();
  const { whatsappHref } = useSettings();
  const es = locale === 'es';

  return (
    <div>
      <Container className="max-w-3xl pt-10">
        <Eyebrow>{es ? 'Quiénes somos' : 'About us'}</Eyebrow>
        <h1 className="mt-3 text-h1 text-ink">
          {es
            ? 'Reservar un viaje debería ser fácil para cualquiera.'
            : 'Booking a trip should be easy for anyone.'}
        </h1>
        <p className="mt-5 text-body leading-relaxed text-muted">
          {es
            ? 'Hellominus reúne tours y hospedajes en un solo lugar, con precios claros y pasos simples. Está pensado para que lo use cualquiera: familias que viajan con chicos, personas mayores que prefieren llamar antes que llenar formularios, y quien viaja por trabajo y necesita resolver rápido.'
            : 'Hellominus brings tours and stays together in one place, with clear prices and simple steps. It is built for everyone: families traveling with kids, older travelers who would rather call than fill in forms, and people traveling for work who need to sort things out fast.'}
        </p>
        <p className="mt-4 text-body leading-relaxed text-muted">
          {es
            ? 'Si trabajás de forma remota, vas a encontrar además la información que te importa: conexión, espacio para trabajar y estadías largas.'
            : 'If you work remotely, you will also find what matters to you: connectivity, a place to work and long stays.'}
        </p>
      </Container>

      {/* Cómo trabajamos */}
      <Container className="py-12">
        <h2 className="mb-6 text-h2 text-ink">{es ? 'Cómo trabajamos' : 'How we work'}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Pillar
            icon={<Users className="h-7 w-7 text-brand" aria-hidden="true" />}
            title={es ? 'Anfitriones locales' : 'Local hosts'}
            body={
              es
                ? 'La experiencia la arma quien vive en el lugar y la conoce de verdad.'
                : 'The experience is built by people who live there and know it well.'
            }
          />
          <Pillar
            icon={<Wallet className="h-7 w-7 text-brand" aria-hidden="true" />}
            title={es ? 'Precio claro, sin sorpresas' : 'Clear price, no surprises'}
            body={
              es
                ? 'Ves el total antes de reservar. Sin cargos que aparecen al final.'
                : 'You see the total before booking. No fees appearing at the end.'
            }
          />
          <Pillar
            icon={<MessageCircle className="h-7 w-7 text-brand" aria-hidden="true" />}
            title={es ? 'Una persona te responde' : 'A person answers you'}
            body={
              es
                ? 'Escribís por WhatsApp y te contesta alguien que puede resolverte.'
                : 'You write on WhatsApp and someone who can actually help replies.'
            }
          />
        </div>
      </Container>

      {/* Misión / Visión */}
      <Container className="grid gap-7 py-6 md:grid-cols-2">
        <div className="rounded-card border border-line bg-white p-7">
          <Eyebrow>{es ? 'Misión' : 'Mission'}</Eyebrow>
          <p className="mt-3 text-body leading-relaxed text-muted">
            {es
              ? 'Que reservar un tour o un hospedaje se resuelva en pocos pasos, se entienda a la primera y esté al alcance de cualquier persona.'
              : 'Make booking a tour or a stay take just a few steps, read clearly the first time, and stay within reach of anyone.'}
          </p>
        </div>
        <div className="rounded-card border border-line bg-white p-7">
          <Eyebrow>{es ? 'Visión' : 'Vision'}</Eyebrow>
          <p className="mt-3 text-body leading-relaxed text-muted">
            {es
              ? 'Ser la plataforma donde viajeros de cualquier edad encuentran y reservan sin fricción, y donde los anfitriones locales trabajan en condiciones justas.'
              : 'To be the platform where travelers of any age find and book without friction, and where local hosts work on fair terms.'}
          </p>
        </div>
      </Container>

      {/* CTA */}
      <Container className="py-12">
        <div className="flex flex-col items-start justify-between gap-8 rounded-[22px] bg-brand px-8 py-11 sm:px-14 md:flex-row md:items-center">
          <div className="text-h2 leading-tight text-white">
            {es ? '¿Tenés una duda antes de reservar?' : 'Any questions before you book?'}
          </div>
          <a
            href={whatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses('white', 'lg', 'shrink-0')}
          >
            {es ? 'Escribinos por WhatsApp' : 'Message us on WhatsApp'}
          </a>
        </div>
      </Container>
    </div>
  );
}

function Pillar({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-card border border-line bg-white p-6">
      {icon}
      <div className="mt-3.5 text-h3 text-ink">{title}</div>
      <p className="mt-1.5 text-body-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}
