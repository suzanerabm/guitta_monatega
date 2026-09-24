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

  it('returns Taylo digital and paperback details independently', () => {
    const editions = getCatalogBook('taylo-e-pitu-volume-1', 'pt')?.editions;

    expect(editions?.map((edition) => edition.format)).toEqual(['ebook', 'paperback']);
    expect(editions?.map((edition) => edition.price?.amount)).toEqual([24.90, 49.90]);
    expect(editions?.every((edition) => edition.price?.currency === 'BRL')).toBe(true);
    expect(editions?.[0].facts).toMatchObject({ pageCount: 35, fileSize: '10,3 MB' });
    expect(editions?.[1].facts).toMatchObject({
      readingAge: '3–8 anos',
      pageCount: 36,
      dimensions: '15,24 × 0,23 × 22,86 cm',
    });
  });

  it('returns all Saga ORF-V formats with their own prices and dimensions', () => {
    const book = getCatalogBook('saga-orf-v-volume-1', 'pt');

    expect(book?.editions.map((edition) => edition.format)).toEqual([
      'ebook',
      'paperback',
      'hardcover',
    ]);
    expect(book?.editions.map((edition) => edition.price?.amount)).toEqual([
      29.90,
      99.90,
      139.90,
    ]);
    expect(book?.editions.map((edition) => edition.facts?.pageCount)).toEqual([
      151,
      144,
      144,
    ]);
    expect(book?.editions[2].facts?.dimensions).toBe('15,85 × 1,35 × 23,47 cm');
  });

  it('returns the confirmed Mundos Imaginários paperback details', () => {
    const book = getCatalogBook('mundos-imaginarios-coloring-book', 'pt');
    const edition = book?.editions[0];

    expect(edition?.format).toBe('paperback');
    expect(edition?.price).toEqual({ amount: 59.90, currency: 'BRL' });
    expect(edition?.facts).toMatchObject({
      pageCount: 114,
      dimensions: '21,59 × 0,66 × 21,59 cm',
      isbn: '979-8194078561',
    });
  });

  it('returns the confirmed Imaginary Worlds paperback details', () => {
    const edition = getCatalogBook('mundos-imaginarios-coloring-book', 'en')?.editions[0];

    expect(edition?.price?.amount).toBe(13.90);
    expect(edition?.facts).toMatchObject({
      pageCount: 114,
      language: 'English',
      dimensions: '8.5 × 0.26 × 8.5 in',
      publicationDate: 'September 24, 2026',
      isbn: '979-8175224666',
    });
  });
});
