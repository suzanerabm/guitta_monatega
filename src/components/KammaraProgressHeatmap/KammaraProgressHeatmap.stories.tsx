import type { Meta, StoryObj } from '@storybook/react';
import { KammaraProgressHeatmap } from './KammaraProgressHeatmap';
import progressData from '@/data/kammara_progress.json';

const meta: Meta<typeof KammaraProgressHeatmap> = {
  title: 'Kammara/KammaraProgressHeatmap',
  component: KammaraProgressHeatmap,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof KammaraProgressHeatmap>;

// A story resolve o idioma na mão porque o componente agora recebe rótulo
// pronto — no app quem faz isso é `src/lib/content/kammara.ts`.
const resolve = (loc: 'pt' | 'en') => ({
  categories: progressData.categories.map((c) => ({ id: c.id, label: c.label[loc] })),
  planets: progressData.planets.map((p) => ({
    id: p.id,
    name: p.name[loc],
    progress: p.progress,
  })),
});

const baseArgs = {
  title: 'Próximos Planetas',
  subline: 'Kammara',
  ...resolve('pt'),
  locale: 'pt' as const,
  color: '#d4cbf0',
  darkColor: '#0a0a2e',
};

export const Default: Story = {
  args: { ...baseArgs },
};

export const English: Story = {
  args: { ...baseArgs, ...resolve('en'), locale: 'en', title: 'Upcoming Worlds' },
};

export const WithBackgroundImage: Story = {
  args: {
    ...baseArgs,
    backgroundImage: '/imgs/kammara/_progress_bg.png',
  },
};
