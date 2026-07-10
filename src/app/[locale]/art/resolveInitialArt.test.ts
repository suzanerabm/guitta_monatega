import { describe, it, expect } from 'vitest';
import { resolveInitialArt } from './resolveInitialArt';

const ids = ['aquarela', 'digital', 'nanquim'];

describe('resolveInitialArt', () => {
  it('cai na primeira seção quando não há param', () => {
    expect(resolveInitialArt(null, ids)).toBe('aquarela');
    expect(resolveInitialArt(undefined, ids)).toBe('aquarela');
    expect(resolveInitialArt('', ids)).toBe('aquarela');
  });

  it('abre a seção nomeada no param', () => {
    expect(resolveInitialArt('digital', ids)).toBe('digital');
    expect(resolveInitialArt('nanquim', ids)).toBe('nanquim');
  });

  it('cai na primeira seção para id desconhecido', () => {
    expect(resolveInitialArt('inexistente', ids)).toBe('aquarela');
  });

  it('retorna string vazia quando não há seções', () => {
    expect(resolveInitialArt('digital', [])).toBe('');
  });
});
