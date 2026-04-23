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
    image: "/imgs/characters/kammara/lunnp1/EruRin_230.png",
    worldName: "LUNN'P1",
    worldCrestGlyph: '⊙—⊹—⊙',
    color: '#00e676',
    darkColor: '#002e14',
    midColor: '#003d1a',
    attributes: [
      { glyph: '⊶⊹⊷', label: 'Protocolo', value: 'AURYN' },
      { glyph: '—•—', label: 'Afinidade', value: 'Água' },
    ],
    backImage: "/imgs/characters/kammara/lunnp1/EruRin_costas1.png",
    dorsalMeaning: "O glifo dorsal de Erú'Rin traduz o caminho de quem cuida das raízes que sustentam o mundo — quem planta a memória luminosa e guarda as flores-lume.",
  },
};

export const LúmEsha: Story = {
  args: {
    name: "Lúm'Esha",
    species: "Shal'ún",
    bio: "Guardiã das marés de memória. Conhece cada ciclo lunar e guia os rituais de dissolução na Lún'Rai.",
    image: "/imgs/characters/kammara/lunnp1/LumEsha.png",
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

// Vírus — uses the flip as a DUAL-FORM reveal.
// Front: cute face the vírus shows to the world.
// Back:  corrupted/true form hidden underneath.
// Uses `backTitle` to repurpose the back face beyond "Costas".
export const Virus: Story = {
  args: {
    name: 'Vírus',
    species: 'ENI-4Δ',
    bio: 'Criaturas que nascem dos circuitos de ENI-4Δ. Na superfície, parecem inofensivas — quase fofas. Debaixo da casca, corrompem, consomem, se multiplicam.',
    image: '/imgs/characters/kammara/eni4/virus.png',
    worldName: 'ENI-4Δ',
    worldCrestGlyph: '⋄⊙⋄',
    color: '#e8a317',
    darkColor: '#1a1005',
    midColor: '#3a2a0a',
    attributes: [
      { glyph: '⋄⋄⊷', label: 'Protocolo', value: 'Ataque' },
      { glyph: '⋄•⋄', label: 'Natureza', value: 'Viral' },
    ],
    backImage: '/imgs/characters/kammara/eni4/virus.png',
    backTitle: 'Forma Corrompida',
    backMeaning: 'A face fofa é isca. Por trás dela, o vírus revela o que é de verdade: uma instrução faminta, sem afeto, que só existe para consumir ciclos alheios.',
  },
};
