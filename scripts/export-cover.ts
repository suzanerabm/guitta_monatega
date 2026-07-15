import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const URL = process.env.EXPORT_URL ?? 'http://localhost:3000/export/cover';
const OUT = path.resolve('public/imgs/kammara/capa_kammara_saga.jpg');

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1000, height: 1600 },
    deviceScaleFactor: 1.6, // 1000×1600 → 1600×2560
  });

  await page.goto(URL, { waitUntil: 'networkidle' });

  // Garantir que todas as <img> (fundo, heróis, discos) carregaram.
  await page.evaluate(async () => {
    const imgs = Array.from(document.images);
    await Promise.all(
      imgs.map((img) =>
        img.complete && img.naturalWidth > 0
          ? Promise.resolve()
          : new Promise((res) => {
              img.addEventListener('load', res, { once: true });
              img.addEventListener('error', res, { once: true });
            }),
      ),
    );
  });

  const target = page.locator('[data-export-target="cover"]');
  const png = await target.screenshot({ type: 'png' });
  await browser.close();

  await mkdir(path.dirname(OUT), { recursive: true });
  await sharp(png)
    .flatten({ background: '#0a0a12' }) // sem alpha → RGB
    .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
    .toFile(OUT);

  const meta = await sharp(OUT).metadata();
  console.log(`✓ ${OUT}`);
  console.log(`  ${meta.width}×${meta.height} ${meta.format} space=${meta.space}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
