import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { BookContextBanner } from './BookContextBanner';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

describe('BookContextBanner', () => {
  it('links the contextual callout and renders its title', () => {
    renderWithChakra(
      <BookContextBanner
        href="/pt/bichittos?bichitto=napcat"
        eyebrow="Bichittos"
        title="Conheça o NapCat"
        backgroundImage="/background.jpg"
        overlay="linear-gradient(blue, navy)"
        decorations={[{ src: '/napcat.png' }]}
        accentColor="orange"
      />,
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', '/pt/bichittos?bichitto=napcat');
    expect(screen.getByRole('heading', { name: 'Conheça o NapCat' })).toBeInTheDocument();
  });
});
