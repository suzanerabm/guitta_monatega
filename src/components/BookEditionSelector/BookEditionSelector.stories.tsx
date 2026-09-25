import type { Meta, StoryObj } from '@storybook/react';
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

const meta: Meta<typeof BookEditionSelector> = {
  title: 'Components/BookEditionSelector',
  component: BookEditionSelector,
  tags: ['autodocs'],
  decorators: [(Story) => (
    <NextIntlClientProvider locale="pt" messages={cartMessages}>
      <CartProvider><Story /></CartProvider>
    </NextIntlClientProvider>
  )],
};

export default meta;
type Story = StoryObj<typeof BookEditionSelector>;

export const Default: Story = {
  args: {
    book: { slug: 'zeco', title: 'Zeco', cover: null },
    editions: [
      { id: 'ebook', format: 'ebook', purchaseChannel: 'amazon', url: '#ebook', retailer: 'Amazon.com', price: { amount: 4.98, currency: 'USD' } },
      { id: 'paperback', format: 'paperback', purchaseChannel: 'amazon', url: '#paperback', retailer: 'Amazon.com', price: { amount: 17.99, currency: 'USD' } },
      { id: 'hardcover', format: 'hardcover', purchaseChannel: 'amazon', url: '#hardcover', retailer: 'Amazon.com', price: { amount: 27.99, currency: 'USD' } },
    ],
    locale: 'pt',
    accentColor: 'orange',
    formatLabels: { ebook: 'Livro digital', paperback: 'Capa comum', hardcover: 'Capa dura' },
    factsLabels: {
      readingAge: 'Faixa etária', pageCount: 'Número de páginas', language: 'Idioma',
      dimensions: 'Dimensões', weight: 'Peso', fileSize: 'Tamanho do arquivo',
      publicationDate: 'Publicação', isbn: 'ISBN', pages: 'páginas',
    },
    buyLabel: 'Comprar',
    amazonBuyLabel: 'Comprar na Amazon',
    soonLabel: 'Em breve',
  },
};
