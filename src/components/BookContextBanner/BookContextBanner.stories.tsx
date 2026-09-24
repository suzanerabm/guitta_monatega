import type { Meta, StoryObj } from '@storybook/react';
import { bookPageVisuals } from '@/theme/bookPages';
import { BookContextBanner } from './BookContextBanner';

const meta: Meta<typeof BookContextBanner> = {
  title: 'Components/BookContextBanner',
  component: BookContextBanner,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BookContextBanner>;

export const NapCat: Story = {
  args: {
    href: '/pt/bichittos?bichitto=napcat',
    eyebrow: 'Bichittos',
    title: 'Conheça o NapCat',
    backgroundImage: '/imgs/bichittos/_bg/napcat.jpg',
    overlay: bookPageVisuals.napcat.contextOverlay,
    decorations: ['/imgs/bichittos/napcat/napcat.png'],
    accentColor: 'orange',
  },
};
