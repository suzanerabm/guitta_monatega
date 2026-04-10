import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { CreatureSection } from './CreatureSection';

describe('CreatureSection', () => {
  it('renders children', () => {
    renderWithChakra(
      <CreatureSection gradient="linear-gradient(135deg,#000,#111)">
        <p>Hello creature</p>
      </CreatureSection>
    );
    expect(screen.getByText('Hello creature')).toBeInTheDocument();
  });

  it('renders background with gradient style', () => {
    renderWithChakra(
      <CreatureSection gradient="linear-gradient(135deg,#1a1432,#2a1f4a)">
        <div>content</div>
      </CreatureSection>
    );
    const bg = screen.getByTestId('creature-section-bg');
    expect(bg.getAttribute('style') || '').toContain('linear-gradient');
  });

  it('renders bgImage when provided', () => {
    renderWithChakra(
      <CreatureSection
        gradient="linear-gradient(135deg,#000,#111)"
        bgImage="/imgs/bg.webp"
      >
        <div>content</div>
      </CreatureSection>
    );
    const wrap = screen.getByTestId('creature-section-bg-image');
    expect(wrap).toBeInTheDocument();
    const img = wrap.querySelector('img');
    expect(img?.getAttribute('src')).toBe('/imgs/bg.webp');
  });

  it('applies hidden state with opacity 0', () => {
    renderWithChakra(
      <CreatureSection
        gradient="linear-gradient(135deg,#000,#111)"
        hidden
      >
        <div>content</div>
      </CreatureSection>
    );
    const section = screen.getByTestId('creature-section');
    const style = section.getAttribute('style') || '';
    expect(style).toContain('opacity: 0');
  });

  it('does not render bgImage when not provided', () => {
    renderWithChakra(
      <CreatureSection gradient="linear-gradient(135deg,#000,#111)">
        <div>content</div>
      </CreatureSection>
    );
    expect(screen.queryByTestId('creature-section-bg-image')).toBeNull();
  });
});
