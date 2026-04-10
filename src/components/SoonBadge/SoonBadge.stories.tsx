import type { Meta, StoryObj } from '@storybook/react';
import { SoonBadge } from './SoonBadge';

const meta: Meta<typeof SoonBadge> = {
  title: 'Components/SoonBadge',
  component: SoonBadge,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SoonBadge>;

export const Default: Story = { args: { label: 'soon' } };
export const Overlay: Story = {
  args: { label: 'em breve', overlay: true },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: 200, height: 200, background: '#333' }}>
        <Story />
      </div>
    ),
  ],
};
