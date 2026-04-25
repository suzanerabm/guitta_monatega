import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { KammaraCard } from './KammaraCard';

const meta: Meta<typeof KammaraCard> = {
  title: 'Kammara/KammaraCard',
  component: KammaraCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <Box width="440px" height="660px" padding="1.5rem" display="flex">
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof KammaraCard>;

// Icons use the semantic Kalún glyph assignments defined in
// i18n pt.json → characters.kammara.lunnp1.subsystems["Os Glifos Kalún"]:
//   Cultura       → ⊙    (centro, foco)
//   Flora & Fauna → •    (semente, começo)
//   Geografia     → —    (fluxo, caminho)
//   Ciclos & Luas → ⊶⊷   (abertura e fechamento — ritmo)
//   A Água        → ⋄    (silêncio, pausa)
//   Idioma        → ⊹⊙⊹  (universo, linguagem)
//   Os Glifos Kalún → ⊹  (ancestral, memória)
const lunnp1Tabs = [
  {
    id: 'cultura',
    icon: '⊙',
    label: 'Cultura',
    title: 'Cultura',
    content: (
      <>
        <h3>Sem hierarquia</h3>
        <p>Em LUNN&apos;P1, ninguém manda. Não existe governo, chefe ou votação.</p>
        <h3>O dia a dia</h3>
        <p>A vida é feita de rituais pequenos: o Primeiro Reflexo ao acordar, a Primeira Fruta, o Silume coletivo.</p>
        <h3>A transparência</h3>
        <p>Os Shal&apos;ún não competem, não acumulam, não mentem. A água revela tudo.</p>
      </>
    ),
  },
  {
    id: 'flora',
    icon: '•',
    label: 'Flora & Fauna',
    title: 'Flora & Fauna',
    content: (
      <>
        <h3>Sem predadores</h3>
        <p>Não existe fauna predatória em LUNN&apos;P1. Tudo coexiste.</p>
        <h3>Os Lún&apos;Kai</h3>
        <p>Guias lumínicos — pequenos seres de luz viva.</p>
      </>
    ),
  },
  {
    id: 'geografia',
    icon: '—',
    label: 'Geografia',
    title: 'Geografia',
    content: (
      <>
        <h3>Um mundo vivo</h3>
        <p>LUNN&apos;P1 não tem zonas secas, metálicas ou urbanas. Tudo é orgânico e luminoso.</p>
      </>
    ),
  },
  {
    id: 'luas',
    icon: '⊶⊷',
    label: 'Ciclos & Luas',
    title: 'Ciclos & Luas',
    image: '/imgs/kammara/lunnp1/_subsystems/3.jpg',
    imageAlt: 'Quatro luas de LUNN\'P1',
    content: (
      <>
        <h3>Sem sol</h3>
        <p>O ritmo do planeta é regido por quatro luas.</p>
      </>
    ),
  },
  {
    id: 'agua',
    icon: '⋄',
    label: 'A Água',
    title: "A Água — Lún'Rai",
    content: (
      <>
        <h3>Não é só água</h3>
        <p>A Lún&apos;Rai funciona como o sistema nervoso do planeta.</p>
      </>
    ),
  },
  {
    id: 'idioma',
    icon: '⊹⊙⊹',
    label: 'Idioma',
    title: 'Idioma',
    content: (
      <>
        <h3>Três formas</h3>
        <p>A Voz Kalún, o Código-Lume e os Glifos.</p>
      </>
    ),
  },
  {
    id: 'glifos',
    icon: '⊹',
    label: 'Os Glifos Kalún',
    title: 'Os Glifos Kalún',
    content: (
      <>
        <h3>Os seis glifos base</h3>
        <p>⊶ partida · ⊷ chegada · ⊙ centro · ⊹ ancestral · • semente · — fluxo</p>
        <h3>O glifo dorsal</h3>
        <p>Cada Shal&apos;ún nasce com um glifo único marcado nas costas — uma impressão digital feita de luz.</p>
      </>
    ),
  },
];

export const Lunnp1: Story = {
  args: {
    name: "LUNN'P1",
    category: 'Planeta',
    subtitle: 'Lar dos Shal\'ún · Água · Imunidade',
    crestGlyph: '⊙',
    rarity: 4,
    color: '#00e676',
    darkColor: '#002e14',
    midColor: '#003d1a',
    tabs: lunnp1Tabs,
  },
};
