import type { Meta, StoryObj } from '@storybook/react';
import { BookEditionSelector } from './BookEditionSelector';

const meta: Meta<typeof BookEditionSelector> = {
  title: 'Components/BookEditionSelector',
  component: BookEditionSelector,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BookEditionSelector>;

export const Default: Story = {
  args: {
    editions: [
      { id: 'ebook', format: 'ebook', purchaseChannel: 'amazon', url: '#ebook', retailer: 'Amazon.com', price: { amount: 4.98, currency: 'USD' } },
      { id: 'paperback', format: 'paperback', purchaseChannel: 'amazon', url: '#paperback', retailer: 'Amazon.com', price: { amount: 17.99, currency: 'USD' } },
      { id: 'hardcover', format: 'hardcover', purchaseChannel: 'amazon', url: '#hardcover', retailer: 'Amazon.com', price: { amount: 27.99, currency: 'USD' } },
    ],
    bookTitle: 'Zeco nas Estações',
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
    preorderLabel: 'Pré-venda',
    preorderEmailSubject: 'Pré-venda — {title}',
    preorderEmailBody: 'Desejo comprar o livro "{title}", na edição {format}, e quero reservar 1 unidade.',
    soonLabel: 'Em breve',
  },
};
