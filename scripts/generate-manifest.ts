// scripts/generate-manifest.ts
import fs from 'fs';
import path from 'path';

const PUBLIC = path.resolve(process.cwd(), 'public');
const IMGS = path.join(PUBLIC, 'imgs');
const OUTPUT = path.resolve(process.cwd(), 'src/data/image-manifest.json');

const IMAGE_EXTS = /\.(png|jpg|jpeg|webp|gif|svg)$/i;

function listImages(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => IMAGE_EXTS.test(f))
    .sort();
}

function listDirs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => fs.statSync(path.join(dir, f)).isDirectory())
    .sort();
}

function cleanName(filename: string): string {
  return filename
    .replace(IMAGE_EXTS, '')
    .replace(/^\d+[-_]?/, '')
    .replace(/[_-]/g, ' ')
    .trim();
}

// Build characters manifest
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
      const subImages = listImages(path.join(creatureDir, sub));
      if (subImages.length > 0) {
        result[`${creature}/${sub}`] = subImages.map((f) => ({
          name: cleanName(f),
          image: `/imgs/characters/${creature}/${sub}/${f}`,
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

// Build scenes manifest
function buildScenes() {
  const charsDir = path.join(IMGS, 'characters');
  const result: Record<string, { name: string; image: string }[]> = {};

  for (const creature of listDirs(charsDir)) {
    const creatureDir = path.join(charsDir, creature);
    for (const sub of listDirs(creatureDir)) {
      const scenesDir = path.join(creatureDir, sub, '_scenes');
      if (!fs.existsSync(scenesDir)) continue;
      const images = listImages(scenesDir);
      if (images.length > 0) {
        result[`${creature}/${sub}`] = images.map((f) => ({
          name: cleanName(f),
          image: `/imgs/characters/${creature}/${sub}/_scenes/${f}`,
        }));
      }
    }
  }
  return result;
}

// Build kammara world backgrounds — each world has a `_bg/` directory
// with a single image used as the parallax background for that section.
function buildKammaraBgs() {
  const charsDir = path.join(IMGS, 'characters');
  const result: Record<string, string> = {};

  // Direct kammara/_bg for the main section
  const mainBgDir = path.join(charsDir, 'kammara', '_bg');
  const mainBgImages = listImages(mainBgDir);
  if (mainBgImages.length > 0) {
    result['kammara'] = `/imgs/characters/kammara/_bg/${mainBgImages[0]}`;
  }

  // kammara/{world}/_bg for each world
  const kammaraDir = path.join(charsDir, 'kammara');
  for (const world of listDirs(kammaraDir)) {
    if (world.startsWith('_')) continue;
    const bgDir = path.join(kammaraDir, world, '_bg');
    const bgImages = listImages(bgDir);
    if (bgImages.length > 0) {
      result[`kammara/${world}`] = `/imgs/characters/kammara/${world}/_bg/${bgImages[0]}`;
    }
  }
  return result;
}

// Build subsystem images — each kammara world has a `_subsystems/` directory
// with 0.xxx, 1.xxx, 2.xxx for the 3 subsystem cards.
function buildSubsystems() {
  const charsDir = path.join(IMGS, 'characters');
  const result: Record<string, (string | null)[]> = {};

  const kammaraDir = path.join(charsDir, 'kammara');
  for (const world of listDirs(kammaraDir)) {
    if (world.startsWith('_')) continue;
    const subDir = path.join(kammaraDir, world, '_subsystems');
    const images = listImages(subDir);
    if (images.length === 0) continue;
    // Find files that start with 0., 1., 2. (or 0-, 1-, 2-)
    const slots: (string | null)[] = [0, 1, 2].map((i) => {
      const file = images.find(
        (f) => f.startsWith(`${i}.`) || f.startsWith(`${i}-`)
      );
      return file ? `/imgs/characters/kammara/${world}/_subsystems/${file}` : null;
    });
    result[`kammara/${world}`] = slots;
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
