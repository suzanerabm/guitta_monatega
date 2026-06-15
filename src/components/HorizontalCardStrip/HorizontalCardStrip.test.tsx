import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { HorizontalCardStrip } from './HorizontalCardStrip';

describe('HorizontalCardStrip', () => {
  it('renders all children', () => {
    renderWithChakra(
      <HorizontalCardStrip>
        <div>Card A</div>
        <div>Card B</div>
        <div>Card C</div>
      </HorizontalCardStrip>
    );
    expect(screen.getByText('Card A')).toBeInTheDocument();
    expect(screen.getByText('Card B')).toBeInTheDocument();
    expect(screen.getByText('Card C')).toBeInTheDocument();
  });

  it('renders prev/next arrow buttons', () => {
    renderWithChakra(
      <HorizontalCardStrip>
        <div>Card</div>
      </HorizontalCardStrip>
    );
    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  it('exposes a scrollable track via data-testid', () => {
    renderWithChakra(
      <HorizontalCardStrip data-testid="events-strip">
        <div>Card</div>
      </HorizontalCardStrip>
    );
    expect(screen.getByTestId('events-strip-track')).toBeInTheDocument();
    expect(screen.getByTestId('events-strip-arrow-left')).toBeInTheDocument();
    expect(screen.getByTestId('events-strip-arrow-right')).toBeInTheDocument();
  });
});
