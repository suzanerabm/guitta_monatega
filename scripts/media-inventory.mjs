/**
 * Gera `src/data/media-inventory.json`: a lista das mídias que estão no bucket.
 *
 * As mídias de conteúdo não moram mais em `public/imgs` — vivem no S3. Os
 * scripts que precisam saber se uma mídia EXISTE (hoje: generate-app-content)
 * consultam este inventário em vez do disco.
 *
 * Rode apontando para a MESMA pasta que foi enviada ao bucket (a raiz dela é a
 * raiz do bucket: `kammara/`, `books/`, ...):
 *
 *   npm run media-inventory -- ~/Desktop/imgs
 *
 * Os paths são gravados no formato do código (`/imgs/kammara/a.png`), ordenados.
 */
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

const IGNORED = new Set(['.DS_Store', '.gitkeep']);

const source = process.argv[2];
if (!source) {
  console.error('Uso: npm run media-inventory -- <pasta enviada ao bucket>');
  process.exit(1);
}
const root = resolve(source);
const output = resolve(process.cwd(), 'src/data/media-inventory.json');

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    if (IGNORED.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push('/imgs/' + relative(root, full).split(sep).join('/'));
  }
  return out;
}

const paths = walk(root, []).sort();
writeFileSync(output, JSON.stringify(paths, null, 2) + '\n');
console.log(`media-inventory: ${paths.length} arquivos → ${output}`);
