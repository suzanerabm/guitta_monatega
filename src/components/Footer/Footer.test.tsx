import { screen } from '@testing-library/react';
import { renderWithChakra as render } from '@/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { Footer } from './Footer';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.ComponentProps<'a'>) => <a href={href} {...props}>{children}</a>,
}));

describe('Footer', () => {
  const baseProps = {
    aboutPath: '/about',
    aboutLabel: 'sobre guitta monatega',
    licensingPath: '/licensing-partnerships',
    licensingLabel: 'licenciamento e parcerias',
    privacyPath: '/privacy',
    privacyLabel: 'privacidade',
  };

  it('renders about, licensing and privacy links', () => {
    render(<Footer {...baseProps} />);
    expect(screen.getByText('sobre guitta monatega')).toBeInTheDocument();
    expect(screen.getByText('licenciamento e parcerias')).toBeInTheDocument();
    expect(screen.getByText('privacidade')).toBeInTheDocument();
  });

  it('links to the right paths', () => {
    render(<Footer {...baseProps} />);
    expect(screen.getByText('sobre guitta monatega').closest('a')).toHaveAttribute('href', '/about');
    expect(screen.getByText('licenciamento e parcerias').closest('a')).toHaveAttribute('href', '/licensing-partnerships');
    expect(screen.getByText('privacidade').closest('a')).toHaveAttribute('href', '/privacy');
  });

  it('places licensing immediately after privacy', () => {
    render(<Footer {...baseProps} />);
    expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '/about',
      '/privacy',
      '/licensing-partnerships',
    ]);
  });
});
