import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { BookPanel, type BookPanelBook } from './BookPanel';

const readable: BookPanelBook = {
  id: 'b1',
  image: '/img/b1.jpg',
  alt: 'Book One',
  label: 'Book One',
};

const buyable: BookPanelBook = {
  id: 'b2',
  alt: 'Book Two',
  label: 'Book Two',
  buy: { url: 'https://example.com', label: 'Compre na Amazon' },
};

const soon: BookPanelBook = {
  id: 'b3',
  alt: 'Book Three',
  label: 'Book Three',
  soon: true,
};

describe('BookPanel', () => {
  it('renders the book label', () => {
    renderWithChakra(
      <BookPanel book={readable} borderColor="#fff" textColor="#fff" />,
    );
    expect(screen.getByText('Book One')).toBeInTheDocument();
  });

  it('can hide the book label without hiding its cover', () => {
    renderWithChakra(
      <BookPanel book={readable} borderColor="#fff" textColor="#fff" showLabel={false} />,
    );
    expect(screen.queryByText('Book One')).not.toBeInTheDocument();
    expect(screen.getByAltText('Book One')).toBeInTheDocument();
  });

  it('renders the cover image when present', () => {
    renderWithChakra(
      <BookPanel book={readable} borderColor="#fff" textColor="#fff" />,
    );
    expect(screen.getByAltText('Book One')).toBeInTheDocument();
  });

  it('renders a buy link when book.buy is set', () => {
    renderWithChakra(
      <BookPanel book={buyable} borderColor="#fff" textColor="#fff" />,
    );
    const link = screen.getByRole('link', { name: /Compre na Amazon/ });
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('renders a read button and calls onRead when there is no buy link', () => {
    const onRead = vi.fn();
    renderWithChakra(
      <BookPanel
        book={readable}
        borderColor="#fff"
        textColor="#fff"
        onRead={onRead}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Ler história/ }));
    expect(onRead).toHaveBeenCalledWith('b1');
  });

  it('renders a "coming soon" pill (no buy link, no read button) when the book is "soon"', () => {
    renderWithChakra(
      <BookPanel book={soon} borderColor="#fff" textColor="#fff" />,
    );
    expect(screen.getByText('Em breve')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('uses a custom comingSoonLabel when provided', () => {
    renderWithChakra(
      <BookPanel
        book={soon}
        borderColor="#fff"
        textColor="#fff"
        comingSoonLabel="Coming soon"
      />,
    );
    expect(screen.getByText('Coming soon')).toBeInTheDocument();
  });

  it('renders an optional extra link', () => {
    renderWithChakra(
      <BookPanel
        book={{
          ...readable,
          extraLink: {
            url: '/pt/bichittos?bichitto=napcat',
            label: 'Conheça o mundo do Napcat',
            image: '/imgs/bichittos/napcat/napcat.png',
            imageAlt: 'Napcat',
          },
        }}
        borderColor="#fff"
        textColor="#fff"
      />,
    );
    expect(screen.getByRole('link', { name: /Conheça o mundo do Napcat/ })).toHaveAttribute(
      'href',
      '/pt/bichittos?bichitto=napcat',
    );
    expect(screen.getByAltText('Napcat')).toHaveAttribute(
      'src',
      '/imgs/bichittos/napcat/napcat.png',
    );
    expect(screen.getByTestId('book-extra-link-divider')).toBeInTheDocument();
  });
});
