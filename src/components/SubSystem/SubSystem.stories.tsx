import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { SubSystem } from './SubSystem';

const meta: Meta<typeof SubSystem> = {
  title: 'Components/SubSystem',
  component: SubSystem,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box bg="#0a0a1a" minH="100vh" pt="2rem">
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SubSystem>;

export const ThreeWithImages: Story = {
  args: {
    sectionTitle: 'Subsistemas',
    cards: [
      {
        title: 'Geografia',
        image: '/imgs/kammara/lunnp1/_subsystems/0.png',
        texts: ['Densas camadas de água doce.', 'Auroras visíveis da órbita.'],
      },
      {
        title: 'Cultura',
        image: '/imgs/kammara/lunnp1/_scenes/regiao_leste.jpg',
        texts: ['Sociedade matriarcal.', 'Música feita com plantas.'],
      },
      {
        title: 'Fauna',
        image: '/imgs/kammara/lunnp1/_scenes/cena_com_frutas_flutuantes.jpg',
        texts: ['Frutas que flutuam ao amadurecer.', 'Espécies bioluminescentes.'],
      },
    ],
  },
};

export const NoImages: Story = {
  args: {
    cards: [
      { title: 'Lore A', texts: ['Some lore text 1.'] },
      { title: 'Lore B', texts: ['Some lore text 2.'] },
      { title: 'Lore C', texts: ['Some lore text 3.'] },
    ],
  },
};

export const TintedOutline: Story = {
  args: {
    titleColor: '#00e86a',
    cards: [
      { title: 'Card 1', texts: ['Body 1'] },
      { title: 'Card 2', texts: ['Body 2'] },
      { title: 'Card 3', texts: ['Body 3'] },
    ],
  },
};
