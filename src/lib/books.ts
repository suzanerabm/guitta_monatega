import {
  getArtBooks,
  getBichittoBooks,
  getKammaraBooks,
  type BookEntry,
} from '@/lib/visibility';

export type BookLocale = 'pt' | 'en';
export type BookCollection = 'art' | 'bichittos' | 'kammara';
export type BookFormat = 'ebook' | 'paperback' | 'hardcover' | 'print';

interface BookDefinition {
  slug: string;
  collection: BookCollection;
  legacyIds: string[];
  contextPath: string;
  descriptions: Partial<Record<BookLocale, string>>;
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
  title: string;
  description: string;
  cover: string | null;
  editions: BookEdition[];
}

const BOOK_DEFINITIONS: BookDefinition[] = [
  {
    slug: 'napcat-coloring-book',
    collection: 'bichittos',
    legacyIds: ['color-pt', 'color-en'],
    contextPath: '/bichittos?bichitto=napcat',
    descriptions: {
      pt: 'Um livro para colorir inspirado no universo do NapCat, criado para transformar imaginação, personagens e afeto em momentos de criação.',
      en: 'A coloring book inspired by NapCat’s world, created to turn imagination, characters, and affection into moments of creativity.',
    },
  },
  {
    slug: 'zeco-estacoes',
    collection: 'bichittos',
    legacyIds: ['zeco-estacoes-pt', 'zeco-estacoes-en'],
    contextPath: '/bichittos?bichitto=zeco',
    descriptions: {
      pt: 'Zeco e seus amigos atravessam as estações em uma história ilustrada sobre descobertas, encontros e as mudanças que chegam com cada novo ciclo.',
      en: 'Zeco and his friends travel through the seasons in an illustrated story about discovery, friendship, and the changes brought by every new cycle.',
    },
  },
  {
    slug: 'taylo-e-pitu-volume-1',
    collection: 'bichittos',
    legacyIds: ['star-hunter-pt', 'star-hunter-en'],
    contextPath: '/bichittos?bichitto=taylo',
    descriptions: {
      pt: 'O primeiro volume das aventuras de Taylo e Pitu, uma história ilustrada sobre amizade, curiosidade e a coragem de seguir uma estrela.',
      en: 'The first volume of Taylo and Pitu’s adventures, an illustrated story about friendship, curiosity, and the courage to follow a star.',
    },
  },
  {
    slug: 'saga-orf-v-volume-1',
    collection: 'kammara',
    legacyIds: ['saga-orf-v-pt', 'saga-orf-v-en'],
    contextPath: '/kammara',
    descriptions: {
      pt: 'Uma aventura ilustrada em Kammara, universo onde as invenções da humanidade continuaram evoluindo e cada planeta passou a viver sua própria história.',
      en: 'An illustrated adventure set in Kammara, a universe where humanity’s inventions kept evolving and every planet came to live its own story.',
    },
  },
  {
    slug: 'mundos-imaginarios-coloring-book',
    collection: 'art',
    legacyIds: ['coloring-book-pt', 'coloring-book-en'],
    contextPath: '/art',
    descriptions: {
      pt: 'Um livro de colorir que reúne mundos imaginários e ilustrações autorais de Guitta Monatega em páginas abertas à interpretação de cada leitor.',
      en: 'A coloring book that brings together imaginary worlds and original illustrations by Guitta Monatega in pages open to every reader’s interpretation.',
    },
  },
  {
    slug: 'saga-digg-volume-2',
    collection: 'kammara',
    legacyIds: ['saga-maelik-v-pt'],
    contextPath: '/kammara',
    descriptions: {
      pt: 'O segundo volume da saga de Kammara amplia a jornada para Digg e para novas histórias desse universo em expansão.',
    },
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
    if (!primary || !description) return [];

    return [{
      slug: definition.slug,
      collection: definition.collection,
      contextPath: definition.contextPath,
      title: primary.title,
      description,
      cover: primary.cover,
      editions: matches.map((book) => ({
        id: book.id,
        format: 'print' as const,
        url: book.buy?.url ?? null,
        retailer: book.buy?.label ?? null,
      })),
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

