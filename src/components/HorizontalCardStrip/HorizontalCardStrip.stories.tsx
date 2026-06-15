import type { Meta, StoryObj } from '@storybook/react';
import { Box, Heading, Text } from '@chakra-ui/react';
import { HorizontalCardStrip } from './HorizontalCardStrip';

const meta: Meta<typeof HorizontalCardStrip> = {
  title: 'Layout/HorizontalCardStrip',
  component: HorizontalCardStrip,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', backgrounds: { default: 'dark' } },
};

export default meta;
type Story = StoryObj<typeof HorizontalCardStrip>;

// A simple demo card so the story shows the strip mechanics without
// pulling in a real domain card. The caller owns the width.
function DemoCard({ n }: { n: number }) {
  return (
    <Box
      width={{ base: '85vw', md: '320px' }}
      maxW={{ base: '480px', md: 'none' }}
      height="220px"
      bg="rgba(0,0,0,0.3)"
      backdropFilter="blur(8px)"
      borderRadius="16px"
      outline="2px solid"
      outlineColor="#d4cbf0"
      outlineOffset="3px"
      padding="1.5rem"
      color="white"
    >
      <Heading as="h3" fontSize="1.4rem" fontFamily="body" m={0}>
        Card {n}
      </Heading>
      <Text mt="0.8rem" fontSize="0.9rem" opacity={0.85}>
        Conteúdo de exemplo do card {n}. Deslize na horizontal ou use as
        setas (desktop).
      </Text>
    </Box>
  );
}

export const Default: Story = {
  args: {
    arrowColor: '#d4cbf0',
    children: [1, 2, 3, 4, 5, 6].map((n) => <DemoCard key={n} n={n} />),
  },
};

export const FewCards: Story = {
  args: {
    arrowColor: '#d4cbf0',
    children: [1, 2].map((n) => <DemoCard key={n} n={n} />),
  },
};
