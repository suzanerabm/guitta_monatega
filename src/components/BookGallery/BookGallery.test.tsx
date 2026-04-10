import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { BookGallery, type BookCover } from './BookGallery';

const sample: BookCover[] = [
  { id: 'b1', alt: 'Book 1', label: 'Book One', image: '/img/b1.jpg' },
  { id: 'b2', alt: 'Book 2', label: 'Book Two' },
  { id: 'b3', alt: 'Book 3', label: 'Coming', soon: true },
];

describe('BookGallery', () => {
  it('renders title', () => {
    renderWithChakra(<BookGallery title="Lore Books" books={sample} />);
    expect(screen.getByRole('heading', { name: 'Lore Books' })).toBeInTheDocument();
  });

  it('renders all books', () => {
    renderWithChakra(<BookGallery title="t" books={sample} />);
    expect(screen.getByText('Book One')).toBeInTheDocument();
    expect(screen.getByText('Book Two')).toBeInTheDocument();
    expect(screen.getByText('Coming')).toBeInTheDocument();
  });

  it('renders placeholder when no image', () => {
    renderWithChakra(<BookGallery title="t" books={sample} />);
    expect(screen.getByTestId('book-b2-placeholder')).toBeInTheDocument();
  });

  it('renders SoonBadge overlay when soon=true', () => {
    renderWithChakra(<BookGallery title="t" books={sample} soonLabel="em breve" />);
    expect(screen.getByText('em breve')).toBeInTheDocument();
  });

  it('calls onBookClick when book clicked (not soon)', () => {
    const onClick = vi.fn();
    renderWithChakra(<BookGallery title="t" books={sample} onBookClick={onClick} />);
    fireEvent.click(screen.getByTestId('book-b1'));
    expect(onClick).toHaveBeenCalledWith('b1');
  });

  it('does not call onBookClick when soon book clicked', () => {
    const onClick = vi.fn();
    renderWithChakra(<BookGallery title="t" books={sample} onBookClick={onClick} />);
    fireEvent.click(screen.getByTestId('book-b3'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
