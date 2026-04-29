// scripts/resize-art-fulls.ts
//
// Resizes images in place so they're web-friendly. Currently handles:
//   - public/imgs/art/<section>/*           → longest side 500px
//   - public/imgs/kammara/**/_scenes/*       → longest side 1200px
//   - public/imgs/kammara/**/_subsystems/*   → longest side 2000px (quality 85)
//   - public/imgs/{kammara,bichittos}/**/_bg/* → longest side 1920px
//
// Re-encodes as JPEG and normalizes the extension to .jpg. Default quality
// is 82, but per-target overrides apply (subsystems use 85 because they're
// shown near-full-width and benefit from the extra fidelity). Whenever a
// file gets renamed (e.g. `foo.png` → `foo.jpg`), this script also rewrites
// any references to the old URL inside src/data/**/*.json so the data layer
// stays in sync with what's on disk.
// Uses macOS `sips`. Run with: npm run resize-art-fulls

import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = process.cwd();
const PUBLIC_ROOT = path.join(PROJECT_ROOT, 'public');
const PUBLIC = path.join(PUBLIC_ROOT, 'imgs');
const DATA_ROOT = path.join(PROJECT_ROOT, 'src/data');
const DEFAULT_QUALITY = 82;
const IMAGE_EXTS = /\.(png|jpg|jpeg|webp|heic)$/i;

// Map of old public URL → new public URL, for every file we renamed.
// Used at the end to rewrite references in src/data/**/*.json.
const renames = new Map<string, string>();

function publicUrl(absPath: string): string {
  return '/' + path.relative(PUBLIC_ROOT, absPath).split(path.sep).join('/');
}

interface Target {
  label: string;
  dir: string;
  maxSide: number;
  quality?: number;
}

// Walks a tree and collects every directory whose basename matches `name`.
function findDirsNamed(root: string, name: string): string[] {
  if (!fs.existsSync(root)) return [];
  const out: string[] = [];
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop()!;
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (!fs.statSync(full).isDirectory()) continue;
      if (entry === name) out.push(full);
      stack.push(full);
    }
  }
  return out;
}

function listArtSections(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .map((f) => path.join(dir, f))
    .filter((p) => fs.statSync(p).isDirectory() && !path.basename(p).startsWith('_'));
}

const targets: Target[] = [
  // Art sections — small thumbs of the static art page.
  ...listArtSections(path.join(PUBLIC, 'art')).map((dir) => ({
    label: `art/${path.basename(dir)}`,
    dir,
    maxSide: 500,
  })),
  // Kammara scenes — larger because they're shown big in the scene strip.
  ...findDirsNamed(path.join(PUBLIC, 'kammara'), '_scenes').map((dir) => ({
    label: path.relative(PUBLIC, dir),
    dir,
    maxSide: 1200,
  })),
  // Subsystem panels — shown near-full-width, higher quality on purpose.
  ...findDirsNamed(path.join(PUBLIC, 'kammara'), '_subsystems').map((dir) => ({
    label: path.relative(PUBLIC, dir),
    dir,
    maxSide: 2000,
    quality: 85,
  })),
  // Section backgrounds — full-bleed parallax, sized for high-DPI monitors.
  ...findDirsNamed(path.join(PUBLIC, 'kammara'), '_bg').map((dir) => ({
    label: path.relative(PUBLIC, dir),
    dir,
    maxSide: 1920,
  })),
  ...findDirsNamed(path.join(PUBLIC, 'bichittos'), '_bg').map((dir) => ({
    label: path.relative(PUBLIC, dir),
    dir,
    maxSide: 1920,
  })),
];

let total = 0;
let totalBytesBefore = 0;
let totalBytesAfter = 0;

