import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { KammaraEventCard } from './KammaraEventCard';

describe('KammaraEventCard', () => {
  const baseProps = {
    name: 'Festival',
    category: 'Festival',
    parentName: "LUNN'P1",
    parentCrestGlyph: '⊙—⊹—⊙',
    color: '#00e676',
    darkColor: '#002e14',
  };

  it('renders the name and tab content', () => {
    renderWithChakra(
      <KammaraEventCard
        {...baseProps}
        tabs={[
          {
            id: 's',
            icon: '⊙',
            label: 'x',
            title: 'x',
            content: (
              <>
                <h3>Cycle</h3>
                <p>Soon</p>
              </>
            ),
          },
        ]}
      />,
    );
    expect(screen.getByText('Festival')).toBeInTheDocument();
    expect(screen.getByText('Cycle')).toBeInTheDocument();
    expect(screen.getByText('Soon')).toBeInTheDocument();
  });
});
