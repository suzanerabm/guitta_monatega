'use client';
import { useState, useEffect, useRef } from 'react';

/**
 * Drives the header's compact + hidden states based on scroll position.
 *
 * Previous behaviour reappeared the header on every upward scroll, which
 * conflicted with sticky UI further down the page (e.g. the Kammara
 * subsystem roulette would be covered by the header as soon as the user
 * scrolled up a few pixels to interact with it).
 *
 * Current behaviour:
 *  - scrolling down past `threshold` → header becomes compact AND hidden
 *  - header only reappears when the user scrolls back near the top
 *    (`y <= threshold`). That way it stays out of the way while the user
 *    interacts with content anywhere else on the page.
 */
export function useScrollHeader(threshold = 80) {
  const [isCompact, setIsCompact] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      if (y <= threshold) {
        setIsCompact(false);
        setIsHidden(false);
      } else {
        setIsCompact(true);
        setIsHidden(true);
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return { isCompact, isHidden };
}
