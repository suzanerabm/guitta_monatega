import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { KammaraStatBadge } from './KammaraStatBadge';

describe('KammaraStatBadge', () => {
  it('renders the label and value', () => {
    renderWithChakra(
      <KammaraStatBadge label="Habitantes" value="Shal'ún" color="#00e676" darkColor="#002e14" />,
    );
    expect(screen.getByText('Habitantes')).toBeInTheDocument();
    expect(screen.getByText("Shal'ún")).toBeInTheDocument();
  });
});
