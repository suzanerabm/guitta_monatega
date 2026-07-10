import { describe, it, expect } from 'vitest';
import { resolveInitialBichitto } from './resolveInitialBichitto';

const published = ['napcat', 'zeco', 'taylo', 'cheiodebolinha', 'miscelania'];

describe('resolveInitialBichitto', () => {
  it('cai na primeira criatura publicada quando não há param', () => {
    expect(resolveInitialBichitto(null, published)).toBe('napcat');
    expect(resolveInitialBichitto(undefined, published)).toBe('napcat');
    expect(resolveInitialBichitto('', published)).toBe('napcat');
  });

  it('abre a criatura publicada nomeada no param', () => {
    expect(resolveInitialBichitto('zeco', published)).toBe('zeco');
    expect(resolveInitialBichitto('miscelania', published)).toBe('miscelania');
  });

  it('cai na primeira publicada para criatura desconhecida ou não-publicada', () => {
    expect(resolveInitialBichitto('inexistente', published)).toBe('napcat');
    expect(resolveInitialBichitto('zeco', ['napcat', 'taylo'])).toBe('napcat');
  });

  it('retorna string vazia quando não há criaturas publicadas', () => {
    expect(resolveInitialBichitto('napcat', [])).toBe('');
  });
});
