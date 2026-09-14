import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { LOCALES, LOCALE_LABEL, type Locale } from '../lib/i18n';
import type { FieldDef } from './types';

type Val = unknown;
type OnChange = (name: string, value: Val) => void;

const inputCls =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

function Label({ field }: { field: FieldDef }) {
  return (
    <label className="mb-1 block text-sm font-medium text-gray-700">
      {field.label}
      {field.required && <span className="text-red-500"> *</span>}
    </label>
  );
}

/* ---------- i18n ---------- */

function LocaleTabs({ active, onChange }: { active: Locale; onChange: (l: Locale) => void }) {
  return (
    <div className="mb-1.5 flex gap-1">
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
            active === l ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {LOCALE_LABEL[l]}
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
  const [loc, setLoc] = useState<Locale>('es');
  const map = (value ?? {}) as Record<string, string>;
  const set = (v: string) => onChange(field.name, { ...map, [loc]: v });

  return (
    <div>
      <Label field={field} />
      <LocaleTabs active={loc} onChange={setLoc} />
      {textarea ? (
        <textarea rows={4} className={inputCls} value={map[loc] ?? ''} onChange={(e) => set(e.target.value)} />
      ) : (
        <input className={inputCls} value={map[loc] ?? ''} onChange={(e) => set(e.target.value)} />
      )}
      {field.help && <p className="mt-1 text-xs text-gray-500">{field.help}</p>}
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
  const [loc, setLoc] = useState<Locale>('es');
  const map = (value ?? {}) as Record<string, string[]>;
  const text = (map[loc] ?? []).join('\n');
  const set = (v: string) =>
    onChange(field.name, { ...map, [loc]: v.split('\n').map((s) => s.trim()).filter(Boolean) });

  return (
    <div>
      <Label field={field} />
      <LocaleTabs active={loc} onChange={setLoc} />
      <textarea rows={4} className={inputCls} value={text} onChange={(e) => set(e.target.value)} />
    </div>
  );
}

/* ---------- escalares ---------- */

export function TextField({ field, value, onChange }: { field: FieldDef; value: Val; onChange: OnChange }) {
  return (
    <div>
      <Label field={field} />
      <input
        className={inputCls}
        value={(value as string) ?? ''}
        onChange={(e) => onChange(field.name, e.target.value === '' ? null : e.target.value)}
      />
      {field.help && <p className="mt-1 text-xs text-gray-500">{field.help}</p>}
    </div>
  );
}

export function NumberField({ field, value, onChange }: { field: FieldDef; value: Val; onChange: OnChange }) {
  return (
    <div>
      <Label field={field} />
      <input
        type="number"
        className={inputCls}
        value={value === null || value === undefined ? '' : (value as number)}
        onChange={(e) => onChange(field.name, e.target.value === '' ? null : Number(e.target.value))}
      />
    </div>
  );
}

export function BoolField({ field, value, onChange }: { field: FieldDef; value: Val; onChange: OnChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 pt-6">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-gray-300"
        checked={Boolean(value)}
        onChange={(e) => onChange(field.name, e.target.checked)}
      />
      <span className="text-sm font-medium text-gray-700">{field.label}</span>
    </label>
  );
}

export function SelectField({ field, value, onChange }: { field: FieldDef; value: Val; onChange: OnChange }) {
  return (
    <div>
      <Label field={field} />
      <select
        className={inputCls}
        value={(value as string) ?? ''}
        onChange={(e) => onChange(field.name, e.target.value === '' ? null : e.target.value)}
      >
        {(field.options ?? []).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SlugField({ field, value, onChange }: { field: FieldDef; value: Val; onChange: OnChange }) {
  return (
    <div>
      <Label field={field} />
      <input
        className={`${inputCls} font-mono`}
        value={(value as string) ?? ''}
        onChange={(e) =>
          onChange(
            field.name,
            e.target.value
              .toLowerCase()
              .normalize('NFD')
              .replace(/[̀-ͯ]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '')
          )
        }
      />
      <p className="mt-1 text-xs text-gray-500">Identificador en la URL. Solo minúsculas, números y guiones.</p>
    </div>
  );
}

export function DateField({ field, value, onChange }: { field: FieldDef; value: Val; onChange: OnChange }) {
  const v = value ? String(value).slice(0, 10) : '';
  return (
    <div>
      <Label field={field} />
      <input
        type="date"
        className={inputCls}
        value={v}
        onChange={(e) => onChange(field.name, e.target.value === '' ? null : e.target.value)}
      />
    </div>
  );
}

export function RefField({ field, value, onChange }: { field: FieldDef; value: Val; onChange: OnChange }) {
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
          })
        );
      });
  }, [field.refTable]);

  return (
    <div>
      <Label field={field} />
      <select
        className={inputCls}
        value={(value as string) ?? ''}
        onChange={(e) => onChange(field.name, e.target.value === '' ? null : e.target.value)}
      >
        <option value="">—</option>
        {opts.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
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
