import type { Meta, StoryObj } from '@storybook/react';
import { BookCatalogCard } from './BookCatalogCard';

const meta: Meta<typeof BookCatalogCard> = {
  title: 'Components/BookCatalogCard',
  component: BookCatalogCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BookCatalogCard>;

export const Default: Story = {
  args: {
    href: '/pt/books/zeco-estacoes',
    title: 'Zeco nas Estações',
    collection: 'Bichittos',
    cover: '/imgs/books/zeco/zeco-estacoes/cover_ptbr1.jpg',
    detailsLabel: 'Conheça o livro',
  },
};

