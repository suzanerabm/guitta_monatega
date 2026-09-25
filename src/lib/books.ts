import { getArtBooks, getBichittoBooks, getKammaraBooks, type BookEditionConfig, type BookEntry } from '@/lib/visibility';
import type { BookVisualKey } from '@/theme/bookPages';
import {
  type BookEdition,
  type BookCollection,
  type BookLocale,
  type CatalogBook,
} from '@/lib/bookCatalog';

export {
  BOOK_FORMAT_ORDER,
  formatBookPrice,
  getBookFormats,
  getLowestBookPrice,
  isBookComingSoon,
} from '@/lib/bookCatalog';

export type {
  BookCollection,
  BookEdition,
  BookFacts,
  BookFormat,
  BookLocale,
  BookPrice,
  CatalogBook,
  PurchaseChannel,
} from '@/lib/bookCatalog';

interface BookDefinition {
  slug: string;
  collection: BookCollection;
  legacyIds: string[];
  contextPath: string;
  visualKey: BookVisualKey;
}

const BOOK_DEFINITIONS: BookDefinition[] = [
  { slug: 'napcat-coloring-book', collection: 'bichittos', legacyIds: ['color-pt', 'color-en'], contextPath: '/bichittos?bichitto=napcat', visualKey: 'napcat' },
  { slug: 'zeco-estacoes', collection: 'bichittos', legacyIds: ['zeco-estacoes-pt', 'zeco-estacoes-en'], contextPath: '/bichittos?bichitto=zeco', visualKey: 'zeco' },
  { slug: 'taylo-e-pitu-volume-1', collection: 'bichittos', legacyIds: ['star-hunter-pt', 'star-hunter-en'], contextPath: '/bichittos?bichitto=taylo', visualKey: 'taylo' },
  { slug: 'saga-orf-v-volume-1', collection: 'kammara', legacyIds: ['saga-orf-v-pt', 'saga-orf-v-en'], contextPath: '/kammara', visualKey: 'orfv' },
  { slug: 'mundos-imaginarios-coloring-book', collection: 'art', legacyIds: ['coloring-book-pt', 'coloring-book-en'], contextPath: '/art', visualKey: 'art' },
  { slug: 'saga-digg-volume-2', collection: 'kammara', legacyIds: ['saga-maelik-v-pt'], contextPath: '/kammara', visualKey: 'digg' },
];

function allLegacyBooks(locale: BookLocale): BookEntry[] {
  return [
    ...getArtBooks('art', locale), ...getKammaraBooks('kammara', locale),
    ...['napcat', 'zeco', 'taylo', 'cheiodebolinha', 'miscelania'].flatMap((id) => getBichittoBooks(id, locale)),
  ];
}

function normalizeUrl(value?: string): string | null {
  if (!value) return null;
  const url = value.trim();
  return /^(https?:)?\/\//i.test(url) || url.startsWith('/') ? url : `https://${url}`;
}

function resolveEdition(book: BookEntry, edition: BookEditionConfig): BookEdition {
  const purchaseChannel = edition.purchaseChannel ?? (edition.buyUrl || book.buy ? 'amazon' : 'comingSoon');
  return {
    id: `${book.id}-${edition.format}`,
    format: edition.format,
    purchaseChannel,
    url: normalizeUrl(edition.buyUrl) ?? (purchaseChannel === 'amazon' ? book.buy?.url ?? null : null),
    retailer: edition.buyLabel ?? (purchaseChannel === 'amazon' ? book.buy?.label ?? null : null),
    price: edition.price,
    facts: edition.facts,
  };
}

export function getBookSlug(legacyId: string): string | null {
  return BOOK_DEFINITIONS.find((definition) => definition.legacyIds.includes(legacyId))?.slug ?? null;
}

export function getBookDetails(legacyId: string, locale: BookLocale) {
  const slug = getBookSlug(legacyId);
  return slug
    ? {
        url: `/${locale}/books/${slug}`,
        label: locale === 'en' ? 'Discover the book' : 'Conheça o livro',
      }
    : null;
}

export function getCatalogBooks(locale: BookLocale): CatalogBook[] {
  const legacyBooks = allLegacyBooks(locale);
  return BOOK_DEFINITIONS.flatMap((definition) => {
    const matches = legacyBooks.filter((book) => definition.legacyIds.includes(book.id));
    const primary = matches[0];
    if (!primary?.description || !primary.contextTitle) return [];
    return [{
      slug: definition.slug, collection: definition.collection, contextPath: definition.contextPath,
      visualKey: definition.visualKey, title: primary.title, description: primary.description,
      cover: primary.cover, contextTitle: primary.contextTitle,
      editions: matches.flatMap((book) => {
        const editions = book.editions.length > 0
          ? book.editions
          : [{ format: 'paperback', purchaseChannel: book.buy ? 'amazon' : 'comingSoon' } as const];
        return editions.map((edition) => resolveEdition(book, edition));
      }),
    }];
  });
}

export function getCatalogBook(slug: string, locale: BookLocale): CatalogBook | null {
  return getCatalogBooks(locale).find((book) => book.slug === slug) ?? null;
}
export function getBookLocales(slug: string): BookLocale[] {
  return (['pt', 'en'] as const).filter((locale) => getCatalogBooks(locale).some((book) => book.slug === slug));
}
export function getAllBookSlugs(): string[] { return BOOK_DEFINITIONS.map((book) => book.slug); }
