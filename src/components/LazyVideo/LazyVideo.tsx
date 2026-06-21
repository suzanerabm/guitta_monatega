'use client';
import { useEffect, useRef, useState } from 'react';
import { Box } from '@chakra-ui/react';

export interface LazyVideoProps {
  /** Video src (.mp4). The .webm sibling is offered automatically. */
  src: string;
  /** Poster image — shown until the video plays. */
  poster: string;
  /** Alt text for the poster image (accessibility). */
  alt?: string;
  /** objectFit of both the poster and the video. Default 'cover'. */
  fit?: 'cover' | 'contain';
  /**
   * What triggers playback:
   *  - `'hover'` (default): the clip stays a still poster until the pointer is
   *    over it; then it loads and plays in place, pausing back to the poster on
   *    leave. Cheapest — only the clip you're looking at ever downloads.
   *  - `'visible'`: plays whenever it's near/in the viewport (auto-play feel),
   *    pausing when it scrolls away.
   */
  playOn?: 'hover' | 'visible';
  /**
   * For `playOn="visible"`: how close to the viewport (px) before we mount and
   * load the <video>. Default 300 so playback feels instant on scroll-in.
   */
  rootMargin?: string;
}

/**
 * LazyVideo — a still poster that becomes a looping clip on demand.
 *
 * The performance contract (specs/2026-06-21-performance-videos-imagens.md):
 * the page was freezing because every clip auto-played and downloaded at once.
 * Here the heavy <video> is only mounted (and only then does it download, with
 * `preload="none"`) when its trigger fires — hover by default — so at most a
 * handful of clips are ever live. The poster carries the visual the rest of the
 * time. No `autoPlay`, ever.
 */
export function LazyVideo({
  src,
  poster,
  alt = '',
  fit = 'cover',
  playOn = 'hover',
  rootMargin = '300px',
}: LazyVideoProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // `active` = mount the <video>. For hover it tracks the pointer; for visible
  // it latches true on first intersection (cheap re-entry afterwards).
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (playOn !== 'visible') return;
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
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
  }, [playOn, rootMargin]);

  const media: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: fit,
    display: 'block',
  };

  // Hover handlers (no-op unless playOn === 'hover').
  const onEnter =
    playOn === 'hover'
      ? () => {
          setActive(true);
          // play() may need a tick for the freshly-mounted <video>.
          requestAnimationFrame(() => videoRef.current?.play?.().catch(() => {}));
        }
      : undefined;
  const onLeave =
    playOn === 'hover'
      ? () => {
          videoRef.current?.pause?.();
          setActive(false);
        }
      : undefined;

  return (
    <Box
      ref={wrapRef}
      position="relative"
      width="100%"
      height="100%"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Poster: the placeholder before playback (and the <video>'s own poster
          after). Lazy image, so off-screen cards cost almost nothing. */}
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
