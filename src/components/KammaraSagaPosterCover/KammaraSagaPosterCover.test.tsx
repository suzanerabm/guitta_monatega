import { render } from '@testing-library/react';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { describe, it, expect } from 'vitest';
import { KammaraSagaPosterCover } from './KammaraSagaPosterCover';

function renderWithChakra(ui: React.ReactNode) {
  return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>);
}

describe('KammaraSagaPosterCover', () => {
  it('renders the inner poster', () => {
    const { getByTestId } = renderWithChakra(
      <KammaraSagaPosterCover background="/bg.jpg" />,
    );
    // O poster interno tem seu próprio testid.
    expect(getByTestId('kammara-saga-poster')).toBeInTheDocument();
  });

  it('wraps the poster in a 1:1.6 frame', () => {
    const { getByTestId } = renderWithChakra(
      <KammaraSagaPosterCover background="/bg.jpg" />,
    );
    const cover = getByTestId('kammara-saga-poster-cover');
    expect(cover.style.aspectRatio.replace(/\s/g, '')).toBe('1000/1600');
  });
});
