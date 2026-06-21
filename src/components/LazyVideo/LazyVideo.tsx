'use client';
import { useEffect, useRef, useState } from 'react';
import { Box } from '@chakra-ui/react';

export interface LazyVideoProps {
  /** Video src (.mp4). The .webm sibling is offered automatically. */
  src: string;
  /** Poster image — shown until the video enters the viewport. */
  poster: string;
  /** Alt text for the poster image (accessibility). */
  alt?: string;
  /** objectFit of both the poster and the video. Default 'cover'. */
  fit?: 'cover' | 'contain';
  /**
   * How close to the viewport (px) the element must be before we mount the
   * <video> and start loading it. Default 300 — loads a bit before it scrolls
   * in so playback feels instant without eager-loading the whole page.
   */
  rootMargin?: string;
}

/**
 * LazyVideo — a viewport-aware looping clip.
 *
 * The performance contract (see specs/2026-06-21-performance-videos-imagens.md):
 *  - Until the element is near the viewport, ONLY the poster image renders —
 *    no <video>, no download. This is what stops the "load every clip at once"
 *    tsunami that was freezing the page.
 *  - When it scrolls in, we mount the <video> with `preload="none"` and play it.
 *    When it scrolls out, we pause it (and keep it mounted so re-entry is
 *    instant — a lightweight cache).
 *  - No `autoPlay`: play is driven by the observer, so dozens of off-screen
 *    clips never fight for bandwidth/CPU at once.
 */
export function LazyVideo({
  src,
  poster,
  alt = '',
  fit = 'cover',
  rootMargin = '300px',
}: LazyVideoProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // `active` = near/in the viewport → mount the <video>. Once true it stays
  // true (cheap re-entry); we only toggle play/pause from then on.
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      // No observer (very old browser / SSR fallback): just activate so the
      // clip still works, accepting the eager load.
      setActive(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          videoRef.current?.play?.().catch(() => {});
        } else {
          videoRef.current?.pause?.();
        }
      },
      { rootMargin },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin]);

  const media: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: fit,
    display: 'block',
  };

  return (
    <Box ref={wrapRef} position="relative" width="100%" height="100%">
      {/* Poster always rendered: it's the placeholder before activation and the
          natural <video> poster after. Cheap, lazy-loaded image. */}
      {!active && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt={alt} loading="lazy" decoding="async" style={media} />
      )}
      {active && (
        <video
          ref={videoRef}
          loop
          muted
          playsInline
          poster={poster}
          preload="none"
          style={media}
        >
          {src.endsWith('.mp4') && (
            <source src={src.replace(/\.mp4$/, '.webm')} type="video/webm" />
          )}
          <source src={src} type="video/mp4" />
        </video>
      )}
    </Box>
  );
}
