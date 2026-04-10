'use client';
import { useState, useEffect, useRef } from 'react';

export function useScrollHeader(threshold = 80) {
  const [isCompact, setIsCompact] = useState(false);
  const lastScrollRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const scrollingDown = y > lastScrollRef.current && y > threshold;
      setIsCompact(scrollingDown);
      lastScrollRef.current = y;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return { isCompact };
}
