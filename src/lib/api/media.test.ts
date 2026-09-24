import { describe, it, expect } from 'vitest';
import { absolutizeMedia } from './media';

// Sem `NEXT_PUBLIC_SITE_URL` no ambiente de teste, `SITE_URL` cai no domínio
// padrão — que é o que estas expectativas usam.
const SITE = 'https://guittamonatega.com';

describe('absolutizeMedia', () => {
  it('absolutiza caminho de mídia solto', () => {
    expect(absolutizeMedia('/imgs/a/b.png')).toBe(`${SITE}/imgs/a/b.png`);
  });

  it('não toca em caminho que não é de mídia', () => {
    expect(absolutizeMedia('/icons/kammara.svg')).toBe('/icons/kammara.svg');
    expect(absolutizeMedia('/pt/kammara')).toBe('/pt/kammara');
  });

  it('não toca em texto comum', () => {
    expect(absolutizeMedia('Nasceu em Ve’Lume')).toBe('Nasceu em Ve’Lume');
  });

  it('é idempotente — aplicar duas vezes não duplica o prefixo', () => {
    const once = absolutizeMedia('/imgs/a.png');
    expect(absolutizeMedia(once)).toBe(once);
  });

  it('desce em objetos e arrays aninhados', () => {
    const payload = {
      world: {
        bgImage: '/imgs/bg.jpg',
        characters: [{ image: '/imgs/c1.png', backImage: '/imgs/c1_back.png' }],
        drops: [{ video: '/imgs/v.mp4', poster: '/imgs/v.jpg', label: 'Cena' }],
      },
    };
    const out = absolutizeMedia(payload);
    expect(out.world.bgImage).toBe(`${SITE}/imgs/bg.jpg`);
    expect(out.world.characters[0].image).toBe(`${SITE}/imgs/c1.png`);
    expect(out.world.characters[0].backImage).toBe(`${SITE}/imgs/c1_back.png`);
    expect(out.world.drops[0].video).toBe(`${SITE}/imgs/v.mp4`);
    expect(out.world.drops[0].label).toBe('Cena');
  });

  it('preserva null, undefined, número e boolean', () => {
    const out = absolutizeMedia({ a: null, b: undefined, c: 3, d: true });
    expect(out).toEqual({ a: null, b: undefined, c: 3, d: true });
  });

  it('deixa passar URL que já é absoluta (é o caso do modo CDN)', () => {
    const cdn = 'https://cdn.exemplo.com/imgs/a.png';
    expect(absolutizeMedia(cdn)).toBe(cdn);
  });

  it('preserva o sufixo .mp4, de onde o player deriva o .webm', () => {
    const v = absolutizeMedia('/imgs/x/_videos/a.mp4');
    expect(v.endsWith('.mp4')).toBe(true);
  });
});
