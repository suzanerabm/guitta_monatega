import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { ScrollReveal } from './ScrollReveal';

describe('ScrollReveal', () => {
  it('renders children', () => {
    renderWithChakra(
      <ScrollReveal>
        <div>Hello world</div>
      </ScrollReveal>
    );
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });
});
