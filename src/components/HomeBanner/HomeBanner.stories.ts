import type { Meta, StoryObj } from '@storybook/html';
import HomeBanner from './HomeBanner.astro';

const meta: Meta<typeof HomeBanner> = {
  title: 'Components/HomeBanner',
  component: HomeBanner,
};
export default meta;
type Story = StoryObj<typeof HomeBanner>;

export const Bichittos: Story = {
  args: {
    href: '/bichittos',
    label: 'Serie',
    title: 'Bichittos',
    description: 'Criaturas que existem entre o absurdo e o afeto.',
    variant: 'bichittos',
  },
};

export const Kammara: Story = {
  args: {
    href: '/kammara',
    label: 'Saga',
    title: 'Kammara',
    description: 'Mundos conectados. Sistemas vivos. Uma saga ilustrada.',
    variant: 'kammara',
  },
};

export const Arte: Story = {
  args: {
    href: '/art',
    label: 'Portfolio',
    title: 'Arte',
    description: 'Ilustracao, concept art e design visual.',
    variant: 'arte',
    fullWidth: true,
  },
};
