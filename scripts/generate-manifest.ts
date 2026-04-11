// scripts/generate-manifest.ts
import fs from 'fs';
import path from 'path';

const PUBLIC = path.resolve(process.cwd(), 'public');
const IMGS = path.join(PUBLIC, 'imgs');
const OUTPUT = path.resolve(process.cwd(), 'src/data/image-manifest.json');

const IMAGE_EXTS = /\.(png|jpg|jpeg|webp|gif|svg)$/i;

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

// Build characters manifest
//
// Directory depth supported:
//   creature/                    → key: "creature"            (e.g. bichittos creatures)
//   creature/sub/                → key: "creature/sub"        (e.g. kammara worlds)
//   creature/sub/region/         → key: "creature/sub/region" (e.g. triplec regions)
//
// The third level lets a single kammara world (e.g. triplec) split its
// content into named regions (malloc/mesh/sharp). Each region gets its
// own characters, scenes and subsystems via matching subfolders.
function buildCharacters() {
  const charsDir = path.join(IMGS, 'characters');
  const result: Record<string, { name: string; image: string }[]> = {};

  for (const creature of listDirs(charsDir)) {
    const creatureDir = path.join(charsDir, creature);
    const subDirs = listDirs(creatureDir);
    const directImages = listImages(creatureDir);

    if (directImages.length > 0) {
      result[creature] = directImages.map((f) => ({
        name: cleanName(f),
        image: `/imgs/characters/${creature}/${f}`,
      }));
    }

    // Sub-directories (e.g., kammara worlds)
    for (const sub of subDirs) {
      if (sub.startsWith('_')) continue;
      const subDir = path.join(creatureDir, sub);
      const subImages = listImages(subDir);
      if (subImages.length > 0) {
        result[`${creature}/${sub}`] = subImages.map((f) => ({
          name: cleanName(f),
          image: `/imgs/characters/${creature}/${sub}/${f}`,
        }));
      }

      // Region subdirectories inside the sub (e.g. triplec/malloc).
      for (const region of listDirs(subDir)) {
        if (region.startsWith('_')) continue;
        const regionImages = listImages(path.join(subDir, region));
        if (regionImages.length > 0) {
          result[`${creature}/${sub}/${region}`] = regionImages.map((f) => ({
            name: cleanName(f),
            image: `/imgs/characters/${creature}/${sub}/${region}/${f}`,
          }));
        }
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

// Build scenes manifest
//
// Reads `_scenes/` directories at two levels:
//   creature/sub/_scenes           → key: "creature/sub"
//   creature/sub/region/_scenes    → key: "creature/sub/region"
function buildScenes() {
  const charsDir = path.join(IMGS, 'characters');
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

  for (const creature of listDirs(charsDir)) {
    const creatureDir = path.join(charsDir, creature);
    for (const sub of listDirs(creatureDir)) {
      if (sub.startsWith('_')) continue;
      const subDir = path.join(creatureDir, sub);
      collect(subDir, `${creature}/${sub}`, `/imgs/characters/${creature}/${sub}`);

      for (const region of listDirs(subDir)) {
        if (region.startsWith('_')) continue;
        const regionDir = path.join(subDir, region);
        collect(
          regionDir,
          `${creature}/${sub}/${region}`,
          `/imgs/characters/${creature}/${sub}/${region}`
        );
      }
    }
  }
  return result;
}

// Build kammara world backgrounds — each world has a `_bg/` directory
// with a single image used as the parallax background for that section.
// Worlds that are split into regions (e.g. triplec) can also have a
// `_bg/` inside each region directory.
function buildKammaraBgs() {
  const charsDir = path.join(IMGS, 'characters');
  const result: Record<string, string> = {};

  const collect = (dir: string, key: string, urlPrefix: string) => {
    const bgDir = path.join(dir, '_bg');
    const bgImages = listImages(bgDir);
    if (bgImages.length > 0) {
      result[key] = `${urlPrefix}/_bg/${bgImages[0]}`;
    }
  };

  // Direct kammara/_bg for the main section
  collect(path.join(charsDir, 'kammara'), 'kammara', '/imgs/characters/kammara');

  // kammara/{world}/_bg + kammara/{world}/{region}/_bg
  const kammaraDir = path.join(charsDir, 'kammara');
  for (const world of listDirs(kammaraDir)) {
    if (world.startsWith('_')) continue;
    const worldDir = path.join(kammaraDir, world);
    collect(worldDir, `kammara/${world}`, `/imgs/characters/kammara/${world}`);

    for (const region of listDirs(worldDir)) {
      if (region.startsWith('_')) continue;
      const regionDir = path.join(worldDir, region);
      collect(
        regionDir,
        `kammara/${world}/${region}`,
        `/imgs/characters/kammara/${world}/${region}`
      );
    }
  }
  return result;
}

// Build subsystem images — each kammara world (and optionally each region
// inside a world) has a `_subsystems/` directory with 0.xxx, 1.xxx, 2.xxx
// for the 3 subsystem cards.
function buildSubsystems() {
  const charsDir = path.join(IMGS, 'characters');
  const result: Record<string, (string | null)[]> = {};

  const collect = (dir: string, key: string, urlPrefix: string) => {
    const subDir = path.join(dir, '_subsystems');
    const images = listImages(subDir);
    if (images.length === 0) return;
    // Find files that start with 0., 1., 2. (or 0-, 1-, 2-)
    const slots: (string | null)[] = [0, 1, 2].map((i) => {
      const file = images.find(
        (f) => f.startsWith(`${i}.`) || f.startsWith(`${i}-`)
      );
      return file ? `${urlPrefix}/_subsystems/${file}` : null;
    });
    result[key] = slots;
  };

  const kammaraDir = path.join(charsDir, 'kammara');
  for (const world of listDirs(kammaraDir)) {
    if (world.startsWith('_')) continue;
    const worldDir = path.join(kammaraDir, world);
    collect(worldDir, `kammara/${world}`, `/imgs/characters/kammara/${world}`);

    for (const region of listDirs(worldDir)) {
      if (region.startsWith('_')) continue;
      const regionDir = path.join(worldDir, region);
      collect(
        regionDir,
        `kammara/${world}/${region}`,
        `/imgs/characters/kammara/${world}/${region}`
      );
    }
  }
  return result;
}

const manifest = {
  characters: buildCharacters(),
  books: buildBooks(),
  art: buildArt(),
  scenes: buildScenes(),
  kammaraBgs: buildKammaraBgs(),
  subsystems: buildSubsystems(),
};

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(manifest, null, 2));
console.log(`Manifest generated at ${OUTPUT}`);
console.log(`- Characters: ${Object.keys(manifest.characters).length} groups`);
console.log(`- Books: ${Object.keys(manifest.books).length} sections`);
console.log(`- Art: ${Object.keys(manifest.art).length} sections`);
console.log(`- Scenes: ${Object.keys(manifest.scenes).length} worlds`);
console.log(`- Kammara bgs: ${Object.keys(manifest.kammaraBgs).length} entries`);
console.log(`- Subsystems: ${Object.keys(manifest.subsystems).length} worlds`);
