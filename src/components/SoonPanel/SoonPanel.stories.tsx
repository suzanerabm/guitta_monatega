import type { Meta, StoryObj } from '@storybook/react';
import { SoonPanel } from './SoonPanel';

const meta: Meta<typeof SoonPanel> = {
  title: 'Components/SoonPanel',
  component: SoonPanel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SoonPanel>;

export const Default: Story = { args: { label: 'soon' } };
