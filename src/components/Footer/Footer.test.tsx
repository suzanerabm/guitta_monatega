import { screen } from '@testing-library/react';
import { renderWithChakra as render } from '@/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { Footer } from './Footer';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

describe('Footer', () => {
  const baseProps = {
    aboutPath: '/about',
    aboutLabel: 'sobre guitta monatega',
    privacyPath: '/privacy',
    privacyLabel: 'privacidade',
  };

  it('renders about and privacy links', () => {
    render(<Footer {...baseProps} />);
    expect(screen.getByText('sobre guitta monatega')).toBeInTheDocument();
    expect(screen.getByText('privacidade')).toBeInTheDocument();
  });

  it('links to the right paths', () => {
    render(<Footer {...baseProps} />);
    expect(screen.getByText('sobre guitta monatega').closest('a')).toHaveAttribute('href', '/about');
    expect(screen.getByText('privacidade').closest('a')).toHaveAttribute('href', '/privacy');
  });
});
