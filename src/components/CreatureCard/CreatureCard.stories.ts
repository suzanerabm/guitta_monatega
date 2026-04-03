import type { Meta, StoryObj } from '@storybook/html';
import CreatureCard from './CreatureCard.astro';

const meta: Meta<typeof CreatureCard> = {
  title: 'Components/CreatureCard',
  component: CreatureCard,
};
export default meta;
type Story = StoryObj<typeof CreatureCard>;

export const NapCat: Story = {
  args: {
    name: 'NapCat',
    bannerImage: '/imgs/banners/banner_napcat.jpg',
  },
};

export const Zeco: Story = {
  args: {
    name: 'Zeco',
    bannerImage: '/imgs/banners/banner_zeco.jpg',
  },
};

export const Taylo: Story = {
  args: {
    name: 'Taylo',
    bannerImage: '/imgs/banners/banner_taylo.jpg',
  },
};
