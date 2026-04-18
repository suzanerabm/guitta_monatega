import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { ModalProvider, Modal, ModalKammara } from '@/components/Modal';
import { KammaraSceneCollage } from './KammaraSceneCollage';

const meta: Meta<typeof KammaraSceneCollage> = {
  title: 'Kammara/KammaraSceneCollage',
  component: KammaraSceneCollage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <ModalProvider>
        <Box
          background="#050505"
          minH="100vh"
          padding="2rem"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Story />
        </Box>
        <Modal />
        <ModalKammara />
      </ModalProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof KammaraSceneCollage>;

// Real LUNN'P1 scenes (first 5 for the Apple-style mosaic)
const lunnp1Scenes = [
  { name: 'Plantando', image: "/imgs/characters/kammara/lunnp1/_scenes/Erú'Rin_e_Lúm'Esha_plantando.jpg" },
  { name: 'Frutas Flutuantes', image: '/imgs/characters/kammara/lunnp1/_scenes/cena_com_frutas_flutuantes.jpg' },
  { name: 'Extremo Norte', image: '/imgs/characters/kammara/lunnp1/_scenes/regiao_EXTERMO_NORTE.jpg' },
  { name: 'Região Leste', image: '/imgs/characters/kammara/lunnp1/_scenes/regiao_leste.jpg' },
  { name: 'Leste Aérea', image: '/imgs/characters/kammara/lunnp1/_scenes/regiao_leste_aerea.jpg' },
];

/**
 * Default: bounded column (420x640) that mimics the DSMainCard stripSide
 * slot on desktop. The mosaic fills the whole area — hero tile on top,
 * two 4/2 and 2/4 rows below. Apple-style editorial rhythm.
 */
export const Default: Story = {
  render: () => (
    <Box width="420px" height="640px" outline="1px dashed #00e67640" borderRadius="20px" padding="0.5rem">
      <KammaraSceneCollage
        scenes={lunnp1Scenes}
        color="#00e676"
        darkColor="#002e14"
        crestGlyph="⊙"
        modalBg="linear-gradient(160deg, #001a0e 0%, #003d1a 40%, #002e14 100%)"
        modalTitle="LUNN'P1"
        modalSubtitle="Cenas do planeta-jardim"
      />
    </Box>
  ),
};

/** 3 scenes: top hero + two tiles in row 2. Last row is empty. */
export const ThreeScenes: Story = {
  render: () => (
    <Box width="420px" height="640px" outline="1px dashed #00e67640" borderRadius="20px" padding="0.5rem">
      <KammaraSceneCollage
        scenes={lunnp1Scenes.slice(0, 3)}
        color="#00e676"
      />
    </Box>
  ),
};

/** Narrower column to verify the mosaic still reads well. */
export const Narrow: Story = {
  render: () => (
    <Box width="360px" height="560px" outline="1px dashed #a78bfa40" borderRadius="20px" padding="0.5rem">
      <KammaraSceneCollage
        scenes={lunnp1Scenes}
        color="#a78bfa"
      />
    </Box>
  ),
};

/** Mobile viewport: the collage falls back to a vertical stack. */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    <Box width="100%" maxWidth="360px">
      <KammaraSceneCollage
        scenes={lunnp1Scenes}
        color="#00e676"
      />
    </Box>
  ),
};
