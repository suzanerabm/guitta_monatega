import type { Meta, StoryObj } from '@storybook/react';
import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { DSCard } from './DSCard';

const meta: Meta<typeof DSCard> = {
  title: 'Components/DSCard',
  component: DSCard,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof DSCard>;

export const Plain: Story = {
  render: () => (
    <DSCard p="3xl">
      <Flex gap="base">
        <Box flex="1" bg="surface" p="base" borderRadius="md">
          child 1
        </Box>
        <Box flex="1" bg="surface" p="base" borderRadius="md">
          child 2
        </Box>
        <Box flex="1" bg="surface" p="base" borderRadius="md">
          child 3
        </Box>
      </Flex>
    </DSCard>
  ),
};

const MockBanner = ({
  bg,
  title,
  subtitle,
}: {
  bg: string;
  title: string;
  subtitle: string;
}) => (
  <Flex
    direction="column"
    align="center"
    justify="center"
    bg={bg}
    color="white"
    h="60vh"
    textAlign="center"
    gap="base"
  >
    <Text textStyle="label" opacity={0.7}>
      {subtitle}
    </Text>
    <Heading fontSize="h1" fontWeight="bold" letterSpacing="heroTitle" textTransform="uppercase">
      {title}
    </Heading>
  </Flex>
);

export const Reveal: Story = {
  render: () => (
    <DSCard
      reveal={{
        left: {
          title: 'BICHITTOS',
          spineBg: '#1a1432',
          content: (
            <MockBanner bg="#2a1f4a" title="Bichittos" subtitle="série" />
          ),
        },
        right: {
          title: 'KAMMARA',
          spineBg: '#0a0a2e',
          content: (
            <MockBanner bg="#1a1a4e" title="Kammara" subtitle="saga" />
          ),
        },
      }}
    />
  ),
};
