import type { Meta, StoryObj } from '@storybook/html';
import FilterBar from './FilterBar.astro';

const meta: Meta<typeof FilterBar> = {
  title: 'Components/FilterBar',
  component: FilterBar,
};
export default meta;
type Story = StoryObj<typeof FilterBar>;

export const Default: Story = {
  args: {
    filters: [
      { id: 'black', label: 'Branco no Preto' },
      { id: 'grafite', label: 'Grafite' },
      { id: 'doodle', label: 'Doodle' },
      { id: 'digital', label: 'Arte Digital' },
    ],
    allLabel: 'Todos',
  },
};

export const English: Story = {
  args: {
    filters: [
      { id: 'black', label: 'White on Black' },
      { id: 'grafite', label: 'Graphite' },
      { id: 'doodle', label: 'Doodle' },
      { id: 'digital', label: 'Digital Art' },
    ],
    allLabel: 'All',
  },
};
