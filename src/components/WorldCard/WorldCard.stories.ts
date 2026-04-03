import type { Meta, StoryObj } from '@storybook/html';
import WorldCard from './WorldCard.astro';

const meta: Meta<typeof WorldCard> = {
  title: 'Components/WorldCard',
  component: WorldCard,
};
export default meta;
type Story = StoryObj<typeof WorldCard>;

export const LunnP1: Story = {
  args: {
    tag: 'Planeta',
    name: "LUNN'P1",
    gradientClass: 'wb-lunnp1',
    showDivider: true,
  },
};

export const TripleC: Story = {
  args: {
    tag: 'Estacao Espacial',
    name: 'TripleC',
    gradientClass: 'wb-triplec',
    showDivider: false,
  },
};
