import type { Tables } from '../lib/supabase';

export type EntityKey =
  | 'destinations'
  | 'accommodations'
  | 'tours'
  | 'events'
  | 'real_estate_listings'
  | 'testimonials'
  | 'blog_posts';

export type FieldType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'select'
  | 'slug'
  | 'i18n-text'
  | 'i18n-textarea'
  | 'i18n-list'
  | 'date'
  | 'ref'; // referencia a otra tabla (select con opciones cargadas)

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  help?: string;
  required?: boolean;
  options?: { value: string; label: string }[]; // para 'select'
  refTable?: 'destinations' | 'blog_categories'; // para 'ref'
  group?: string; // agrupa campos en el formulario
  colSpan?: 1 | 2;
}

export interface ImageConfig {
  table: keyof Tables; // p.ej. 'accommodation_images'
  fk: string; // p.ej. 'accommodation_id'
}

export interface EntityConfig {
  key: EntityKey;
  table: EntityKey;
  labelSingular: string;
  labelPlural: string;
  icon: string; // nombre de icono lucide
  /** Campo jsonb i18n que se usa como "título" en listas. */
  titleField: string;
  listColumns: { field: string; label: string; kind?: 'i18n' | 'status' | 'bool' | 'text' | 'money' }[];
  fields: FieldDef[];
  images?: ImageConfig;
  defaults?: Record<string, unknown>;
}
