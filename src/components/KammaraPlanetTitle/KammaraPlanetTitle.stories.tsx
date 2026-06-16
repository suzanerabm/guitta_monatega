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
      <Box width="960px" padding="2xl" bg="darkBg">
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
    category: 'Planeta',
    role: 'Imunidade',
    description:
      "LUNN'P1 — o planeta onde tudo flui. Um mundo onde as quatro luas regem o tempo. Lar dos Shal'ún, os únicos seres naturalmente imunes a vírus em todo o universo.",
    palette: 'lunnp1',
    crestGlyph: '⊙',
    declarer: 'planet',
  },
};

export const Eni4: Story = {
  args: {
    name: 'ENI4',
    category: 'Planeta',
    role: 'Diálogo-Código',
    description:
      'ENI4 — o planeta das máquinas-vivas. Circuitos orgânicos que respiram e sentem. Lar dos que aprenderam a dialogar com o código sem se perder nele.',
    palette: 'eni4',
    crestGlyph: '⊶',
    declarer: 'planet',
  },
};

export const Universe: Story = {
  args: {
    name: 'Kammara',
    category: 'Universo',
    role: 'Origem',
    description:
      'O universo Kammara (Kam\'Rin) — onde cada planeta é um subsistema, cada subsistema uma região de sentido. Tudo conectado pela água-memória que atravessa as fronteiras.',
    palette: 'kammara',
    crestGlyph: '⊹',
    declarer: 'universe',
  },
};
