import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Json } from '../types/supabase';
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  pickList,
  pickText,
  readInitialLocale,
  type I18nList,
  type I18nText,
  type Locale,
} from './i18n';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  /** Traduce un mapa jsonb al idioma actual. */
  t: (value: Json | I18nText | null | undefined) => string;
  /** Traduce un mapa jsonb de listas al idioma actual. */
  tList: (value: Json | I18nList | null | undefined) => string[];
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale);

  useEffect(() => {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => setLocaleState(l), []);
  const t = useCallback(
    (value: Json | I18nText | null | undefined) => pickText(value, locale),
    [locale]
  );
  const tList = useCallback(
    (value: Json | I18nList | null | undefined) => pickList(value, locale),
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t, tList }), [locale, setLocale, t, tList]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    // Fallback si algún componente se usa fuera del provider (p.ej. tests)
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      t: (v) => pickText(v, DEFAULT_LOCALE),
      tList: (v) => pickList(v, DEFAULT_LOCALE),
    };
  }
  return ctx;
}
