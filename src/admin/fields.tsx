import { useEffect, useId, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { LOCALES, LOCALE_LABEL, type Locale } from '../lib/i18n';
import { inputCls } from '../dash/fields';
import type { FieldDef } from './types';

type Val = unknown;
type OnChange = (name: string, value: Val) => void;

/** "Casa Mar & Sol" → "casa-mar-sol". */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function Label({ field, htmlFor, aside }: { field: FieldDef; htmlFor: string; aside?: ReactNode }) {
  return (
    <div className="mb-1.5 flex items-end justify-between gap-3">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
        {field.label}
        {field.required && <span className="text-alert"> *</span>}
      </label>
      {aside}
    </div>
  );
}

function Help({ children }: { children?: ReactNode }) {
  return children ? <p className="mt-1.5 text-xs text-muted">{children}</p> : null;
}

/* ---------- i18n ---------- */

function LocaleTabs({ active, onChange, filled }: { active: Locale; onChange: (l: Locale) => void; filled: Record<string, boolean> }) {
  return (
    <div className="flex gap-1" role="group" aria-label="Idioma del texto">
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={active === l}
          onClick={() => onChange(l)}
          className={`min-h-[30px] rounded-full px-3 text-xs font-semibold transition ${
            active === l ? 'bg-ink text-surface' : 'bg-stone text-muted hover:text-ink'
          }`}
        >
          {LOCALE_LABEL[l]}
          {!filled[l] && active !== l && <span className="sr-only"> (vacío)</span>}
        </button>
      ))}
    </div>
  );
}

export function I18nInput({
  field,
  value,
  onChange,
  textarea,
}: {
  field: FieldDef;
  value: Record<string, string> | null | undefined;
  onChange: OnChange;
  textarea?: boolean;
}) {
  const id = useId();
  const [loc, setLoc] = useState<Locale>('es');
  const map = (value ?? {}) as Record<string, string>;
  const set = (v: string) => onChange(field.name, { ...map, [loc]: v });
  const filled = Object.fromEntries(LOCALES.map((l) => [l, Boolean(map[l]?.trim())]));

  return (
    <div>
      <Label field={field} htmlFor={id} aside={<LocaleTabs active={loc} onChange={setLoc} filled={filled} />} />
      {textarea ? (
        <textarea id={id} rows={5} className={`${inputCls} leading-relaxed`} value={map[loc] ?? ''} onChange={(e) => set(e.target.value)} />
      ) : (
        <input id={id} className={inputCls} value={map[loc] ?? ''} onChange={(e) => set(e.target.value)} />
      )}
      <Help>{field.help ?? (loc !== 'es' && !map[loc] ? 'Opcional: si lo dejas vacío se muestra el texto en español.' : undefined)}</Help>
    </div>
  );
}

export function I18nListInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: Record<string, string[]> | null | undefined;
  onChange: OnChange;
}) {
  const id = useId();
  const [loc, setLoc] = useState<Locale>('es');
  const map = (value ?? {}) as Record<string, string[]>;
  const text = (map[loc] ?? []).join('\n');
  const set = (v: string) => onChange(field.name, { ...map, [loc]: v.split('\n').map((s) => s.trim()).filter(Boolean) });
  const filled = Object.fromEntries(LOCALES.map((l) => [l, Boolean(map[l]?.length)]));

  return (
    <div>
      <Label field={field} htmlFor={id} aside={<LocaleTabs active={loc} onChange={setLoc} filled={filled} />} />
      <textarea id={id} rows={4} className={inputCls} value={text} onChange={(e) => set(e.target.value)} />
      <Help>{field.help ?? 'Un elemento por línea.'}</Help>
    </div>
  );
}

/* ---------- escalares ---------- */

export function TextField({ field, value, onChange }: { field: FieldDef; value: Val; onChange: OnChange }) {
  const id = useId();
  return (
    <div>
      <Label field={field} htmlFor={id} />
      <input id={id} className={inputCls} value={(value as string) ?? ''} onChange={(e) => onChange(field.name, e.target.value === '' ? null : e.target.value)} />
      <Help>{field.help}</Help>
    </div>
  );
}

export function NumberField({ field, value, onChange }: { field: FieldDef; value: Val; onChange: OnChange }) {
  const id = useId();
  return (
    <div>
      <Label field={field} htmlFor={id} />
      <input
        id={id}
        type="number"
        inputMode="decimal"
        className={inputCls}
        value={value === null || value === undefined ? '' : (value as number)}
        onChange={(e) => onChange(field.name, e.target.value === '' ? null : Number(e.target.value))}
      />
      <Help>{field.help}</Help>
    </div>
  );
}

