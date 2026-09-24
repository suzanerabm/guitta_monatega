import { describe, it, expect } from 'vitest';
import { json, fail, notFound, readLocale } from './respond';

const req = (url: string, headers?: Record<string, string>) =>
  new Request(url, { headers });

describe('readLocale', () => {
  it('lê o locale da query', () => {
    expect(readLocale(req('http://x/api/v1/worlds?locale=en'))).toBe('en');
  });

  it('cai no padrão quando ausente ou inválido', () => {
    expect(readLocale(req('http://x/api/v1/worlds'))).toBe('pt');
    expect(readLocale(req('http://x/api/v1/worlds?locale=xx'))).toBe('pt');
    expect(readLocale(req('http://x/api/v1/worlds?locale='))).toBe('pt');
  });
});

describe('json', () => {
  it('devolve JSON com ETag e cache público', async () => {
    const r = json(req('http://x/a'), 'k1', () => ({ ok: true }));
    expect(r.status).toBe(200);
    expect(r.headers.get('content-type')).toContain('application/json');
    expect(r.headers.get('etag')).toMatch(/^W\/"/);
    expect(r.headers.get('cache-control')).toContain('s-maxage');
    expect(await r.json()).toEqual({ ok: true });
  });

  it('devolve 304 sem corpo quando o If-None-Match bate', async () => {
    const first = json(req('http://x/a'), 'k2', () => ({ ok: true }));
    const etag = first.headers.get('etag')!;
    const second = json(req('http://x/a', { 'if-none-match': etag }), 'k2', () => ({
      ok: true,
    }));
    expect(second.status).toBe(304);
    expect(await second.text()).toBe('');
    expect(second.headers.get('etag')).toBe(etag);
  });

  it('absolutiza os caminhos de mídia do payload', async () => {
    const r = json(req('http://x/a'), 'k3', () => ({ image: '/imgs/a.png' }));
    const body = (await r.json()) as { image: string };
    expect(body.image.startsWith('http')).toBe(true);
    expect(body.image.endsWith('/imgs/a.png')).toBe(true);
  });

  it('memoiza por chave — a segunda chamada não reconstrói o payload', async () => {
    let builds = 0;
    const build = () => {
      builds += 1;
      return { n: builds };
    };
    await json(req('http://x/a'), 'k4', build).json();
    const second = (await json(req('http://x/a'), 'k4', build).json()) as { n: number };
    expect(builds).toBe(1);
    expect(second.n).toBe(1);
  });

  it('chaves diferentes geram ETags diferentes', () => {
    const a = json(req('http://x/a'), 'k5:pt', () => ({ v: 'pt' }));
    const b = json(req('http://x/a'), 'k5:en', () => ({ v: 'en' }));
    expect(a.headers.get('etag')).not.toBe(b.headers.get('etag'));
  });
});

describe('erros', () => {
  it('fail devolve corpo padronizado e no-store', async () => {
    const r = fail(400, 'bad_request', 'inválido');
    expect(r.status).toBe(400);
    expect(r.headers.get('cache-control')).toBe('no-store');
    expect(await r.json()).toEqual({
      error: { code: 'bad_request', message: 'inválido' },
    });
  });

  it('notFound usa o mesmo formato', async () => {
    const r = notFound('Mundo', 'memphis');
    expect(r.status).toBe(404);
    const body = (await r.json()) as { error: { code: string; message: string } };
    expect(body.error.code).toBe('not_found');
    expect(body.error.message).toContain('memphis');
  });
});
