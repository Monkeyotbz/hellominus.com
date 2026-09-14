import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { subscribeNewsletter } from '../lib/queries';
import { useLocale } from '../lib/locale';
import { Container, Button } from './ui';

export default function NewsletterBand() {
  const { locale } = useLocale();
  const es = locale === 'es';
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/.+@.+\..+/.test(email)) return;
    setState('sending');
    const { error } = await subscribeNewsletter(email.trim(), locale);
    setState(error ? 'error' : 'done');
  };

  return (
    <Container className="py-12">
      <div className="flex flex-col items-start justify-between gap-8 rounded-[22px] bg-brand-deep px-6 py-11 sm:px-14 md:flex-row md:items-center">
        <div>
          <div className="font-serif text-3xl leading-tight text-[#FCFAF4]">
            {es
              ? 'Sumate y llevate un 10% en tu primera experiencia'
              : 'Join and get 10% off your first experience'}
          </div>
          <div className="mt-2 text-[15px] text-[#C9C6B9]">
            {es ? 'Ideas de viaje y ofertas de temporada. Sin spam.' : 'Trip ideas and seasonal deals. No spam.'}
          </div>
        </div>
        {state === 'done' ? (
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-medium text-white">
            <Check className="h-4 w-4" /> {es ? '¡Listo! Revisá tu correo.' : 'Done! Check your inbox.'}
          </div>
        ) : (
          <form onSubmit={submit} className="flex w-full shrink-0 flex-col gap-2 sm:flex-row md:w-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={es ? 'tu@correo.com' : 'you@email.com'}
              className="w-full rounded-full bg-white px-5 py-3 text-sm text-ink outline-none sm:min-w-[240px]"
            />
            <Button variant="primary" size="lg" type="submit" disabled={state === 'sending'}>
              {state === 'sending' && <Loader2 className="h-4 w-4 animate-spin" />}
              {es ? 'Quiero el 10%' : 'Get 10%'}
            </Button>
          </form>
        )}
      </div>
    </Container>
  );
}
