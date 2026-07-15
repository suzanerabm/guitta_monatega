import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { KammaraSagaPosterCover } from './KammaraSagaPosterCover';

const meta: Meta<typeof KammaraSagaPosterCover> = {
  title: 'Kammara/KammaraSagaPosterCover',
  component: KammaraSagaPosterCover,
  tags: ['autodocs'],
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  decorators: [
    (Story) => (
      <Box width="400px" maxW="90vw" bg="darkBg" p="lg">
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof KammaraSagaPosterCover>;

export const Default: Story = {
  args: { background: '/imgs/kammara/orfv/_scenes/9noite_em_orfv.jpg' },
};
