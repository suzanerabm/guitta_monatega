import { stabilizeContentIds } from '../stabilize-app-ids.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { buildContent, stableId } from '../generate-app-content.mjs';
import { createContentApi } from '../../src/lib/kammara-app-api.mjs';

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'kammara-api-'));
  const write = (path, value) => { mkdirSync(dirname(join(root, path)), { recursive: true }); writeFileSync(join(root, path), JSON.stringify(value)); };
  write('src/data/image-manifest.json', {});
  write('src/data/kammara_progress.json', { categories: [{ id: 'lore' }], planets: [
    { id: 'lunnp1', progress: { lore: 100 } }, { id: 'memphis', hidden: true, progress: { lore: 100 } },
  ] });
  for (const lang of ['pt', 'en']) write(`src/i18n/messages/${lang}.json`, {
    kammara: { section: { text: ['Universe'], panel: { story: ['Story'] } } }, privacy: { title: 'Terms' },
  });
  const folder = 'src/data/characters/kammara/lunnp1_';
  write(folder + 'story.json', { name: { pt: 'LUNN', en: 'LUNN' } });
  const characters = Array.from({ length: 43 }, (_, index) => ({ match: `char${index}`, name: { pt: `Character ${index}`, en: `Character ${index}` } }));
  write(folder + 'characters.json', [...characters, { match: 'secret', name: { pt: 'NEVER-PUBLISH' }, visible: false }]);
  write(folder + 'subsystems.json', [{ visible: false, title: { pt: 'SECRET-TOPIC' } }]);
  write(folder + 'scenes.json', [{ visible: false, image: '/secret.jpg', label: { pt: 'SECRET-SCENE' } }]);
  write(folder + 'drops.json', [{ enabled: false, video: '/secret.mp4' }]);
  write('src/data/kammara_mosaic.json', [{ enabled: false, video: '/secret.mp4' }]);
  write('src/data/kammara_books.json', { books: { book: { title: { pt: 'Book' }, description: { pt: 'Website description' }, buyUrl: '' } } });
  write('src/data/kammara_events.json', { visible: false, events: [] });
  write('src/data/kammara-app/relations.json', { schemaVersion: 1, relations: {
    [stableId('lunnp1', 'character', 'char0')]: [stableId('lunnp1', 'character', 'char1'), stableId('lunnp1', 'character', 'secret')],
  } });
  write('src/data/kammara-app/book_details.json', { schemaVersion: 1, books: {
    [stableId('kammara', 'book', 'book')]: { description: { pt: 'Old description' }, externalUrl: 'https://old.example' },
  } });
  write('src/data/kammara-app/section_headers.json', { schemaVersion: 1 });
  return { root, write, characters, folder };
}

test('export excludes hidden records, prunes links and uses website book values', () => {
  const f = fixture();
  try {
    const snapshot = buildContent(f.root);
    const serialized = JSON.stringify(snapshot);
    assert.ok(!serialized.includes('NEVER-PUBLISH'));
    assert.ok(!serialized.includes('SECRET-TOPIC'));
    assert.ok(!serialized.includes('SECRET-SCENE'));
    assert.ok(!serialized.includes('secret.mp4'));
    assert.ok(!serialized.includes('memphis'));
    assert.ok(!serialized.includes('Old description'));
    assert.ok(!serialized.includes('old.example'));
    const catalog = snapshot.files['catalog.json'];
    const id = stableId('lunnp1', 'character', 'char0');
    assert.deepEqual(snapshot.files['relations.json'].relations[id], [stableId('lunnp1', 'character', 'char1')]);
    f.write(f.folder + 'characters.json', [{ ...f.characters[0], visible: false }, ...f.characters.slice(1)]);
    const next = buildContent(f.root);
    assert.notEqual(next.revision, snapshot.revision);
    assert.ok(!next.files['catalog.json'].entries.some(entry => entry.id === id));
    assert.equal(catalog.entries.find(entry => entry.id === stableId('lunnp1', 'character', 'char1')).id,
      next.files['catalog.json'].entries.find(entry => entry.title.pt === 'Character 1').id);
  } finally { rmSync(f.root, { recursive: true }); }
});

test('API never returns an unlimited catalog and rejects stale revisions', async () => {
  const f = fixture();
  try {
    const snapshot = buildContent(f.root);
    const api = createContentApi(snapshot);
    const response = api.manifest(new Request('https://site/api/manifest'));
    const manifest = await response.json();
    assert.deepEqual(manifest.files['catalog.json'].entries, []);
    assert.equal(api.manifest(new Request('https://site/api/manifest', { headers: { 'if-none-match': response.headers.get('etag') } })).status, 304);
    assert.equal(api.manifest(new Request('https://site/api/manifest?all=true')).status, 400);
    const combined = [];
    for (const descriptor of manifest.pages) {
      const page = await api.page(new Request(`https://site/api/pages?index=${descriptor.index}&revision=${manifest.revision}`)).json();
      assert.ok(page.entries.length <= 20);
      assert.equal(page.revision, descriptor.revision);
      combined.push(...page.entries);
    }
    assert.deepEqual(combined, snapshot.files['catalog.json'].entries);
    assert.equal(api.page(new Request(`https://site/api/pages?index=0&revision=${manifest.revision}&limit=100000`)).status, 400);
    assert.equal(api.page(new Request('https://site/api/pages?index=0&revision=old')).status, 409);
    assert.equal(api.page(new Request(`https://site/api/pages?index=-1&revision=${manifest.revision}`)).status, 404);
  } finally { rmSync(f.root, { recursive: true }); }
});


test('editing titles, record order and book keys preserves published identity and links', () => {
  const f = fixture();
  try {
    f.write(f.folder + 'subsystems.json', [{ title: { pt: 'Historia', en: 'History' }, text: { pt: ['Original'] } }]);
    const before = buildContent(f.root);
    const count = stabilizeContentIds(f.root);
    assert.ok(count.assigned > 0);
    assert.equal(stabilizeContentIds(f.root).assigned, 0);
    assert.deepEqual(buildContent(f.root), before);
    const read = path => JSON.parse(readFileSync(join(f.root, path), 'utf8'));
    const topics = read(f.folder + 'subsystems.json');
    const topicId = topics[0].appId;
    topics[0].title.pt = 'História do planeta';
    topics[0].text.pt = ['Texto revisado com acentuação.'];
    f.write(f.folder + 'subsystems.json', topics);
    const characters = read(f.folder + 'characters.json');
    characters[0].name.pt = 'Nome corrigido';
    f.write(f.folder + 'characters.json', characters.reverse());
    const books = read('src/data/kammara_books.json');
    const book = books.books.book;
    book.description.pt = 'Nova sinopse';
    books.books = { renamed: book };
    f.write('src/data/kammara_books.json', books);
    stabilizeContentIds(f.root);
    const next = buildContent(f.root);
    assert.deepEqual(next.files['catalog.json'].entries.map(e => e.id).sort(), before.files['catalog.json'].entries.map(e => e.id).sort());
    assert.equal(next.files['catalog.json'].entries.find(e => e.id === topicId).title.pt, 'História do planeta');
    assert.equal(next.files['catalog.json'].entries.find(e => e.id === book.appId).summary.pt, 'Nova sinopse');
    assert.deepEqual(next.files['relations.json'], before.files['relations.json']);
    assert.ok(!JSON.stringify(next).includes('NEVER-PUBLISH'));
  } finally { rmSync(f.root, { recursive: true }); }
});
