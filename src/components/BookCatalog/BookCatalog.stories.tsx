import type { Meta, StoryObj } from '@storybook/react';
import { BookCatalog } from './BookCatalog';

const meta: Meta<typeof BookCatalog> = {
  title: 'Books/BookCatalog',
  component: BookCatalog,
};

export default meta;
type Story = StoryObj<typeof BookCatalog>;

export const Default: Story = {
  args: {
    locale: 'pt',
    books: [],
    labels: {
      filterLabel: 'Filtrar por formato', allFormats: 'Todos', fromPrice: 'A partir de', details: 'Conheça o livro',
      collections: { art: 'Arte', bichittos: 'Bichittos', kammara: 'Kammara' },
      formats: { ebook: 'Livro digital', paperback: 'Capa comum', hardcover: 'Capa dura' },
    },
  },
};
