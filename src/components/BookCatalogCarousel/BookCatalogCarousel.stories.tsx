import type { Meta, StoryObj } from '@storybook/react';
import { BookCatalogCarousel } from './BookCatalogCarousel';

const meta: Meta<typeof BookCatalogCarousel> = {
  title: 'Books/BookCatalogCarousel',
  component: BookCatalogCarousel,
};

export default meta;
type Story = StoryObj<typeof BookCatalogCarousel>;

export const Empty: Story = {
  args: {
    books: [], locale: 'pt', detailsLabel: 'Conheça o livro', fromPriceLabel: 'A partir de',
    formatLabels: { ebook: 'Livro digital', paperback: 'Capa comum', hardcover: 'Capa dura' },
    collectionLabels: { art: 'Arte', bichittos: 'Bichittos', kammara: 'Kammara' },
  },
};
