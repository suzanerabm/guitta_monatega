import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { NextIntlClientProvider } from 'next-intl';
import { CartProvider } from '@/components/Cart';
import { BookEditionSelector } from './BookEditionSelector';

const cartMessages = {
  cart: {
    open: 'Abrir carrinho', title: 'Seu carrinho', close: 'Fechar carrinho', empty: 'Seu carrinho está vazio.',
    continueShopping: 'Continuar comprando', subtotal: 'Subtotal', shippingNotice: 'Frete calculado no checkout.',
    checkoutPreparing: 'Checkout em preparação', decrease: 'Diminuir {title}', increase: 'Aumentar {title}', remove: 'Remover {title}',
  },
};

function withCart(children: React.ReactNode) {
  return (
    <NextIntlClientProvider locale="pt" messages={cartMessages}>
      <CartProvider>{children}</CartProvider>
    </NextIntlClientProvider>
  );
}

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

describe('BookEditionSelector', () => {
  it('shows the information for the selected format', () => {
    renderWithChakra(
      withCart(<BookEditionSelector
        book={{ slug: 'zeco', title: 'Zeco', cover: null }}
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
      />),
    );

    expect(screen.getByRole('link', { name: 'Comprar na Amazon' })).toHaveAttribute('href', '/paperback');
    fireEvent.click(screen.getByRole('button', { name: /Livro digital/ }));
    expect(screen.getByRole('link', { name: 'Comprar na Amazon' })).toHaveAttribute('href', '/ebook');
  });

  it('keeps the store purchase button for physical PT-BR editions', () => {
    renderWithChakra(
      withCart(<BookEditionSelector
        book={{ slug: 'zeco', title: 'Zeco', cover: null }}
        editions={[
          { id: 'paperback', format: 'paperback', purchaseChannel: 'store', url: null, retailer: null, price: { amount: 69.90, currency: 'BRL' } },
        ]}
        locale="pt"
        accentColor="orange"
        formatLabels={{ ebook: 'Livro digital', paperback: 'Capa comum', hardcover: 'Capa dura' }}
        factsLabels={labels}
        buyLabel="Comprar"
        amazonBuyLabel="Comprar na Amazon"
        soonLabel="Em breve"
      />),
    );

    expect(screen.getByRole('button', { name: 'Comprar' })).toHaveAttribute('data-cart-action', 'add');
    expect(screen.queryByText('Em breve')).not.toBeInTheDocument();
  });
});
