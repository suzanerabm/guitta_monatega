import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { openApiDocument } from './openapi';

/**
 * O valor destes testes não é validar OpenAPI — é impedir que a documentação
 * envelheça em silêncio. Como o spec é escrito à mão, o risco real é alguém
 * criar ou remover uma rota e esquecer dele; o primeiro teste pega exatamente
 * isso, lendo as rotas do disco.
 */

const API_ROOT = path.resolve(process.cwd(), 'src/app/api/v1');

/** Descobre as rotas reais a partir dos `route.ts` em `src/app/api/v1`. */
function routesOnDisk(): string[] {
  const found: string[] = [];
  const walk = (dir: string, prefix: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // `[id]` no sistema de arquivos é `{id}` no OpenAPI.
        const seg = entry.name.replace(/^\[(.+)\]$/, '{$1}');
        walk(full, `${prefix}/${seg}`);
      } else if (entry.name === 'route.ts') {
        found.push(prefix || '/');
      }
    }
  };
  walk(API_ROOT, '');
  return found.sort();
}

describe('spec x rotas no disco', () => {
  it('documenta exatamente as rotas que existem', () => {
    const documented = Object.keys(openApiDocument.paths).sort();
    expect(routesOnDisk()).toEqual(documented);
  });

  it('toda rota documentada declara o método GET', () => {
    for (const [route, methods] of Object.entries(openApiDocument.paths)) {
      expect(Object.keys(methods), `rota ${route}`).toContain('get');
    }
  });
});

describe('forma do documento', () => {
  it('é OpenAPI 3.1 com info mínima', () => {
    expect(openApiDocument.openapi).toBe('3.1.0');
    expect(openApiDocument.info.title).toBeTruthy();
    expect(openApiDocument.info.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(openApiDocument.servers.length).toBeGreaterThan(0);
  });

  it('toda operação tem operationId único', () => {
    const ids = Object.values(openApiDocument.paths).flatMap((methods) =>
      Object.values(methods).map((op) => (op as { operationId: string }).operationId),
    );
    expect(ids.every(Boolean)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todo $ref aponta pra um schema que existe', () => {
    const schemas = openApiDocument.components.schemas as Record<string, unknown>;
    const refs = new Set<string>();
    const collect = (node: unknown) => {
      if (Array.isArray(node)) return node.forEach(collect);
      if (node && typeof node === 'object') {
        for (const [k, v] of Object.entries(node)) {
          if (k === '$ref' && typeof v === 'string') refs.add(v);
          else collect(v);
        }
      }
    };
    collect(openApiDocument);

    expect(refs.size).toBeGreaterThan(0);
    for (const ref of refs) {
      expect(ref.startsWith('#/components/schemas/'), ref).toBe(true);
      expect(schemas, ref).toHaveProperty(ref.replace('#/components/schemas/', ''));
    }
  });

  it('todo endpoint com parâmetro de path declara esse parâmetro', () => {
    for (const [route, methods] of Object.entries(openApiDocument.paths)) {
      const expected = [...route.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
      if (expected.length === 0) continue;
      for (const op of Object.values(methods)) {
        const declared = ((op as { parameters?: { name: string; in: string }[] }).parameters ?? [])
          .filter((p) => p.in === 'path')
          .map((p) => p.name);
        expect(declared.sort(), `rota ${route}`).toEqual(expected.sort());
      }
    }
  });

  it('não usa `nullable`, que é sintaxe do 3.0 e inválida no 3.1', () => {
    // No 3.1 o nulo entra no próprio `type` (`type: ['object', 'null']`).
    // Deixar `nullable: true` passa despercebido na leitura mas quebra
    // geradores de cliente.
    const walk = (node: unknown): boolean => {
      if (Array.isArray(node)) return node.some(walk);
      if (node && typeof node === 'object') {
        return Object.entries(node).some(([k, v]) => k === 'nullable' || walk(v));
      }
      return false;
    };
    expect(walk(openApiDocument)).toBe(false);
  });

  it('sobrevive a JSON.stringify — é o que a rota devolve', () => {
    const body = JSON.stringify(openApiDocument);
    expect(JSON.parse(body).openapi).toBe('3.1.0');
  });
});
