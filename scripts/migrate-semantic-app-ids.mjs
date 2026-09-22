/** One-time migration from opaque hash IDs to authorable semantic IDs. */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { semanticAppId } from './app-id.mjs';

const COLLISION_IDS = {
  'eni4-scene-1bf519b867705a7d': 'eni4-scene-palacio-de-node-0-1',
  'eni4-scene-2ce7e20ede862529': 'eni4-scene-palacio-de-node-0-3',
  'eni4-scene-9c6a65c2023f7a4f': 'eni4-scene-palacio-de-node-0-4',
  'eni4-scene-8ded64139506ee60': 'eni4-scene-interior-do-palacio-de-node-0-8',
  'eni4-scene-26d856cb1f6cb698': 'eni4-scene-interior-do-palacio-de-node-0-9',
  'eni4-scene-fb05c3232d0ed895': 'eni4-scene-tuneis-com-worms-na-zona-crack-15',
  'eni4-scene-32dec6fe4f42f504': 'eni4-scene-tuneis-com-worms-na-zona-crack-16',
  'orfv-scene-7e58ef55a22e87be': 'orfv-scene-regiao-sul-deserta-10',
  'orfv-scene-b6f14d959e8de188': 'orfv-scene-regiao-sul-deserta-11',
  'triplec-sharp-scene-48d4fa2173ee3666': 'triplec-sharp-scene-praca-central',
  'triplec-sharp-scene-6179cfe14d5e96be': 'triplec-sharp-scene-praca-central-plataforma',
};

export function migrateSemanticAppIds(siteRoot) {
  const aliasPath = resolve(siteRoot, 'src/data/kammara-app/app_id_aliases.json');
  if (existsSync(aliasPath)) {
    throw Error('Semantic appId migration already ran; remove app_id_aliases.json only if you intentionally want to rebuild it');
  }
  const paths = [];
  const contentFolder = resolve(siteRoot, 'src/data/characters/kammara');
  for (const name of readdirSync(contentFolder).sort()) {
    if (/^(.+)_(story|characters|subsystems|scenes|drops)\.json$/.test(name)) paths.push(`src/data/characters/kammara/${name}`);
  }
  paths.push('src/data/kammara_books.json', 'src/data/kammara_mosaic.json', 'src/data/kammara_events.json');

  const documents = new Map(paths.map(path => [path, JSON.parse(readFileSync(resolve(siteRoot, path), 'utf8'))]));
  const aliases = new Map([
    // The universe is generated rather than stored in an authoring JSON.
    ['kammara-universe-10ea8200121f55b9', 'kammara-universe-kammara'],
  ]);
  const claimed = new Map();

  const assign = (item, world, kind, label, path) => {
    if (!item?.appId) throw Error(`Missing existing appId in ${path}`);
    const oldId = item.appId;
    let nextId = aliases.get(oldId);
    if (!nextId) {
      nextId = COLLISION_IDS[oldId] || semanticAppId(world, kind, label);
      const owner = claimed.get(nextId);
      if (owner && owner !== oldId) throw Error(`Semantic appId collision: ${nextId} (${owner}, ${oldId})`);
      aliases.set(oldId, nextId);
      claimed.set(nextId, oldId);
    }
    item.appId = nextId;
  };

  for (const [path, root] of documents) {
    const name = path.split('/').at(-1);
    const match = name.match(/^(.+)_(story|characters|subsystems|scenes|drops)\.json$/);
    if (path.includes('/characters/kammara/') && match) {
      const [, world, type] = match;
      const items = type === 'story' ? [root] : root;
      for (const item of items) {
        const kind = type === 'story' ? (world.startsWith('triplec-') ? 'region' : 'planet')
          : type === 'characters' ? 'character' : type === 'subsystems' ? 'topic' : type === 'scenes' ? 'scene' : 'video';
        const label = item.name?.pt || item.name?.en || item.title?.pt || item.title?.en
          || item.label?.pt || item.label?.en || item.match || world;
        assign(item, world, kind, label, path);
      }
    } else if (path.endsWith('kammara_books.json')) {
      for (const [key, item] of Object.entries(root.books)) assign(item, 'kammara', 'book', item.title?.pt || item.title?.en || key, path);
    } else if (path.endsWith('kammara_mosaic.json')) {
      for (const item of root) assign(item, item.world || 'kammara', 'video', item.label?.pt || item.label?.en, path);
    } else if (path.endsWith('kammara_events.json')) {
      for (const item of root.events) assign(item, item.planet, 'event', item.title?.pt || item.title?.en || item.id, path);
    }
  }

  const rewriteIds = value => {
    if (Array.isArray(value)) return value.map(rewriteIds);
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([key, child]) => [aliases.get(key) || key, rewriteIds(child)]));
    }
    return typeof value === 'string' && aliases.has(value) ? aliases.get(value) : value;
  };

  for (const [path, root] of documents) writeFileSync(resolve(siteRoot, path), JSON.stringify(root, null, 2) + '\n');
  for (const path of ['src/data/kammara-app/relations.json', 'src/data/kammara-app/book_details.json']) {
    const file = resolve(siteRoot, path);
    if (existsSync(file)) writeFileSync(file, JSON.stringify(rewriteIds(JSON.parse(readFileSync(file, 'utf8'))), null, 2) + '\n');
  }
  writeFileSync(aliasPath, JSON.stringify({ schemaVersion: 1, aliases: Object.fromEntries([...aliases].sort()) }, null, 2) + '\n');
  return { migrated: aliases.size, aliasPath };
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  console.log(JSON.stringify(migrateSemanticAppIds(resolve(process.argv[2] || process.cwd()))));
}
