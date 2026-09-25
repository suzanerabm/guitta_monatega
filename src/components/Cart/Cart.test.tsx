import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { CartProvider, CartTrigger, useCart } from './Cart';

const messages = {
  cart: {
    open: 'Abrir carrinho', title: 'Seu carrinho', close: 'Fechar carrinho', empty: 'Seu carrinho está vazio.',
    continueShopping: 'Continuar comprando', subtotal: 'Subtotal', shippingNotice: 'Frete calculado no checkout.',
    checkoutPreparing: 'Checkout em preparação', decrease: 'Diminuir {title}', increase: 'Aumentar {title}', remove: 'Remover {title}',
  },
};

function AddProduct() {
  const { addItem } = useCart();
  return (
    <button type="button" onClick={() => addItem({
      editionId: 'zeco-paperback', slug: 'zeco', title: 'Zeco', format: 'Capa comum', cover: null,
      price: { amount: 69.9, currency: 'BRL' },
    })}>
      Adicionar
    </button>
  );
}

function renderCart() {
  return renderWithChakra(
    <NextIntlClientProvider locale="pt" messages={messages}>
      <CartProvider><CartTrigger /><AddProduct /></CartProvider>
    </NextIntlClientProvider>,
  );
}

describe('Cart', () => {
  it('opens empty cart from the header trigger', async () => {
    renderCart();
    await userEvent.click(screen.getByRole('button', { name: 'Abrir carrinho' }));
    expect(screen.getByRole('dialog', { name: 'Seu carrinho' })).toBeInTheDocument();
    expect(screen.getByText('Seu carrinho está vazio.')).toBeInTheDocument();
  });

  it('adds a product and updates its quantity', async () => {
    renderCart();
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(screen.getByText('Zeco')).toBeInTheDocument();
    expect(screen.getAllByText(/69,90/)).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Diminuir Zeco' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Aumentar Zeco' }));
    expect(screen.getAllByText('2')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Diminuir Zeco' })).toBeEnabled();
    await userEvent.click(screen.getByRole('button', { name: 'Remover Zeco — Capa comum' }));
    expect(screen.getByText('Seu carrinho está vazio.')).toBeInTheDocument();
  });
});
