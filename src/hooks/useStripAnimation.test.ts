import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useStripAnimation } from './useStripAnimation';
import { useRef } from 'react';

describe('useStripAnimation', () => {
  it('returns pause and resume functions', () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      return useStripAnimation(ref, { speed: 30, direction: 'left', pauseOnHover: true });
    });
    expect(typeof result.current.pause).toBe('function');
    expect(typeof result.current.resume).toBe('function');
  });

  it('does not throw when ref is null', () => {
    expect(() => {
      renderHook(() => {
        const ref = useRef<HTMLDivElement>(null);
        useStripAnimation(ref, { speed: 30, direction: 'left', pauseOnHover: false });
      });
    }).not.toThrow();
  });
});
