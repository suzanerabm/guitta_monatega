'use client';
import { useEffect, useState, type RefObject } from 'react';

export function useScrollReveal(
  ref: RefObject<HTMLElement | null>,
  options?: { threshold?: number; once?: boolean }
): boolean {
  const [isVisible, setIsVisible] = useState(false);
  const threshold = options?.threshold ?? 0.15;
  const once = options?.once ?? true;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold, once]);

  return isVisible;
}
