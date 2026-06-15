import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { ZoomableImage } from './ZoomableImage';

describe('ZoomableImage', () => {
  it('renders the image with src and alt', () => {
    renderWithChakra(<ZoomableImage src="/foo.jpg" alt="A scene" />);
    const img = screen.getByAltText('A scene') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('src')).toBe('/foo.jpg');
  });

  it('starts at identity transform (scale 1, no translate)', () => {
    renderWithChakra(<ZoomableImage src="/foo.jpg" alt="x" />);
    const img = screen.getByAltText('x') as HTMLImageElement;
    expect(img.style.transform).toContain('scale(1)');
    expect(img.style.transform).toContain('translate(0px, 0px)');
  });

  it('zooms in on wheel scroll up', () => {
    renderWithChakra(
      <ZoomableImage src="/foo.jpg" alt="x" data-testid="zoom" />
    );
    const container = screen.getByTestId('zoom');
    const img = screen.getByAltText('x') as HTMLImageElement;
    // Negative deltaY = scroll up = zoom in.
    fireEvent.wheel(container, { deltaY: -300 });
    const match = img.style.transform.match(/scale\(([\d.]+)\)/);
    expect(match).toBeTruthy();
    expect(Number(match![1])).toBeGreaterThan(1);
  });

  it('disables native touch-action so the page does not zoom', () => {
    renderWithChakra(
      <ZoomableImage src="/foo.jpg" alt="x" data-testid="zoom" />
    );
    const container = screen.getByTestId('zoom');
    expect(getComputedStyle(container).touchAction).toBe('none');
  });
});
