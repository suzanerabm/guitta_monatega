import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { WorldCard } from './WorldCard';

describe('WorldCard', () => {
  it('renders tag and name', () => {
    renderWithChakra(
      <WorldCard tag="Planeta" name="LUNN'P1" paletteName="lunnp1">
        A water world
      </WorldCard>
    );
    expect(screen.getByText('Planeta')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: "LUNN'P1" })).toBeInTheDocument();
  });

  it('renders children as text', () => {
    renderWithChakra(
      <WorldCard tag="Planeta" name="LUNN'P1" paletteName="lunnp1">
        A water world
      </WorldCard>
    );
    expect(screen.getByText('A water world')).toBeInTheDocument();
  });

  it('applies banner layout by default', () => {
    renderWithChakra(
      <WorldCard tag="Planeta" name="LUNN'P1" paletteName="lunnp1" data-testid="world">
        Body
      </WorldCard>
    );
    expect(screen.getByTestId('world').getAttribute('data-strip-layout')).toBe('banner');
  });

  it('applies side layout when stripLayout=side', () => {
    renderWithChakra(
      <WorldCard
        tag="Planeta"
        name="ENI-4"
        paletteName="eni4"
        stripLayout="side"
        data-testid="world"
      >
        Body
      </WorldCard>
    );
    expect(screen.getByTestId('world').getAttribute('data-strip-layout')).toBe('side');
  });

  it('shows divider by default', () => {
    renderWithChakra(
      <WorldCard tag="Planeta" name="LUNN'P1" paletteName="lunnp1">
        Body
      </WorldCard>
    );
    expect(screen.getByTestId('world-divider')).toBeInTheDocument();
  });

  it('hides divider when showDivider=false', () => {
    renderWithChakra(
      <WorldCard tag="Planeta" name="LUNN'P1" paletteName="lunnp1" showDivider={false}>
        Body
      </WorldCard>
    );
    expect(screen.queryByTestId('world-divider')).not.toBeInTheDocument();
  });
});
