import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { HomeBanner } from './HomeBanner';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('HomeBanner', () => {
  it('renders label, title, and description', () => {
    renderWithChakra(
      <HomeBanner
        href="/bichittos"
        label="serie"
        title="Bichittos"
        description="cute creatures"
        variant="bichittos"
      />
    );
    expect(screen.getByText('serie')).toBeInTheDocument();
    expect(screen.getByText('Bichittos')).toBeInTheDocument();
    expect(screen.getByText('cute creatures')).toBeInTheDocument();
  });

  it('links to href', () => {
    renderWithChakra(
      <HomeBanner
        href="/kammara"
        label="saga"
        title="Kammara"
        description="worlds"
        variant="kammara"
      />
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', '/kammara');
  });

  it('renders arte variant', () => {
    renderWithChakra(
      <HomeBanner
        href="/art"
        label="portfolio"
        title="Arte"
        description="paintings"
        variant="arte"
      />
    );
    expect(screen.getByText('Arte')).toBeInTheDocument();
  });
});
