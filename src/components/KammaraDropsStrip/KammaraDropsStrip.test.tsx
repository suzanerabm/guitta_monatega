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
  it('renders one card per drop', () => {
    render();
    expect(screen.getByTestId('drop-card-0')).toBeInTheDocument();
    expect(screen.getByTestId('drop-card-1')).toBeInTheDocument();
  });

  it('shows each drop label and the world name', () => {
    render();
    expect(screen.getByText('Clipe A')).toBeInTheDocument();
    expect(screen.getByText('Clipe B')).toBeInTheDocument();
    expect(screen.getAllByText('ORF-V').length).toBeGreaterThan(0);
  });

  it('renders the section title and prev/next arrows', () => {
    render();
    expect(screen.getByText('Drops · ORF-V')).toBeInTheDocument();
    // Arrows are display:none below md; query by aria-label so hidden ones count.
    expect(screen.getByLabelText('Previous')).toBeInTheDocument();
    expect(screen.getByLabelText('Next')).toBeInTheDocument();
  });
});
