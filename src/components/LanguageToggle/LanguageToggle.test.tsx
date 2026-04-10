import { screen } from '@testing-library/react';
import { renderWithChakra as render } from '@/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { LanguageToggle } from './LanguageToggle';

vi.mock('next-intl', () => ({
  useLocale: () => 'pt-BR',
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

describe('LanguageToggle', () => {
  it('renders EN when locale is pt-BR', () => {
    render(<LanguageToggle currentPath="/" />);
    expect(screen.getByText('EN')).toBeInTheDocument();
  });
});
