// scripts/generate-manifest.ts
import fs from 'fs';
import path from 'path';

const PUBLIC = path.resolve(process.cwd(), 'public');
const IMGS = path.join(PUBLIC, 'imgs');
const OUTPUT = path.resolve(process.cwd(), 'src/data/image-manifest.json');

const IMAGE_EXTS = /\.(png|jpg|jpeg|webp|gif|svg)$/i;

// Bichittos creatures live at public/imgs/bichittos/<creature>/…
const BICHITTOS_ROOT = 'bichittos';
const BICHITTOS_CREATURES = [
  'napcat',
  'zeco',
  'taylo',
  'cheiodebolinha',
  'miscelania',
] as const;

// Kammara worlds live at public/imgs/kammara/<world>/…
// (A Kammara hub section lives at public/imgs/kammara/_bg, no world.)
const KAMMARA_ROOT = 'kammara';

// Natural sort: treats numeric prefixes as numbers so "2_x" comes before "10_x".
const naturalSort = (a: string, b: string) =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

function listImages(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => IMAGE_EXTS.test(f))
    .sort(naturalSort);
}

function listDirs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => fs.statSync(path.join(dir, f)).isDirectory())
    .sort(naturalSort);
}

function cleanName(filename: string): string {
  return filename
    .replace(IMAGE_EXTS, '')
    .replace(/^\d+_?/, '')
    .replace(/_/g, ' ')
    .trim();
}

// Build characters manifest.
//
// New folder layout (after the April 2026 reorg):
//   public/imgs/bichittos/<creature>/*.png         → key: "<creature>"
//   public/imgs/kammara/<world>/*.png              → key: "kammara/<world>"
//   public/imgs/kammara/<world>/<region>/*.png     → key: "kammara/<world>/<region>"
//
// The "kammara/" prefix on the key mirrors the old shape so the JSON data
// files (`kammara/<world>_characters.json`, etc.) can keep using the same
// context ids (`kammara/lunnp1`, `kammara/triplec/malloc`, ...).
function buildCharacters() {
  const result: Record<string, { name: string; image: string }[]> = {};

  // Bichittos: flat creatures (no sub-worlds).
  const bichittosDir = path.join(IMGS, BICHITTOS_ROOT);
  for (const creature of BICHITTOS_CREATURES) {
    const creatureDir = path.join(bichittosDir, creature);
    const images = listImages(creatureDir);
    if (images.length > 0) {
      result[creature] = images.map((f) => ({
        name: cleanName(f),
        image: `/imgs/${BICHITTOS_ROOT}/${creature}/${f}`,
      }));
    }
  }

  // Kammara: worlds, plus optional regions inside a world.
  const kammaraDir = path.join(IMGS, KAMMARA_ROOT);
  // Direct kammara/*.png (the hub has no character images today but keep
  // the support for future use).
  const hubImages = listImages(kammaraDir);
  if (hubImages.length > 0) {
    result.kammara = hubImages.map((f) => ({
      name: cleanName(f),
      image: `/imgs/${KAMMARA_ROOT}/${f}`,
    }));
  }

  for (const world of listDirs(kammaraDir)) {
    if (world.startsWith('_')) continue;
    const worldDir = path.join(kammaraDir, world);
    const worldImages = listImages(worldDir);
    if (worldImages.length > 0) {
      result[`kammara/${world}`] = worldImages.map((f) => ({
        name: cleanName(f),
        image: `/imgs/${KAMMARA_ROOT}/${world}/${f}`,
      }));
    }

    for (const region of listDirs(worldDir)) {
      if (region.startsWith('_')) continue;
      const regionImages = listImages(path.join(worldDir, region));
      if (regionImages.length > 0) {
        result[`kammara/${world}/${region}`] = regionImages.map((f) => ({
          name: cleanName(f),
          image: `/imgs/${KAMMARA_ROOT}/${world}/${region}/${f}`,
        }));
      }
    }
  }

  return result;
}

// Build books manifest
function buildBooks() {
  const booksDir = path.join(IMGS, 'books');
  const result: Record<string, { id: string; cover: string | null; pages: string[] }[]> = {};

  for (const section of listDirs(booksDir)) {
    const sectionDir = path.join(booksDir, section);
    result[section] = [];

    for (const book of listDirs(sectionDir)) {
      const bookDir = path.join(sectionDir, book);
      const coverCandidates = listImages(bookDir).filter((f) => f.startsWith('cover'));
      const pagesDir = path.join(bookDir, 'pages');
      const pages = listImages(pagesDir).map((f) => `/imgs/books/${section}/${book}/pages/${f}`);

      result[section].push({
        id: book,
        cover: coverCandidates[0] ? `/imgs/books/${section}/${book}/${coverCandidates[0]}` : null,
        pages,
      });
    }
  }
  return result;
}

