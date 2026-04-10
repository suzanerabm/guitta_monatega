import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { HeroSection } from './HeroSection';

describe('HeroSection', () => {
  it('renders label, title, and description', () => {
    renderWithChakra(
      <HeroSection
        label="serie"
        title="Bichittos"
        description="A series about..."
        background="#000"
      />
    );
    expect(screen.getByText('serie')).toBeInTheDocument();
    expect(screen.getByText('Bichittos')).toBeInTheDocument();
    expect(screen.getByText('A series about...')).toBeInTheDocument();
  });

  it('renders without description', () => {
    renderWithChakra(<HeroSection label="art" title="Arte" background="#fff" />);
    expect(screen.getByText('Arte')).toBeInTheDocument();
  });
});
