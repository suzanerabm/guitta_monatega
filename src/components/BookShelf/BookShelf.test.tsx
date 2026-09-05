import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { BookShelf, type BookShelfEntry } from './BookShelf';

const entries: BookShelfEntry[] = [
  {
    book: { id: 'b1', alt: 'Book One', label: 'Book One' },
    borderColor: '#fff',
    textColor: '#fff',
    onRead: vi.fn(),
  },
  {
    book: { id: 'b2', alt: 'Book Two', label: 'Book Two' },
    borderColor: '#000',
    textColor: '#000',
    onRead: vi.fn(),
  },
];

describe('BookShelf', () => {
  it('renders every book in the shelf', () => {
    renderWithChakra(<BookShelf title="Livros" books={entries} />);
    expect(screen.getByText('Book One')).toBeInTheDocument();
    expect(screen.getByText('Book Two')).toBeInTheDocument();
  });

  it('renders the shared title on each card', () => {
    renderWithChakra(<BookShelf title="Livros" books={entries} />);
    const titles = screen.getAllByText('Livros');
    expect(titles).toHaveLength(2);
  });

  it('calls the correct book onRead when its read button is clicked', () => {
    renderWithChakra(<BookShelf title="Livros" books={entries} />);
    // Both books lack `buy`, so both render a "read" button — one per card.
    const readButtons = screen.getAllByRole('button', { name: /Ler história/ });
    expect(readButtons).toHaveLength(2);
    fireEvent.click(readButtons[0]);
    expect(entries[0].onRead).toHaveBeenCalledWith('b1');
    fireEvent.click(readButtons[1]);
    expect(entries[1].onRead).toHaveBeenCalledWith('b2');
  });

  it('scrolls with prev/next arrows present', () => {
    renderWithChakra(<BookShelf title="Livros" books={entries} data-testid="shelf" />);
    expect(screen.getByTestId('shelf-arrow-left')).toBeInTheDocument();
    expect(screen.getByTestId('shelf-arrow-right')).toBeInTheDocument();
  });
});
