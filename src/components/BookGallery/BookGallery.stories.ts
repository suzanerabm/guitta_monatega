import type { Meta, StoryObj } from '@storybook/html';
import BookGallery from './BookGallery.astro';

const meta: Meta<typeof BookGallery> = {
  title: 'Components/BookGallery',
  component: BookGallery,
};
export default meta;
type Story = StoryObj<typeof BookGallery>;

export const FourSeasons: Story = {
  args: {
    title: 'Livros - As 4 Estacoes',
    books: [
      { id: 'primavera', image: '/imgs/banners/cover_primavera.jpg', alt: 'Zeco na Primavera', label: 'Primavera' },
      { id: 'verao', image: '/imgs/banners/cover_verao.jpg', alt: 'Zeco no Verao', label: 'Verao' },
      { id: 'outono', image: '/imgs/banners/cover_outono.jpg', alt: 'Zeco no Outono', label: 'Outono' },
      { id: 'inverno', image: '/imgs/banners/cover_inverno.jpg', alt: 'Zeco no Inverno', label: 'Inverno' },
    ],
  },
};
