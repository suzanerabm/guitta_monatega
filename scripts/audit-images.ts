// scripts/audit-images.ts
//
// Walks public/imgs, collects file sizes and writes a human-friendly
// markdown report at scripts/images-report.md. Helps catch heavy assets
// (gigapixel upscales, uncompressed PNGs, forgotten originals) before
// they ship to prod.
//
// Run with: npm run audit-images

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd(), 'public/imgs');
const OUTPUT = path.resolve(process.cwd(), 'scripts/images-report.md');

const IMAGE_EXTS = /\.(png|jpg|jpeg|webp|gif|svg|avif)$/i;

// Per-folder ideal size thresholds (in bytes). When a folder name matches
// the key, files above the matching target are flagged. Falls back to
// `default` for anything else.
// High-resolution targets: assume @2x retina exports, JPG 82-85% quality
// (or optimized PNG for art with hard lines / transparency). Anything above
// "critical" is almost certainly a gigapixel-style upscale that leaked
// into /public instead of staying as a local master file.
const TARGETS: Record<string, { ideal: number; critical: number; label: string }> = {
  _bg:          { ideal: 1.5 * 1024 * 1024, critical: 5 * 1024 * 1024, label: 'background (2400×1500, JPG 82%)' },
  _scenes:      { ideal:   1 * 1024 * 1024, critical: 3 * 1024 * 1024, label: 'scene (1200×750, JPG 85%)' },
  _subsystems:  { ideal:   1 * 1024 * 1024, critical: 3 * 1024 * 1024, label: 'subsystem (1600×1000, JPG 85%)' },
  _thumb:       { ideal: 300 * 1024,        critical: 800 * 1024,      label: 'art thumb (600×400, JPG 80%)' },
  default:      { ideal: 600 * 1024,        critical: 2 * 1024 * 1024, label: 'character / misc (1200×1200, PNG otim.)' },
};

interface Entry {
  path: string;       // relative to public/
  size: number;       // bytes
  folder: string;     // immediate parent folder
  category: keyof typeof TARGETS;
}

function walk(dir: string, out: Entry[]) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full, out);
      continue;
    }
    if (!IMAGE_EXTS.test(name)) continue;
    const rel = path.relative(path.resolve(process.cwd(), 'public'), full);
    const folder = path.basename(path.dirname(full));
    const category = (TARGETS[folder] ? folder : 'default') as keyof typeof TARGETS;
    out.push({ path: rel, size: stat.size, folder, category });
  }
}

function fmtSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

function sortDesc(a: Entry, b: Entry) { return b.size - a.size; }

// Aggregate totals by top-level subfolder inside public/imgs.
function byTopFolder(entries: Entry[]) {
  const map = new Map<string, { count: number; bytes: number }>();
  for (const e of entries) {
    const parts = e.path.split(path.sep);
    // path = "imgs/<top>/<...>" — we want <top>
    const top = parts[1] ?? '(root)';
    const cur = map.get(top) ?? { count: 0, bytes: 0 };
    cur.count += 1;
    cur.bytes += e.size;
    map.set(top, cur);
  }
  return [...map.entries()]
    .map(([folder, v]) => ({ folder, ...v }))
    .sort((a, b) => b.bytes - a.bytes);
}

// Main
const entries: Entry[] = [];
walk(ROOT, entries);

if (entries.length === 0) {
  console.log('No images found at public/imgs/');
  process.exit(0);
}

entries.sort(sortDesc);

const totalBytes = entries.reduce((s, e) => s + e.size, 0);
const critical = entries.filter((e) => e.size > TARGETS[e.category].critical);
const overIdeal = entries.filter((e) => e.size > TARGETS[e.category].ideal);
const top30 = entries.slice(0, 30);
const perFolder = byTopFolder(entries);

const lines: string[] = [];
lines.push(`# 🖼️  Image weight audit`);
lines.push('');
lines.push(`_Generated ${new Date().toISOString().slice(0, 19).replace('T', ' ')}_`);
lines.push('');

