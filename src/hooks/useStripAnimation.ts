'use client';
import { useEffect, useRef as useReactRef, type RefObject } from 'react';

interface StripOptions {
  /** Animation speed (full loop duration in seconds) */
  speed: number;
  /** Wrapper element used for mousemove detection (the .char-strip container) */
  wrapperRef: RefObject<HTMLElement | null>;
  /** Whether to enable mousemove edge-based playback control */
  enableEdgeControl?: boolean;
  /**
   * When true, forces the animation to pause and disables mousemove
   * edge control. Used while a character card is selected/expanded
   * so the strip doesn't drift out from under the info panel.
   */
  paused?: boolean;
}

/**
 * WAAPI-based marquee animation matching the Astro original.
 *
 * Behavior:
 * - Track moves from translateX(0) to translateX(-halfWidth) over `speed` seconds
 * - On desktop: mousemove on wrapper detects cursor position
 *    - x < 15%: reverse playback (accelerates as you move further left)
 *    - x > 85%: forward playback (accelerates as you move further right)
 *    - center: pauses
 * - On mobile: animation runs continuously, pauses on touchstart
 * - Re-measures scrollWidth via ResizeObserver so the animation adapts
 *   when images load
 */
export function useStripAnimation(
  trackRef: RefObject<HTMLElement | null>,
  options: StripOptions
) {
  const animRef = useReactRef<Animation | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    const wrapper = options.wrapperRef.current;
    if (!track || !wrapper) return;
    if (typeof track.animate !== 'function') return;

    const isMobile =
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 768px)').matches;

    let anim: Animation | null = null;

    const start = () => {
      anim?.cancel();
      const halfWidth = track.scrollWidth / 2;
      if (halfWidth <= 0) return;
      anim = track.animate(
        [
          { transform: 'translateX(0)' },
          { transform: `translateX(-${halfWidth}px)` },
        ],
        {
          duration: options.speed * 1000,
          iterations: Infinity,
          easing: 'linear',
        }
      );
      animRef.current = anim;
    };

    // Initial start
    start();

    // Recompute when track size changes (images load, etc.)
    const ro = new ResizeObserver(() => {
      // Preserve current playback state and rough progress when restarting
      const wasPlaying = anim?.playState !== 'paused';
      start();
      if (!wasPlaying) anim?.pause();
    });
    ro.observe(track);

    // Also re-init once images inside have loaded
    const imgs = track.querySelectorAll('img');
    let pendingImgs = imgs.length;
    const onImgLoad = () => {
      pendingImgs--;
      if (pendingImgs <= 0) start();
    };
    imgs.forEach((img) => {
      if (img.complete) {
        pendingImgs--;
      } else {
        img.addEventListener('load', onImgLoad, { once: true });
        img.addEventListener('error', onImgLoad, { once: true });
      }
    });
    if (pendingImgs <= 0 && imgs.length > 0) start();

    // Mobile: swipe-to-scrub. A animação corre sozinha; ao tocar ela pausa, e
    // ao arrastar o strip ACOMPANHA o dedo (deslocando o currentTime da
    // animação proporcional ao arraste). Ao soltar, a animação retoma de onde
    // parou — então os dois convivem (auto-scroll + swipe manual).
    if (isMobile) {
      let startX = 0;
      let startTime = 0;
      let dragging = false;
      const onTouchStart = (e: TouchEvent) => {
        if (!anim) return;
        anim.pause();
        dragging = true;
        startX = e.touches[0].clientX;
        startTime = (anim.currentTime as number | null) ?? 0;
      };
      const onTouchMove = (e: TouchEvent) => {
        if (!anim || !dragging) return;
        const dx = e.touches[0].clientX - startX;
        const halfWidth = track.scrollWidth / 2;
        if (halfWidth <= 0) return;
        // Converte o deslocamento em px do dedo pra tempo da animação:
        // o ciclo inteiro (speed*1000ms) corresponde a halfWidth px. Arrastar
        // pra a esquerda (dx<0) avança no tempo; pra a direita recua. Mantém
        // dentro de [0, duração] com módulo pra o loop infinito não travar.
        const duration = options.speed * 1000;
        const deltaTime = (-dx / halfWidth) * duration;
        let next = (startTime + deltaTime) % duration;
        if (next < 0) next += duration;
        anim.currentTime = next;
      };
      const onTouchEnd = () => {
        dragging = false;
        anim?.play();
      };
      wrapper.addEventListener('touchstart', onTouchStart, { passive: true });
      wrapper.addEventListener('touchmove', onTouchMove, { passive: true });
      wrapper.addEventListener('touchend', onTouchEnd);
      return () => {
        ro.disconnect();
        anim?.cancel();
        wrapper.removeEventListener('touchstart', onTouchStart);
        wrapper.removeEventListener('touchmove', onTouchMove);
        wrapper.removeEventListener('touchend', onTouchEnd);
      };
    }

    // Desktop: mousemove edge control
    if (!options.enableEdgeControl) {
      return () => {
        ro.disconnect();
        anim?.cancel();
      };
    }

    // Edge control: dead zone in the middle (15%–85%), and the closer the
    // cursor gets to the left/right edge the faster the strip plays.
    //
    // Ramp uses a normalized 0..1 factor across the 15% edge window, raised
    // to a power so the acceleration is gentle near the dead zone and much
    // steeper right at the edge. Multiplier caps the max speed boost.
    const EDGE = 0.15;
    const MAX_BOOST = 8; // peak playbackRate magnitude when cursor hits the edge
    const CURVE = 2; // >1 = more aggressive near the edge
    const onMouseMove = (e: MouseEvent) => {
      if (!anim) return;
      // If externally paused, ignore edge control entirely.
      if (options.paused) return;
      const rect = wrapper.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      if (x < EDGE) {
        const t = Math.pow((EDGE - x) / EDGE, CURVE); // 0 at dead-zone edge, 1 at x=0
        anim.playbackRate = -(1 + t * (MAX_BOOST - 1));
        // WAAPI refuses to .play() a reversed infinite animation when
        // currentTime is 0/null — nudge it into the first cycle first.
        const ct = (anim.currentTime as number | null) ?? 0;
        if (ct <= 0) anim.currentTime = options.speed * 1000;
        anim.play();
      } else if (x > 1 - EDGE) {
        const t = Math.pow((x - (1 - EDGE)) / EDGE, CURVE); // 0..1
        anim.playbackRate = 1 + t * (MAX_BOOST - 1);
        anim.play();
      } else {
        anim.pause();
      }
    };
    const onMouseLeave = () => {
      if (!anim) return;
      anim.playbackRate = 1;
      anim.play();
    };
    wrapper.addEventListener('mousemove', onMouseMove);
    wrapper.addEventListener('mouseleave', onMouseLeave);

    return () => {
      ro.disconnect();
      anim?.cancel();
      wrapper.removeEventListener('mousemove', onMouseMove);
      wrapper.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [trackRef, options.wrapperRef, options.speed, options.enableEdgeControl]);

  // Separate effect: toggle pause/play on the existing animation when the
  // `paused` flag changes, without tearing down and recreating it (which
  // would reset the strip to translateX(0) and make it "jump").
  useEffect(() => {
    const anim = animRef.current;
    if (!anim) return;
    if (options.paused) {
      anim.pause();
    } else {
      anim.play();
    }
  }, [options.paused]);
}
