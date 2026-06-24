import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { FairyDust } from './FairyDust';

describe('FairyDust', () => {
  const wrap = (ui: React.ReactElement) =>
    render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>);

  it('renders the requested number of particles', () => {
    const { container } = wrap(<FairyDust count={12} />);
    // Particles are the divs inside the aria-hidden wrapper. Scoping to that
    // wrapper avoids counting the wrapper Box itself (a plain `div > div`
    // selector also matched the outer Box, yielding 13).
    const particles = container.querySelectorAll('[aria-hidden="true"] > div');
    expect(particles.length).toBe(12);
  });

  it('is hidden from screen readers', () => {
    const { container } = wrap(<FairyDust />);
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('produces the same layout on re-render (deterministic)', () => {
    const { container, rerender } = wrap(<FairyDust count={5} />);
    const firstRun = Array.from(container.querySelectorAll('[aria-hidden="true"] > div')).map((el) =>
      (el as HTMLElement).style.top,
    );
    rerender(
      <ChakraProvider value={defaultSystem}>
        <FairyDust count={5} />
      </ChakraProvider>,
    );
    const secondRun = Array.from(container.querySelectorAll('[aria-hidden="true"] > div')).map((el) =>
      (el as HTMLElement).style.top,
    );
    expect(secondRun).toEqual(firstRun);
  });
});
