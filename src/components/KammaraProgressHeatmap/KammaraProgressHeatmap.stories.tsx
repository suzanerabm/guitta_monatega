import type { Meta, StoryObj } from '@storybook/react';
import { KammaraProgressHeatmap } from './KammaraProgressHeatmap';
import progressData from '@/data/kammara_progress.json';

const meta: Meta<typeof KammaraProgressHeatmap> = {
  title: 'Components/KammaraProgressHeatmap',
  component: KammaraProgressHeatmap,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof KammaraProgressHeatmap>;

const baseArgs = {
  title: 'Próximos Planetas',
  subline: 'Kammara',
  categories: progressData.categories,
  planets: progressData.planets,
  locale: 'pt' as const,
  color: '#d4cbf0',
  darkColor: '#0a0a2e',
};

export const Default: Story = {
  args: { ...baseArgs },
};

export const English: Story = {
  args: { ...baseArgs, locale: 'en', title: 'Upcoming Worlds' },
};

export const WithBackgroundImage: Story = {
  args: {
    ...baseArgs,
    backgroundImage: '/imgs/kammara/_progress_bg.png',
  },
};
