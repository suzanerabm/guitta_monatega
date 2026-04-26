import type { Meta, StoryObj } from '@storybook/react';
import { KammaraEvents } from './KammaraEvents';
import eventsData from '@/data/kammara_events.json';

const meta: Meta<typeof KammaraEvents> = {
  title: 'Kammara/KammaraEvents',
  component: KammaraEvents,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof KammaraEvents>;

const baseArgs = {
  title: 'Próximos Eventos',
  kicker: 'Universo Kammara',
  categories: eventsData.categories,
  events: eventsData.events,
  locale: 'pt' as const,
  color: '#d4cbf0',
  darkColor: '#0a0a2e',
};

export const Default: Story = { args: { ...baseArgs } };

export const English: Story = {
  args: { ...baseArgs, locale: 'en', title: 'Upcoming Events' },
};
