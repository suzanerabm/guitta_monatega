import type { Meta, StoryObj } from '@storybook/react';
import { CreatureCard } from './CreatureCard';

const meta: Meta<typeof CreatureCard> = {
  title: 'Components/CreatureCard',
  component: CreatureCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CreatureCard>;

export const Default: Story = {
  args: {
    name: 'NapCat',
    children: 'A sleepy cat creature that loves to nap in sunbeams.',
  },
};

export const WithColors: Story = {
  args: {
    name: 'NapCat',
    children: 'A sleepy cat creature that loves to nap in sunbeams.',
    color1: '#667eea',
    color2: '#b5a2dc',
  },
};
