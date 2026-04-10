import type { Meta, StoryObj } from '@storybook/react';
import { ArtSection } from './ArtSection';

const meta: Meta<typeof ArtSection> = {
  title: 'Components/ArtSection',
  component: ArtSection,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ArtSection>;

// Real art thumbs from /public/imgs/art
const blackThumbs = [
  '/imgs/art/black/_thumb/094DDD20-5A18-40D0-8E14-FBB6480C492D_1_201_a.jpg',
  '/imgs/art/black/_thumb/1_32C78239-A11A-45C4-87ED-520E2E19C58E_1_105_c.jpg',
  '/imgs/art/black/_thumb/2_DE86BB57-487A-41A3-88E2-F0ABC7938583_1_105_c.jpg',
  '/imgs/art/black/_thumb/3_6BAC4A41-7327-4F2B-B449-1EEE7C43A71C_1_105_c.jpg',
  '/imgs/art/black/_thumb/45594716-B23F-40D2-B6B9-46474FF78A29_1_105_c.jpg',
  '/imgs/art/black/_thumb/49ECFAE1-2380-485A-A86A-8F6CECFDC342_1_105_c.jpg',
];

const digitalThumbs = [
  '/imgs/art/digital/_thumb/Red.jpg',
  '/imgs/art/digital/_thumb/espiral.jpg',
];

export const Default: Story = {
  args: {
    id: 'digital',
    title: 'Arte Digital',
    technique: 'Digital painting',
    bg: '#eae8f0',
    titleColor: '#333333',
    techColor: 'rgba(51,51,51,0.5)',
    thumbs: digitalThumbs,
  },
};

export const Large: Story = {
  args: {
    id: 'black',
    title: 'Branco no Preto',
    technique: 'White on black',
    bg: '#1a1a1a',
    titleColor: '#ffffff',
    techColor: 'rgba(255,255,255,0.5)',
    large: true,
    thumbs: blackThumbs,
  },
};

export const DarkBackground: Story = {
  args: {
    id: 'black',
    title: 'Branco no Preto',
    technique: 'White on black',
    bg: '#1a1a1a',
    titleColor: '#ffffff',
    techColor: 'rgba(255,255,255,0.5)',
    thumbs: blackThumbs,
  },
};
