import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { OutlineActionLink } from './OutlineActionLink';

describe('OutlineActionLink', () => {
  it('renders an internal link with its label', () => {
    renderWithChakra(
      <OutlineActionLink href="/pt/books">Ver todos os livros</OutlineActionLink>,
    );

    expect(screen.getByRole('link', { name: 'Ver todos os livros' })).toHaveAttribute(
      'href',
      '/pt/books',
    );
  });
});
