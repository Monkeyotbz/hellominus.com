import type { Json } from '../types/supabase';

/** Idiomas soportados por el sitio (deben existir en la tabla `locales`). */
export const LOCALES = ['es', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'es';

export const LOCALE_LABEL: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
};

export const LOCALE_STORAGE_KEY = 'tc_locale';

/** Mapa i18n almacenado en columnas jsonb: { es: "...", en: "..." }. */
export type I18nText = Partial<Record<string, string>>;
export type I18nList = Partial<Record<string, string[]>>;

export function emptyI18n(): I18nText {
  return {};
}

/** Elige el texto del idioma pedido con fallback a español y luego a cualquiera. */
export function pickText(
  value: Json | I18nText | null | undefined,
  locale: Locale = DEFAULT_LOCALE
): string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return '';
  const map = value as Record<string, unknown>;
  for (const key of [locale, DEFAULT_LOCALE, ...LOCALES]) {
    const v = map[key];
    if (typeof v === 'string' && v.trim()) return v;
  }
  const first = Object.values(map).find((v) => typeof v === 'string' && (v as string).trim());
  return (first as string) ?? '';
}

/** Igual que pickText pero para arrays (highlights, includes, ...). */
export function pickList(
  value: Json | I18nList | null | undefined,
  locale: Locale = DEFAULT_LOCALE
): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
  const map = value as Record<string, unknown>;
  for (const key of [locale, DEFAULT_LOCALE, ...LOCALES]) {
    const v = map[key];
    if (Array.isArray(v)) return v.filter((x): x is string => typeof x === 'string');
  }
  return [];
}

export function readInitialLocale(): Locale {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved && (LOCALES as readonly string[]).includes(saved)) return saved as Locale;
    const nav = navigator.language?.slice(0, 2).toLowerCase();
    if (nav && (LOCALES as readonly string[]).includes(nav)) return nav as Locale;
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE;
}
