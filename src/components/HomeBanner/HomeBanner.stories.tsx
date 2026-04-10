import type { Meta, StoryObj } from '@storybook/react';
import { HomeBanner } from './HomeBanner';

const meta: Meta<typeof HomeBanner> = {
  title: 'Components/HomeBanner',
  component: HomeBanner,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof HomeBanner>;

export const Bichittos: Story = {
  args: {
    href: '/bichittos',
    label: 'serie',
    title: 'Bichittos',
    description: 'creaturas',
    variant: 'bichittos',
  },
};

export const Kammara: Story = {
  args: {
    href: '/kammara',
    label: 'saga',
    title: 'Kammara',
    description: 'mundos',
    variant: 'kammara',
  },
};

export const Arte: Story = {
  args: {
    href: '/art',
    label: 'portfolio',
    title: 'Arte',
    description: 'pinturas',
    variant: 'arte',
    fullWidth: true,
  },
};
