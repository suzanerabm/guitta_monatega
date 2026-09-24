import { screen } from '@testing-library/react';
import type { ComponentPropsWithoutRef } from 'react';
import { renderWithChakra as render } from '@/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { LanguageToggle } from './LanguageToggle';

// The component derives the locale from the URL via usePathname; `currentPath`
// (when given) overrides it, so the tests drive everything through that prop.
vi.mock('next/navigation', () => ({
  usePathname: () => '/pt',
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: ComponentPropsWithoutRef<'a'>) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('LanguageToggle', () => {
  it('shows EN and links to /en when on a pt path', () => {
    render(<LanguageToggle currentPath="/pt/" />);
    const link = screen.getByText('EN');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/en/');
  });

  it('shows PT and links to /pt when on an en path', () => {
    render(<LanguageToggle currentPath="/en/kammara" />);
    const link = screen.getByText('PT');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/pt/kammara');
  });
});
