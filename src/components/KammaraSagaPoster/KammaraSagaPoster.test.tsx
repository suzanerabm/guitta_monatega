import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { KammaraSagaPoster } from './KammaraSagaPoster';

const BG = '/imgs/kammara/orfv/_scenes/9noite_em_orfv.jpg';

describe('KammaraSagaPoster', () => {
  it('renders the title and top label', () => {
    renderWithChakra(<KammaraSagaPoster background={BG} />);
    expect(screen.getByText('KAMMARA')).toBeInTheDocument();
    expect(screen.getByText('UNIVERSO')).toBeInTheDocument();
  });

  it('renders the six default heroes by alt text', () => {
    renderWithChakra(<KammaraSagaPoster background={BG} />);
    for (const name of ['EruRin', 'Orvian', 'SELKA RIN', 'KAEL TORIN', 'LUMA VAL', 'Lumesha']) {
      expect(screen.getByAltText(name)).toBeInTheDocument();
    }
  });

  it('honors custom title/subtitle/label', () => {
    renderWithChakra(
      <KammaraSagaPoster background={BG} title="ORF-V" subtitle="SAGA I" topLabel="SAGA" />
    );
    expect(screen.getByText('ORF-V')).toBeInTheDocument();
    expect(screen.getByText('SAGA I')).toBeInTheDocument();
  });
});
