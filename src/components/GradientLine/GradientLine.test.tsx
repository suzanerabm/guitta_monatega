import { renderWithChakra } from '@/test-utils';
import { describe, expect, it } from 'vitest';
import { GradientLine } from './GradientLine';

describe('GradientLine', () => {
  it('renders as a decorative element', () => {
    const { container } = renderWithChakra(<GradientLine color="orange" width="72px" />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });
});
