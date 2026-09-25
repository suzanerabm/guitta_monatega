import type { Meta, StoryObj } from '@storybook/react';
import { NextIntlClientProvider } from 'next-intl';
import { CartProvider, CartTrigger } from './Cart';

const messages = {
  cart: {
    open: 'Abrir carrinho', title: 'Seu carrinho', close: 'Fechar carrinho', empty: 'Seu carrinho está vazio.',
    continueShopping: 'Continuar comprando', subtotal: 'Subtotal', shippingNotice: 'Frete calculado no checkout.',
    checkoutPreparing: 'Checkout em preparação', decrease: 'Diminuir {title}', increase: 'Aumentar {title}', remove: 'Remover {title}',
  },
};

const meta: Meta<typeof CartTrigger> = {
  title: 'Components/Cart',
  component: CartTrigger,
  decorators: [(Story) => (
    <NextIntlClientProvider locale="pt" messages={messages}>
      <CartProvider><Story /></CartProvider>
    </NextIntlClientProvider>
  )],
};

export default meta;
type Story = StoryObj<typeof CartTrigger>;
export const Empty: Story = {};
