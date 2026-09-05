import type { Meta, StoryObj } from '@storybook/react';
import { BookShelf } from './BookShelf';

const meta: Meta<typeof BookShelf> = {
  title: 'Components/BookShelf',
  component: BookShelf,
  tags: ['autodocs'],
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export default meta;
type Story = StoryObj<typeof BookShelf>;

const kammaraCover = '/imgs/books/kammara/saga-orf-v/cover.png';
const zecoCover = '/imgs/books/zeco/zeco-estacoes/cover.png';

export const FewBooks: Story = {
  args: {
    title: 'Livros',
    books: [
      {
        book: { id: 'b1', image: kammaraCover, alt: 'Saga em ORF-V', label: 'Saga em ORF-V' },
        borderColor: '#a78bfa',
        textColor: '#f5f0ff',
      },
      {
        book: { id: 'b2', image: zecoCover, alt: 'Zeco nas Estações', label: 'Zeco nas Estações' },
        borderColor: '#f58020',
        textColor: '#fece95',
      },
    ],
  },
};

export const ManyBooks: Story = {
  args: {
    title: 'Livros',
    books: Array.from({ length: 10 }, (_, i) => ({
      book: {
        id: `book-${i}`,
        image: i % 2 === 0 ? kammaraCover : zecoCover,
        alt: `Livro ${i + 1}`,
        label: `Livro ${i + 1}`,
        soon: i % 3 === 0,
      },
      borderColor: i % 2 === 0 ? '#a78bfa' : '#f58020',
      textColor: i % 2 === 0 ? '#f5f0ff' : '#fece95',
    })),
  },
};
