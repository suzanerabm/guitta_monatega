import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { ModalProvider } from '@/components/Modal';
import { KammaraDropsStrip, type KammaraDrop } from './KammaraDropsStrip';

const drops: KammaraDrop[] = [
  { video: '/v/a.mp4', poster: '/p/a.jpg', label: 'Clipe A' },
  { video: '/v/b.mp4', poster: '/p/b.jpg', label: 'Clipe B' },
];

function render() {
  return renderWithChakra(
    <ModalProvider>
      <KammaraDropsStrip
        drops={drops}
        worldName="ORF-V"
        crestGlyph="⊙"
        color="#cf568c"
        darkColor="#1e0c48"
        sectionTitle="Drops · ORF-V"
      />
    </ModalProvider>,
  );
}

describe('KammaraDropsStrip', () => {
  // The component renders TWO strips — a frameless mobile swipe strip (just the
  // clip) and the desktop HUD frame (the full DropCard). Only the desktop frame
  // carries the `drop-card-*` testid, so each appears once. Labels/world name
  // show in both, so those use getAllBy*.
  it('renders one DropCard per drop in the desktop frame', () => {
    render();
    expect(screen.getByTestId('drop-card-0')).toBeInTheDocument();
    expect(screen.getByTestId('drop-card-1')).toBeInTheDocument();
  });

  it('shows each drop label and the world name', () => {
    render();
    expect(screen.getAllByText('Clipe A').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Clipe B').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ORF-V').length).toBeGreaterThan(0);
  });

  it('renders the section title and prev/next arrows (desktop frame only)', () => {
    render();
    expect(screen.getByText('Drops · ORF-V')).toBeInTheDocument();
    expect(screen.getByLabelText('Previous')).toBeInTheDocument();
    expect(screen.getByLabelText('Next')).toBeInTheDocument();
  });
});
