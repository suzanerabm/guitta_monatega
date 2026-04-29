import type { Meta, StoryObj } from '@storybook/react';
import { KammaraEventCard } from './KammaraEventCard';

const meta: Meta<typeof KammaraEventCard> = {
  title: 'Kammara/KammaraEventCard',
  component: KammaraEventCard,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof KammaraEventCard>;

const baseArgs = {
  name: "Festival das Quatro Luas",
  category: 'Festival',
  parentName: "LUNN'P1",
  parentCrestGlyph: '⊙—⊹—⊙',
  crestGlyph: '⊙—⊹—⊙',
  color: '#00e676',
  darkColor: '#002e14',
  tabs: [
    {
      id: 'story',
      icon: '⊙—⊹—⊙',
      label: 'Festival',
      title: 'Festival',
      content: (
        <>
          <h3>Ciclo</h3>
          <p>Daqui a 10 ciclos</p>
          <h3>Local</h3>
          <p>Naru&apos;ei Centrais, LUNN&apos;P1</p>
          <h3>Cshift</h3>
          <p>⊷⊙⊶[0201744e]</p>
          <p>O dia mais especial de LUNN&apos;P1.</p>
        </>
      ),
    },
  ],
};

export const Default: Story = { args: baseArgs };
