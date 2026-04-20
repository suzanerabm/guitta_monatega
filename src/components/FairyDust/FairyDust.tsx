'use client';
import { Box } from '@chakra-ui/react';
import { useMemo } from 'react';

export interface FairyDustProps {
  /** Glow color — pass the character's accent (e.g. Brisa = "#7eeded"). */
  color?: string;
  /** How many sparkles to render. */
  count?: number;
  /** Average sparkle diameter in px. Each particle varies ±40%. */
  size?: number;
  /** Seconds for a full sparkle cycle (fade in → out). */
  duration?: number;
  /**
   * Restrict the sparkle field to a sub-region of the parent, expressed in
   * percentages. Useful for focusing dust on a body part — e.g. the tail of
   * a Tzir'Kai:
   *   { top: 65, left: 40, width: 25, height: 30 }
   * Defaults to the full container (0,0,100,100).
   */
  area?: { top: number; left: number; width: number; height: number };
  /**
   * Emit from a specific point (in %) and fan out in a direction, creating
   * a core of dense sparkles that trails off diagonally. When provided,
   * `area` is ignored.
   *   origin: { top: 70, left: 55 }   // where the glow starts
   *   spread: { x: 25, y: -30 }       // direction + length of the trail
   *   falloff: 0.7                    // 0..1, higher = tighter core
   */
  emit?: {
    origin: { top: number; left: number };
    spread: { x: number; y: number };
    falloff?: number;
  };
  /** Glow intensity multiplier (1 = default, 2 = twice as bright). */
  intensity?: number;
  /** Cover the whole parent; pair with a positioned container. */
  className?: string;
}

/**
 * Tiny deterministic PRNG so every particle picks stable positions/delays
 * across re-renders without a `key` thrash. A fresh render with the same
 * props always produces the same sparkle pattern.
 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * FairyDust — a stationary field of pulsing light specks. Designed to sit
 * inside a relatively/absolutely positioned container (e.g. a character
 * card or modal image) and add a subtle magic-glow feel.
 *
 * The sparkles DO NOT move. They pulse in opacity and scale with staggered
 * delays so the composition always has some "breathing" going on — like
 * fireflies sitting still but blinking.
 *
 * Purely CSS — no JS animation frame, no dependencies.
 */
export function FairyDust({
  color = '#7eeded',
  count = 15,
  size = 5,
  duration = 3,
  area,
  emit,
  intensity = 1,
  className,
}: FairyDustProps) {
  const bounds = area ?? { top: 0, left: 0, width: 100, height: 100 };
  // Positions and delays are computed once per (count, seed, bounds/emit)
  // combo. Using a fixed seed keeps layout stable across rerenders — if you
  // want a different arrangement, change `count` or re-mount the component.
  const particles = useMemo(() => {
    const seed =
      count * 97 +
      Math.round(size * 10) +
      (emit
        ? Math.round(emit.origin.top * 13 + emit.origin.left * 7 + emit.spread.x * 3 + emit.spread.y * 5)
        : Math.round(bounds.top + bounds.left * 7));
    const rand = mulberry32(seed);
    return Array.from({ length: count }, (_, i) => {
      let top: number;
      let left: number;
      if (emit) {
        // Particles biased toward the origin and fanning toward `spread`.
        // `t` is distance along the trail (0 at origin, 1 at tail end),
        // biased with a power curve so we get a dense core and a thinner tail.
        const falloff = emit.falloff ?? 0.7;
        const t = Math.pow(rand(), 1 / Math.max(0.1, 1 - falloff));
        // Perpendicular scatter — shrinks with t so the trail narrows as
        // it moves away. Uses a box-muller-ish 2-sample average for softer
        // edges than a uniform distribution.
        const scatter = (rand() + rand() - 1) * 6 * (1 - t * 0.5);
        // Perpendicular direction of spread (rotate 90°).
        const len = Math.hypot(emit.spread.x, emit.spread.y) || 1;
        const px = -emit.spread.y / len;
        const py = emit.spread.x / len;
        top = emit.origin.top + emit.spread.y * t + py * scatter;
        left = emit.origin.left + emit.spread.x * t + px * scatter;
      } else {
        top = bounds.top + rand() * bounds.height;
        left = bounds.left + rand() * bounds.width;
      }
      const scale = 0.6 + rand() * 0.7;
      const delay = rand() * duration;
      const pulse = duration * (0.7 + rand() * 0.6);
      return { i, top, left, scale, delay, pulse };
    });
  }, [
    count,
    size,
    duration,
    bounds.top,
    bounds.left,
    bounds.width,
    bounds.height,
    emit,
  ]);

  // A single shared keyframe — every particle uses it, only the delay and
  // duration vary. Declared inline so the component is fully self-contained.
  const keyframes = `@keyframes fairyDustSparkle {
    0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.6); }
    50%      { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
  }`;

  return (
    <Box
      className={className}
      position="absolute"
      inset={0}
      pointerEvents="none"
      aria-hidden="true"
      overflow="hidden"
    >
      <style>{keyframes}</style>
      {particles.map((p) => {
        const px = size * p.scale;
        return (
          <Box
            key={p.i}
            position="absolute"
            top={`${p.top}%`}
            left={`${p.left}%`}
            width={`${px}px`}
            height={`${px}px`}
            borderRadius="50%"
            css={{
              background: `radial-gradient(circle, #ffffff 0%, ${color} 30%, ${color}aa 55%, transparent 85%)`,
              filter: 'blur(0.6px)',
              boxShadow: `0 0 ${px * 2 * intensity}px ${color}, 0 0 ${px * 4 * intensity}px ${color}cc, 0 0 ${px * 8 * intensity}px ${color}60`,
              animation: `fairyDustSparkle ${p.pulse}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
              willChange: 'opacity, transform',
            }}
          />
        );
      })}
    </Box>
  );
}
