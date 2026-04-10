'use client';
import { useEffect, type RefObject } from 'react';

export function useParallax(ref: RefObject<HTMLElement | null>, speed = 0.15) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let rafId: number;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;
      if (rect.bottom > 0 && rect.top < windowH) {
        const offset = rect.top * speed;
        el.style.transform = `translateY(${offset}px)`;
      }
      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [ref, speed]);
}
