import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { DSMainCard, type Character } from './DSMainCard';

const chars: Character[] = [
  { image: '/c1.png', x: 25, y: 10, size: 200 },
  { image: '/c2.png', x: 50, y: 10, size: 250, zIndex: 2 },
  { image: '/c3.png', x: 75, y: 10, size: 200 },
];

describe('DSMainCard', () => {
  it('renders all characters', () => {
    renderWithChakra(<DSMainCard characters={chars} />);
    expect(screen.getByTestId('ds-char-0')).toBeInTheDocument();
    expect(screen.getByTestId('ds-char-1')).toBeInTheDocument();
    expect(screen.getByTestId('ds-char-2')).toBeInTheDocument();
  });

  it('renders gradient background layer', () => {
    renderWithChakra(<DSMainCard characters={chars} />);
    expect(screen.getByTestId('ds-card-bg')).toBeInTheDocument();
  });

  it('renders text panel when text prop provided', () => {
    renderWithChakra(
      <DSMainCard
        characters={chars}
        text={
          <>
            <h2>Hello</h2>
            <p>Body</p>
          </>
        }
      />
    );
    expect(screen.getByTestId('ds-text-wrap')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Hello' })).toBeInTheDocument();
  });

  it('does not render text wrap when no text prop', () => {
    renderWithChakra(<DSMainCard characters={chars} />);
    expect(screen.queryByTestId('ds-text-wrap')).not.toBeInTheDocument();
  });

  it('renders mascot when provided', () => {
    renderWithChakra(
      <DSMainCard
        characters={chars}
        text={<p>x</p>}
        mascot={{ image: '/mascot.png', size: 140 }}
      />
    );
    expect(screen.getByTestId('ds-mascot')).toBeInTheDocument();
  });

  it('applies stripSide layout', () => {
    renderWithChakra(
      <DSMainCard characters={chars} stripSide data-testid="card">
        <div data-testid="strip-content">strip</div>
      </DSMainCard>
    );
    expect(screen.getByTestId('card').getAttribute('data-strip-side')).toBe('true');
    expect(screen.getByTestId('ds-strip-side')).toBeInTheDocument();
    expect(screen.getByTestId('strip-content')).toBeInTheDocument();
  });

  it('renders default strip slot inline when not stripSide', () => {
    renderWithChakra(
      <DSMainCard characters={chars}>
        <div data-testid="strip-content">strip</div>
      </DSMainCard>
    );
    expect(screen.getByTestId('strip-content')).toBeInTheDocument();
    expect(screen.queryByTestId('ds-strip-side')).not.toBeInTheDocument();
  });
});
