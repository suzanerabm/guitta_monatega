import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { ConnectedCardFrame } from './ConnectedCardFrame';

describe('ConnectedCardFrame', () => {
  it('renders all four connected cards', () => {
    renderWithChakra(
      <ConnectedCardFrame
        colors={['#111111', '#222222', '#333333', '#444444']}
        negativeBackground="#000000"
      >
        <div>One</div>
        <div>Two</div>
        <div>Three</div>
        <div>Four</div>
      </ConnectedCardFrame>,
    );

    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Four')).toBeInTheDocument();
  });
});
