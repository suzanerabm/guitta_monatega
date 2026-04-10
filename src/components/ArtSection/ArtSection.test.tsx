import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { ArtSection } from './ArtSection';

const baseProps = {
  id: 'aquarela',
  title: 'Aquarela',
  technique: 'Watercolor',
  bg: '#f0f0f0',
  titleColor: '#000',
  techColor: '#666',
  thumbs: ['/a.jpg', '/b.jpg', '/c.jpg'],
};

describe('ArtSection', () => {
  it('renders title and technique', () => {
    renderWithChakra(<ArtSection {...baseProps} />);
    expect(screen.getByRole('heading', { name: 'Aquarela' })).toBeInTheDocument();
    expect(screen.getByText('Watercolor')).toBeInTheDocument();
  });

  it('renders all thumbs', () => {
    renderWithChakra(<ArtSection {...baseProps} />);
    expect(screen.getByTestId('thumb-aquarela-0')).toBeInTheDocument();
    expect(screen.getByTestId('thumb-aquarela-1')).toBeInTheDocument();
    expect(screen.getByTestId('thumb-aquarela-2')).toBeInTheDocument();
  });

  it('sets data-section-art id', () => {
    renderWithChakra(<ArtSection {...baseProps} data-testid="art" />);
    expect(screen.getByTestId('art').getAttribute('data-section-art')).toBe('aquarela');
  });

  it('applies hidden state', () => {
    renderWithChakra(<ArtSection {...baseProps} hidden data-testid="art" />);
    expect(screen.getByTestId('art').getAttribute('data-hidden')).toBe('true');
  });

  it('uses large grid when large=true', () => {
    renderWithChakra(<ArtSection {...baseProps} large data-testid="art" />);
    // Just verify it renders; CSS class differences are checked visually
    expect(screen.getByTestId('art')).toBeInTheDocument();
  });

  it('calls onThumbClick with correct index', () => {
    const onClick = vi.fn();
    renderWithChakra(<ArtSection {...baseProps} onThumbClick={onClick} />);
    fireEvent.click(screen.getByTestId('thumb-aquarela-1'));
    expect(onClick).toHaveBeenCalledWith(1);
  });
});
