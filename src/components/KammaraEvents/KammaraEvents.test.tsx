import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { KammaraEvents } from './KammaraEvents';

const categories = [
  { id: 'cultural', label: { pt: 'Culturais & Festas', en: 'Cultural & Festivities' } },
  { id: 'scientific', label: { pt: 'Científicos', en: 'Scientific' } },
];

const events = [
  {
    id: 'evento-da-lua',
    category: 'cultural',
    planet: 'lunnp1',
    glyph: '⊙',
    title: { pt: 'Evento da Lua', en: 'Moon Event' },
    date: { pt: 'Próximo ciclo', en: 'Next cycle' },
    description: { pt: 'Descrição PT', en: 'Description EN' },
  },
];

describe('KammaraEvents', () => {
  it('renders title and category sections that have events', () => {
    renderWithChakra(
      <KammaraEvents
        title="Próximos Eventos"
        categories={categories}
        events={events}
        locale="pt"
        color="#d4cbf0"
        darkColor="#0a0a2e"
      />,
    );
    expect(screen.getByText('PRÓXIMOS EVENTOS')).toBeInTheDocument();
    expect(screen.getByText('Culturais & Festas')).toBeInTheDocument();
    // No events for "Scientific" → section is hidden
    expect(screen.queryByText('Científicos')).not.toBeInTheDocument();
  });

  it('renders event card with glyph, planet, title, date and description', () => {
    renderWithChakra(
      <KammaraEvents
        title="Próximos Eventos"
        categories={categories}
        events={events}
        locale="pt"
        color="#d4cbf0"
        darkColor="#0a0a2e"
      />,
    );
    expect(screen.getByText('Evento da Lua')).toBeInTheDocument();
    // The card resolves the planet id to its canonical display name
    // via getWorldName(): 'lunnp1' → "LUNN'P1".
    expect(screen.getByText("LUNN'P1")).toBeInTheDocument();
    expect(screen.getByText('Próximo ciclo')).toBeInTheDocument();
    expect(screen.getByText('Descrição PT')).toBeInTheDocument();
  });
});
