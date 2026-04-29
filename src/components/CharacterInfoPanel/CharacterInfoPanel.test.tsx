import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { CharacterInfoPanel } from './CharacterInfoPanel';

const char = {
  match: "Erú'Rin",
  name: { pt: "Erú'Rin", en: "Erú'Rin" },
  species: { pt: "Shal'ún", en: "Shal'ún" },
  bio: { pt: 'Um guardião das flores.', en: 'A guardian of flowers.' },
};

describe('CharacterInfoPanel', () => {
  it('renders name, species and bio in pt', () => {
    renderWithChakra(<CharacterInfoPanel character={char} locale="pt" anchorEl={null} />);
    expect(screen.getByText("Erú'Rin")).toBeInTheDocument();
    expect(screen.getByText("Shal'ún")).toBeInTheDocument();
    expect(screen.getByText('Um guardião das flores.')).toBeInTheDocument();
  });

  it('renders nothing when character is null', () => {
    const { container } = renderWithChakra(
      <CharacterInfoPanel character={null} locale="pt" anchorEl={null} />
    );
    expect(container.innerHTML).toBe('');
  });
});
