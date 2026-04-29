// scripts/fix-image-case.ts
//
// macOS APFS is case-insensitive, so a JSON ref to `/imgs/foo/Bar.png`
// happily loads `bar.png` from disk in dev. On Linux (Vercel), it
// 404s. This script walks src/data/**/*.json, finds every "/imgs/..."
// path whose case doesn't match the actual file on disk, and fixes
// the JSON to match. Run with: npm run fix-image-case

import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = process.cwd();
const PUBLIC_ROOT = path.join(PROJECT_ROOT, 'public');
const DATA_ROOT = path.join(PROJECT_ROOT, 'src/data');

// Cache: directory absPath → Map<lowercase name, real name on disk>.
// Used so we can resolve a case-insensitive lookup with a single
// readdir per directory.
const dirCache = new Map<string, Map<string, string>>();

function readDirCaseMap(absDir: string): Map<string, string> {
  const cached = dirCache.get(absDir);
  if (cached) return cached;
  const map = new Map<string, string>();
  if (fs.existsSync(absDir)) {
    for (const name of fs.readdirSync(absDir)) {
      map.set(name.toLowerCase(), name);
    }
  }
  dirCache.set(absDir, map);
  return map;
}

// Returns the on-disk URL for `urlPath`, walking each segment under
// /public/ case-insensitively. Returns null if any segment is missing.
function resolveOnDisk(urlPath: string): string | null {
  if (!urlPath.startsWith('/')) return null;
  const segments = urlPath.split('/').filter(Boolean);
  let current = PUBLIC_ROOT;
  const fixedSegments: string[] = [];

  for (const seg of segments) {
    const map = readDirCaseMap(current);
    const realName = map.get(seg.toLowerCase());
    if (!realName) return null;
    fixedSegments.push(realName);
    current = path.join(current, realName);
  }

  return '/' + fixedSegments.join('/');
}

function walkJson(dir: string, out: string[]) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walkJson(full, out);
    else if (name.endsWith('.json')) out.push(full);
  }
}

const jsonFiles: string[] = [];
walkJson(DATA_ROOT, jsonFiles);

let totalRewrites = 0;
const touched: string[] = [];
const unresolved: { file: string; url: string }[] = [];

for (const file of jsonFiles) {
  const original = fs.readFileSync(file, 'utf8');
  let updated = original;
  let count = 0;
  const seen = new Set<string>();

  // Match every quoted "/imgs/..." path. Image extensions only — we
  // don't want to touch unrelated /imgs/... refs that aren't filenames.
  const matches =
    updated.match(/"\/imgs\/[^"]+?\.(?:png|jpe?g|webp|heic|gif|svg|avif)"/gi) ?? [];

  for (const quoted of matches) {
    if (seen.has(quoted)) continue;
    seen.add(quoted);
    const urlPath = quoted.slice(1, -1);
    const real = resolveOnDisk(urlPath);
    if (!real) {
      unresolved.push({ file: path.relative(PROJECT_ROOT, file), url: urlPath });
      continue;
    }
    if (real === urlPath) continue;
    const replacement = `"${real}"`;
    const occurrences = updated.split(quoted).length - 1;
    updated = updated.split(quoted).join(replacement);
    count += occurrences;
  }

  if (count > 0) {
    fs.writeFileSync(file, updated);
    totalRewrites += count;
    touched.push(path.relative(PROJECT_ROOT, file));
  }
}

console.log(`Rewrote ${totalRewrites} ref(s) in ${touched.length} JSON file(s):`);
for (const f of touched) console.log(`  ${f}`);

if (unresolved.length > 0) {
  console.log(`\n⚠️  ${unresolved.length} ref(s) point at files that DON'T exist:`);
  const unique = new Set(unresolved.map((u) => u.url));
  for (const url of unique) console.log(`  ${url}`);
}
