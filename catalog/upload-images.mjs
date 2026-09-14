#!/usr/bin/env node
/**
 * Sube a Supabase Storage las imágenes del catálogo, desde public/<source>
 * hacia <bucket>/<storage_path> (las rutas están en catalog/catalog.json).
 *
 *   CATALOG_SUPABASE_URL=https://xxx.supabase.co \
 *   CATALOG_SUPABASE_SERVICE_KEY=eyJ... \
 *   CATALOG_BUCKET=catalog \
 *   node catalog/upload-images.mjs
 *
 * Correr cuando exista el bucket de Storage del CRM (o el del sitio en dev).
 * Idempotente: usa upsert. No borra nada.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const data = JSON.parse(readFileSync(join(here, 'catalog.json'), 'utf8'));

const URL = process.env.CATALOG_SUPABASE_URL;
const KEY = process.env.CATALOG_SUPABASE_SERVICE_KEY;
const BUCKET = process.env.CATALOG_BUCKET || 'catalog';
if (!URL || !KEY) {
  console.error('Faltan CATALOG_SUPABASE_URL / CATALOG_SUPABASE_SERVICE_KEY.');
  process.exit(1);
}

const sb = createClient(URL, KEY, { auth: { persistSession: false } });

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

const items = [...data.destinations, ...data.accommodations, ...data.tours];
let ok = 0;
let fail = 0;

for (const it of items) {
  for (const im of it.images ?? []) {
    const localPath = join(root, 'public', im.source);
    let buf;
    try {
      buf = readFileSync(localPath);
    } catch {
      console.warn(`SKIP (no existe): ${im.source}`);
      fail++;
      continue;
    }
    const { error } = await sb.storage.from(BUCKET).upload(im.storage_path, buf, {
      contentType: MIME[extname(im.storage_path).toLowerCase()] ?? 'application/octet-stream',
      upsert: true,
    });
    if (error) {
      console.error(`ERROR ${im.storage_path}: ${error.message}`);
      fail++;
    } else {
      ok++;
      if (ok % 20 === 0) console.log(`  ${ok} subidas…`);
    }
  }
}

console.log(`Listo. ${ok} subidas, ${fail} con problema.`);