// Build art manifest
function buildArt() {
  const artDir = path.join(IMGS, 'art');
  const result: Record<string, { thumbs: string[]; full: string[] }> = {};

  for (const section of listDirs(artDir)) {
    const sectionDir = path.join(artDir, section);
    const thumbDir = path.join(sectionDir, '_thumb');
    const thumbs = listImages(thumbDir).map((f) => `/imgs/art/${section}/_thumb/${f}`);
    const full = listImages(sectionDir).map((f) => `/imgs/art/${section}/${f}`);
    result[section] = { thumbs, full };
  }
  return result;
}

// Build scenes manifest — looks for `_scenes/` inside each kammara world
// and region. Manifest keys keep the `kammara/<world>[/<region>]` shape.
function buildScenes() {
  const result: Record<string, { name: string; image: string }[]> = {};

  const collect = (dir: string, key: string, urlPrefix: string) => {
    const scenesDir = path.join(dir, '_scenes');
    if (!fs.existsSync(scenesDir)) return;
    const images = listImages(scenesDir);
    if (images.length === 0) return;
    result[key] = images.map((f) => ({
      name: cleanName(f),
      image: `${urlPrefix}/_scenes/${f}`,
    }));
  };

  const kammaraDir = path.join(IMGS, KAMMARA_ROOT);
  for (const world of listDirs(kammaraDir)) {
    if (world.startsWith('_')) continue;
    const worldDir = path.join(kammaraDir, world);
    collect(worldDir, `kammara/${world}`, `/imgs/${KAMMARA_ROOT}/${world}`);

    for (const region of listDirs(worldDir)) {
      if (region.startsWith('_')) continue;
      const regionDir = path.join(worldDir, region);
      collect(
        regionDir,
        `kammara/${world}/${region}`,
        `/imgs/${KAMMARA_ROOT}/${world}/${region}`,
      );
    }
  }
  return result;
}

// Build kammara world backgrounds — each world has a `_bg/` directory
// with a single image used as the parallax background for that section.
// Worlds that are split into regions (e.g. triplec) can also have a
// `_bg/` inside each region directory. The kammara hub reads from
// public/imgs/kammara/_bg/ (not tied to any world).
function buildKammaraBgs() {
  const result: Record<string, string> = {};

  const collect = (dir: string, key: string, urlPrefix: string) => {
    const bgDir = path.join(dir, '_bg');
    const bgImages = listImages(bgDir);
    if (bgImages.length > 0) {
      result[key] = `${urlPrefix}/_bg/${bgImages[0]}`;
    }
  };

  const kammaraDir = path.join(IMGS, KAMMARA_ROOT);
  // Hub bg lives at public/imgs/kammara/_bg/
  collect(kammaraDir, 'kammara', `/imgs/${KAMMARA_ROOT}`);

  for (const world of listDirs(kammaraDir)) {
    if (world.startsWith('_')) continue;
    const worldDir = path.join(kammaraDir, world);
    collect(worldDir, `kammara/${world}`, `/imgs/${KAMMARA_ROOT}/${world}`);

    for (const region of listDirs(worldDir)) {
      if (region.startsWith('_')) continue;
      const regionDir = path.join(worldDir, region);
      collect(
        regionDir,
        `kammara/${world}/${region}`,
        `/imgs/${KAMMARA_ROOT}/${world}/${region}`,
      );
    }
  }
  return result;
}

// (Subsystem images are no longer tracked here — they live as `img`
//  inside each `_subsystems.json` file under
//  `src/data/characters/kammara/`. The manifest used to mirror the
//  on-disk numeric slots, but that indirection forced contributors to
//  guess slot indices when adding new images. The JSON itself is now
//  the single source of truth.)

const manifest = {
  characters: buildCharacters(),
  books: buildBooks(),
  art: buildArt(),
  scenes: buildScenes(),
  kammaraBgs: buildKammaraBgs(),
};

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(manifest, null, 2));
console.log(`Manifest generated at ${OUTPUT}`);
console.log(`- Characters: ${Object.keys(manifest.characters).length} groups`);
console.log(`- Books: ${Object.keys(manifest.books).length} sections`);
console.log(`- Art: ${Object.keys(manifest.art).length} sections`);
console.log(`- Scenes: ${Object.keys(manifest.scenes).length} worlds`);
console.log(`- Kammara bgs: ${Object.keys(manifest.kammaraBgs).length} entries`);
