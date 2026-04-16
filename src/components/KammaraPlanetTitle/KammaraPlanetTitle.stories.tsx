import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { KammaraPlanetTitle } from './KammaraPlanetTitle';

const meta: Meta<typeof KammaraPlanetTitle> = {
  title: 'Kammara/KammaraPlanetTitle',
  component: KammaraPlanetTitle,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <Box
        width="640px"
        padding="xl"
        background="linear-gradient(135deg, #002e14 0%, #003d1a 50%, #002e14 100%)"
        borderRadius="lg"
      >
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof KammaraPlanetTitle>;

export const Lunnp1: Story = {
  args: {
    name: "LUNN'P1",
    description:
      "LUNN'P1 — o planeta onde tudo flui. Um mundo sem sol, onde quatro luas regem o tempo e a água nunca mente. Lar dos Shal'ún, os únicos seres naturalmente imunes a vírus em todo o universo.",
    color: '#00e676',
    declarer: 'planet',
  },
};

export const Universe: Story = {
  args: {
    name: 'Kammara',
    description:
      'O universo onde tudo acontece. Cada planeta é um subsistema — cada subsistema, uma região de sentido.',
    color: '#9c88ff',
    declarer: 'universe',
  },
};
