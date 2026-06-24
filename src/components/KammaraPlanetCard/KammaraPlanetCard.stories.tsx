import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { KammaraPlanetCard } from './KammaraPlanetCard';
import { palettes } from '@/theme/palettes';
import { worldCrestGlyph } from '@/theme/kalunGlyphs';

const meta: Meta<typeof KammaraPlanetCard> = {
  title: 'Kammara/KammaraPlanetCard',
  component: KammaraPlanetCard,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', backgrounds: { default: 'dark' } },
  decorators: [
    (Story) => (
      <Box bg="darkBg" padding={{ base: '25px', md: '2rem', xl: '3rem' }} minH="100vh">
        <Story />
      </Box>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof KammaraPlanetCard>;

export const LunnP1: Story = {
  args: {
    id: 'lunnp1',
    name: "LUNN'P1",
    summary:
      "LUNN'P1 — o planeta onde tudo flui. Um mundo onde as quatro luas regem o tempo e a água cobre todo o planeta. Lar dos Shal'ún, os únicos seres naturalmente imunes a vírus em todo o universo.",
    image: '/imgs/kammara/lunnp1/_bg/regiao_norte.jpg',
    crestGlyph: worldCrestGlyph('lunnp1'),
    color: palettes.lunnp1.colors[0],
    darkColor: palettes.lunnp1.dark,
    badges: [
      { label: 'Habitantes', value: "Shal'ún" },
      { label: 'Idioma', value: 'Voz Kalún' },
      { label: 'Clima', value: 'Aquático' },
      { label: 'Energia', value: 'Luz' },
    ],
    onSelect: () => {},
  },
};

export const Orfv: Story = {
  args: {
    id: 'orfv',
    name: 'ORF-V',
    summary:
      'ORF-V — o planeta onde tudo conecta. Um mundo sem perfeição estrutural, onde quatro luas regem o tempo e a água nunca mente. Lar dos ElePHPants, os seres que sentem antes de pensar.',
    image: '/imgs/kammara/orfv/_bg/vista_longa_orf-v-gigapixel-cgi-6x.jpg',
    crestGlyph: worldCrestGlyph('orfv'),
    color: palettes.orfv.colors[0],
    darkColor: palettes.orfv.dark,
    badges: [
      { label: 'Habitantes', value: 'ElePHPants' },
      { label: 'Idioma', value: 'lanPHPe' },
      { label: 'Luas', value: '4' },
      { label: 'Clima', value: 'Ameno' },
    ],
    onSelect: () => {},
  },
};
