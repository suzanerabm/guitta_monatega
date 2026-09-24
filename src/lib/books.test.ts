import { describe, expect, it } from 'vitest';
import { getBookLocales, getBookSlug, getCatalogBook, getCatalogBooks } from './books';

describe('book catalog', () => {
  it('groups the legacy locale editions under one stable book slug', () => {
    expect(getBookSlug('zeco-estacoes-pt')).toBe('zeco-estacoes');
    expect(getBookSlug('zeco-estacoes-en')).toBe('zeco-estacoes');
  });

  it('returns localized catalog content and current sales links', () => {
    const book = getCatalogBook('zeco-estacoes', 'pt');
    expect(book?.title).toContain('Zeco nas Estações');
    expect(book?.editions[0].url).toBe('https://a.co/d/0fxxQVRy');
  });

  it('keeps locale-specific availability', () => {
    expect(getBookLocales('taylo-e-pitu-volume-1')).toEqual(['pt']);
    expect(getCatalogBooks('en').some((book) => book.slug === 'taylo-e-pitu-volume-1')).toBe(false);
  });
});

