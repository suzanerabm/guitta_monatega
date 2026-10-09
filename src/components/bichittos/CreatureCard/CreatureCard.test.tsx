import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { CreatureCard } from './CreatureCard';

describe('CreatureCard', () => {
  it('renders name', () => {
    renderWithChakra(<CreatureCard name="Napcat">A sleepy cat creature</CreatureCard>);
    expect(screen.getByRole('heading', { name: 'Napcat' })).toBeInTheDocument();
  });

  it('renders children as text', () => {
    renderWithChakra(<CreatureCard name="Napcat">A sleepy cat creature</CreatureCard>);
    expect(screen.getByText('A sleepy cat creature')).toBeInTheDocument();
  });

  it('applies color1 to name and color2 to text', () => {
    renderWithChakra(
      <CreatureCard name="Napcat" color1="#667eea" color2="#b5a2dc">
        Body
      </CreatureCard>
    );
    const heading = screen.getByRole('heading', { name: 'Napcat' });
    // Browser normalizes hex to rgb: #667eea => rgb(102, 126, 234)
    expect(heading.getAttribute('style') || '').toMatch(/rgb\(102,\s*126,\s*234\)/);
    const body = screen.getByText('Body');
    // #b5a2dc => rgb(181, 162, 220)
    expect(body.getAttribute('style') || '').toMatch(/rgb\(181,\s*162,\s*220\)/);
  });

  it('renders bannerImage when provided', () => {
    renderWithChakra(
      <CreatureCard name="Napcat" bannerImage="/imgs/banner.webp" data-testid="creature">
        Body
      </CreatureCard>
    );
    expect(screen.getByTestId('creature-banner')).toBeInTheDocument();
  });
});
