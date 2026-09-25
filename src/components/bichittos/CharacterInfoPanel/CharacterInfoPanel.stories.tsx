import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { CharacterInfoPanel } from './CharacterInfoPanel';
import type { CharacterInfo } from './CharacterInfoPanel';

// O painel recebe texto já resolvido para um idioma — quem escolhe pt/en é a
// camada de conteúdo, no servidor.
const eruRinPt: CharacterInfo = {
  name: "Erú'Rin",
  species: "Shal'ún",
  bio: "Um dos Shal'ún que cuidam das flores-lume em LUNN'P1. Planta e protege a vegetação luminosa.",
};

const eruRinEn: CharacterInfo = {
  name: "Erú'Rin",
  species: "Shal'ún",
  bio: "One of the Shal'ún who tend to the flor-lume in LUNN'P1. Plants and protects the luminous vegetation.",
};

const meta: Meta<typeof CharacterInfoPanel> = {
  title: 'Bichittos/CharacterInfoPanel',
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
  args: { character: eruRinPt },
};

export const English: Story = {
  args: { character: eruRinEn },
};

export const WithCloseButton: Story = {
  args: { character: eruRinPt, onClose: () => {} },
};

export const NoCharacter: Story = {
  args: { character: null },
};

export const ShortBio: Story = {
  args: { character: { ...eruRinPt, bio: 'Guerreiro silencioso.' } },
};
