#!/usr/bin/env node
/**
 * Genera catalog/seed.sql a partir de catalog/catalog.json.
 *
 *   node catalog/build-sql.mjs
 *
 * El SQL resultante es idempotente (UPSERT por slug; las imágenes y features
 * de cada ítem se borran y reinsertan). Apunta al esquema inferido en
 * src/types/supabase.ts (tablas destinations / accommodations / tours + *_images
 * + features + *_features). Si el CRM usa otros nombres de tabla, es un rename
 * mecánico.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(join(here, 'catalog.json'), 'utf8'));

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const j = (o) => `${q(JSON.stringify(o ?? {}))}::jsonb`;
const num = (v) => (v === null || v === undefined || v === '' ? 'null' : Number(v));
const boolv = (v) => (v ? 'true' : 'false');
const orNull = (v) => (v === null || v === undefined || v === '' ? 'null' : q(v));
const destRef = (slug) => (slug ? `(select id from destinations where slug=${q(slug)})` : 'null');

const out = [];
out.push('-- Catálogo Turismo Colombia — generado por catalog/build-sql.mjs');
out.push(`-- Fuente: catalog/catalog.json (${data.meta?.date ?? ''})`);
out.push('-- Idempotente: correr las veces que haga falta.');
out.push('');
out.push('begin;');
out.push('');

/* ---------------------------------------------------------------- features */
out.push('-- features ----------------------------------------------------------');
for (const f of data.features) {
  out.push(
    `insert into features (slug, kind, icon, sort_order, label) values ` +
      `(${q(f.slug)}, ${q(f.kind)}, ${orNull(f.icon)}, ${num(f.sort_order)}, ${j(f.label)}) ` +
      `on conflict (slug) do update set kind=excluded.kind, icon=excluded.icon, sort_order=excluded.sort_order, label=excluded.label;`
  );
}
out.push('');

/* ------------------------------------------------------------ destinations */
out.push('-- destinations ------------------------------------------------------');
for (const d of data.destinations) {
  out.push(
    `insert into destinations (slug, status, featured, sort_order, name, region, country, tagline, description, hero_image_path) values (` +
      `${q(d.slug)}, ${q(d.status)}, ${boolv(d.featured)}, ${num(d.sort_order)}, ${j(d.name)}, ${orNull(d.region)}, ${q(d.country)}, ${j(d.tagline)}, ${j(d.description)}, ${orNull(d.hero_image_path)}) ` +
      `on conflict (slug) do update set status=excluded.status, featured=excluded.featured, sort_order=excluded.sort_order, name=excluded.name, region=excluded.region, country=excluded.country, tagline=excluded.tagline, description=excluded.description, hero_image_path=excluded.hero_image_path;`
  );
  out.push(`delete from destination_images where destination_id=${destRef(d.slug)};`);
  for (const im of d.images ?? []) {
    out.push(
      `insert into destination_images (destination_id, storage_path, is_cover, sort_order, alt) values ` +
        `(${destRef(d.slug)}, ${q(im.storage_path)}, ${boolv(im.is_cover)}, ${num(im.sort_order)}, ${j(im.alt)});`
    );
  }
}
out.push('');

