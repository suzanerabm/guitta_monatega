import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { BookEditionSelector } from './BookEditionSelector';

const labels = {
  readingAge: 'Faixa etária',
  pageCount: 'Número de páginas',
  language: 'Idioma',
  dimensions: 'Dimensões',
  weight: 'Peso',
  fileSize: 'Tamanho do arquivo',
  publicationDate: 'Publicação',
  isbn: 'ISBN',
  pages: 'páginas',
};

const preorderProps = {
  bookTitle: 'Zeco nas Estações',
  editionFormatLabel: 'Formato',
  digitalFormatLabel: 'digital',
  preorderLabel: 'Eu quero o Zeco!',
  preorderEmailHint: 'Ao clicar, abriremos seu aplicativo de e-mail com a mensagem pronta. O site não coleta seus dados; o envio acontece pelo seu aplicativo de e-mail.',
  preorderEmailSubject: 'Pré-venda — {title}',
  preorderEmailBody: 'Desejo comprar o livro "{title}", na edição {format}, e quero reservar 1 unidade.',
};

describe('BookEditionSelector', () => {
  it('shows the information for the selected format', () => {
    renderWithChakra(
      <BookEditionSelector
        {...preorderProps}
        editions={[
          { id: 'ebook', format: 'ebook', purchaseChannel: 'amazon', url: '/ebook', retailer: 'Amazon', price: { amount: 4.98, currency: 'USD' } },
          { id: 'paperback', format: 'paperback', purchaseChannel: 'amazon', url: '/paperback', retailer: 'Amazon', price: { amount: 17.99, currency: 'USD' } },
        ]}
        locale="pt"
        accentColor="orange"
        formatLabels={{ ebook: 'Livro digital', paperback: 'Capa comum', hardcover: 'Capa dura' }}
        factsLabels={labels}
        buyLabel="Comprar"
        amazonBuyLabel="Comprar na Amazon"
        soonLabel="Em breve"
      />,
    );

    expect(screen.getByRole('link', { name: 'Comprar na Amazon' })).toHaveAttribute('href', '/paperback');
    fireEvent.click(screen.getByRole('button', { name: /Livro digital/ }));
    expect(screen.getByRole('link', { name: 'Comprar na Amazon' })).toHaveAttribute('href', '/ebook');
  });

  it('shows unavailable editions without a purchase action', () => {
    renderWithChakra(
      <BookEditionSelector
        {...preorderProps}
        editions={[
          { id: 'paperback', format: 'paperback', purchaseChannel: 'comingSoon', url: null, retailer: null, price: { amount: 69.90, currency: 'BRL' } },
        ]}
        locale="pt"
        accentColor="orange"
        formatLabels={{ ebook: 'Livro digital', paperback: 'Capa comum', hardcover: 'Capa dura' }}
        factsLabels={labels}
        buyLabel="Comprar"
        amazonBuyLabel="Comprar na Amazon"
        soonLabel="Em breve"
      />,
    );

    expect(screen.queryByRole('button', { name: 'Comprar' })).not.toBeInTheDocument();
    expect(screen.getByText('Em breve')).toBeInTheDocument();
  });

  it('opens a pre-filled email for a pre-order edition', () => {
    renderWithChakra(
      <BookEditionSelector
        {...preorderProps}
        editions={[
          { id: 'paperback', format: 'paperback', purchaseChannel: 'preorder', url: null, retailer: null, price: { amount: 69.90, currency: 'BRL' } },
        ]}
        locale="pt"
        accentColor="orange"
        formatLabels={{ ebook: 'Livro digital', paperback: 'Capa comum', hardcover: 'Capa dura' }}
        factsLabels={labels}
        buyLabel="Comprar"
        amazonBuyLabel="Comprar na Amazon"
        soonLabel="Em breve"
      />,
    );

    const link = screen.getByRole('link', { name: 'Eu quero o Zeco!' });
    expect(link).toHaveAttribute('href', expect.stringMatching(/^mailto:hello@guittamonategastudio\.com\?/));
    expect(screen.getByText(preorderProps.preorderEmailHint)).toBeInTheDocument();
    expect(decodeURIComponent(link.getAttribute('href') ?? '')).toContain('Zeco nas Estações');
    expect(decodeURIComponent(link.getAttribute('href') ?? '')).toContain('Capa comum');
    expect(decodeURIComponent(link.getAttribute('href') ?? '')).toContain('reservar 1 unidade');
  });

  it('shows Amazon links for the current and alternate language editions', () => {
    renderWithChakra(
      <BookEditionSelector
        {...preorderProps}
        editions={[
          {
            id: 'zeco-en-paperback-kdp',
            variantId: 'paperback-kdp',
            format: 'paperback',
            purchaseChannel: 'amazon',
            url: 'https://example.com/en',
            retailer: 'Amazon.com',
            price: { amount: 17.99, currency: 'USD' },
          },
        ]}
        alternateEditions={[
          {
            id: 'zeco-pt-paperback-kdp',
            variantId: 'paperback-kdp',
            format: 'paperback',
            purchaseChannel: 'amazon',
            url: 'https://example.com/pt',
            retailer: 'Amazon.com',
            price: { amount: 69.90, currency: 'BRL' },
          },
        ]}
        locale="en"
        accentColor="orange"
        formatLabels={{ ebook: 'Digital book', paperback: 'Paperback', hardcover: 'Hardcover' }}
        factsLabels={labels}
        buyLabel="Buy"
        amazonBuyLabel="Buy on Amazon"
        amazonVersionLabels={{
          en: '[English version]',
          pt: '[Portuguese version]',
        }}
        soonLabel="Coming soon"
      />,
    );

    expect(screen.getByRole('link', { name: 'Buy on Amazon [English version]' })).toHaveAttribute(
      'href',
      'https://example.com/en',
    );
    expect(screen.getByRole('link', { name: 'Buy on Amazon [Portuguese version]' })).toHaveAttribute(
      'href',
      'https://example.com/pt',
    );
  });

  it('shows the promotion name, calculated discount and crossed-out original price', () => {
    renderWithChakra(
      <BookEditionSelector
        {...preorderProps}
        editions={[
          {
            id: 'zeco-pt-paperback-monte-seu-livro',
            variantId: 'paperback-monte-seu-livro',
            format: 'paperback',
            purchaseChannel: 'preorder',
            url: null,
            retailer: null,
            price: { amount: 45, currency: 'BRL' },
            promotion: {
              name: 'Promoção de lançamento',
              originalPrice: { amount: 59.90, currency: 'BRL' },
            },
            facts: { dimensions: '16 × 23 cm' },
          },
        ]}
        locale="pt"
        accentColor="orange"
        formatLabels={{ ebook: 'Livro digital', paperback: 'Capa comum', hardcover: 'Capa dura' }}
        factsLabels={labels}
        buyLabel="Comprar"
        amazonBuyLabel="Comprar na Amazon"
        soonLabel="Em breve"
      />,
    );

    expect(
      screen.getAllByText('Promoção de lançamento'),
    ).toHaveLength(2);
    expect(screen.getAllByText(/59,90/)[0]).toHaveStyle({ textDecoration: 'line-through' });
    expect(screen.getAllByText(/45,00/)).toHaveLength(2);
  });

  it('distinguishes two editions with the same binding format', () => {
    renderWithChakra(
      <BookEditionSelector
        {...preorderProps}
        editions={[
          {
            id: 'paperback-small',
            format: 'paperback',
            label: 'Capa comum — menor',
            purchaseChannel: 'preorder',
            url: null,
            retailer: null,
            facts: { dimensions: '15 × 21 cm', weight: '240 g' },
          },
          {
            id: 'paperback-large',
            format: 'paperback',
            label: 'Capa comum — maior',
            purchaseChannel: 'preorder',
            url: null,
            retailer: null,
            facts: { dimensions: '21 × 28 cm', weight: '420 g' },
          },
        ]}
        locale="pt"
        accentColor="orange"
        formatLabels={{ ebook: 'Livro digital', paperback: 'Capa comum', hardcover: 'Capa dura' }}
        factsLabels={labels}
        buyLabel="Comprar"
        amazonBuyLabel="Comprar na Amazon"
        soonLabel="Em breve"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Formato 21 × 28 cm/ }));
    expect(screen.getAllByText('Capa comum')).toHaveLength(3);
    expect(screen.getByText('Formato 15 × 21 cm')).toBeInTheDocument();
    expect(screen.getByText('Formato 21 × 28 cm')).toBeInTheDocument();
    expect(screen.getByText('21 × 28 cm')).toBeInTheDocument();
    expect(screen.getByText('420 g')).toBeInTheDocument();
  });
});
