import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { KammaraDropsMosaic, type MosaicClip } from './KammaraDropsMosaic';

const clips: MosaicClip[] = [
  { video: '/v/a.mp4', poster: '/p/a.jpg', label: 'Clipe A', worldId: 'orfv', worldName: 'ORF-V', crestGlyph: '⊙' },
  { video: '/v/b.mp4', poster: '/p/b.jpg', label: 'Clipe B', worldId: 'eni4', worldName: 'eni4', crestGlyph: '⊙' },
  { video: '/v/c.mp4', poster: '/p/c.jpg', label: 'Clipe C', worldId: 'lunnp1', worldName: "LUNN'P1", crestGlyph: '⊙' },
];

describe('KammaraDropsMosaic', () => {
  it('renders one tile per clip (with the poster as placeholder)', () => {
    const { container } = renderWithChakra(
      <KammaraDropsMosaic clips={clips} color="#cf568c" />,
    );
    // Each clip starts as its poster image (LazyVideo before activation).
    expect(container.querySelectorAll('img').length).toBe(3);
  });

  it('renders nothing when there are no clips', () => {
    const { container } = renderWithChakra(
      <KammaraDropsMosaic clips={[]} color="#cf568c" />,
    );
    expect(container.querySelector('[data-testid="kammara-drops-mosaic"]')).toBeNull();
  });

  it('stamps each clip with its world name', () => {
    renderWithChakra(<KammaraDropsMosaic clips={clips} color="#cf568c" />);
    expect(screen.getByText('ORF-V')).toBeInTheDocument();
    expect(screen.getByText('eni4')).toBeInTheDocument();
  });

  it('calls onSelectWorld with the clip world id when a tile is clicked', () => {
    const onSelectWorld = vi.fn();
    renderWithChakra(
      <KammaraDropsMosaic clips={clips} color="#cf568c" onSelectWorld={onSelectWorld} />,
    );
    fireEvent.click(screen.getByLabelText('Abrir ORF-V'));
    expect(onSelectWorld).toHaveBeenCalledWith('orfv');
  });
});
