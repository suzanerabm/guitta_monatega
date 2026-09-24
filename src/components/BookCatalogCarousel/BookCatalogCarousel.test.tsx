import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import type { CatalogBook } from '@/lib/books';
import { BookCatalogCarousel } from './BookCatalogCarousel';

const book: CatalogBook = {
  slug: 'zeco-estacoes', collection: 'bichittos', contextPath: '/bichittos', visualKey: 'zeco',
  title: 'Zeco', description: 'Description', cover: null, contextTitle: 'Zeco',
  editions: [{ id: 'ebook', format: 'ebook', purchaseChannel: 'amazon', url: null, retailer: null, price: { amount: 4.98, currency: 'USD' } }],
};

describe('BookCatalogCarousel', () => {
  it('uses catalog cards and links to the full catalog', () => {
    renderWithChakra(
      <BookCatalogCarousel
        books={[book]}
        locale="pt"
        detailsLabel="Conheça o livro"
        fromPriceLabel="A partir de"
        formatLabels={{ ebook: 'Livro digital', paperback: 'Capa comum', hardcover: 'Capa dura' }}
        collectionLabels={{ art: 'Arte', bichittos: 'Bichittos', kammara: 'Kammara' }}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Zeco' })).toBeInTheDocument();
    expect(screen.getByText(/A partir de US\$\s4,98/)).toBeInTheDocument();
  });
});
