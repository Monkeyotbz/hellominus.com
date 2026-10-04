import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getSiteSettings } from '../lib/queries';
import { useLocale } from '../lib/locale';
import { pickText } from '../lib/i18n';
import { WHATSAPP_NUMBER, CONTACT_EMAIL, buildWhatsappLink } from '../lib/contact';

// Sin número por defecto: mientras no se configure uno propio, el sitio esconde
// el canal de WhatsApp en vez de mandar a nadie a un destinatario ajeno.
const FALLBACK = {
  whatsapp: WHATSAPP_NUMBER,
  email: CONTACT_EMAIL,
  phone: '',
};

interface SettingsValue {
  loaded: boolean;
  raw: Record<string, Record<string, unknown>>;
  whatsappNumber: string;
  /** `false` cuando no hay número configurado: no muestres el canal. */
  hasWhatsapp: boolean;
  contactEmail: string;
  contactPhone: string;
  /** URL de WhatsApp con texto prellenado. Cadena vacía si no hay número. */
  whatsappHref: (text?: string) => string;
  announcement: { enabled: boolean; text: string };
  social: Record<string, string>;
}

const SettingsContext = createContext<SettingsValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  const [raw, setRaw] = useState<Record<string, Record<string, unknown>>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getSiteSettings()
      .then(setRaw)
      .finally(() => setLoaded(true));
  }, []);

  const value = useMemo<SettingsValue>(() => {
    const contact = (raw.contact ?? {}) as Record<string, unknown>;
    const ann = (raw.announcement_bar ?? {}) as Record<string, unknown>;
    const whatsappNumber = (contact.whatsapp_number as string) || FALLBACK.whatsapp;
    const defaultText = pickText(contact.whatsapp_default_text as never, locale) || 'Hola, quiero información';
    return {
      loaded,
      raw,
      whatsappNumber,
      hasWhatsapp: Boolean(String(whatsappNumber ?? '').replace(/\D/g, '')),
      contactEmail: (contact.email as string) || FALLBACK.email,
      contactPhone: (contact.phone as string) || FALLBACK.phone,
      whatsappHref: (text?: string) => buildWhatsappLink(whatsappNumber, text || defaultText),
      // La franja solo aparece si se activa en site_settings y tiene texto.
      announcement: {
        enabled: ann.enabled === true && Boolean(pickText(ann.text as never, locale)),
        text: pickText(ann.text as never, locale),
      },
      social: (raw.social ?? {}) as Record<string, string>,
    };
  }, [raw, loaded, locale]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    return {
      loaded: false,
      raw: {},
      whatsappNumber: FALLBACK.whatsapp,
      hasWhatsapp: Boolean(FALLBACK.whatsapp),
      contactEmail: FALLBACK.email,
      contactPhone: FALLBACK.phone,
      whatsappHref: (t?: string) => buildWhatsappLink(FALLBACK.whatsapp, t || 'Hola'),
      announcement: { enabled: false, text: '' },
      social: {},
    };
  }
  return ctx;
}
