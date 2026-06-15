'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Box } from '@chakra-ui/react';

export interface ZoomableImageProps {
  src: string;
  alt?: string;
  /** Max zoom factor. Default 4. */
  maxScale?: number;
  /** Min zoom factor (1 = fit). Default 1. */
  minScale?: number;
  /** Border radius of the image. Default '16px'. */
  borderRadius?: string;
  /** Max rendered height of the fitted image. */
  maxHeight?: string;
  'data-testid'?: string;
}

interface Transform {
  scale: number;
  x: number;
  y: number;
}

const IDENTITY: Transform = { scale: 1, x: 0, y: 0 };

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

function distance(a: React.Touch, b: React.Touch) {
  const dx = a.clientX - b.clientX;
  const dy = a.clientY - b.clientY;
  return Math.hypot(dx, dy);
}

/**
 * ZoomableImage — pinch/scroll to zoom + drag to pan, fully contained.
 *
 * The transform applies to the image only, never the page: `touch-action:
 * none` on the container swallows the browser's native pinch so zooming
 * here can't scroll or zoom the surrounding modal/page. Works with touch
 * (pinch + 1-finger drag, double-tap reset) and mouse (wheel zoom, drag
 * pan, double-click reset).
 *
 * Panning is clamped so the image can't be dragged entirely out of view.
 */
export function ZoomableImage({
  src,
  alt = '',
  maxScale = 4,
  minScale = 1,
  borderRadius = '16px',
  maxHeight = '60vh',
  'data-testid': testId,
}: ZoomableImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [t, setT] = useState<Transform>(IDENTITY);

  // Gesture bookkeeping kept in a ref so listeners read fresh values
  // without re-subscribing on every transform change.
  const gesture = useRef({
    pinchStartDist: 0,
    pinchStartScale: 1,
    dragging: false,
    lastX: 0,
    lastY: 0,
    lastTapTime: 0,
  });
  // Mirror of the live transform, read inside touch/mouse handlers to
  // decide whether a drag should pan (only when zoomed). Synced via an
  // effect — never written during render.
  const tRef = useRef<Transform>(IDENTITY);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  // Clamp pan so at least part of the image stays within the container.
  // At scale s, the image overflows the box by (s-1)/2 on each axis; we
  // let the user pan up to that overflow (in container-size units).
  const clampPan = useCallback((next: Transform): Transform => {
    const el = containerRef.current;
    if (!el) return next;
    const { width, height } = el.getBoundingClientRect();
    const maxX = (Math.max(next.scale, 1) - 1) * width * 0.5;
    const maxY = (Math.max(next.scale, 1) - 1) * height * 0.5;
    return {
      scale: next.scale,
      x: clamp(next.x, -maxX, maxX),
      y: clamp(next.y, -maxY, maxY),
    };
  }, []);

  const reset = useCallback(() => setT(IDENTITY), []);
  // Note: gallery prev/next remounts this component via a `key={src}` on the
  // caller side, which resets the transform — no reset effect needed here.

  // ── Touch gestures ──────────────────────────────────────────
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const g = gesture.current;
    if (e.touches.length === 2) {
      g.pinchStartDist = distance(e.touches[0], e.touches[1]);
      g.pinchStartScale = tRef.current.scale;
      g.dragging = false;
    } else if (e.touches.length === 1) {
      // Double-tap to reset.
      const now = e.timeStamp;
      if (now - g.lastTapTime < 300) {
        setT(IDENTITY);
        g.lastTapTime = 0;
        return;
      }
      g.lastTapTime = now;
      g.dragging = true;
      g.lastX = e.touches[0].clientX;
      g.lastY = e.touches[0].clientY;
    }
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const g = gesture.current;
    if (e.touches.length < 2) g.pinchStartDist = 0;
    if (e.touches.length === 0) g.dragging = false;
  }, []);

  // touchmove + wheel are attached natively with { passive: false } rather
  // than via React props. React registers these as PASSIVE listeners, which
  // silently ignores preventDefault() — letting the browser pinch/zoom the
  // whole page (or the device frame in responsive mode). Attaching them
  // ourselves lets preventDefault actually block the native gesture, so the
  // zoom stays contained to this image.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTouchMove = (e: TouchEvent) => {
      const g = gesture.current;
      if (e.touches.length === 2 && g.pinchStartDist > 0) {
        e.preventDefault();
        const dist = distance(e.touches[0], e.touches[1]);
        const ratio = dist / g.pinchStartDist;
        const scale = clamp(g.pinchStartScale * ratio, minScale, maxScale);
        setT((prev) => clampPan({ ...prev, scale }));
      } else if (e.touches.length === 1 && g.dragging) {
        // Only pan when zoomed in; otherwise let the gesture be a tap.
        if (tRef.current.scale <= 1) return;
        e.preventDefault();
        const dx = e.touches[0].clientX - g.lastX;
        const dy = e.touches[0].clientY - g.lastY;
        g.lastX = e.touches[0].clientX;
        g.lastY = e.touches[0].clientY;
        setT((prev) => clampPan({ ...prev, x: prev.x + dx, y: prev.y + dy }));
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.0015;
      setT((prev) => {
        const scale = clamp(prev.scale + delta * prev.scale, minScale, maxScale);
        return clampPan({ ...prev, scale });
      });
    };

    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('wheel', handleWheel);
    };
  }, [clampPan, maxScale, minScale]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (tRef.current.scale <= 1) return;
    const g = gesture.current;
    g.dragging = true;
    g.lastX = e.clientX;
    g.lastY = e.clientY;
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const g = gesture.current;
      if (!g.dragging) return;
      const dx = e.clientX - g.lastX;
      const dy = e.clientY - g.lastY;
      g.lastX = e.clientX;
      g.lastY = e.clientY;
      setT((prev) => clampPan({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    },
    [clampPan]
  );

  const endMouse = useCallback(() => {
    gesture.current.dragging = false;
  }, []);

  const isZoomed = t.scale > 1;

  return (
    <Box
      ref={containerRef}
      data-testid={testId}
      position="relative"
      display="flex"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      width="100%"
      maxH={maxHeight}
      borderRadius={borderRadius}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={endMouse}
      onMouseLeave={endMouse}
      onDoubleClick={reset}
      css={{
        touchAction: 'none',
        cursor: isZoomed ? 'grab' : 'zoom-in',
        userSelect: 'none',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        style={{
          maxWidth: '100%',
          maxHeight,
          objectFit: 'contain',
          borderRadius,
          display: 'block',
          transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale})`,
          transformOrigin: 'center center',
          // Smooth easing only while fitted (scale 1) — e.g. the snap-back
          // on double-tap reset. Once zoomed, drop the transition so panning
          // tracks the finger/mouse with no rubber-banding lag.
          transition: t.scale > 1 ? 'none' : 'transform 0.18s ease-out',
          willChange: 'transform',
        }}
      />
    </Box>
  );
}
