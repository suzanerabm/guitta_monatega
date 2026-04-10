import type { Meta, StoryObj } from '@storybook/react';
import { BookGallery } from './BookGallery';

const meta: Meta<typeof BookGallery> = {
  title: 'Components/BookGallery',
  component: BookGallery,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BookGallery>;

// Real book covers
const napcatCover = '/imgs/books/napcat/adventures/cover.jpg';
const zecoCover = '/imgs/books/zeco/zeco-estacoes/cover.png';
const kammaraCover = '/imgs/books/kammara/saga-orf-v/cover.png';
const artCover = '/imgs/books/art/Coloring%20Book/cover.jpg';

export const SingleBook: Story = {
  args: {
    title: 'Em destaque',
    books: [{ id: 'a', image: napcatCover, alt: 'NapCat Adventures', label: 'NapCat Adventures' }],
  },
};

export const ThreeBooks: Story = {
  args: {
    title: 'Livros',
    books: [
      { id: 'napcat', image: napcatCover, alt: 'NapCat Adventures', label: 'NapCat Adventures' },
      { id: 'zeco', image: zecoCover, alt: 'Zeco Estações', label: 'Zeco Estações' },
      { id: 'kammara', image: kammaraCover, alt: 'Saga ORF-V', label: 'Saga ORF-V' },
    ],
  },
};

export const ManyBooks: Story = {
  args: {
    title: 'Biblioteca',
    books: [
      { id: 'napcat', image: napcatCover, alt: 'NapCat', label: 'NapCat Adventures' },
      { id: 'zeco', image: zecoCover, alt: 'Zeco', label: 'Zeco Estações' },
      { id: 'kammara', image: kammaraCover, alt: 'Kammara', label: 'Saga ORF-V' },
      { id: 'art', image: artCover, alt: 'Art', label: 'Coloring Book' },
      { id: 'soon-1', alt: 'soon', label: 'Em breve', soon: true },
      { id: 'soon-2', alt: 'soon', label: 'Em breve', soon: true },
    ],
  },
};

export const WithSoonVariant: Story = {
  args: {
    title: 'Próximos lançamentos',
    books: [
      { id: 'napcat', image: napcatCover, alt: 'NapCat', label: 'Disponível' },
      { id: 'soon', alt: 'soon', label: 'Em breve', soon: true },
    ],
  },
};
