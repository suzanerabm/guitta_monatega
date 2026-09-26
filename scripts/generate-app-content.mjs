/** Build the public app snapshot from the website's authoring JSONs. Node only; no extra dependency. */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, realpathSync } from 'node:fs';
import { resolve, dirname, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { stabilizeContentIds } from './stabilize-app-ids.mjs';
import { semanticAppId } from './app-id.mjs';

const worlds = ['lunnp1', 'eni4', 'triplec', 'orfv', 'z1', 'gotto', 'digg', 'memphis'];
const regions = ['triplec-malloc', 'triplec-mesh', 'triplec-sharp'];
const base = 'https://guittamonatega.com';
// Mídia de conteúdo vive no bucket (ver `src/lib/media.ts`): com a env definida,
// `/imgs/kammara/a.png` → `<base>/kammara/a.png`. Sem ela, cai no próprio site.
const mediaBase = () => (process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? '').trim().replace(/\/+$/, '');
const hash = value => createHash('sha256').update(value).digest('hex');
// Kept as a public alias for fixtures and downstream scripts.
export const stableId = semanticAppId;
const localized = (value, fallback = '') => value && !Array.isArray(value) && typeof value === 'object'
  ? { pt: value.pt ?? fallback, en: value.en ?? fallback } : { pt: value ?? fallback, en: value ?? fallback };
const paragraphs = value => Object.fromEntries(Object.entries(localized(value, [])).map(([lang, text]) =>
  [lang, Array.isArray(text) ? text : text ? [text] : []]));
const normalize = text => String(text).normalize('NFD').replace(/\p{M}+/gu, '').toLowerCase().replaceAll('’', "'").trim().replace(/\s+/g, ' ');
// `visible` controls the website. `appVisible` controls the app and, when
// omitted, inherits the legacy website rule so existing content keeps the
// same behavior. An explicit appVisible value always wins, which allows
// site-only and app-only entries.
const appVisible = item => item.appVisible ?? (
  item.visible !== false && item.enabled !== false && item.hidden !== true
);
const appComingSoon = item => item.appComingSoon ?? false;
const encodePath = path => path.split('/').map(part => encodeURIComponent(part).replace(/[!'()*]/g, char => '%' + char.charCodeAt(0).toString(16).toUpperCase())).join('/');
const remote = path => {
  if (!path?.startsWith('/')) return path || '';
  if (mediaBase() && path.startsWith('/imgs/')) return mediaBase() + encodePath(path.slice('/imgs'.length));
  return base + encodePath(path);
};

export function buildContent(siteRoot, appDataRoot = resolve(siteRoot, 'src/data/kammara-app')) {
  const read = path => JSON.parse(readFileSync(resolve(siteRoot, path), 'utf8'));
  const appData = name => JSON.parse(readFileSync(resolve(appDataRoot, name), 'utf8'));
  const publicRoot = resolve(siteRoot, 'public');
  // As mídias saíram de `public/imgs` e foram pro bucket: "existe" = está no
  // disco OU no inventário do bucket (`npm run media-inventory`).
  const inventoryFile = resolve(siteRoot, 'src/data/media-inventory.json');
  const inventory = new Set(existsSync(inventoryFile) ? JSON.parse(readFileSync(inventoryFile, 'utf8')) : []);
  const art = path => {
    if (!path) return '';
    if (!path.startsWith('/imgs/kammara/') && !path.startsWith('/imgs/books/kammara/')) throw Error(`Out-of-scope image: ${path}`);
    const full = resolve(publicRoot, path.slice(1));
    if (!full.startsWith(publicRoot + sep)) throw Error('Invalid image path');
    return existsSync(full) || inventory.has(path) ? remote(path) : '';
  };
  const media = (image, title, video = '', fit = false) => ({ image: art(image), title: localized(title), video: remote(video), fit });
  const entries = [], worldEntries = {}, worldDropIds = {}, mosaicIds = [];
  const entry = (world, kind, key, title, summary, body, image = '', extra = {}) => {
    const semanticLabel = title?.pt || title?.en || title || key;
    const item = { id: extra.source?.appId || stableId(world, kind, semanticLabel), worldId: world, kind,
      title: localized(title), summary: localized(summary), body: paragraphs(body), image: art(image),
      attributes: [], media: [], sections: [], ...extra };
    entries.push(item);
    return item;
  };
  const manifest = read('src/data/image-manifest.json');
  const progress = read('src/data/kammara_progress.json');
  const stages = progress.categories.map(stage => stage.id);
  const statuses = new Map(progress.planets.map(planet => [planet.id, planet]));
  const published = worlds.filter(world => {
    const planet = statuses.get(world);
    if (!planet) return false;
    // An explicit app flag owns app publication, independently from the
    // website readiness percentage. Without it, preserve the legacy rule.
    if (typeof planet.appVisible === 'boolean') return planet.appVisible;
    return appVisible(planet) && Math.round(stages.reduce((sum, stage) => sum + (planet.progress[stage] || 0), 0) / stages.length) >= 100;
  });
  const allMessages = Object.fromEntries(['pt', 'en'].map(lang => [lang, read(`src/i18n/messages/${lang}.json`)]));
  const messages = Object.fromEntries(['pt', 'en'].map(lang => [lang, allMessages[lang].kammara]));
  const universe = entry('kammara', 'universe', 'kammara', { pt: 'Kammara', en: 'Kammara' },
    Object.fromEntries(['pt', 'en'].map(lang => [lang, messages[lang].section.text.join('\n\n')])),
    Object.fromEntries(['pt', 'en'].map(lang => [lang, messages[lang].section.panel.story])));
  worldEntries.kammara = universe.id;
  const contexts = [...published, ...(published.includes('triplec') ? regions : [])];
  const readWorld = (world, kind) => read(`src/data/characters/kammara/${world}_${kind}.json`);
  const readWorldIfExists = (world, kind, fallback) => {
    const path = `src/data/characters/kammara/${world}_${kind}.json`;
    return existsSync(resolve(siteRoot, path)) ? read(path) : fallback;
  };

  // Relações autorais permanecem nos JSONs quando um conteúdo é ocultado.
  // Este índice distingue um alvo temporariamente oculto de um ID digitado
  // incorretamente, permitindo podar o primeiro sem mascarar o segundo.
  const knownIds = new Set([universe.id]);
  for (const world of [...worlds, ...regions]) {
    const story = readWorldIfExists(world, 'story', null);
    if (story) knownIds.add(story.appId || stableId(world, regions.includes(world) ? 'region' : 'planet', story.name?.pt || story.name?.en || world));
    for (const character of readWorldIfExists(world, 'characters', [])) {
      knownIds.add(character.appId || stableId(world, 'character', character.name?.pt || character.name?.en || character.match));
    }
    for (const [index, sub] of readWorldIfExists(world, 'subsystems', []).entries()) {
      knownIds.add(sub.appId || stableId(world, 'topic', sub.title?.pt || sub.title?.en || String(index)));
    }
    for (const scene of readWorldIfExists(world, 'scenes', [])) {
      knownIds.add(scene.appId || stableId(world, 'scene', scene.label?.pt || scene.label?.en || scene.image));
    }
    for (const drop of readWorldIfExists(world, 'drops', [])) {
      knownIds.add(drop.appId || stableId(world, 'video', drop.label?.pt || drop.label?.en || drop.video));
    }
  }
  for (const clip of read('src/data/kammara_mosaic.json')) {
    const world = clip.world || 'kammara';
    knownIds.add(clip.appId || stableId(world, 'video', clip.label?.pt || clip.label?.en || clip.video));
  }
  const allBooks = read('src/data/kammara_books.json').books;
  for (const [key, book] of Object.entries(allBooks)) {
    knownIds.add(book.appId || stableId('kammara', 'book', book.title?.pt || book.title?.en || key));
  }
  const allEvents = read('src/data/kammara_events.json');
  for (const event of allEvents.events) {
    knownIds.add(event.appId || stableId(event.planet, 'event', event.title?.pt || event.title?.en || event.id));
  }
  for (const world of contexts) {
    if (regions.includes(world) && !worldEntries.triplec) continue;
    const story = readWorld(world, 'story');
    if (!appVisible(story)) continue;
    const context = `kammara/${world.replace('triplec-', 'triplec/')}`;
    const planet = entry(world, regions.includes(world) ? 'region' : 'planet', world, story.name,
      Object.fromEntries(Object.entries(paragraphs(story.summary)).map(([lang, parts]) => [lang, parts.join('\n\n')])),
      story.panel?.story, manifest.kammaraBgs?.[context] || '', {
        attributes: story.tags || [], parentId: regions.includes(world) ? worldEntries.triplec || '' : universe.id, source: story,
      });
    worldEntries[world] = planet.id;
    for (const character of readWorld(world, 'characters').filter(appVisible)) {
      const item = entry(world, 'character', character.match, character.name, character.bio, undefined, character.image, {
        source: character, attributes: [{ label: { pt: 'Espécie', en: 'Species' }, value: character.species || {}, glyph: '⊙•⊙' }, ...(character.attributes || [])],
        media: [media(character.image, character.name, '', true)],
      });
      const hasDorsal = Object.values(localized(character.dorsalMeaning)).some(Boolean);
      const meaning = hasDorsal ? character.dorsalMeaning : character.backMeaning;
      const backTitle = Object.values(localized(character.backTitle)).some(Boolean) ? character.backTitle
        : hasDorsal ? { pt: 'Glifo dorsal', en: 'Dorsal glyph' } : { pt: 'Costas', en: 'Back' };
      if (character.backImage) item.media.push(media(character.backImage, backTitle, '', true));
      if (Object.values(localized(meaning)).some(Boolean)) item.sections.push({ title: localized(backTitle), body: paragraphs(meaning) });
    }
    for (const [index, sub] of readWorld(world, 'subsystems').entries()) {
      if (appVisible(sub)) entry(world, 'topic', sub.title.pt || sub.title.en || String(index), sub.title, undefined, sub.text, sub.img, { source: sub });
    }
    for (const scene of readWorld(world, 'scenes').filter(appVisible)) {
      entry(world, 'scene', scene.image, scene.label, undefined, undefined, scene.image, { source: scene, media: [media(scene.image, scene.label, scene.video)] });
    }
    worldDropIds[world] = [];
    for (const drop of readWorld(world, 'drops').filter(appVisible)) {
      const item = entry(world, 'video', drop.video, drop.label, undefined, undefined, drop.poster, { source: drop, media: [media(drop.poster, drop.label, drop.video)] });
      worldDropIds[world].push(item.id);
    }
  }
  for (const clip of read('src/data/kammara_mosaic.json').filter(appVisible)) {
    const world = clip.world || 'kammara';
    if (!worldEntries[world]) continue;
    const id = clip.appId || stableId(world, 'video', clip.label?.pt || clip.label?.en || clip.video);
    if (!entries.some(item => item.id === id)) entry(world, 'video', clip.video, clip.label, undefined, undefined, clip.poster,
      { source: clip, media: [media(clip.poster, clip.label, clip.video)] });
    mosaicIds.push(id);
  }
  const books = allBooks;
  const bookDetails = appData('book_details.json');
  for (const [key, book] of Object.entries(books).filter(([, book]) => appVisible(book))) {
    let buy = (book.buyUrl || '').trim();
    if (buy && !/^https?:\/\//.test(buy)) buy = `https://${buy}`;
    const item = entry('kammara', 'book', key, book.title, book.description, book.body, book.cover,
      { source: book, onlyLocale: book.onlyLocale || '', externalUrl: buy, media: [media(book.cover, book.title, '', true)] });
    // Website fields take precedence, including explicit empty values used to remove content.
    if (bookDetails.books[item.id]) {
      if (Object.hasOwn(book, 'description')) delete bookDetails.books[item.id].description;
      if (Object.hasOwn(book, 'buyUrl')) delete bookDetails.books[item.id].externalUrl;
    }
  }
  const events = allEvents;
  if (appVisible(events)) for (const event of events.events.filter(appVisible)) {
    if (!worldEntries[event.planet]) continue;
    entry(event.planet, 'event', event.id, event.title, event.description, undefined, '', {
      source: event, attributes: [
        ...[['date', 'Data', 'Date'], ['location', 'Local', 'Location'], ['cshiftAddress', 'Endereço CShift', 'CShift address']]
          .map(([key, pt, en]) => ({ label: { pt, en }, value: localized(event[key]) })),
        { label: { pt: 'Categoria', en: 'Category' }, value: event.subcategory || {} },
      ], media: event.backgroundVideo ? [media('', event.title, event.backgroundVideo)] : [],
    });
  }
  const byId = new Map(entries.map(item => [item.id, item]));
  if (byId.size !== entries.length) throw Error('Duplicate entry IDs');
  const names = new Map();
  for (const item of entries) for (const title of Object.values(item.title)) {
    if (!title) continue;
    const key = `${item.worldId}:${normalize(title)}`;
    if (!names.has(key)) names.set(key, new Set());
    names.get(key).add(item.id);
  }
  for (const item of entries) {
    const authoredLinks = item.source?.relations || [];
    if (!Array.isArray(authoredLinks) || authoredLinks.some(id => typeof id !== 'string')) {
      throw Error(`Invalid relations array: ${item.id}`);
    }
    const duplicateLinks = authoredLinks.filter((id, index) => authoredLinks.indexOf(id) !== index);
    if (duplicateLinks.length) throw Error(`Duplicate relation in ${item.id}: ${duplicateLinks[0]}`);
    for (const id of authoredLinks) {
      if (id === item.id) throw Error(`Self relation: ${item.id}`);
      if (!byId.has(id) && !knownIds.has(id)) throw Error(`Unknown relation from ${item.id}: ${id}`);
    }
    const links = authoredLinks.filter(id => byId.has(id));
    for (const attribute of item.attributes) {
      const matches = new Set(Object.values(localized(attribute.value)).flatMap(value => [...(names.get(`${item.worldId}:${normalize(value)}`) || [])]));
      if (matches.size === 1 && !matches.has(item.id)) links.push(...matches);
    }
    item.relations = [...new Set(links)];
    if (!Object.values(item.title).some(title => String(title).trim())) throw Error(`Missing title: ${item.id}`);
    // Internal authoring metadata and unpublished nested content are never sent to the device.
    delete item.source;
  }
  const authored = appData('relations.json');
  authored.relations = Object.fromEntries(Object.entries(authored.relations).filter(([id]) => byId.has(id))
    .map(([id, targets]) => [id, [...new Set(targets)].filter(target => byId.has(target) && target !== id)]));
  bookDetails.books = Object.fromEntries(Object.entries(bookDetails.books).filter(([id]) => byId.has(id)));
  const upcoming = progress.planets.filter(planet => appComingSoon(planet));
  let characters = 0;
  const folder = resolve(siteRoot, 'src/data/characters/kammara');
  for (const file of readdirSync(folder).filter(name => name.endsWith('_characters.json'))) {
    characters += new Set(JSON.parse(readFileSync(resolve(folder, file), 'utf8')).map(item => item.match)).size;
  }
  const legal = { schemaVersion: 1, source: { urls: Object.fromEntries(['pt', 'en'].map(lang => [lang, `${base}/${lang}/privacy`])) },
    documents: Object.fromEntries(['pt', 'en'].map(lang => [lang, allMessages[lang].privacy])) };
  const catalog = { schemaVersion: 1, includeHidden: false, source: 'guitta_monatega / Kammara', universeId: universe.id,
    worldEntries, entries, mosaicIds, worldDropIds, upcoming, progressCategories: progress.categories, websiteMessages: messages };
  const counts = { schemaVersion: 1, counts: { books: Object.fromEntries(['pt', 'en'].map(lang =>
    [lang, Object.values(books).filter(book => appVisible(book) && !(book.buyUrl || '').trim() && (!book.onlyLocale || book.onlyLocale === lang)).length])),
    characters, planets: upcoming.length } };
  const files = { 'catalog.json': catalog, 'relations.json': authored, 'book_details.json': bookDetails,
    'section_headers.json': appData('section_headers.json'), 'legal.json': legal, 'coming_soon.json': counts };
  return { schemaVersion: 1, revision: hash(JSON.stringify(files)), files };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1])) {
  const siteRoot = resolve(process.argv[2] || process.cwd());
  // Roda fora do Next (prebuild/predev), então o `.env.local` não é lido sozinho.
  // Variáveis já definidas (ex: Vercel) têm prioridade.
  const envFile = resolve(siteRoot, '.env.local');
  if (existsSync(envFile)) process.loadEnvFile(envFile);
  if (!mediaBase()) console.warn('Kammara app: NEXT_PUBLIC_MEDIA_BASE_URL vazia — mídias apontam para o site, que não serve mais /imgs.');
  const output = resolve(process.argv[3] || resolve(siteRoot, 'src/generated/kammara-app.json'));
  if (output.startsWith(resolve(siteRoot, 'public') + sep)) throw Error('The complete snapshot must never be generated inside public/');
  const appDataRoot = process.argv[4] ? resolve(process.argv[4]) : undefined;
  stabilizeContentIds(siteRoot);
  const snapshot = buildContent(siteRoot, appDataRoot);
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, JSON.stringify(snapshot));
  console.log(`Kammara app: ${snapshot.files['catalog.json'].entries.length} entries → ${output}`);
}
