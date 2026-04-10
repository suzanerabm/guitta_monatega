import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { SoonBadge } from './SoonBadge';

describe('SoonBadge', () => {
  it('renders label text', () => {
    renderWithChakra(<SoonBadge label="soon" />);
    expect(screen.getByText('soon')).toBeInTheDocument();
  });

  it('renders default label when none provided', () => {
    renderWithChakra(<SoonBadge />);
    expect(screen.getByText('soon')).toBeInTheDocument();
  });

  it('renders overlay variant', () => {
    renderWithChakra(<SoonBadge label="em breve" overlay />);
    expect(screen.getByText('em breve')).toBeInTheDocument();
  });
});
