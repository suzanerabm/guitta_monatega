// scripts/generate-thumbs.ts
//
// Regenerates thumbnails for every art section under public/imgs/art/<section>/.
// For each full-size image directly inside the section folder, writes a
// 200×200 JPEG thumbnail (cover-cropped) into <section>/_thumb/ using the
// same filename (extension swapped to .jpg). Old thumbnails that don't
// correspond to any full are removed so the folder stays in sync.
//
// Uses macOS `sips` so no extra deps are needed. Run with: npm run generate-thumbs

import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ART_ROOT = path.resolve(process.cwd(), 'public/imgs/art');
const THUMB_SIZE = 300;
const QUALITY = 75;
const IMAGE_EXTS = /\.(png|jpg|jpeg|webp|heic)$/i;

function listSections(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => {
    const full = path.join(dir, f);
    return fs.statSync(full).isDirectory() && !f.startsWith('_');
  });
}

function listFulls(sectionDir: string): string[] {
  return fs
    .readdirSync(sectionDir)
    .filter((f) => IMAGE_EXTS.test(f) && fs.statSync(path.join(sectionDir, f)).isFile());
}

// sips can't write to a different filename in one call, so we copy the
// source into the thumb folder, then resize/crop/recompress in place.
function makeThumb(srcFull: string, destThumb: string) {
  fs.copyFileSync(srcFull, destThumb);
  // -Z fits inside a square (preserves aspect, no crop) → simpler and good
  // enough for square-ish art thumbs. Switch to -z H W for cover-crop.
  execFileSync('sips', [
    '-Z', String(THUMB_SIZE),
    '-s', 'format', 'jpeg',
    '-s', 'formatOptions', String(QUALITY),
    destThumb,
  ], { stdio: 'pipe' });
}

let totalGenerated = 0;
let totalRemoved = 0;

for (const section of listSections(ART_ROOT)) {
  const sectionDir = path.join(ART_ROOT, section);
  const thumbDir = path.join(sectionDir, '_thumb');
  // Wipe the thumb folder before regenerating so renamed/removed fulls
  // don't leave duplicates behind.
  if (fs.existsSync(thumbDir)) fs.rmSync(thumbDir, { recursive: true, force: true });
  fs.mkdirSync(thumbDir, { recursive: true });

  const fulls = listFulls(sectionDir);
  const expectedThumbs = new Set<string>();

  for (const full of fulls) {
    const base = full.replace(IMAGE_EXTS, '');
    const thumbName = `${base}.jpg`;
    const thumbPath = path.join(thumbDir, thumbName);
    expectedThumbs.add(thumbName);
    makeThumb(path.join(sectionDir, full), thumbPath);
    totalGenerated += 1;
    process.stdout.write('.');
  }

  // Drop stale thumbs that no longer match any full.
  for (const existing of fs.readdirSync(thumbDir)) {
    if (!IMAGE_EXTS.test(existing)) continue;
    if (!expectedThumbs.has(existing)) {
      fs.unlinkSync(path.join(thumbDir, existing));
      totalRemoved += 1;
    }
  }

  process.stdout.write(` ${section} (${fulls.length})\n`);
}

console.log(`\nGenerated ${totalGenerated} thumbs, removed ${totalRemoved} stale files.`);
