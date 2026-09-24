import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { BookCatalogCard } from './BookCatalogCard';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('BookCatalogCard', () => {
  it('links the cover and details label to the book page', () => {
    renderWithChakra(
      <BookCatalogCard
        href="/pt/books/zeco-estacoes"
        title="Zeco nas Estações"
        collection="Bichittos"
        cover="/cover.jpg"
        detailsLabel="Conheça o livro"
        accentColor="orange"
        decoration="/character.png"
        editionLabels={['Livro digital', 'Capa comum', 'Capa dura']}
        priceLabel="A partir de US$ 4,98"
      />,
    );

    expect(screen.getByRole('heading', { name: 'Zeco nas Estações' })).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(2);
    expect(screen.getByAltText('Zeco nas Estações')).toHaveAttribute('src', '/cover.jpg');
    expect(screen.getByText('A partir de US$ 4,98')).toBeInTheDocument();
    expect(screen.getByText('Livro digital · Capa comum · Capa dura')).toBeInTheDocument();
  });
});
