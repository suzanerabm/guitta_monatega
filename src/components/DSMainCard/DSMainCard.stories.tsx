import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { DSMainCard } from './DSMainCard';

const meta: Meta<typeof DSMainCard> = {
  title: 'Components/DSMainCard',
  component: DSMainCard,
  decorators: [
    (Story) => (
      <Box bg="#0a0a1a" minH="100vh">
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DSMainCard>;

// Real characters from the napcat universe
const characters = [
  { image: '/imgs/bichittos/napcat/napcat-sonequinha.png', x: 55, y: 0, size: 360, zIndex: 2 },
  { image: '/imgs/bichittos/napcat/violeta.png', x: 82, y: 0, size: 350, zIndex: 1 },
];

const sampleText = (
  <>
    <h2>NapCat & Violeta</h2>
    <p>Um gato sonolento e sua amiga roxa, sempre juntos em suas pequenas aventuras.</p>
    <h3>Sobre eles</h3>
    <p>Vivem entre o sonho e o despertar.</p>
  </>
);

const napcatGradient = 'linear-gradient(135deg, #667eea, #764ba2, #fefdff)';

// Use render functions instead of passing JSX through args, to avoid
// circular reference errors when Storybook serializes args (Emotion adds
// __emotion_real refs that can't be JSON.stringified).

export const WithTextPanel: Story = {
  render: () => (
    <DSMainCard
      characters={characters}
      gradient={napcatGradient}
      titleColor="#4f0a42"
      textColor="#ddd4f4"
      text={sampleText}
    />
  ),
};

export const WithMascot: Story = {
  render: () => (
    <DSMainCard
      characters={characters}
      gradient={napcatGradient}
      titleColor="#4f0a42"
      textColor="#ddd4f4"
      text={sampleText}
      mascot={{
        image: '/imgs/bichittos/napcat/napcat.png',
        size: 120,
        offsetX: 8,
        offsetY: -40,
      }}
    />
  ),
};

export const StripSide: Story = {
  render: () => (
    <DSMainCard
      characters={characters}
      stripSide
      gradient={napcatGradient}
      titleColor="#4f0a42"
      textColor="#ddd4f4"
      text={sampleText}
    >
      <Box bg="rgba(255,255,255,0.1)" h="300px" borderRadius="md" />
    </DSMainCard>
  ),
};
