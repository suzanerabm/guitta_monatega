import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { SoonPanel } from './SoonPanel';

describe('SoonPanel', () => {
  it('renders label', () => {
    renderWithChakra(<SoonPanel label="em breve" />);
    expect(screen.getByText('em breve')).toBeInTheDocument();
  });

  it('renders default label', () => {
    renderWithChakra(<SoonPanel />);
    expect(screen.getByText('soon')).toBeInTheDocument();
  });
});
