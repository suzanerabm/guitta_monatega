import type { Meta, StoryObj } from '@storybook/react';
import { HeroSection } from './HeroSection';

const meta: Meta<typeof HeroSection> = {
  title: 'Components/HeroSection',
  component: HeroSection,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HeroSection>;

export const Dark: Story = {
  args: {
    label: 'serie',
    title: 'Bichittos',
    description: 'A series about cute creatures',
    background: 'linear-gradient(135deg, #1a1432, #2a1f4a)',
  },
};

export const Light: Story = {
  args: {
    label: 'portfolio',
    title: 'Arte',
    background: '#f5f5f5',
    textColor: '#2d2d2d',
    labelColor: 'rgba(0,0,0,0.4)',
  },
};

export const Home: Story = {
  args: {
    variant: 'home',
    title: 'guitta monatega',
    label: 'ilustração · animação · narrativa',
  },
};

export const HomeWithDescription: Story = {
  args: {
    variant: 'home',
    title: 'guitta monatega',
    label: 'ilustração · animação · narrativa',
    description:
      'Um portfólio de mundos, criaturas e histórias visuais.',
  },
};
