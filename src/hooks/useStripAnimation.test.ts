import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useStripAnimation } from './useStripAnimation';
import { useRef } from 'react';

describe('useStripAnimation', () => {
  it('does not throw when refs are null', () => {
    expect(() => {
      renderHook(() => {
        const trackRef = useRef<HTMLDivElement>(null);
        const wrapperRef = useRef<HTMLDivElement>(null);
        useStripAnimation(trackRef, { speed: 30, wrapperRef });
      });
    }).not.toThrow();
  });

  it('accepts the paused flag without throwing', () => {
    expect(() => {
      renderHook(() => {
        const trackRef = useRef<HTMLDivElement>(null);
        const wrapperRef = useRef<HTMLDivElement>(null);
        useStripAnimation(trackRef, { speed: 30, wrapperRef, paused: true });
      });
    }).not.toThrow();
  });
});
