import type { Meta, StoryObj } from '@storybook/react';
import { BookFacts } from './BookFacts';

const meta = {
  title: 'Books/BookFacts',
  component: BookFacts,
  args: {
    accentColor: 'orange',
    facts: {
      readingAge: '3–6 anos',
      pageCount: 58,
      language: 'Português',
      dimensions: '20,96 × 20,96 cm',
      publicationDate: '23 de setembro de 2026',
    },
    labels: {
      readingAge: 'Faixa etária',
      pageCount: 'Número de páginas',
      language: 'Idioma',
      dimensions: 'Dimensões',
      publicationDate: 'Publicação',
      isbn: 'ISBN',
      pages: 'páginas',
    },
  },
} satisfies Meta<typeof BookFacts>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
