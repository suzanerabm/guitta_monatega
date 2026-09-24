import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { BookFacts } from './BookFacts';

const labels = {
  readingAge: 'Faixa etária',
  pageCount: 'Número de páginas',
  language: 'Idioma',
  dimensions: 'Dimensões',
  weight: 'Peso',
  fileSize: 'Tamanho do arquivo',
  publicationDate: 'Publicação',
  isbn: 'ISBN',
  pages: 'páginas',
};

describe('BookFacts', () => {
  it('renders confirmed facts and omits missing ones', () => {
    renderWithChakra(
      <BookFacts
        facts={{ readingAge: '3–6 anos', pageCount: 58 }}
        labels={labels}
        accentColor="orange"
      />,
    );

    expect(screen.getByText('3–6 anos')).toBeInTheDocument();
    expect(screen.getByText('58 páginas')).toBeInTheDocument();
    expect(screen.queryByText('ISBN')).not.toBeInTheDocument();
  });
});