/* ---------------------------------------------------------- accommodations */
out.push('-- accommodations ---------------------------------------------------');
for (const a of data.accommodations) {
  out.push(
    `insert into accommodations (slug, type, status, featured, sort_order, name, summary, description, city, region, country, destination_id, price_from, currency, max_guests, bedrooms, beds, bathrooms, location_note, external_booking_url, external_platform) values (` +
      `${q(a.slug)}, ${q(a.type)}, ${q(a.status)}, ${boolv(a.featured)}, ${num(a.sort_order)}, ${j(a.name)}, ${j(a.summary)}, ${j(a.description)}, ${orNull(a.city)}, ${orNull(a.region)}, ${q(a.country)}, ${destRef(a.destination_slug)}, ${num(a.price_from)}, ${q(a.currency)}, ${num(a.max_guests)}, ${num(a.bedrooms)}, ${num(a.beds)}, ${num(a.bathrooms)}, ${j(a.location_note)}, ${orNull(a.external_booking_url)}, ${orNull(a.external_platform)}) ` +
      `on conflict (slug) do update set type=excluded.type, status=excluded.status, featured=excluded.featured, sort_order=excluded.sort_order, name=excluded.name, summary=excluded.summary, description=excluded.description, city=excluded.city, region=excluded.region, country=excluded.country, destination_id=excluded.destination_id, price_from=excluded.price_from, currency=excluded.currency, max_guests=excluded.max_guests, bedrooms=excluded.bedrooms, beds=excluded.beds, bathrooms=excluded.bathrooms, location_note=excluded.location_note, external_booking_url=excluded.external_booking_url, external_platform=excluded.external_platform;`
  );
  const ref = `(select id from accommodations where slug=${q(a.slug)})`;
  out.push(`delete from accommodation_images where accommodation_id=${ref};`);
  for (const im of a.images ?? []) {
    out.push(
      `insert into accommodation_images (accommodation_id, storage_path, is_cover, sort_order, alt) values ` +
        `(${ref}, ${q(im.storage_path)}, ${boolv(im.is_cover)}, ${num(im.sort_order)}, ${j(im.alt)});`
    );
  }
  out.push(`delete from accommodation_features where accommodation_id=${ref};`);
  if ((a.feature_slugs ?? []).length) {
    const list = a.feature_slugs.map(q).join(', ');
    out.push(
      `insert into accommodation_features (accommodation_id, feature_id) ` +
        `select ${ref}, f.id from features f where f.slug in (${list});`
    );
  }
}
out.push('');

/* ------------------------------------------------------------------- tours */
out.push('-- tours ----------------------------------------------------------');
for (const t of data.tours) {
  out.push(
    `insert into tours (slug, status, featured, sort_order, category, name, summary, description, city, region, destination_id, price_from, currency, duration_label, duration_hours, schedule_label, difficulty, min_pax, max_pax) values (` +
      `${q(t.slug)}, ${q(t.status)}, ${boolv(t.featured)}, ${num(t.sort_order)}, ${orNull(t.category)}, ${j(t.name)}, ${j(t.summary)}, ${j(t.description)}, ${orNull(t.city)}, ${orNull(t.region)}, ${destRef(t.destination_slug)}, ${num(t.price_from)}, ${q(t.currency)}, ${j(t.duration_label)}, ${num(t.duration_hours)}, ${j(t.schedule_label)}, ${orNull(t.difficulty)}, ${num(t.min_pax)}, ${num(t.max_pax)}) ` +
      `on conflict (slug) do update set status=excluded.status, featured=excluded.featured, sort_order=excluded.sort_order, category=excluded.category, name=excluded.name, summary=excluded.summary, description=excluded.description, city=excluded.city, region=excluded.region, destination_id=excluded.destination_id, price_from=excluded.price_from, currency=excluded.currency, duration_label=excluded.duration_label, duration_hours=excluded.duration_hours, schedule_label=excluded.schedule_label, difficulty=excluded.difficulty, min_pax=excluded.min_pax, max_pax=excluded.max_pax;`
  );
  const ref = `(select id from tours where slug=${q(t.slug)})`;
  out.push(`delete from tour_images where tour_id=${ref};`);
  for (const im of t.images ?? []) {
    out.push(
      `insert into tour_images (tour_id, storage_path, is_cover, sort_order, alt) values ` +
        `(${ref}, ${q(im.storage_path)}, ${boolv(im.is_cover)}, ${num(im.sort_order)}, ${j(im.alt)});`
    );
  }
  out.push(`delete from tour_features where tour_id=${ref};`);
  if ((t.feature_slugs ?? []).length) {
    const list = t.feature_slugs.map(q).join(', ');
    out.push(
      `insert into tour_features (tour_id, feature_id) ` +
        `select ${ref}, f.id from features f where f.slug in (${list});`
    );
  }
}
out.push('');
out.push('commit;');
out.push('');

writeFileSync(join(here, 'seed.sql'), out.join('\n'), 'utf8');

const counts = {
  features: data.features.length,
  destinations: data.destinations.length,
  accommodations: data.accommodations.length,
  tours: data.tours.length,
  accommodation_images: data.accommodations.reduce((n, a) => n + (a.images?.length ?? 0), 0),
  tour_images: data.tours.reduce((n, t) => n + (t.images?.length ?? 0), 0),
};
console.log('catalog/seed.sql escrito.');
console.table(counts);
