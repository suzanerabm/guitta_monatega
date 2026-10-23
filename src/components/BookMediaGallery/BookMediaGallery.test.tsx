import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { BookMediaGallery } from './BookMediaGallery';

const props = {
  cover: '/cover.jpg',
  bookTitle: 'Zeco nas Estações',
  accentColor: 'orange',
  frameColor: 'white',
  coverLabel: 'Capa',
  galleryLabel: 'Galeria do livro',
  videoFallback: 'Seu navegador não suporta vídeo.',
};

describe('BookMediaGallery', () => {
  it('shows only the cover when the gallery is empty', () => {
    renderWithChakra(<BookMediaGallery {...props} items={[]} />);

    expect(screen.getByRole('img', { name: 'Capa: Zeco nas Estações' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Galeria do livro')).not.toBeInTheDocument();
  });

  it('switches from the cover to a gallery photo', () => {
    renderWithChakra(
      <BookMediaGallery
        {...props}
        items={[{
          id: 'open-book',
          type: 'image',
          src: '/open-book.jpg',
          alt: 'Livro aberto',
        }]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Livro aberto' }));
    expect(screen.getByRole('img', { name: 'Livro aberto' })).toHaveAttribute('src', '/open-book.jpg');
  });

  it('renders a selected video with controls and poster', () => {
    renderWithChakra(
      <BookMediaGallery
        {...props}
        items={[{
          id: 'book-video',
          type: 'video',
          src: '/book.mp4',
          poster: '/poster.jpg',
          alt: 'Vídeo do livro',
        }]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Vídeo do livro' }));
    const video = screen
      .getAllByLabelText('Vídeo do livro')
      .find((element) => element.tagName === 'VIDEO');
    expect(video).toHaveAttribute('controls');
    expect(video).toHaveAttribute('poster', '/poster.jpg');
  });
});
