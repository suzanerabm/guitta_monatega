import { screen } from '@testing-library/react';
import { renderWithChakra as render } from '@/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { Footer } from './Footer';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.ComponentProps<'a'>) => <a href={href} {...props}>{children}</a>,
}));

describe('Footer', () => {
  const baseProps = {
    followLabel: 'acompanhe',
    socialProfiles: [
      { name: 'Studio' },
      { name: 'Bichittos' },
      { name: 'Kammara' },
    ],
    aboutPath: '/about',
    aboutLabel: 'sobre guitta monatega',
    licensingPath: '/licensing-partnerships',
    licensingLabel: 'licenciamento e parcerias',
    privacyPath: '/privacy',
    privacyLabel: 'privacidade',
  };

  it('renders the three social identities', () => {
    render(<Footer {...baseProps} />);
    expect(screen.getByText('Studio')).toBeInTheDocument();
    expect(screen.getByText('Bichittos')).toBeInTheDocument();
    expect(screen.getByText('Kammara')).toBeInTheDocument();
  });

  it('activates only configured social links', () => {
    render(
      <Footer
        {...baseProps}
        socialProfiles={[
          {
            name: 'Studio',
            instagramUrl: 'https://www.instagram.com/studio',
            facebookUrl: 'https://www.facebook.com/studio',
          },
        ]}
      />,
    );
    expect(screen.getByRole('link', { name: 'Studio Instagram' })).toHaveAttribute(
      'href',
      'https://www.instagram.com/studio',
    );
    expect(screen.getByRole('link', { name: 'Studio Facebook' })).toHaveAttribute(
      'href',
      'https://www.facebook.com/studio',
    );
  });

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

  it('renders the version when provided', () => {
    render(<Footer {...baseProps} version="1.0.0" />);
    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
  });

  it('renders a decorative gradient line above the copyright', () => {
    const { container } = render(<Footer {...baseProps} copyright="© Guitta Monatega" />);
    const line = container.querySelector('[aria-hidden="true"]');
    const copyright = screen.getByText('© Guitta Monatega');

    expect(line).toBeInTheDocument();
    expect(line!.compareDocumentPosition(copyright) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('omits the version when not provided', () => {
    render(<Footer {...baseProps} />);
    expect(screen.queryByText(/^v\d/)).not.toBeInTheDocument();
  });
});
