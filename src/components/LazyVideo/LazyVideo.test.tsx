import { screen } from '@testing-library/react';
import { describe, it, expect, beforeAll } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { LazyVideo } from './LazyVideo';

// jsdom has no IntersectionObserver — stub it so the component mounts. We make
// it never fire, so the component stays in its initial "poster only" state,
// which is exactly the pre-activation behaviour we want to assert.
beforeAll(() => {
  class IO {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  // @ts-expect-error - minimal stub for the test environment
  globalThis.IntersectionObserver = IO;
});

describe('LazyVideo', () => {
  it('shows only the poster before entering the viewport (no <video>)', () => {
    const { container } = renderWithChakra(
      <LazyVideo src="/v/a.mp4" poster="/p/a.jpg" alt="Clipe A" />,
    );
    // Poster image is present...
    expect(screen.getByAltText('Clipe A')).toBeInTheDocument();
    // ...and the heavy <video> is NOT mounted yet (the whole point).
    expect(container.querySelector('video')).toBeNull();
  });
});
