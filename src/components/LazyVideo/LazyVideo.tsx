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
  // Hover graceful-stop: when the pointer leaves we DON'T cut the clip mid-way.
  // We let the current loop finish and stop at the end. `stopping` records that
  // intent so the `ended` handler knows to halt (and re-entering cancels it).
  const stoppingRef = useRef(false);

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

  // Tracks whether the pointer is currently over the card. Needed because the
  // <video> may only finish loading AFTER mouse-enter (preload="none" means no
  // data yet on the first hover); when it becomes playable we only auto-play if
  // the pointer is still there.
  const hoveringRef = useRef(false);

  // Robustly start playback. On the first hover the freshly-mounted <video>
  // often has no data yet, so play() rejects; we then wait for `canplay` and
  // try once more (if the pointer is still over the card). This is what fixed
  // "only some clips play" — slower-to-buffer clips were losing the first race.
  const tryPlay = (v: HTMLVideoElement | null) => {
    if (!v) return;
    v.play().catch(() => {
      const onCanPlay = () => {
        v.removeEventListener('canplay', onCanPlay);
        if (hoveringRef.current) v.play().catch(() => {});
      };
      v.addEventListener('canplay', onCanPlay);
    });
  };

  // Hover handlers (no-op unless playOn === 'hover'). Once activated the
  // <video> STAYS mounted — on leave we let the current loop finish, so there's
  // no abrupt cut and re-hover is instant.
  const onEnter =
    playOn === 'hover'
      ? () => {
          hoveringRef.current = true;
          stoppingRef.current = false; // re-entering cancels a pending stop
          setActive(true);
          const v = videoRef.current;
          if (v) v.loop = true;
          // The <video> may have just mounted; give it a tick before play().
          requestAnimationFrame(() => tryPlay(videoRef.current));
        }
      : undefined;
  const onLeave =
    playOn === 'hover'
      ? () => {
          hoveringRef.current = false;
          // Don't pause now — let it play to the end of this loop, then stop.
          stoppingRef.current = true;
          const v = videoRef.current;
          if (v) v.loop = false; // disable loop so it fires `ended` this round
        }
      : undefined;

  // When the clip reaches the end after the pointer left, stop and reset to the
  // first frame (which matches the poster). If the pointer came back meanwhile,
  // `stopping` is false and we just let it loop again.
  const onEnded = () => {
    const v = videoRef.current;
    if (!v) return;
    if (stoppingRef.current) {
      v.pause();
      v.currentTime = 0;
      stoppingRef.current = false;
    } else {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  };

  return (
    <Box
      ref={wrapRef}
      position="relative"
      width="100%"
      height="100%"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Before activation: just the poster (cheap, lazy). The <video> isn't
          mounted yet, so nothing downloads. */}
      {!active && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt={alt} loading="lazy" decoding="async" style={media} />
      )}
      {/* After activation the <video> stays mounted; its own `poster` shows
          while paused, so pausing on mouse-leave looks like the still image. */}
      {active && (
        <video
          ref={videoRef}
          // 'visible' loops natively; 'hover' controls loop via JS so it can
          // finish the current round after the pointer leaves (see onEnded).
          loop={playOn === 'visible'}
          onEnded={playOn === 'hover' ? onEnded : undefined}
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
