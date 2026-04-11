import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { CharacterInfoPanel } from './CharacterInfoPanel';
import type { Character } from '@/data/characters/types';

const mockCharacter: Character = {
  match: "Erú'Rin",
  name: { pt: "Erú'Rin", en: "Erú'Rin" },
  species: { pt: "Shal'ún", en: "Shal'ún" },
  bio: {
    pt: 'Um dos Shal\'ún que cuidam das flores-lume em LUNN\'P1. Planta e protege a vegetação luminosa.',
    en: 'One of the Shal\'ún who tend to the flor-lume in LUNN\'P1. Plants and protects the luminous vegetation.',
  },
};

const meta: Meta<typeof CharacterInfoPanel> = {
  title: 'Components/CharacterInfoPanel',
  component: CharacterInfoPanel,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box position="relative" height="300px" bg="gray.900" p="4rem">
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CharacterInfoPanel>;

export const Default: Story = {
  args: {
    character: mockCharacter,
    locale: 'pt',
  },
};

export const English: Story = {
  args: {
    character: mockCharacter,
    locale: 'en',
  },
};

export const WithCloseButton: Story = {
  args: {
    character: mockCharacter,
    locale: 'pt',
    onClose: () => {},
  },
};

export const NoCharacter: Story = {
  args: {
    character: null,
    locale: 'pt',
  },
};

export const ShortBio: Story = {
  args: {
    character: {
      ...mockCharacter,
      bio: { pt: 'Guerreiro silencioso.', en: 'Silent warrior.' },
    },
    locale: 'pt',
  },
};
