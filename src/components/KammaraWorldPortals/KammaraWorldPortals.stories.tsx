import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { KammaraWorldPortals } from './KammaraWorldPortals';
import { palettes } from '@/theme/palettes';

const meta: Meta<typeof KammaraWorldPortals> = {
  title: 'Kammara/KammaraWorldPortals',
  component: KammaraWorldPortals,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', backgrounds: { default: 'dark' } },
  decorators: [
    (Story) => (
      <Box bg="darkBg" p="xl">
        <Story />
      </Box>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof KammaraWorldPortals>;

export const Default: Story = {
  args: {
    onSelect: () => {},
    portals: [
      { id: 'orfv', name: 'ORF-V', color: palettes.orfv.colors[0], darkColor: palettes.orfv.dark },
      { id: 'triplec', name: 'TripleC', color: '#8ce8a8', darkColor: palettes.triplec.dark },
      { id: 'lunnp1', name: "LUNN'P1", color: palettes.lunnp1.colors[0], darkColor: palettes.lunnp1.dark },
      { id: 'eni4', name: 'ENI-4Δ', color: palettes.eni4.colors[0], darkColor: palettes.eni4.dark },
    ],
  },
};
