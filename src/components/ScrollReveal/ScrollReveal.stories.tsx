import type { Meta, StoryObj } from '@storybook/react';
import { Box, Heading, Text } from '@chakra-ui/react';
import { ScrollReveal } from './ScrollReveal';

const meta: Meta<typeof ScrollReveal> = {
  title: 'Components/ScrollReveal',
  component: ScrollReveal,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ScrollReveal>;

export const Default: Story = {
  render: () => (
    <Box p="xl">
      <Box h="80vh" />
      <ScrollReveal>
        <Box>
          <Heading>Revealed!</Heading>
          <Text>Scroll down to see me fade in.</Text>
        </Box>
      </ScrollReveal>
    </Box>
  ),
};
