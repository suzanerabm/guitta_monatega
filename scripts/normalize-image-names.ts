// scripts/normalize-image-names.ts
//
// Walks public/imgs and renames image files whose names contain
// characters that are unfriendly for URLs / hosting:
//   - non-ASCII letters (acentos: á, ã, é, ç, etc) → ASCII equivalent
//   - typographic apostrophes / quotes (’ ‘ “ ”) → dropped
//   - whitespace (incl. leading) → "-"
//   - parens / brackets → removed
//
// Case is PRESERVED — APFS on macOS is case-insensitive by default, so
// lowercasing files would create "renames" the FS doesn't actually
// perform but git sees as massive deletes/adds. Underscores are also
// preserved: they're URL-safe and very common in our existing names,
// only spaces aren't.
//
// Then rewrites references in src/data/**/*.json so any path that
// used to point at the old name follows the file to its new home.
//
// Run with: npm run normalize-image-names

import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = process.cwd();
const PUBLIC_ROOT = path.join(PROJECT_ROOT, 'public');
const IMGS_ROOT = path.join(PUBLIC_ROOT, 'imgs');
const DATA_ROOT = path.join(PROJECT_ROOT, 'src/data');
const IMAGE_EXTS = /\.(png|jpg|jpeg|webp|heic|gif|svg|avif)$/i;
const IGNORED_DIRS = new Set(['_bkp']);

// Map from old public URL → new public URL.
const renames = new Map<string, string>();

function publicUrl(absPath: string): string {
  return '/' + path.relative(PUBLIC_ROOT, absPath).split(path.sep).join('/');
}

function normalizeBaseName(name: string): string {
  const ext = path.extname(name);
  const base = name.slice(0, -ext.length);

  const cleaned = base
    // Decompose unicode (á → a + combining acute) and strip combining marks.
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    // Typographic punctuation → drop (curly apostrophes, smart quotes).
    .replace(/[‘’ʼ“”]/g, '')
    // Parens / brackets → drop.
    .replace(/[()[\]{}]/g, '')
    // Whitespace runs (incl. leading/trailing) → single dash.
    .replace(/\s+/g, '-')
    // Strip any leftover non-URL-safe chars. Keep A-Z and a-z (preserve
    // case), digits, and _ . -
    .replace(/[^A-Za-z0-9._-]/g, '')
    // When a dash ends up adjacent to an underscore (e.g. "13zona_ FOO"
    // → "13zona_-FOO"), collapse the pair to a single dash so we don't
    // leave ugly `_-` / `-_` runs.
    .replace(/[-_]*-[-_]*/g, '-')
    // Collapse multiple dashes and trim leading/trailing.
    .replace(/-+/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '');

  return `${cleaned}${ext}`;
}

function walkImages(dir: string, out: string[]) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (IGNORED_DIRS.has(entry)) continue;
      walkImages(full, out);
      continue;
    }
    if (IMAGE_EXTS.test(entry)) out.push(full);
  }
}

function uniquePath(targetDir: string, desired: string): string {
  // If the desired filename already exists in the dir, append a numeric
  // suffix so we don't overwrite anything. Should be rare.
  let candidate = path.join(targetDir, desired);
  if (!fs.existsSync(candidate)) return candidate;
  const ext = path.extname(desired);
  const stem = desired.slice(0, -ext.length);
  let i = 1;
  while (fs.existsSync(candidate)) {
    candidate = path.join(targetDir, `${stem}-${i}${ext}`);
    i += 1;
  }
  return candidate;
}

const allImages: string[] = [];
walkImages(IMGS_ROOT, allImages);

let renamedCount = 0;

for (const oldFull of allImages) {
  const dir = path.dirname(oldFull);
  const oldName = path.basename(oldFull);
  const newName = normalizeBaseName(oldName);
  if (newName === oldName) continue;

  const newFull = uniquePath(dir, newName);
  fs.renameSync(oldFull, newFull);
  renames.set(publicUrl(oldFull), publicUrl(newFull));
  renamedCount += 1;
  console.log(`  ${publicUrl(oldFull)} → ${publicUrl(newFull)}`);
}

console.log(`\nRenamed ${renamedCount} files.\n`);

// Rewrite references in src/data/**/*.json so any path that used to
// point at a renamed file follows it.
function walkJson(dir: string, out: string[]) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walkJson(full, out);
    else if (name.endsWith('.json')) out.push(full);
  }
}

if (renames.size > 0) {
  const jsonFiles: string[] = [];
  walkJson(DATA_ROOT, jsonFiles);

  let totalRewrites = 0;
  const touched: string[] = [];

  for (const file of jsonFiles) {
    const original = fs.readFileSync(file, 'utf8');
    let updated = original;
    let count = 0;

    for (const [oldUrl, newUrl] of renames) {
      // Plain string replace. URLs in our data files are quoted as-is,
      // so wrapping in `"..."` makes the match unambiguous and the chars
      // inside (spaces, parens, accents) are matched literally.
      const needle = `"${oldUrl}"`;
      const replacement = `"${newUrl}"`;
      const occurrences = updated.split(needle).length - 1;
      if (occurrences > 0) {
        updated = updated.split(needle).join(replacement);
        count += occurrences;
      }
    }

    if (count > 0) {
      fs.writeFileSync(file, updated);
      totalRewrites += count;
      touched.push(path.relative(PROJECT_ROOT, file));
    }
  }

  if (touched.length > 0) {
    console.log(`Rewrote ${totalRewrites} ref(s) in ${touched.length} JSON file(s):`);
    for (const f of touched) console.log(`  ${f}`);
  } else {
    console.log('No JSON references needed updating.');
  }
}
