import type { Meta, StoryObj } from '@storybook/react';
import { CharacterCard } from './CharacterCard';

const meta: Meta<typeof CharacterCard> = {
  title: 'Components/CharacterCard',
  component: CharacterCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CharacterCard>;

const baseArgs = {
  name: 'NapCat',
  image: '/imgs/bichittos/napcat/napcat-dormindo.png',
  gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
};

export const Default: Story = { args: baseArgs };
export const Transparent: Story = { args: { ...baseArgs, transparent: true } };
export const NoBorder: Story = { args: { ...baseArgs, noBorder: true } };
export const Large: Story = { args: { ...baseArgs, cardSize: 180 } };
