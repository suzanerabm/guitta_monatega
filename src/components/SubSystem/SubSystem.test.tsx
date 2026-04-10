import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { SubSystem, type SubSystemCard } from './SubSystem';

const cards: SubSystemCard[] = [
  { title: 'Atmosphere', image: '/a.jpg', imageAlt: 'air', texts: ['Para 1', 'Para 2'] },
  { title: 'Geology', texts: ['Para A'] },
  { title: 'Life', image: '/l.jpg', texts: ['Para X', 'Para Y', 'Para Z'] },
];

describe('SubSystem', () => {
  it('renders all cards', () => {
    renderWithChakra(<SubSystem cards={cards} />);
    expect(screen.getByRole('heading', { name: 'Atmosphere' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Geology' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Life' })).toBeInTheDocument();
  });

  it('renders section title when provided', () => {
    renderWithChakra(<SubSystem cards={cards} sectionTitle="Sub-systems" />);
    expect(screen.getByRole('heading', { name: 'Sub-systems' })).toBeInTheDocument();
  });

  it('omits section title when not provided', () => {
    renderWithChakra(<SubSystem cards={cards} />);
    expect(screen.queryByRole('heading', { name: 'Sub-systems' })).not.toBeInTheDocument();
  });

  it('renders images when provided', () => {
    renderWithChakra(<SubSystem cards={cards} />);
    expect(screen.getByTestId('subsystem-card-0-image')).toBeInTheDocument();
    expect(screen.queryByTestId('subsystem-card-1-image')).not.toBeInTheDocument();
    expect(screen.getByTestId('subsystem-card-2-image')).toBeInTheDocument();
  });

  it('renders all texts per card', () => {
    renderWithChakra(<SubSystem cards={cards} />);
    expect(screen.getByText('Para 1')).toBeInTheDocument();
    expect(screen.getByText('Para 2')).toBeInTheDocument();
    expect(screen.getByText('Para A')).toBeInTheDocument();
    expect(screen.getByText('Para X')).toBeInTheDocument();
    expect(screen.getByText('Para Y')).toBeInTheDocument();
    expect(screen.getByText('Para Z')).toBeInTheDocument();
  });
});
