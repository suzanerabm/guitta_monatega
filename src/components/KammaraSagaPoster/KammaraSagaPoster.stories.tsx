import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { KammaraSagaPoster } from './KammaraSagaPoster';

const meta: Meta<typeof KammaraSagaPoster> = {
  title: 'Kammara/KammaraSagaPoster',
  component: KammaraSagaPoster,
  tags: ['autodocs'],
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  decorators: [
    (Story) => (
      <Box width="420px" maxW="90vw" bg="darkBg" p="lg">
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof KammaraSagaPoster>;

export const Default: Story = {
  args: {
    background: '/imgs/kammara/orfv/_scenes/9noite_em_orfv.jpg',
  },
};

// Narrow container — proves the poster scales down intact (mobile behavior).
export const Narrow: Story = {
  args: { background: '/imgs/kammara/orfv/_scenes/9noite_em_orfv.jpg' },
  decorators: [
    (Story) => (
      <Box width="220px" bg="darkBg" p="md">
        <Story />
      </Box>
    ),
  ],
};
