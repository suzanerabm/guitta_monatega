import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { DSTextPanel } from './DSTextPanel';

describe('DSTextPanel', () => {
  it('renders children', () => {
    renderWithChakra(
      <DSTextPanel>
        <h2>Hello</h2>
        <p>Body text</p>
      </DSTextPanel>
    );
    expect(screen.getByRole('heading', { name: 'Hello' })).toBeInTheDocument();
    expect(screen.getByText('Body text')).toBeInTheDocument();
  });

  it('applies custom titleColor via CSS var', () => {
    renderWithChakra(
      <DSTextPanel titleColor="#ff0000" data-testid="panel">
        <p>x</p>
      </DSTextPanel>
    );
    const inner = screen.getByTestId('panel').querySelector('.ds-text-scroll') as HTMLElement;
    expect(inner.style.getPropertyValue('--ds-title-color')).toBe('#ff0000');
  });

  it('uses subtitleColor fallback to titleColor', () => {
    renderWithChakra(
      <DSTextPanel titleColor="#abc" data-testid="panel">
        <p>x</p>
      </DSTextPanel>
    );
    const inner = screen.getByTestId('panel').querySelector('.ds-text-scroll') as HTMLElement;
    expect(inner.style.getPropertyValue('--ds-subtitle-color')).toBe('#abc');
  });

  it('applies default text color', () => {
    renderWithChakra(
      <DSTextPanel data-testid="panel">
        <p>x</p>
      </DSTextPanel>
    );
    const inner = screen.getByTestId('panel').querySelector('.ds-text-scroll') as HTMLElement;
    // Default now references the textOverlay theme token via CSS variable
    expect(inner.style.getPropertyValue('--ds-text-color')).toContain('textOverlay');
  });
});
