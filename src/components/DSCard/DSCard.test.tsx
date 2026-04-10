import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { DSCard } from './DSCard';

describe('DSCard', () => {
  it('renders children in plain mode', () => {
    renderWithChakra(
      <DSCard>
        <span>hello</span>
      </DSCard>
    );
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('renders both slots and spine titles in reveal mode', () => {
    renderWithChakra(
      <DSCard
        reveal={{
          left: { title: 'LEFT', content: <span>left-content</span> },
          right: { title: 'RIGHT', content: <span>right-content</span> },
        }}
      />
    );
    expect(screen.getByText('left-content')).toBeInTheDocument();
    expect(screen.getByText('right-content')).toBeInTheDocument();
    expect(screen.getByText('LEFT')).toBeInTheDocument();
    expect(screen.getByText('RIGHT')).toBeInTheDocument();
  });
});
