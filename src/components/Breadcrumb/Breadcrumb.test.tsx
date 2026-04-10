import { screen } from '@testing-library/react';
import { renderWithChakra as render } from '@/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { Breadcrumb } from './Breadcrumb';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

describe('Breadcrumb', () => {
  it('renders items', () => {
    render(<Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Bichittos' }]} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Bichittos')).toBeInTheDocument();
  });
});
