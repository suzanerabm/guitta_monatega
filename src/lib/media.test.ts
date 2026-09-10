import { describe, it, expect, afterEach, vi } from 'vitest';
import { mediaUrl, mediaUrls, mediaOrigin } from './media';

/**
 * `media.ts` lê a env em escopo de módulo (mesmo padrão do `visibility.ts`),
 * então testar o modo REMOTO exige recarregar o módulo com a env já definida.
 */
async function loadWithBase(base: string | undefined) {
  vi.resetModules();
  if (base === undefined) {
    vi.stubEnv('NEXT_PUBLIC_MEDIA_BASE_URL', '');
  } else {
    vi.stubEnv('NEXT_PUBLIC_MEDIA_BASE_URL', base);
  }
  return import('./media');
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('mediaUrl — modo local (default, sem env)', () => {
  it('devolve o path intacto', () => {
    expect(mediaUrl('/imgs/kammara/eni4/sereno.png')).toBe(
      '/imgs/kammara/eni4/sereno.png',
    );
  });

  it('não codifica espaços em modo local (o Next serve o arquivo cru)', () => {
    expect(mediaUrl('/imgs/books/art/Coloring Book/cover.jpg')).toBe(
      '/imgs/books/art/Coloring Book/cover.jpg',
    );
  });

  it('preserva null e undefined', () => {
    expect(mediaUrl(null)).toBeNull();
    expect(mediaUrl(undefined)).toBeUndefined();
  });

  it('mediaOrigin é null', () => {
    expect(mediaOrigin()).toBeNull();
  });
});

describe('mediaUrl — modo remoto', () => {
  it('prefixa paths de /imgs/', async () => {
    const { mediaUrl: url } = await loadWithBase('https://cdn.exemplo.com');
    expect(url('/imgs/kammara/eni4/sereno.png')).toBe(
      'https://cdn.exemplo.com/imgs/kammara/eni4/sereno.png',
    );
  });

  it('ignora barra sobrando no fim da base', async () => {
    const { mediaUrl: url } = await loadWithBase('https://cdn.exemplo.com///');
    expect(url('/imgs/a.png')).toBe('https://cdn.exemplo.com/imgs/a.png');
  });

  it('codifica espaço uma única vez (idempotente)', async () => {
    const { mediaUrl: url } = await loadWithBase('https://cdn.exemplo.com');
    const once = url('/imgs/books/art/Coloring Book/cover.jpg');
    expect(once).toBe(
      'https://cdn.exemplo.com/imgs/books/art/Coloring%20Book/cover.jpg',
    );
    // Reaplicar não deve gerar %2520.
    expect(url(once)).toBe(once);
  });

  it('não mexe em /icons (chrome de UI fica local)', async () => {
    const { mediaUrl: url } = await loadWithBase('https://cdn.exemplo.com');
    expect(url('/icons/kammara.svg')).toBe('/icons/kammara.svg');
  });

  it('não mexe em URLs já absolutas, data: e blob:', async () => {
    const { mediaUrl: url } = await loadWithBase('https://cdn.exemplo.com');
    expect(url('https://outro.com/imgs/a.png')).toBe(
      'https://outro.com/imgs/a.png',
    );
    expect(url('data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA');
    expect(url('blob:http://localhost/abc')).toBe('blob:http://localhost/abc');
  });

  it('preserva o sufixo .mp4 pro LazyVideo derivar o .webm', async () => {
    const { mediaUrl: url } = await loadWithBase('https://cdn.exemplo.com');
    const src = url('/imgs/kammara/eni4/_videos/palacio.mp4');
    expect(src.endsWith('.mp4')).toBe(true);
    expect(src.replace(/\.mp4$/, '.webm')).toBe(
      'https://cdn.exemplo.com/imgs/kammara/eni4/_videos/palacio.webm',
    );
  });

  it('não gera query string (o Modal deriva o label do nome do arquivo)', async () => {
    const { mediaUrl: url } = await loadWithBase('https://cdn.exemplo.com');
    expect(url('/imgs/a/b.png')).not.toContain('?');
  });

  it('mediaUrls mapeia arrays', async () => {
    const { mediaUrls: urls } = await loadWithBase('https://cdn.exemplo.com');
    expect(urls(['/imgs/a.png', '/imgs/b.png'])).toEqual([
      'https://cdn.exemplo.com/imgs/a.png',
      'https://cdn.exemplo.com/imgs/b.png',
    ]);
  });

  it('mediaOrigin devolve só a origem', async () => {
    const { mediaOrigin: origin } = await loadWithBase(
      'https://cdn.exemplo.com/qualquer/caminho',
    );
    expect(origin()).toBe('https://cdn.exemplo.com');
  });

  it('mediaOrigin devolve null se a base for inválida', async () => {
    const { mediaOrigin: origin } = await loadWithBase('nao-e-url');
    expect(origin()).toBeNull();
  });
});

describe('mediaUrls — modo local', () => {
  it('devolve o mesmo array', () => {
    const input = ['/imgs/a.png', '/imgs/b.png'];
    expect(mediaUrls(input)).toEqual(input);
  });
});
