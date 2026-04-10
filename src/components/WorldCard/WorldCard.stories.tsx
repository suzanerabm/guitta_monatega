import type { Meta, StoryObj } from '@storybook/react';
import { WorldCard } from './WorldCard';

const meta: Meta<typeof WorldCard> = {
  title: 'Components/WorldCard',
  component: WorldCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof WorldCard>;

export const LunnP1: Story = {
  args: {
    tag: 'Planeta',
    name: "LUNN'P1",
    paletteName: 'lunnp1',
    children: 'A water world covered in shimmering oceans and green islands.',
  },
};

export const Eni4Side: Story = {
  args: {
    tag: 'Planeta',
    name: 'ENI-4',
    paletteName: 'eni4',
    stripLayout: 'side',
    children: 'A desert world bathed in gold and amber light.',
  },
};
