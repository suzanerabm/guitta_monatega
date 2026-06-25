import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { CharacterStrip } from './CharacterStrip';

const chars = [
  { name: 'NapCat', image: '/imgs/napcat.webp' },
  { name: 'Zeco', image: '/imgs/zeco.webp' },
  { name: 'Taylo', image: '/imgs/taylo.webp' },
];

describe('CharacterStrip', () => {
  it('renders section title when provided', () => {
    renderWithChakra(<CharacterStrip characters={chars} sectionTitle="CHARACTERS" />);
    expect(screen.getByRole('heading', { name: 'CHARACTERS' })).toBeInTheDocument();
  });

  it('duplicates characters when looping (default)', () => {
    renderWithChakra(<CharacterStrip characters={chars} />);
    // Each character should appear twice because of duplication.
    expect(screen.getAllByAltText('NapCat')).toHaveLength(2);
    expect(screen.getAllByAltText('Zeco')).toHaveLength(2);
  });

  it('renders characters once when noLoop=true', () => {
    renderWithChakra(<CharacterStrip characters={chars} noLoop />);
    expect(screen.getAllByAltText('NapCat')).toHaveLength(1);
  });

  it('renders arrow buttons when showArrows=true', () => {
    renderWithChakra(
      <CharacterStrip characters={chars} showArrows noLoop />
    );
    expect(screen.getByLabelText('Previous')).toBeInTheDocument();
    expect(screen.getByLabelText('Next')).toBeInTheDocument();
  });

  it('arrow click is wired (does not throw)', () => {
    renderWithChakra(
      <CharacterStrip characters={chars} showArrows noLoop />
    );
    // Should not throw when invoking click handler.
    fireEvent.click(screen.getByLabelText('Next'));
    fireEvent.click(screen.getByLabelText('Previous'));
  });
});
