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
  // Whether the trigger says "should be playing": pointer-over for hover,
  // in-viewport for visible. The play happens in an effect (below) that also
  // depends on `active`, so play() never races the <video> mount — that race
  // was the "sometimes it doesn't play" bug.
  const [wantPlay, setWantPlay] = useState(false);
  // Hover graceful-stop: when the pointer leaves we DON'T cut the clip mid-way.
  // We let the current loop finish and stop at the end. `stopping` records that
  // intent so the `ended` handler knows to halt (and re-entering cancels it).
  const stoppingRef = useRef(false);

  // `visible` mode: an observer flips `active`/`wantPlay` when the card enters
  // or leaves the viewport — so a strip of clips only ever plays the few on
  // screen, never all of a world's videos at once.
  useEffect(() => {
    if (playOn !== 'visible') return;
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setActive(true);
      setWantPlay(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          setWantPlay(true);
        } else {
          setWantPlay(false);
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

  // The single source of truth for play/pause. Runs after the <video> mounts
  // (depends on `active`), so the element always exists when we call play().
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (wantPlay) {
      stoppingRef.current = false;
      // `visible` loops natively; `hover` controls loop via JS so it can finish
      // the current round after the pointer leaves (see onEnded).
      if (playOn === 'hover') v.loop = true;
      const play = () => v.play().catch(() => {});
      play();
      // preload="none" may mean no data on the first trigger — retry on canplay.
      const onCanPlay = () => v.play().catch(() => {});
      v.addEventListener('canplay', onCanPlay);
      return () => v.removeEventListener('canplay', onCanPlay);
    }
    // Trigger off:
    if (playOn === 'hover') {
      // Let the current loop finish, then stop (see onEnded).
      v.loop = false;
      stoppingRef.current = true;
    } else {
      // Visible mode: just pause where it is; resumes when it scrolls back in.
      v.pause();
    }
  }, [wantPlay, active, playOn]);

  // Hover handlers (no-op unless playOn === 'hover'). They only flip state; the
  // effect above does the actual play once the <video> is in the DOM.
  const onEnter =
    playOn === 'hover'
      ? () => {
          setWantPlay(true);
          setActive(true);
        }
      : undefined;
  const onLeave =
    playOn === 'hover' ? () => setWantPlay(false) : undefined;

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
