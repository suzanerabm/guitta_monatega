import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { KammaraPlanetCard, type PlanetBadge } from './KammaraPlanetCard';

const badges: PlanetBadge[] = [
  { label: 'Habitantes', value: "Shal'ún" },
  { label: 'Clima', value: 'Aquático' },
];

function render(onSelect = () => {}) {
  return renderWithChakra(
    <KammaraPlanetCard
      id="lunnp1"
      name="LUNN'P1"
      summary="O planeta onde tudo flui."
      image="/imgs/lunnp1.jpg"
      crestGlyph="⊙—⊹—⊙"
      color="#00e676"
      darkColor="#002e14"
      badges={badges}
      onSelect={onSelect}
    />,
  );
}

describe('KammaraPlanetCard', () => {
  it('shows the name, summary and badges', () => {
    render();
    expect(screen.getByText("LUNN'P1")).toBeInTheDocument();
    expect(screen.getByText('O planeta onde tudo flui.')).toBeInTheDocument();
    expect(screen.getByText("Shal'ún")).toBeInTheDocument();
    expect(screen.getByText('Aquático')).toBeInTheDocument();
  });

  it('calls onSelect with the world id when clicked', () => {
    const onSelect = vi.fn();
    render(onSelect);
    fireEvent.click(screen.getByLabelText("Abrir LUNN'P1"));
    expect(onSelect).toHaveBeenCalledWith('lunnp1');
  });
});
