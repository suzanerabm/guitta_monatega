import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { KammaraDropsStrip } from './KammaraDropsStrip';
import { ModalProvider } from '@/components/Modal';
import { palettes } from '@/theme/palettes';

const meta: Meta<typeof KammaraDropsStrip> = {
  title: 'Kammara/KammaraDropsStrip',
  component: KammaraDropsStrip,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', backgrounds: { default: 'dark' } },
  decorators: [
    (Story) => (
      <ModalProvider>
        <Box bg="darkBg" p="xl">
          <Story />
        </Box>
      </ModalProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof KammaraDropsStrip>;

// Colors resolved the same way the page does (getWorldColors): ORF-V's accent
// is colors[0] (pink), but TripleC/malloc uses a custom pastel green accent
// (#8ce8a8) instead of its purple colors[0] — matching the live site.
const orfv = palettes.orfv;
const triplec = palettes.triplec;

export const OrfV: Story = {
  args: {
    sectionTitle: 'Drops · ORF-V',
    worldName: 'ORF-V',
    crestGlyph: '⊙',
    color: orfv.colors[0],
    darkColor: orfv.dark,
    drops: [
      {
        video: '/imgs/kammara/orfv/_videos/festa_orfv.mp4',
        poster: '/imgs/kammara/orfv/_videos/festa_orfv_poster.jpg',
        label: "Lüp'Nül Fest",
      },
      {
        video: '/imgs/kammara/orfv/_videos/festa_orfv.mp4',
        poster: '/imgs/kammara/orfv/_videos/festa_orfv_poster.jpg',
        label: 'A colheita',
      },
      {
        video: '/imgs/kammara/orfv/_videos/festa_orfv.mp4',
        poster: '/imgs/kammara/orfv/_videos/festa_orfv_poster.jpg',
        label: 'As pontes',
      },
    ],
  },
};

// Different world color (malloc / TripleC) — proves the accent drives the look.
export const Malloc: Story = {
  args: {
    sectionTitle: 'Drops · malloc',
    worldName: 'malloc',
    crestGlyph: '⊙',
    color: '#8ce8a8', // TripleC's custom pastel-green accent (not colors[0])
    darkColor: triplec.dark,
    drops: [
      {
        video: '/imgs/kammara/triplec/malloc/_videos/malloc_runnnin_mesh.mp4',
        poster: '/imgs/kammara/triplec/malloc/_videos/malloc_runnnin_mesh_poster.jpg',
        label: 'Correndo pra Mesh',
      },
    ],
  },
};