for (const target of targets) {
  const files = fs.readdirSync(target.dir)
    .filter((f) => IMAGE_EXTS.test(f) && fs.statSync(path.join(target.dir, f)).isFile());

  for (const f of files) {
    const full = path.join(target.dir, f);
    totalBytesBefore += fs.statSync(full).size;

    execFileSync('sips', [
      '-Z', String(target.maxSide),
      '-s', 'format', 'jpeg',
      '-s', 'formatOptions', String(target.quality ?? DEFAULT_QUALITY),
      full,
    ], { stdio: 'pipe' });

    // Normalize extension to .jpg so the folder doesn't end up with
    // `name.png` and `name.jpeg` side by side (both already JPEG by
    // content). When .jpg already exists, prefer it and drop the dup.
    const ext = path.extname(f).toLowerCase();
    if (ext !== '.jpg') {
      const base = f.slice(0, -ext.length);
      const jpgPath = path.join(target.dir, `${base}.jpg`);
      if (fs.existsSync(jpgPath)) {
        fs.unlinkSync(full);
      } else {
        fs.renameSync(full, jpgPath);
      }
      renames.set(publicUrl(full), publicUrl(jpgPath));
    }

    const finalPath = path.join(target.dir, `${path.basename(f, path.extname(f))}.jpg`);
    totalBytesAfter += fs.existsSync(finalPath) ? fs.statSync(finalPath).size : 0;
    total += 1;
    process.stdout.write('.');
  }
  process.stdout.write(` ${target.label} (${files.length})\n`);
}

const fmt = (b: number) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`);
console.log(`\nResized ${total} files. ${fmt(totalBytesBefore)} → ${fmt(totalBytesAfter)}`);

// Rewrite references in src/data/**/*.json so paths point at files that
// actually exist on disk. Catches two cases:
//   1) renames from this run (e.g. just converted foo.png → foo.jpg)
//   2) stale refs from previous runs where the JSON wasn't updated
//      (orphan .png ref pointing at a file that no longer exists, but
//      whose .jpg sibling does)
function walkJson(dir: string, out: string[]) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walkJson(full, out);
    else if (name.endsWith('.json')) out.push(full);
  }
}

function publicPathExists(relUrl: string): boolean {
  if (!relUrl.startsWith('/')) return false;
  return fs.existsSync(path.join(PUBLIC_ROOT, relUrl));
}

const jsonFiles: string[] = [];
walkJson(DATA_ROOT, jsonFiles);

let totalRewrites = 0;
const touched: string[] = [];

for (const file of jsonFiles) {
  const original = fs.readFileSync(file, 'utf8');
  let updated = original;
  let count = 0;

  // (1) Apply this-run renames first so `oldUrl` in the file becomes
  // `newUrl` even if the old file is already gone.
  for (const [oldUrl, newUrl] of renames) {
    const needle = `"${oldUrl}"`;
    const replacement = `"${newUrl}"`;
    const occurrences = updated.split(needle).length - 1;
    if (occurrences > 0) {
      updated = updated.split(needle).join(replacement);
      count += occurrences;
    }
  }

  // (2) Reconcile any leftover non-jpg refs whose target is missing
  // but whose .jpg sibling exists. Plain string replace per-match using
  // split/join so filename chars (spaces, parens) match as literals.
  const matches = updated.match(/"\/imgs\/[^"]+?\.(?:png|jpeg|webp|heic)"/gi) ?? [];
  const seen = new Set<string>();
  for (const quoted of matches) {
    if (seen.has(quoted)) continue;
    seen.add(quoted);
    const urlPath = quoted.slice(1, -1);
    if (publicPathExists(urlPath)) continue;
    const jpgPath = urlPath.replace(/\.(png|jpeg|webp|heic)$/i, '.jpg');
    if (jpgPath === urlPath) continue;
    if (!publicPathExists(jpgPath)) continue;
    const replacement = `"${jpgPath}"`;
    const occurrences = updated.split(quoted).length - 1;
    updated = updated.split(quoted).join(replacement);
    count += occurrences;
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
}
