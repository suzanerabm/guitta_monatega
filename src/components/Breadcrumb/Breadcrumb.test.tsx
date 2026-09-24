import { fireEvent, screen } from '@testing-library/react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { renderWithChakra as render } from '@/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { Breadcrumb } from './Breadcrumb';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: {
    children: ReactNode;
    href: string;
  } & AnchorHTMLAttributes<HTMLAnchorElement>) => <a href={href} {...props}>{children}</a>,
}));

const routerBack = vi.fn();
const routerPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: routerBack, push: routerPush }),
}));

describe('Breadcrumb', () => {
  it('renders items', () => {
    render(<Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Bichittos' }]} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Bichittos')).toBeInTheDocument();
  });

  it('uses the browser history for the back action', () => {
    window.history.pushState({}, '', '/pt/books/example');
    render(<Breadcrumb items={[{ label: 'Livros' }]} backLabel="voltar" />);

    fireEvent.click(screen.getByRole('button', { name: 'voltar' }));

    expect(routerBack).toHaveBeenCalledOnce();
  });
});
