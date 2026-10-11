import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { ConnectedCardFrame } from './ConnectedCardFrame';

const meta: Meta<typeof ConnectedCardFrame> = {
  title: 'Shared/ConnectedCardFrame',
  component: ConnectedCardFrame,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ConnectedCardFrame>;

export const Default: Story = {
  args: {
    colors: ['#00e676', '#ffb000', '#9b7cff', '#e84393'],
    negativeBackground: '#171447',
    children: ['One', 'Two', 'Three', 'Four'].map((label) => (
      <Box key={label} minHeight="12rem" display="grid" placeItems="center">
        {label}
      </Box>
    )),
  },
};
