import {
  getArtBooks,
  getBichittoBooks,
  getKammaraBooks,
  type BookEntry,
} from '@/lib/visibility';
import type { BookVisualKey } from '@/theme/bookPages';

export type BookLocale = 'pt' | 'en';
export type BookCollection = 'art' | 'bichittos' | 'kammara';
export type BookFormat = 'ebook' | 'paperback' | 'hardcover' | 'print';

interface BookDefinition {
  slug: string;
  collection: BookCollection;
  legacyIds: string[];
  contextPath: string;
  visualKey: BookVisualKey;
  descriptions: Partial<Record<BookLocale, string>>;
  contextTitles: Partial<Record<BookLocale, string>>;
  facts?: Partial<Record<BookLocale, BookFacts>>;
}

export interface BookFacts {
  readingAge?: string;
  pageCount?: number;
  language?: string;
  dimensions?: string;
  publicationDate?: string;
  isbn?: string;
}

export interface BookEdition {
  id: string;
  format: BookFormat;
  url: string | null;
  retailer: string | null;
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
  facts?: BookFacts;
}

const BOOK_DEFINITIONS: BookDefinition[] = [
  {
    slug: 'napcat-coloring-book',
    collection: 'bichittos',
    legacyIds: ['color-pt', 'color-en'],
    contextPath: '/bichittos?bichitto=napcat',
    visualKey: 'napcat',
    descriptions: {
      pt: 'Um livro para colorir inspirado no universo do NapCat, criado para transformar imaginação, personagens e afeto em momentos de criação.',
      en: 'A coloring book inspired by NapCat’s world, created to turn imagination, characters, and affection into moments of creativity.',
    },
    contextTitles: { pt: 'Conheça o NapCat', en: 'Discover NapCat' },
    facts: {
      pt: {
        readingAge: '3–6 anos',
        pageCount: 58,
        language: 'Português',
        dimensions: '20,96 × 20,96 cm',
        publicationDate: '23 de setembro de 2026',
      },
    },
  },
  {
    slug: 'zeco-estacoes',
    collection: 'bichittos',
    legacyIds: ['zeco-estacoes-pt', 'zeco-estacoes-en'],
    contextPath: '/bichittos?bichitto=zeco',
    visualKey: 'zeco',
    descriptions: {
      pt: 'Zeco e seus amigos atravessam as estações em uma história ilustrada sobre descobertas, encontros e as mudanças que chegam com cada novo ciclo.',
      en: 'Zeco and his friends travel through the seasons in an illustrated story about discovery, friendship, and the changes brought by every new cycle.',
    },
    contextTitles: { pt: 'Conheça Zeco e seus amigos', en: 'Discover Zeco and his friends' },
  },
  {
    slug: 'taylo-e-pitu-volume-1',
    collection: 'bichittos',
    legacyIds: ['star-hunter-pt', 'star-hunter-en'],
    contextPath: '/bichittos?bichitto=taylo',
    visualKey: 'taylo',
    descriptions: {
      pt: 'O primeiro volume das aventuras de Taylo e Pitu, uma história ilustrada sobre amizade, curiosidade e a coragem de seguir uma estrela.',
      en: 'The first volume of Taylo and Pitu’s adventures, an illustrated story about friendship, curiosity, and the courage to follow a star.',
    },
    contextTitles: { pt: 'Conheça Taylo e Pitu', en: 'Discover Taylo and Pitu' },
  },
  {
    slug: 'saga-orf-v-volume-1',
    collection: 'kammara',
    legacyIds: ['saga-orf-v-pt', 'saga-orf-v-en'],
    contextPath: '/kammara',
    visualKey: 'orfv',
    descriptions: {
      pt: 'Uma aventura ilustrada em Kammara, universo onde as invenções da humanidade continuaram evoluindo e cada planeta passou a viver sua própria história.',
      en: 'An illustrated adventure set in Kammara, a universe where humanity’s inventions kept evolving and every planet came to live its own story.',
    },
    contextTitles: { pt: 'Explore o universo Kammara', en: 'Explore the Kammara universe' },
  },
  {
    slug: 'mundos-imaginarios-coloring-book',
    collection: 'art',
    legacyIds: ['coloring-book-pt', 'coloring-book-en'],
    contextPath: '/art',
    visualKey: 'art',
    descriptions: {
      pt: 'Um livro de colorir que reúne mundos imaginários e ilustrações autorais de Guitta Monatega em páginas abertas à interpretação de cada leitor.',
      en: 'A coloring book that brings together imaginary worlds and original illustrations by Guitta Monatega in pages open to every reader’s interpretation.',
    },
    contextTitles: { pt: 'Conheça a arte de Guitta Monatega', en: 'Explore the art of Guitta Monatega' },
  },
  {
    slug: 'saga-digg-volume-2',
    collection: 'kammara',
    legacyIds: ['saga-maelik-v-pt'],
    contextPath: '/kammara',
    visualKey: 'digg',
    descriptions: {
      pt: 'O segundo volume da saga de Kammara amplia a jornada para Digg e para novas histórias desse universo em expansão.',
    },
    contextTitles: { pt: 'Explore o universo Kammara' },
  },
];

function allLegacyBooks(locale: BookLocale): BookEntry[] {
  return [
    ...getArtBooks('art', locale),
    ...getKammaraBooks('kammara', locale),
    ...['napcat', 'zeco', 'taylo', 'cheiodebolinha', 'miscelania'].flatMap(
      (id) => getBichittoBooks(id, locale),
    ),
  ];
}

export function getBookSlug(legacyId: string): string | null {
  return (
    BOOK_DEFINITIONS.find((definition) =>
      definition.legacyIds.includes(legacyId),
    )?.slug ?? null
  );
}

export function getCatalogBooks(locale: BookLocale): CatalogBook[] {
  const legacyBooks = allLegacyBooks(locale);

  return BOOK_DEFINITIONS.flatMap((definition) => {
    const matches = legacyBooks.filter((book) =>
      definition.legacyIds.includes(book.id),
    );
    const primary = matches[0];
    const description = definition.descriptions[locale];
    const contextTitle = definition.contextTitles[locale];
    if (!primary || !description || !contextTitle) return [];

    return [{
      slug: definition.slug,
      collection: definition.collection,
      contextPath: definition.contextPath,
      visualKey: definition.visualKey,
      title: primary.title,
      description,
      cover: primary.cover,
      editions: matches.map((book) => ({
        id: book.id,
        format: 'print' as const,
        url: book.buy?.url ?? null,
        retailer: book.buy?.label ?? null,
      })),
      contextTitle,
      facts: definition.facts?.[locale],
    }];
  });
}

export function getCatalogBook(
  slug: string,
  locale: BookLocale,
): CatalogBook | null {
  return getCatalogBooks(locale).find((book) => book.slug === slug) ?? null;
}

export function getBookLocales(slug: string): BookLocale[] {
  return (['pt', 'en'] as const).filter((locale) =>
    getCatalogBooks(locale).some((book) => book.slug === slug),
  );
}

export function getAllBookSlugs(): string[] {
  return BOOK_DEFINITIONS.map((book) => book.slug);
}
