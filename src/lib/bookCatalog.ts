import type { BookVisualKey } from '@/theme/bookPages';

export type BookLocale = 'pt' | 'en';
export type BookCollection = 'art' | 'bichittos' | 'kammara';
export type BookFormat = 'ebook' | 'paperback' | 'hardcover';
export type PurchaseChannel = 'amazon' | 'external' | 'preorder' | 'comingSoon';

export const BOOK_FORMAT_ORDER: BookFormat[] = ['ebook', 'paperback', 'hardcover'];

export interface BookPrice {
  amount: number;
  currency: 'USD' | 'BRL';
}

export interface BookFacts {
  readingAge?: string;
  pageCount?: number;
  language?: string;
  dimensions?: string;
  weight?: string;
  fileSize?: string;
  publicationDate?: string;
  isbn?: string;
}

export interface BookEdition {
  id: string;
  format: BookFormat;
  purchaseChannel: PurchaseChannel;
  url: string | null;
  retailer: string | null;
  price?: BookPrice;
  facts?: BookFacts;
}

export interface CatalogBook {
  slug: string;
  collection: BookCollection;
  contextPath: string;
  visualKey: BookVisualKey;
  title: string;
  description: string;
  cover: string | null;
  editions: BookEdition[];
  contextTitle: string;
}

export function getBookFormats(book: CatalogBook): BookFormat[] {
  return BOOK_FORMAT_ORDER.filter((format) =>
    book.editions.some(
      (edition) => edition.format === format && edition.purchaseChannel !== 'comingSoon',
    ),
  );
}

export function isBookComingSoon(book: CatalogBook): boolean {
  return (
    book.editions.length > 0 &&
    book.editions.every((edition) => edition.purchaseChannel === 'comingSoon')
  );
}

export function getLowestBookPrice(book: CatalogBook): BookPrice | null {
  const prices = book.editions.flatMap((edition) =>
    edition.price ? [edition.price] : [],
  );
  return prices.length > 0
    ? prices.reduce((lowest, price) =>
        price.amount < lowest.amount ? price : lowest,
      )
    : null;
}

export function formatBookPrice(price: BookPrice, locale: BookLocale): string {
  return new Intl.NumberFormat(locale === 'pt' ? 'pt-BR' : 'en-US', {
    style: 'currency',
    currency: price.currency,
  }).format(price.amount);
}
