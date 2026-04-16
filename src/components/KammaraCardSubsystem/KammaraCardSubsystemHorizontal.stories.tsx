import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { KammaraCardSubsystemHorizontal } from './KammaraCardSubsystemHorizontal';

const meta: Meta<typeof KammaraCardSubsystemHorizontal> = {
  title: 'Kammara/KammaraCardSubsystemHorizontal',
  component: KammaraCardSubsystemHorizontal,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <Box
        background="#050505"
        minH="100vh"
        padding={{ base: '25px', md: '2rem', xl: '3rem' }}
      >
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof KammaraCardSubsystemHorizontal>;

// Real scene image from /public so the variation C cinematic background
// has something to show. Every tab gets its own image so switching tabs
// exercises the crossfade.
const lunnp1Tabs = [
  {
    id: 'cultura',
    icon: '⊙',
    label: 'Cultura',
    title: 'Cultura',
    image: '/imgs/characters/kammara/lunnp1/_scenes/regiao_leste.jpg',
    imageAlt: 'Região Leste',
    content: (
      <>
        <h3>Sem hierarquia</h3>
        <p>Em LUNN&apos;P1, ninguém manda. Não existe governo, chefe ou votação. A vida acontece em pequenos núcleos autônomos, cada um com seu ritmo.</p>
        <h3>O dia a dia</h3>
        <p>A vida é feita de rituais pequenos: o Primeiro Reflexo ao acordar, a Primeira Fruta, o Silume coletivo. Tudo acontece em torno da água.</p>
        <h3>A transparência</h3>
        <p>Os Shal&apos;ún não competem, não acumulam, não mentem. A água revela tudo — ninguém pode esconder um pensamento denso por muito tempo.</p>
      </>
    ),
  },
  {
    id: 'flora',
    icon: '•',
    label: 'Flora & Fauna',
    title: 'Flora & Fauna',
    image: '/imgs/characters/kammara/lunnp1/_scenes/cena_com_frutas_flutuantes.jpg',
    imageAlt: 'Frutas flutuantes',
    content: (
      <>
        <h3>Sem predadores</h3>
        <p>Não existe fauna predatória em LUNN&apos;P1. Tudo coexiste sob a regência das quatro luas.</p>
        <h3>Os Lún&apos;Kai</h3>
        <p>Guias lumínicos — pequenos seres de luz viva que acompanham cada Shal&apos;ún desde o nascimento.</p>
      </>
    ),
  },
  {
    id: 'geografia',
    icon: '—',
    label: 'Geografia',
    title: 'Geografia',
    image: '/imgs/characters/kammara/lunnp1/_scenes/regiao_EXTERMO_NORTE.jpg',
    imageAlt: 'Extremo Norte',
    content: (
      <>
        <h3>Um mundo vivo</h3>
        <p>LUNN&apos;P1 não tem zonas secas, metálicas ou urbanas. Tudo é orgânico e luminoso. Cidades flutuantes ancoradas por raízes-lume, campos de flor-lume, marés vibracionais.</p>
      </>
    ),
  },
  {
    id: 'luas',
    icon: '⊶⊷',
    label: 'Ciclos & Luas',
    title: 'Ciclos & Luas',
    image: '/imgs/characters/kammara/lunnp1/_scenes/regiao_leste_aerea.jpg',
    imageAlt: 'Leste aérea',
    content: (
      <>
        <h3>Sem sol</h3>
        <p>O ritmo do planeta é regido por quatro luas. Cada uma dita um modo de existir: escuta, floresta, maré, mutação.</p>
      </>
    ),
  },
  {
    id: 'agua',
    icon: '⋄',
    label: 'A Água',
    title: "A Água — Lún'Rai",
    image: "/imgs/characters/kammara/lunnp1/_scenes/Erú'Rin_e_Lúm'Esha_plantando.jpg",
    imageAlt: "Plantando",
    content: (
      <>
        <h3>Não é só água</h3>
        <p>A Lún&apos;Rai funciona como o sistema nervoso do planeta — carrega memória, afeto e vibração entre todos os Shal&apos;ún.</p>
      </>
    ),
  },
];

const baseArgs = {
  name: "LUNN'P1",
  category: 'Subsistema',
  crestGlyph: '⊙—⊹—⊙',
  color: '#00e676',
  darkColor: '#002e14',
  tabs: lunnp1Tabs,
};

/**
 * Variation A — editorial header on top, image (16:9) + text side-by-side
 * below. The roulette floats over the top-left corner.
 */
export const VariantA_HeaderTop: Story = {
  args: {
    ...baseArgs,
    variant: 'A',
  },
};

/**
 * Variation C — cinematic. The active tab's image fills the card as a
 * background, and a translucent info panel floats over the right side.
 * Roulette sits mid-left as a "channel selector".
 */
export const VariantC_Cinematic: Story = {
  args: {
    ...baseArgs,
    variant: 'C',
  },
};
