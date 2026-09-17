/** Persist identity independently of editable titles, keys and artwork paths. */
import { readFileSync, writeFileSync, existsSync, readdirSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { APP_ID_PATTERN, semanticAppId } from './app-id.mjs';

const mediaLabel = value => String(value || '').split('/').at(-1)?.replace(/\.[^.]+$/, '') || '';

export function stabilizeContentIds(siteRoot) {
  let assigned = 0;
  const files = [];
  const ids = new Map();
  const update = (path, visit) => {
    const file = resolve(siteRoot, path);
    if (!existsSync(file)) return;
    const root = JSON.parse(readFileSync(file, 'utf8'));
    const before = assigned;
    const assign = (item, world, kind, label) => {
      const wasMissing = !item.appId;
      if (wasMissing) {
        item.appId = semanticAppId(world, kind, label);
        assigned++;
      }
      if (!APP_ID_PATTERN.test(item.appId)) throw Error(`Invalid appId ${item.appId} in ${path}`);
      const previous = ids.get(item.appId);
      if (wasMissing && previous) {
        throw Error(`Duplicate appId ${item.appId} in ${path}; assign a more specific semantic appId`);
      }
      if (!previous) ids.set(item.appId, item);
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
      if (type === 'story') assign(root, world, world.startsWith('triplec-') ? 'region' : 'planet', root.name?.pt || root.name?.en || world);
      else root.forEach((item, index) => {
        const [kind, label] = type === 'characters' ? ['character', item.name?.pt || item.name?.en || item.match]
          : type === 'subsystems' ? ['topic', item.title?.pt || item.title?.en || String(index)]
          : type === 'scenes' ? ['scene', item.label?.pt || item.label?.en || mediaLabel(item.image)]
          : ['video', item.label?.pt || item.label?.en || mediaLabel(item.video)];
        assign(item, world, kind, label);
      });
    });
  }
  update('src/data/kammara_books.json', (root, assign) => {
    for (const [key, item] of Object.entries(root.books)) assign(item, 'kammara', 'book', item.title?.pt || item.title?.en || key);
  });
  update('src/data/kammara_mosaic.json', (root, assign) => {
    for (const item of root) assign(item, item.world || 'kammara', 'video', item.label?.pt || item.label?.en || mediaLabel(item.video));
  });
  update('src/data/kammara_events.json', (root, assign) => {
    for (const item of root.events) assign(item, item.planet, 'event', item.title?.pt || item.title?.en || item.id);
  });
  // Validate every input before changing any file. Existing appId values are never recalculated.
  for (const [file, data] of files) writeFileSync(file, data);
  return { assigned, files: files.length };
}
if (process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1])) {
  console.log(JSON.stringify(stabilizeContentIds(resolve(process.argv[2] || process.cwd()))));
}
