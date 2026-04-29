import type { Meta, StoryObj } from '@storybook/react';
import { CharacterStrip } from './CharacterStrip';

const meta: Meta<typeof CharacterStrip> = {
  title: 'Components/CharacterStrip',
  component: CharacterStrip,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof CharacterStrip>;

// Real characters from the project
const chars = [
  { name: 'NapCat', image: '/imgs/bichittos/napcat/napcat-dormindo.png' },
  { name: 'Cambalhota', image: '/imgs/bichittos/napcat/napcat-cambalhota.png' },
  { name: 'Pijama', image: '/imgs/bichittos/napcat/napcat-pijama.png' },
  { name: 'Sonequinha', image: '/imgs/bichittos/napcat/napcat-sonequinha.png' },
  { name: 'Gargalhando', image: '/imgs/bichittos/napcat/napcat-gargalhando.png' },
  { name: 'Desenhando', image: '/imgs/bichittos/napcat/napcat-desenhando.png' },
];

export const Default: Story = { args: { characters: chars } };

export const WithArrows: Story = {
  args: { characters: chars, showArrows: true, noLoop: true },
};

export const WithTitle: Story = {
  args: { characters: chars, sectionTitle: 'CHARACTERS' },
};
