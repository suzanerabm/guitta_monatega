import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { RegionDivider } from './RegionDivider';

const meta: Meta<typeof RegionDivider> = {
  title: 'Components/RegionDivider',
  component: RegionDivider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Horizontal banner that separates the main content of a kammara ' +
          'world from one of its sub-regions (e.g. triplec → malloc / mesh / ' +
          'sharp). Shows the region name in an oversized uppercase heading ' +
          'tinted by the region accent color, with an optional parent eyebrow ' +
          'label and a short tagline below.',
      },
    },
  },
  decorators: [
    (Story) => (
      <Box bg="#0a0a1a" minH="100vh" pt="4rem">
        <Story />
      </Box>
    ),
  ],
  argTypes: {
    color: { control: 'color' },
    name: { control: 'text' },
    parent: { control: 'text' },
    image: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof RegionDivider>;

export const Malloc: Story = {
  args: {
    parent: 'TRIPLEC',
    name: 'malloc',
    color: '#22c55e',
  },
};

export const Mesh: Story = {
  args: {
    parent: 'TRIPLEC',
    name: 'Mesh',
    color: '#94a3b8',
  },
};

export const Sharp: Story = {
  args: {
    parent: 'TRIPLEC',
    name: 'Sharp',
    color: '#f1f5f9',
  },
};

/** No parent eyebrow label above the name. */
export const WithoutParent: Story = {
  args: {
    name: 'Malloc',
    color: '#22c55e',
  },
};

/** Minimal: name + color only. */
export const MinimalNameOnly: Story = {
  args: {
    name: 'Malloc',
    color: '#22c55e',
  },
};

/** Background image behind the tinted gradient. */
export const WithBackgroundImage: Story = {
  args: {
    parent: 'TRIPLEC',
    name: 'Malloc',
    color: '#22c55e',
    image: '/imgs/kammara/triplec/_bg/1_neoForest.jpg',
  },
};
