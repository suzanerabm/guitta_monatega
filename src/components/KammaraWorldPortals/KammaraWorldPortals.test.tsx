import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { KammaraWorldPortals, type WorldPortal } from './KammaraWorldPortals';

const portals: WorldPortal[] = [
  { id: 'orfv', name: 'ORF-V', color: '#cf568c', darkColor: '#1e0c48', image: '/imgs/a.jpg' },
  { id: 'eni4', name: 'ENI-4Δ', color: '#7fd4e0', darkColor: '#0a2a30', image: '/imgs/b.jpg' },
];

describe('KammaraWorldPortals', () => {
  it('renders one portal per world with its name', () => {
    renderWithChakra(<KammaraWorldPortals portals={portals} onSelect={() => {}} />);
    expect(screen.getByText('ORF-V')).toBeInTheDocument();
    expect(screen.getByText('ENI-4Δ')).toBeInTheDocument();
  });

  it('calls onSelect with the world id when a portal is clicked', () => {
    const onSelect = vi.fn();
    renderWithChakra(<KammaraWorldPortals portals={portals} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('ORF-V'));
    expect(onSelect).toHaveBeenCalledWith('orfv');
  });
});
