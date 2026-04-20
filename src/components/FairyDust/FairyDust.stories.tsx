import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { FairyDust } from './FairyDust';

const meta: Meta<typeof FairyDust> = {
  title: 'Components/FairyDust',
  component: FairyDust,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
};

export default meta;

type Story = StoryObj<typeof FairyDust>;

/** Default — Brisa's green-water hue. */
export const Brisa: Story = {
  render: (args) => (
    <Box position="relative" width="400px" height="500px" bg="#0a1410" borderRadius="md">
      <FairyDust {...args} />
    </Box>
  ),
  args: {
    color: '#7eeded',
  },
};

/** More sparkles, smaller size. */
export const Dense: Story = {
  render: (args) => (
    <Box position="relative" width="400px" height="500px" bg="#0a1410" borderRadius="md">
      <FairyDust {...args} />
    </Box>
  ),
  args: {
    color: '#7eeded',
    count: 35,
    size: 3,
  },
};

/** Larger, slower particles — feels like drifting light. */
export const Slow: Story = {
  render: (args) => (
    <Box position="relative" width="400px" height="500px" bg="#0a1410" borderRadius="md">
      <FairyDust {...args} />
    </Box>
  ),
  args: {
    color: '#7eeded',
    count: 10,
    size: 8,
    duration: 5,
  },
};
