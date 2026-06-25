import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { CharacterCard } from './CharacterCard';

describe('CharacterCard', () => {
  it('renders name', () => {
    renderWithChakra(<CharacterCard name="NapCat" image="/imgs/napcat.webp" />);
    expect(screen.getByText('NapCat')).toBeInTheDocument();
  });

  it('renders image with correct src', () => {
    renderWithChakra(<CharacterCard name="NapCat" image="/imgs/napcat.webp" />);
    const img = screen.getByAltText('NapCat') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('src')).toBe('/imgs/napcat.webp');
  });

  it('applies transparent variant', () => {
    renderWithChakra(
      <CharacterCard name="NapCat" image="/imgs/napcat.webp" transparent data-testid="card" />
    );
    const card = screen.getByTestId('card');
    expect(card.getAttribute('data-variant')).toContain('transparent');
  });

  it('applies noBorder variant', () => {
    renderWithChakra(
      <CharacterCard name="NapCat" image="/imgs/napcat.webp" noBorder data-testid="card" />
    );
    const card = screen.getByTestId('card');
    expect(card.getAttribute('data-variant')).toContain('no-border');
  });
});
