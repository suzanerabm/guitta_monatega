import { screen } from '@testing-library/react';
import { renderWithChakra as render } from '@/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { Header } from './Header';

vi.mock('next-intl', () => ({
  useLocale: () => 'pt-BR',
}));
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));
vi.mock('@/hooks/useScrollHeader', () => ({
  useScrollHeader: () => ({ isCompact: false }),
}));

describe('Header', () => {
  it('renders site name', () => {
    render(<Header homePath="/" />);
    expect(screen.getByText('guitta')).toBeInTheDocument();
    expect(screen.getByText(/monatega/)).toBeInTheDocument();
  });

  it('links to home path', () => {
    render(<Header homePath="/en" />);
    const link = screen.getByRole('link', { name: /guitta/i });
    expect(link).toHaveAttribute('href', '/en');
  });
});
