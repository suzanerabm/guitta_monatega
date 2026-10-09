import type { Meta, StoryObj } from '@storybook/react';
import { Footer } from './Footer';

const meta: Meta<typeof Footer> = {
  title: 'Layout/Footer',
  component: Footer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Footer>;

export const Default: Story = {
  args: {
    followLabel: 'acompanhe',
    socialProfiles: [
      { name: 'Studio', instagramUrl: 'https://www.instagram.com/', facebookUrl: 'https://www.facebook.com/' },
      { name: 'Bichittos', instagramUrl: 'https://www.instagram.com/', facebookUrl: 'https://www.facebook.com/' },
      { name: 'Kammara', instagramUrl: 'https://www.instagram.com/', facebookUrl: 'https://www.facebook.com/' },
    ],
    aboutPath: '/about',
    aboutLabel: 'sobre guitta monatega',
    licensingPath: '/licensing-partnerships',
    licensingLabel: 'licenciamento e parcerias',
    privacyPath: '/privacy',
    privacyLabel: 'privacidade',
    version: '1.0.0',
  },
};
