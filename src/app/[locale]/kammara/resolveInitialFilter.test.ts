import { describe, it, expect } from 'vitest';
import { resolveInitialFilter } from './resolveInitialFilter';

const published = ['lunnp1', 'eni4', 'triplec', 'orfv'];

describe('resolveInitialFilter', () => {
  it('falls back to kammara when there is no param', () => {
    expect(resolveInitialFilter(null, published)).toBe('kammara');
    expect(resolveInitialFilter(undefined, published)).toBe('kammara');
    expect(resolveInitialFilter('', published)).toBe('kammara');
  });

  it('opens a published world named in the param', () => {
    expect(resolveInitialFilter('lunnp1', published)).toBe('lunnp1');
    expect(resolveInitialFilter('orfv', published)).toBe('orfv');
  });

  it('keeps kammara explicitly', () => {
    expect(resolveInitialFilter('kammara', published)).toBe('kammara');
  });

  it('falls back to kammara for an unknown or unpublished world', () => {
    expect(resolveInitialFilter('inexistente', published)).toBe('kammara');
    // gotto/z1 não estão na lista de publicados deste teste
    expect(resolveInitialFilter('gotto', published)).toBe('kammara');
  });
});
