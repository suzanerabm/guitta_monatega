import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useParallax } from './useParallax';
import { useRef } from 'react';

describe('useParallax', () => {
  it('does not throw when ref is null', () => {
    expect(() => {
      renderHook(() => {
        const ref = useRef<HTMLDivElement>(null);
        useParallax(ref, 0.15);
      });
    }).not.toThrow();
  });

  it('accepts speed parameter', () => {
    expect(() => {
      renderHook(() => {
        const ref = useRef<HTMLDivElement>(null);
        useParallax(ref, 0.5);
      });
    }).not.toThrow();
  });
});
