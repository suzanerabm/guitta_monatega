import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { FilterBar } from './FilterBar';

describe('FilterBar', () => {
  const filters = [
    { id: 'napcat', label: 'NapCat', color: '#667eea' },
    { id: 'zeco', label: 'Zeco', color: '#ff8c42' },
  ];

  it('renders all filter buttons plus "All"', () => {
    renderWithChakra(<FilterBar filters={filters} onFilter={() => {}} />);
    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('NapCat')).toBeInTheDocument();
    expect(screen.getByText('Zeco')).toBeInTheDocument();
  });

  it('calls onFilter with filter id on click', () => {
    const onFilter = vi.fn();
    renderWithChakra(<FilterBar filters={filters} onFilter={onFilter} />);
    fireEvent.click(screen.getByText('NapCat'));
    expect(onFilter).toHaveBeenCalledWith('napcat');
  });

  it('calls onFilter with "all" when All is clicked', () => {
    const onFilter = vi.fn();
    renderWithChakra(<FilterBar filters={filters} onFilter={onFilter} />);
    fireEvent.click(screen.getByText('NapCat'));
    fireEvent.click(screen.getByText('Todos'));
    expect(onFilter).toHaveBeenLastCalledWith('all');
  });
});
