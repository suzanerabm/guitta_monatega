import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { CharacterInfoPanel } from './CharacterInfoPanel';

const char = {
  name: "Erú'Rin",
  species: "Shal'ún",
  bio: 'Um guardião das flores.',
};

describe('CharacterInfoPanel', () => {
  it('renders name, species and bio in pt', () => {
    // The panel positions itself against an anchor element; without one it
    // renders nothing by design (see the null-character test below). Give it a
    // real anchor so the content actually mounts.
    const anchorEl = document.createElement('div');
    document.body.appendChild(anchorEl);
    renderWithChakra(<CharacterInfoPanel character={char} anchorEl={anchorEl} />);
    expect(screen.getByText("Erú'Rin")).toBeInTheDocument();
    expect(screen.getByText("Shal'ún")).toBeInTheDocument();
    expect(screen.getByText('Um guardião das flores.')).toBeInTheDocument();
  });

  it('renders nothing when character is null', () => {
    const { container } = renderWithChakra(
      <CharacterInfoPanel character={null} anchorEl={null} />
    );
    expect(container.innerHTML).toBe('');
  });
});
