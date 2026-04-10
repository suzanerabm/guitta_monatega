import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumb } from './Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Layout/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  args: { items: [{ label: 'Home', href: '/' }, { label: 'Bichittos' }] },
};

export const ThreeLevels: Story = {
  args: { items: [{ label: 'Home', href: '/' }, { label: 'Kammara', href: '/kammara' }, { label: "LUNN'P1" }] },
};
