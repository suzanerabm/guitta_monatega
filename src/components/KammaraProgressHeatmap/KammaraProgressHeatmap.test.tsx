import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { KammaraProgressHeatmap } from './KammaraProgressHeatmap';

const categories = [
  { id: 'lore', label: { pt: 'Lore', en: 'Lore' } },
  { id: 'cenas', label: { pt: 'Cenas', en: 'Scenes' } },
];

const planets = [
  {
    id: 'z1',
    name: { pt: 'Z1', en: 'Z1' },
    progress: { lore: 96, cenas: 0 },
  },
  {
    id: 'hash',
    name: { pt: 'Hash', en: 'Hash' },
    progress: { lore: 3, cenas: 0 },
  },
];

describe('KammaraProgressHeatmap', () => {
  it('renders title and category headers', () => {
    renderWithChakra(
      <KammaraProgressHeatmap
        title="Próximos Planetas"
        categories={categories}
        planets={planets}
        locale="pt"
        color="#d4cbf0"
        darkColor="#0a0a2e"
      />,
    );

    expect(screen.getByText('PRÓXIMOS PLANETAS')).toBeInTheDocument();
    expect(screen.getByText('Lore')).toBeInTheDocument();
    expect(screen.getByText('Cenas')).toBeInTheDocument();
  });

  it('renders one row per planet with localized name', () => {
    renderWithChakra(
      <KammaraProgressHeatmap
        title="Próximos Planetas"
        categories={categories}
        planets={planets}
        locale="pt"
        color="#d4cbf0"
        darkColor="#0a0a2e"
      />,
    );

    expect(screen.getByText('Z1')).toBeInTheDocument();
    expect(screen.getByText('Hash')).toBeInTheDocument();
  });

  it('exposes accessible cell labels with the percent value', () => {
    renderWithChakra(
      <KammaraProgressHeatmap
        title="Próximos Planetas"
        categories={categories}
        planets={planets}
        locale="pt"
        color="#d4cbf0"
        darkColor="#0a0a2e"
      />,
    );

    expect(
      screen.getByLabelText('Z1 · Lore: 96%'),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Hash · Cenas: 0%'),
    ).toBeInTheDocument();
  });
});
