import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useScrollReveal } from './useScrollReveal';
import { useRef } from 'react';

describe('useScrollReveal', () => {
  it('returns isVisible false initially', () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      return useScrollReveal(ref);
    });
    expect(result.current).toBe(false);
  });
});
