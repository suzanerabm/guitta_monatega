import type { Meta, StoryObj } from '@storybook/react';
import { FilterBar } from './FilterBar';

const meta: Meta<typeof FilterBar> = {
  title: 'Components/FilterBar',
  component: FilterBar,
};

export default meta;
type Story = StoryObj<typeof FilterBar>;

export const Bichittos: Story = {
  args: {
    filters: [
      { id: 'napcat', label: 'NapCat', color: '#667eea' },
      { id: 'zeco', label: 'Zeco', color: '#ff8c42' },
      { id: 'taylo', label: 'Taylo', color: '#5d9466' },
      { id: 'miscelania', label: 'Miscelania', color: '#3a5a8c' },
    ],
    onFilter: (id) => console.log('Filter:', id),
  },
};
