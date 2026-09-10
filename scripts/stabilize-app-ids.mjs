/** Persist identity independently of editable titles, keys and artwork paths. */
import { readFileSync, writeFileSync, existsSync, readdirSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const stableId = (world, kind, key) => `${world}-${kind}-${createHash('sha256').update(key).digest('hex').slice(0, 16)}`;
export function stabilizeContentIds(siteRoot) {
  let assigned = 0;
  const files = [];
  const update = (path, visit) => {
    const file = resolve(siteRoot, path);
    if (!existsSync(file)) return;
    const root = JSON.parse(readFileSync(file, 'utf8'));
    const before = assigned;
    const assign = (item, world, kind, key) => {
      if (item.appId) return;
      if (typeof key !== 'string' || !key) throw Error(`Missing identity key in ${path}`);
      item.appId = stableId(world, kind, key);
      assigned++;
    };
    visit(root, assign);
    if (assigned !== before) files.push([file, JSON.stringify(root, null, 2) + '\n']);
  };
  const folder = 'src/data/characters/kammara';
  for (const name of readdirSync(resolve(siteRoot, folder)).sort()) {
    const match = name.match(/^(.+)_(story|characters|subsystems|scenes|drops)\.json$/);
    if (!match) continue;
    const [, world, type] = match;
    update(`${folder}/${name}`, (root, assign) => {
      if (type === 'story') assign(root, world, world.startsWith('triplec-') ? 'region' : 'planet', world);
      else root.forEach((item, index) => {
        const [kind, key] = type === 'characters' ? ['character', item.match]
          : type === 'subsystems' ? ['topic', item.title?.pt || item.title?.en || String(index)]
          : type === 'scenes' ? ['scene', item.image] : ['video', item.video];
        assign(item, world, kind, key);
      });
    });
  }
  update('src/data/kammara_books.json', (root, assign) => {
    for (const [key, item] of Object.entries(root.books)) assign(item, 'kammara', 'book', key);
  });
  update('src/data/kammara_mosaic.json', (root, assign) => {
    for (const item of root) assign(item, item.world || 'kammara', 'video', item.video);
  });
  update('src/data/kammara_events.json', (root, assign) => {
    for (const item of root.events) assign(item, item.planet, 'event', item.id);
  });
  // Validate every input before changing any file. Existing appId values are never recalculated.
  for (const [file, data] of files) writeFileSync(file, data);
  return { assigned, files: files.length };
}
if (process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1])) {
  console.log(JSON.stringify(stabilizeContentIds(resolve(process.argv[2] || process.cwd()))));
}
