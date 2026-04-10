import { screen } from '@testing-library/react';
import { renderWithChakra as render } from '@/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { Footer } from './Footer';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

describe('Footer', () => {
  it('renders about link', () => {
    render(<Footer aboutPath="/about" aboutLabel="sobre guitta monatega" />);
    expect(screen.getByText('sobre guitta monatega')).toBeInTheDocument();
  });

  it('links to about path', () => {
    render(<Footer aboutPath="/about" aboutLabel="about" />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/about');
  });
});
