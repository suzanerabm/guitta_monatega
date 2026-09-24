import { describe, it, expect, afterEach, vi } from 'vitest';

/**
 * O gate de visibilidade só vale em PRODUÇÃO: `src/lib/visibility.ts` calcula
 * `showAll` em escopo de módulo a partir de `NODE_ENV`, e sob vitest isso é
 * `test` — ou seja, tudo aparece. Para testar o gate de verdade é preciso
 * recarregar os módulos com `NODE_ENV=production`.
 *
 * Este é o teste que protege o conteúdo não-publicado de voltar a vazar.
 */
async function loadInProduction() {
  vi.resetModules();
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', '');
  return {
    kammara: await import('./kammara'),
    bichittos: await import('./bichittos'),
  };
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('gates em produção — Kammara', () => {
  it('não devolve mundo com progresso abaixo de 100', async () => {
    const { kammara } = await loadInProduction();
    const ids = kammara.getWorlds('pt').map((w) => w.id);
    expect(ids).not.toContain('memphis');
    expect(ids).toContain('lunnp1');
  });

  it('getWorld devolve null para mundo não publicado', async () => {
    const { kammara } = await loadInProduction();
    expect(kammara.getWorld('memphis', 'pt')).toBeNull();
    expect(kammara.getWorld('naoexiste', 'pt')).toBeNull();
    expect(kammara.getWorld('lunnp1', 'pt')).not.toBeNull();
  });

  it('não vaza personagem marcado visible:false', async () => {
    const { kammara } = await loadInProduction();
    const eni4 = kammara.getWorld('eni4', 'pt');
    const nomes = eni4!.characters.map((c) => c.name);
    expect(nomes).not.toContain('SCORAK');
    // ...e nem pelas imagens do manifesto.
    const imgs = JSON.stringify(eni4!.chars);
    expect(imgs).not.toContain('SCORAK_costas');
  });

  it('não vaza subsistema marcado visible:false', async () => {
    const { kammara } = await loadInProduction();
    const orfv = kammara.getWorld('orfv', 'pt');
    expect(JSON.stringify(orfv!.subsystems)).not.toContain('A lanPHPe');
  });

  it('não devolve subsistema com texto de placeholder', async () => {
    const { kammara } = await loadInProduction();
    for (const w of kammara.getWorlds('pt')) {
      for (const s of w.subsystems) {
        expect(s.text[0].startsWith('Placeholder')).toBe(false);
      }
    }
  });

  it('mosaico só traz clipe de planeta publicado', async () => {
    const { kammara } = await loadInProduction();
    const worlds = kammara.getMosaic('pt').map((c) => c.worldId);
    expect(worlds).not.toContain('memphis');
  });

  it('resolve o idioma pedido', async () => {
    const { kammara } = await loadInProduction();
    const pt = kammara.getWorld('lunnp1', 'pt')!;
    const en = kammara.getWorld('lunnp1', 'en')!;
    expect(pt.summary[0]).not.toBe(en.summary[0]);
  });

  it('TripleC traz as três regiões', async () => {
    const { kammara } = await loadInProduction();
    const triplec = kammara.getWorld('triplec', 'pt')!;
    expect(Object.keys(triplec.regions ?? {})).toEqual(['malloc', 'mesh', 'sharp']);
  });
});

describe('gates em produção — Bichittos', () => {
  it('não devolve criatura não publicada', async () => {
    const { bichittos } = await loadInProduction();
    const ids = bichittos.getBichittos('pt').map((c) => c.id);
    expect(ids).not.toContain('miscelania');
    expect(ids).toContain('napcat');
  });

  it('não vaza a lore da criatura não publicada', async () => {
    const { bichittos } = await loadInProduction();
    expect(JSON.stringify(bichittos.getBichittos('pt'))).not.toContain(
      'A fada que faz qq nenem',
    );
  });

  it('isKnownBichitto barra id desconhecido e não publicado', async () => {
    const { bichittos } = await loadInProduction();
    expect(bichittos.isKnownBichitto('napcat')).toBe(true);
    expect(bichittos.isKnownBichitto('miscelania')).toBe(false);
    expect(bichittos.isKnownBichitto('naoexiste')).toBe(false);
  });

  it('traduz o nome dos personagens conforme o idioma', async () => {
    const { bichittos } = await loadInProduction();
    const pt = bichittos.getBichitto('napcat', 'pt');
    const en = bichittos.getBichitto('napcat', 'en');
    expect(pt.chars.map((c) => c.name)).toContain('napcat pendurado');
    expect(en.chars.map((c) => c.name)).toContain('napcat hanging');
  });
});
