import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import type { CatalogBook } from '@/lib/bookCatalog';
import { BookCatalog } from './BookCatalog';

const books: CatalogBook[] = [
  {
    slug: 'digital-book', collection: 'bichittos', contextPath: '/bichittos', visualKey: 'zeco',
    title: 'Digital', description: 'Description', cover: null, contextTitle: 'Zeco',
    editions: [{ id: 'digital', format: 'ebook', purchaseChannel: 'amazon', url: null, retailer: null, price: { amount: 4.98, currency: 'USD' } }],
  },
  {
    slug: 'paperback-book', collection: 'art', contextPath: '/art', visualKey: 'art',
    title: 'Print', description: 'Description', cover: null, contextTitle: 'Art',
    editions: [{ id: 'paperback', format: 'paperback', purchaseChannel: 'external', url: null, retailer: null }],
  },
];

const labels = {
  filterLabel: 'Filtrar por formato', allFormats: 'Todos', fromPrice: 'A partir de', details: 'Conheça o livro', comingSoon: 'Em breve',
  collections: { art: 'Arte', bichittos: 'Bichittos', kammara: 'Kammara' },
  formats: { ebook: 'Livro digital', paperback: 'Capa comum', hardcover: 'Capa dura' },
};

describe('BookCatalog', () => {
  it('filters books by available edition format', () => {
    renderWithChakra(<BookCatalog books={books} locale="pt" labels={labels} />);
    fireEvent.click(screen.getByRole('button', { name: 'Livro digital' }));
    expect(screen.getByRole('heading', { name: 'Digital' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Print' })).not.toBeInTheDocument();
  });
});
