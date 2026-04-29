import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { KammaraCharacterGallery } from './KammaraCharacterGallery';
import { KammaraCharacterCard } from '@/components/KammaraCharacterCard';
import type { KammaraCharacterCardProps } from '@/components/KammaraCharacterCard';

const meta: Meta<typeof KammaraCharacterGallery> = {
  title: 'Kammara/KammaraCharacterGallery',
  component: KammaraCharacterGallery,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <Box
        width="100%"
        maxWidth="1400px"
        mx="auto"
        padding={{ base: '1rem', md: '2rem' }}
        background="#050505"
        minH="100vh"
      >
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof KammaraCharacterGallery>;

// ---------------------------------------------------------------------------
// Mock data — uses what exists in /public/imgs/kammara/lunnp1.
// Repeats characters just so we have enough to paginate.
// ---------------------------------------------------------------------------

type Char = Omit<KammaraCharacterCardProps, 'color' | 'darkColor' | 'midColor' | 'worldName' | 'worldCrestGlyph'>;

const lunnp1Base = {
  worldName: "LUNN'P1",
  worldCrestGlyph: '⊙—⊹—⊙',
  color: '#00e676',
  darkColor: '#002e14',
  midColor: '#003d1a',
};

const lunnp1Chars: Char[] = [
  {
    name: "Erú'Rin",
    species: "Shal'ún",
    bio: "Um dos Shal'ún que cuidam das flores-lume em LUNN'P1. Planta e protege a vegetação luminosa que ilumina as quatro luas do planeta.",
    image: "/imgs/kammara/lunnp1/EruRin_230.png",
    attributes: [
      { glyph: '⊶⊹⊷', label: 'Protocolo', value: 'AURYN' },
      { glyph: '—•—', label: 'Afinidade', value: 'Água' },
    ],
    backImage: "/imgs/kammara/lunnp1/EruRin_costas1.png",
    dorsalMeaning: "O glifo dorsal de Erú'Rin traduz o caminho de quem cuida das raízes que sustentam o mundo.",
  },
  {
    name: "Lúm'Esha",
    species: "Shal'ún",
    bio: "Guardiã das marés de memória. Conhece cada ciclo lunar e guia os rituais de dissolução na Lún'Rai.",
    image: "/imgs/kammara/lunnp1/LumEsha.png",
    attributes: [
      { glyph: '⊶⊹⊷', label: 'Protocolo', value: 'AURYN' },
      { glyph: '⊹', label: 'Guardiã', value: "Lún'Rai" },
    ],
  },
  {
    name: "Brisa",
    species: "Shal'ún",
    bio: "Jovem Shal'ún que escuta o vento entre as cidades flutuantes. Sua risada acalma as marés nervosas.",
    image: "/imgs/kammara/lunnp1/brisa_sem_brilho.png",
    attributes: [
      { glyph: '⊶⊹⊷', label: 'Protocolo', value: 'AURYN' },
    ],
  },
  {
    name: "Túri'Kan",
    species: "Tartaruga vibracional",
    bio: "Os Túri'Kan atravessam as Naru'ei carregando Shal'ún e suas histórias. Silenciosos, firmes, antigos.",
    image: "/imgs/kammara/lunnp1/TuriKan.png",
    attributes: [
      { glyph: '—•—', label: 'Afinidade', value: 'Água' },
      { glyph: '⊹—⊙', label: 'Função', value: 'Transporte' },
    ],
  },
];

export const Lunnp1: Story = {
  render: () => (
    <KammaraCharacterGallery
      title="Habitantes de LUNN'P1"
      worldCrestGlyph={lunnp1Base.worldCrestGlyph}
      color={lunnp1Base.color}
      darkColor={lunnp1Base.darkColor}
      items={lunnp1Chars}
      renderCard={(char) => (
        <Box height={{ base: '620px', md: '680px' }}>
          <KammaraCharacterCard {...char} {...lunnp1Base} />
        </Box>
      )}
    />
  ),
};

// Many characters (repeats for pagination demo).
const manyChars: Char[] = [
  ...lunnp1Chars,
  ...lunnp1Chars.map((c) => ({ ...c, name: c.name + ' (II)' })),
  ...lunnp1Chars.slice(0, 2).map((c) => ({ ...c, name: c.name + ' (III)' })),
];

export const WithPagination: Story = {
  render: () => (
    <KammaraCharacterGallery
      title="Habitantes de LUNN'P1"
      worldCrestGlyph={lunnp1Base.worldCrestGlyph}
      color={lunnp1Base.color}
      darkColor={lunnp1Base.darkColor}
      items={manyChars}
      renderCard={(char) => (
        <Box height={{ base: '620px', md: '680px' }}>
          <KammaraCharacterCard {...char} {...lunnp1Base} />
        </Box>
      )}
    />
  ),
};

// 2 columns, larger cards.
export const TwoColumns: Story = {
  render: () => (
    <KammaraCharacterGallery
      title="Habitantes de LUNN'P1"
      worldCrestGlyph={lunnp1Base.worldCrestGlyph}
      color={lunnp1Base.color}
      darkColor={lunnp1Base.darkColor}
      items={lunnp1Chars}
      renderCard={(char) => (
        <Box height={{ base: '620px', md: '720px' }}>
          <KammaraCharacterCard {...char} {...lunnp1Base} />
        </Box>
      )}
    />
  ),
};
