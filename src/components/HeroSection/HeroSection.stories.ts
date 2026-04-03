import type { Meta, StoryObj } from '@storybook/html';
import HeroSection from './HeroSection.astro';

const meta: Meta<typeof HeroSection> = {
  title: 'Components/HeroSection',
  component: HeroSection,
};
export default meta;
type Story = StoryObj<typeof HeroSection>;

export const Bichittos: Story = {
  args: {
    label: 'Serie',
    title: 'Bichittos',
    description: 'Criaturas que existem entre o absurdo e o afeto.',
    background: 'linear-gradient(135deg, #ff6b9d 0%, #ffa751 30%, #ffe259 60%, #6dd5fa 100%)',
  },
};

export const Kammara: Story = {
  args: {
    label: 'Saga Ilustrada',
    title: 'Kammara',
    description: 'Mundos conectados. Sistemas vivos.',
    background: 'linear-gradient(135deg, #0a0a2e, #1a1a4e, #2d1b69)',
    textColor: '#fff',
    labelColor: 'rgba(255,255,255,0.3)',
  },
};

export const Art: Story = {
  args: {
    label: 'Portfolio',
    title: 'Arte',
    background: 'linear-gradient(135deg, #f5f5f5, #e8e8e8, #f0f0f0)',
    textColor: '#1a1d21',
    labelColor: '#999',
    minHeight: '35vh',
  },
};
