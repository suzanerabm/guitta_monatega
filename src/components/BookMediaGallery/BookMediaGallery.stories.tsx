import type { Meta, StoryObj } from '@storybook/react';
import { BookMediaGallery } from './BookMediaGallery';

const meta: Meta<typeof BookMediaGallery> = {
  title: 'Books/BookMediaGallery',
  component: BookMediaGallery,
};

export default meta;
type Story = StoryObj<typeof BookMediaGallery>;

export const WithPhotosAndVideo: Story = {
  args: {
    cover: '/storybook/book-cover.jpg',
    bookTitle: 'Zeco nas Estações',
    items: [
      {
        id: 'photo-1',
        type: 'image',
        src: '/storybook/book-photo.jpg',
        alt: 'Livro aberto sobre uma mesa',
      },
      {
        id: 'video-1',
        type: 'video',
        src: '/storybook/book-video.mp4',
        poster: '/storybook/book-video-poster.jpg',
        alt: 'Vídeo mostrando o interior do livro',
      },
    ],
    accentColor: 'orange',
    frameColor: 'white',
    coverLabel: 'Capa',
    galleryLabel: 'Galeria do livro',
    videoFallback: 'Seu navegador não suporta vídeo.',
  },
};
