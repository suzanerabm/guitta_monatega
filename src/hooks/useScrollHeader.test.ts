import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useScrollHeader } from './useScrollHeader';

describe('useScrollHeader', () => {
  it('returns isCompact false initially', () => {
    const { result } = renderHook(() => useScrollHeader(80));
    expect(result.current.isCompact).toBe(false);
  });

  it('sets isCompact true when scrolling down past threshold', () => {
    const { result } = renderHook(() => useScrollHeader(80));
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 150, writable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.isCompact).toBe(true);
  });
});