// Summary ------------------------------------------------------------------
lines.push('## Resumo');
lines.push('');
lines.push(`| Métrica | Valor |`);
lines.push(`|---|---|`);
lines.push(`| Total de imagens | **${entries.length}** |`);
lines.push(`| Peso total | **${fmtSize(totalBytes)}** |`);
lines.push(`| Acima do alvo (ideal por tipo) | **${overIdeal.length}** (${Math.round((overIdeal.length / entries.length) * 100)}%) |`);
lines.push(`| Críticos (> 2× o alvo) | **${critical.length}** |`);
lines.push('');

// Thresholds ---------------------------------------------------------------
lines.push('## Alvos por tipo de imagem');
lines.push('');
lines.push(`| Pasta | Alvo ideal | Crítico | Uso |`);
lines.push(`|---|---|---|---|`);
for (const [folder, t] of Object.entries(TARGETS)) {
  lines.push(`| \`${folder}\` | ${fmtSize(t.ideal)} | ${fmtSize(t.critical)} | ${t.label} |`);
}
lines.push('');

// Per top folder -----------------------------------------------------------
lines.push('## Peso por pasta (top-level dentro de `public/imgs`)');
lines.push('');
lines.push(`| Pasta | Imagens | Peso |`);
lines.push(`|---|---|---|`);
for (const f of perFolder) {
  lines.push(`| \`${f.folder}\` | ${f.count} | ${fmtSize(f.bytes)} |`);
}
lines.push('');

// Top 30 offenders ---------------------------------------------------------
lines.push('## Top 30 arquivos mais pesados');
lines.push('');
lines.push(`| Peso | Classificação | Caminho |`);
lines.push(`|---|---|---|`);
for (const e of top30) {
  const t = TARGETS[e.category];
  const tag = e.size > t.critical ? '🔴 crítico' : e.size > t.ideal ? '🟠 acima' : '🟢 ok';
  lines.push(`| ${fmtSize(e.size)} | ${tag} (${t.label}) | \`${e.path}\` |`);
}
lines.push('');

// Full list above ideal, grouped by folder --------------------------------
lines.push('## Todos acima do alvo, agrupados por pasta');
lines.push('');
if (overIdeal.length === 0) {
  lines.push('_Tudo dentro do alvo 🎉_');
} else {
  // Group by parent directory (relative path). Inside each group, sort
  // files by size desc so the worst offender in a folder is the first
  // row you see when you open that folder to fix things.
  const groups = new Map<string, Entry[]>();
  for (const e of overIdeal) {
    const parentDir = path.dirname(e.path);
    const list = groups.get(parentDir) ?? [];
    list.push(e);
    groups.set(parentDir, list);
  }
  // Order folders alphabetically by path so the report follows the
  // filesystem layout (all eni4 together, then lunnp1, etc). Inside each
  // folder, files are still sorted by size desc.
  const orderedFolders = [...groups.entries()]
    .map(([folder, items]) => ({
      folder,
      items: items.sort(sortDesc),
      total: items.reduce((s, i) => s + i.size, 0),
    }))
    .sort((a, b) => a.folder.localeCompare(b.folder));

  for (const g of orderedFolders) {
    lines.push(`### \`${g.folder}/\` — ${fmtSize(g.total)} em ${g.items.length} ${g.items.length === 1 ? 'arquivo' : 'arquivos'}`);
    lines.push('');
    lines.push(`| Peso | Classificação | Arquivo |`);
    lines.push(`|---|---|---|`);
    for (const e of g.items) {
      const t = TARGETS[e.category];
      const tag = e.size > t.critical ? '🔴 crítico' : '🟠 acima';
      lines.push(`| ${fmtSize(e.size)} | ${tag} (${t.label}) | \`${path.basename(e.path)}\` |`);
    }
    lines.push('');
  }
}
lines.push('');

fs.writeFileSync(OUTPUT, lines.join('\n'));

console.log(`Report written to ${OUTPUT}`);
console.log(`- Images: ${entries.length}`);
console.log(`- Total size: ${fmtSize(totalBytes)}`);
console.log(`- Above ideal: ${overIdeal.length}`);
console.log(`- Critical: ${critical.length}`);