/** Sí/no como interruptor. */
export function BoolField({ field, value, onChange }: { field: FieldDef; value: Val; onChange: OnChange }) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start justify-between gap-4 py-1">
      <span>
        <span className="block text-sm font-medium text-ink">{field.label}</span>
        {field.help && <span className="block text-xs text-muted">{field.help}</span>}
      </span>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input id={id} type="checkbox" role="switch" className="peer sr-only" checked={Boolean(value)} onChange={(e) => onChange(field.name, e.target.checked)} />
        <span className="h-6 w-11 rounded-full bg-line transition peer-checked:bg-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

export function SelectField({ field, value, onChange }: { field: FieldDef; value: Val; onChange: OnChange }) {
  const id = useId();
  return (
    <div>
      <Label field={field} htmlFor={id} />
      <select id={id} className={inputCls} value={(value as string) ?? ''} onChange={(e) => onChange(field.name, e.target.value === '' ? null : e.target.value)}>
        {(field.options ?? []).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Help>{field.help}</Help>
    </div>
  );
}

/** Dirección web: se normaliza al escribir y muestra cómo queda la URL. */
export function SlugField({ field, value, onChange }: { field: FieldDef; value: Val; onChange: OnChange }) {
  const id = useId();
  const slug = (value as string) ?? '';
  return (
    <div>
      <Label field={field} htmlFor={id} />
      <div className="flex items-stretch">
        {field.prefix && (
          <span className="hidden items-center border border-r-0 border-line bg-surface px-3 text-sm text-muted sm:flex">hellominus.com{field.prefix}</span>
        )}
        <input id={id} className={`${inputCls} font-mono text-sm`} value={slug} onChange={(e) => onChange(field.name, slugify(e.target.value))} />
      </div>
      <Help>{field.help ?? 'Se arma sola a partir del nombre. Solo minúsculas, números y guiones.'}</Help>
    </div>
  );
}

export function DateField({ field, value, onChange }: { field: FieldDef; value: Val; onChange: OnChange }) {
  const id = useId();
  const v = value ? String(value).slice(0, 10) : '';
  return (
    <div>
      <Label field={field} htmlFor={id} />
      <input id={id} type="date" className={inputCls} value={v} onChange={(e) => onChange(field.name, e.target.value === '' ? null : e.target.value)} />
      <Help>{field.help}</Help>
    </div>
  );
}

export function RefField({ field, value, onChange }: { field: FieldDef; value: Val; onChange: OnChange }) {
  const id = useId();
  const [opts, setOpts] = useState<{ id: string; label: string }[]>([]);
  useEffect(() => {
    if (!field.refTable) return;
    supabase
      .from(field.refTable)
      .select('id, name, slug')
      .then(({ data }) => {
        setOpts(
          (data ?? []).map((r: Record<string, unknown>) => {
            const name = r.name as Record<string, string> | null;
            return { id: r.id as string, label: name?.es || name?.en || (r.slug as string) };
          }),
        );
      });
  }, [field.refTable]);

  return (
    <div>
      <Label field={field} htmlFor={id} />
      <select id={id} className={inputCls} value={(value as string) ?? ''} onChange={(e) => onChange(field.name, e.target.value === '' ? null : e.target.value)}>
        <option value="">—</option>
        {opts.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      <Help>{field.help}</Help>
    </div>
  );
}

export function renderField(field: FieldDef, value: Val, onChange: OnChange) {
  switch (field.type) {
    case 'i18n-text':
      return <I18nInput field={field} value={value as Record<string, string>} onChange={onChange} />;
    case 'i18n-textarea':
      return <I18nInput field={field} value={value as Record<string, string>} onChange={onChange} textarea />;
    case 'i18n-list':
      return <I18nListInput field={field} value={value as Record<string, string[]>} onChange={onChange} />;
    case 'number':
      return <NumberField field={field} value={value} onChange={onChange} />;
    case 'boolean':
      return <BoolField field={field} value={value} onChange={onChange} />;
    case 'select':
      return <SelectField field={field} value={value} onChange={onChange} />;
    case 'slug':
      return <SlugField field={field} value={value} onChange={onChange} />;
    case 'date':
      return <DateField field={field} value={value} onChange={onChange} />;
    case 'ref':
      return <RefField field={field} value={value} onChange={onChange} />;
    default:
      return <TextField field={field} value={value} onChange={onChange} />;
  }
}
