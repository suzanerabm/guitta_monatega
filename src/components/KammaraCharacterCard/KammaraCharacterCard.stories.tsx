import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { KammaraCharacterCard } from './KammaraCharacterCard';

const meta: Meta<typeof KammaraCharacterCard> = {
  title: 'Kammara/KammaraCharacterCard',
  component: KammaraCharacterCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      // Portrait aspect ratio (taller than wide) — fits a standing character.
      <Box width="400px" height="680px" padding="1.5rem" display="flex">
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof KammaraCharacterCard>;

export const ErúRin: Story = {
  args: {
    name: "Erú'Rin",
    species: "Shal'ún",
    bio: "Um dos Shal'ún que cuidam das flores-lume em LUNN'P1. Planta e protege a vegetação luminosa que ilumina as quatro luas do planeta.",
    image: "/imgs/characters/kammara/lunnp1/Erú'Rin.png",
    worldName: "LUNN'P1",
    worldCrestGlyph: '⊙—⊹—⊙',
    color: '#00e676',
    darkColor: '#002e14',
    midColor: '#003d1a',
    attributes: [
      { glyph: '⊶⊹⊷', label: 'Protocolo', value: 'AURYN' },
      { glyph: '—•—', label: 'Afinidade', value: 'Água' },
    ],
    backImage: "/imgs/characters/kammara/lunnp1/Erú'Rin_costas.png",
    dorsalMeaning: "O glifo dorsal de Erú'Rin traduz o caminho de quem cuida das raízes que sustentam o mundo — quem planta a memória luminosa e guarda as flores-lume.",
  },
};

export const LúmEsha: Story = {
  args: {
    name: "Lúm'Esha",
    species: "Shal'ún",
    bio: "Guardiã das marés de memória. Conhece cada ciclo lunar e guia os rituais de dissolução na Lún'Rai.",
    image: "/imgs/characters/kammara/lunnp1/Lúm'Esha.png",
    worldName: "LUNN'P1",
    worldCrestGlyph: '⊙—⊹—⊙',
    color: '#00e676',
    darkColor: '#002e14',
    midColor: '#003d1a',
    attributes: [
      { glyph: '⊶⊹⊷', label: 'Protocolo', value: 'AURYN' },
      { glyph: '⊹', label: 'Guardiã', value: 'Lún\'Rai' },
    ],
  },
};
