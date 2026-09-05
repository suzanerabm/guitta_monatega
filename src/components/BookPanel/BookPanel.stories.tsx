import type { Meta, StoryObj } from '@storybook/react';
import { BookPanel } from './BookPanel';

const meta: Meta<typeof BookPanel> = {
  title: 'Components/BookPanel',
  component: BookPanel,
  tags: ['autodocs'],
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export default meta;
type Story = StoryObj<typeof BookPanel>;

const kammaraCover = '/imgs/books/kammara/saga-orf-v/cover.png';
const zecoCover = '/imgs/books/zeco/zeco-estacoes/cover.png';

export const ReadableBook: Story = {
  args: {
    title: 'Livros',
    borderColor: '#a78bfa',
    textColor: '#f5f0ff',
    book: {
      id: 'kammara-saga-orf-v',
      image: kammaraCover,
      alt: 'Saga em ORF-V',
      label: 'Saga em ORF-V',
      soon: false,
    },
  },
};

export const BuyableBook: Story = {
  args: {
    title: 'Livros',
    borderColor: '#f58020',
    textColor: '#fece95',
    book: {
      id: 'zeco-zeco-estacoes',
      image: zecoCover,
      alt: 'Zeco nas Estações',
      label: 'Zeco nas Estações',
      buy: { url: 'https://www.amazon.com.br', label: 'Compre na Amazon' },
    },
  },
};

export const SoonBook: Story = {
  args: {
    title: 'Livros',
    borderColor: '#a78bfa',
    textColor: '#f5f0ff',
    book: {
      id: 'kammara-saga-orf-v',
      image: kammaraCover,
      alt: 'Saga em ORF-V',
      label: 'Saga em ORF-V',
      soon: true,
    },
  },
};

export const NoCover: Story = {
  args: {
    title: 'Livros',
    borderColor: '#a78bfa',
    textColor: '#f5f0ff',
    book: {
      id: 'kammara-saga-orf-v',
      alt: 'Saga em ORF-V',
      label: 'Saga em ORF-V',
      soon: true,
    },
  },
};
