import { createContext, useCallback, useContext, useState } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { submitLead, type LeadInput } from '../lib/queries';
import { useLocale } from '../lib/locale';
import { useSettings } from './SettingsContext';
import { Button, buttonClasses } from './ui';

type Prefill = Partial<Pick<LeadInput, 'type' | 'related_type' | 'related_id'>> & {
  itemTitle?: string;
  /** Texto inicial del campo mensaje (p. ej. contexto de búsqueda: destino y fechas). */
  message?: string;
  /** Nº de viajeros pre-cargado. */
  guests?: number;
};

interface LeadCtx {
  open: (prefill?: Prefill) => void;
}
const Ctx = createContext<LeadCtx>({ open: () => {} });
export const useLeadDialog = () => useContext(Ctx);

export function LeadDialogProvider({ children }: { children: React.ReactNode }) {
  const [prefill, setPrefill] = useState<Prefill | null>(null);
  const open = useCallback((p?: Prefill) => setPrefill(p ?? {}), []);
  return (
    <Ctx.Provider value={{ open }}>
      {children}
      {prefill && <LeadDialog prefill={prefill} onClose={() => setPrefill(null)} />}
    </Ctx.Provider>
  );
}

function LeadDialog({ prefill, onClose }: { prefill: Prefill; onClose: () => void }) {
  const { locale } = useLocale();
  const { whatsappHref, hasWhatsapp } = useSettings();
  const [form, setForm] = useState({
    name: '',
    whatsapp: '',
    email: '',
    message: prefill.message ?? '',
    guests: prefill.guests ? String(prefill.guests) : '',
  });
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const es = locale === 'es';
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.whatsapp.trim()) return;
    setState('sending');
    const { error } = await submitLead({
      type: (prefill.type as LeadInput['type']) ?? 'general',
      name: form.name.trim(),
      whatsapp: form.whatsapp.trim(),
      email: form.email.trim() || undefined,
      message:
        (prefill.itemTitle ? `Interés: ${prefill.itemTitle}. ` : '') + form.message.trim(),
      locale,
      related_type: prefill.related_type,
      related_id: prefill.related_id,
      guests: form.guests ? Number(form.guests) : undefined,
    });
    setState(error ? 'error' : 'done');
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between bg-brand px-6 py-4 text-white">
          <div>
            <h3 className="font-serif text-xl">{es ? 'Contanos qué querés hacer' : 'Tell us what you want to do'}</h3>
            <p className="text-sm text-white/80">
              {prefill.itemTitle
                ? prefill.itemTitle
                : es
                ? 'Un asesor local te responde por WhatsApp'
                : 'A local advisor replies on WhatsApp'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
        </div>

        {state === 'done' ? (
          <div className="space-y-4 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-tint text-brand">
              <Check className="h-6 w-6" />
            </div>
            <p className="text-sm text-ink">
              {es
                ? '¡Listo! Recibimos tu solicitud. Un asesor te escribe pronto.'
                : "Done! We got your request. An advisor will contact you soon."}
            </p>
            {hasWhatsapp && (
            <a href={whatsappHref(`Hola, soy ${form.name}. ${prefill.itemTitle ?? ''}`)} target="_blank" rel="noopener noreferrer" className={buttonClasses('accent', 'md', 'w-full')}>
              {es ? 'Escribir ahora por WhatsApp' : 'Message now on WhatsApp'}
            </a>
            )}
          </div>
        ) : (
          <form onSubmit={send} className="space-y-3 p-6">
            <input
              required
              placeholder={es ? 'Tu nombre' : 'Your name'}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand"
            />
            <input
              required
              placeholder="WhatsApp (+57 ...)"
              value={form.whatsapp}
              onChange={(e) => set('whatsapp', e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand"
            />
            <input
              type="email"
              placeholder={es ? 'Correo (opcional)' : 'Email (optional)'}
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand"
            />
            <div className="flex gap-3">
              <input
                type="number"
                min="1"
                placeholder={es ? 'Personas' : 'Guests'}
                value={form.guests}
                onChange={(e) => set('guests', e.target.value)}
                className="w-28 rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand"
              />
              <input
                placeholder={es ? 'Fechas aprox.' : 'Approx. dates'}
                value={form.message}
                onChange={(e) => set('message', e.target.value)}
                className="flex-1 rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand"
              />
            </div>
            {state === 'error' && (
              <p className="text-xs text-alert">
                {es ? 'No se pudo enviar. Probá por WhatsApp.' : 'Could not send. Try WhatsApp.'}
              </p>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={state === 'sending'}>
              {state === 'sending' && <Loader2 className="h-4 w-4 animate-spin" />}
              {es ? 'Enviar solicitud' : 'Send request'}
            </Button>
            <p className="text-center text-[11px] text-muted">
              {es
                ? 'No se cobra nada ahora. Te contacta un asesor.'
                : 'Nothing is charged now. An advisor will reach out.'}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
