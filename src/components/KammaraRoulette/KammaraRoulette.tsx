'use client';
import { Box } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

// Geometry constants — shared with KammaraCard so the gate label padding
// and the roulette horizontal offset stay in sync.
export const ROULETTE_SPHERE_SIZE = 64; // diameter of each orbiting sphere in px (fits composite glyphs like ⊹⊙⊹)
export const ROULETTE_ORBIT_RADIUS = 56; // base orbit radius in px — used as minimum; actual radius grows if needed to prevent sphere overlap
export const ROULETTE_GAP_AFTER = 10; // breathing room between sphere and gate label in px
/** Minimum gap between two adjacent spheres along the orbit (px). */
export const ROULETTE_SPHERE_GAP = 8;

/**
 * Compute the orbit radius needed to fit N spheres without overlap on an
 * OPEN ARC (active at top + N-1 non-active items stepping clockwise).
 *
 * The chord between two adjacent points on a circle is 2*r*sin(θ/2) where
 * θ is the angular step. For no overlap we need chord ≥ sphere + gap.
 * With an open arc, the tightest neighbors are adjacent items; since the
 * arc doesn't close, we just need the step to guarantee non-collision.
 *
 * Returns the larger of the required r and the base radius.
 */
export function computeOrbitRadius(itemCount: number): number {
  if (itemCount <= 1) return ROULETTE_ORBIT_RADIUS;
  // Use the closed-circle formula as a safe upper bound (more conservative
  // than needed for an open arc, but guarantees no collision in any case).
  const required = (ROULETTE_SPHERE_SIZE + ROULETTE_SPHERE_GAP) / (2 * Math.sin(Math.PI / itemCount));
  return Math.max(ROULETTE_ORBIT_RADIUS, Math.ceil(required));
}

/**
 * Compute (x, y) position for a slot on an OPEN ARC.
 * - Slot 0 sits at the top of the circle (-90°).
 * - Slots 1..N-1 march clockwise with the minimum step needed to keep
 *   adjacent spheres from touching (chord = sphere + gap).
 */
function positionForSlot(slotIndex: number, r: number): { x: number; y: number } {
  if (slotIndex === 0) return { x: 0, y: -r };
  // Angular step: minimum to keep adjacent chord ≥ SPHERE + GAP.
  const minStep = 2 * Math.asin((ROULETTE_SPHERE_SIZE + ROULETTE_SPHERE_GAP) / (2 * r));
  const angle = -Math.PI / 2 + slotIndex * minStep;
  return { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
}

/**
 * Verify NO two spheres collide. Returns true if any pair is closer than
 * `SPHERE_SIZE + GAP` (i.e. they touch or overlap).
 */
function hasCollision(positions: { x: number; y: number }[]): boolean {
  const minDist = ROULETTE_SPHERE_SIZE + ROULETTE_SPHERE_GAP;
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const dx = positions[i].x - positions[j].x;
      const dy = positions[i].y - positions[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < minDist - 0.01) return true; // 0.01 tolerance for float rounding
    }
  }
  return false;
}

/**
 * Compute the final layout: radius + positions, GUARANTEED collision-free.
 * Starts with `computeOrbitRadius(N)`, verifies with `hasCollision`, and if
 * any pair collides, grows the radius incrementally until none do.
 * This handles the open-arc case where certain indexes could end up near
 * the active sphere even when adjacent-pair chord is fine.
 */
export function computeArcLayout(itemCount: number): {
  radius: number;
  positions: { x: number; y: number }[];
} {
  let r = computeOrbitRadius(itemCount);
  let positions: { x: number; y: number }[] = [];
  for (let attempt = 0; attempt < 50; attempt++) {
    positions = Array.from({ length: itemCount }, (_, i) => positionForSlot(i, r));
    if (!hasCollision(positions)) return { radius: r, positions };
    r += 4; // grow radius and retry
  }
  // Give up (shouldn't happen): return last attempt.
  return { radius: r, positions };
}

export interface KammaraRouletteItem {
  id: string | null;
  icon: string;
  label: string;
  title: string;
}

export interface KammaraRouletteProps {
  items: KammaraRouletteItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
  color: string;
  darkColor: string;
  /**
   * Layout mode:
   * - "inline" (default): the roulette sits in the normal flow. The parent
   *   controls where it goes via layout (flex/grid). Recommended — simpler,
   *   no measurement, no resize logic.
   * - "absolute": the roulette is absolutely positioned inside its nearest
   *   positioned ancestor, aligned horizontally to `cardPaddingX` and
   *   vertically to `top`. Kept for legacy floating-over-card use.
   */
  mode?: 'inline' | 'absolute';
  /** (absolute mode only) Horizontal padding of the parent card. */
  cardPaddingX?: string;
  /** (absolute mode only) Vertical center position relative to the card. */
  top?: string;
}

export function KammaraRoulette({
  items,
  activeIndex,
  onSelect,
  color,
  darkColor,
  mode = 'inline',
  cardPaddingX,
  top = '50%',
}: KammaraRouletteProps) {
  const [rouletteOpen, setRouletteOpen] = useState(true);
  const [shooting, setShooting] = useState(false);
  // Mount flag prevents hydration mismatch: server renders an empty shell,
  // client mounts and then renders the real positions. The collision-free
  // layout computation can produce subtly different floats on server vs
  // client, causing React to discard and re-create the subtree.
  const [mounted, setMounted] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = items.length;
  // Compute collision-free layout: radius + (x,y) for every slot.
  const layout = computeArcLayout(totalItems);
  const r = layout.radius;

  const cancelHide = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };

  const scheduleHide = () => {
    cancelHide();
    hideTimer.current = setTimeout(() => {
      setShooting(true);
      setTimeout(() => {
        setRouletteOpen(false);
        setShooting(false);
      }, 600);
    }, 2500);
  };

  const showRoulette = () => {
    cancelHide();
    setRouletteOpen(true);
  };

  const handleMouseLeave = () => {
    // Only start the auto-hide timer when the mouse leaves — not while it
    // hovers over the roulette. The user stays in control while interacting.
    if (rouletteOpen) scheduleHide();
  };

  useEffect(() => {
    scheduleHide();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, []);

  // Positions are pre-computed by `computeArcLayout` which guarantees zero
  // collisions between any pair of spheres (iteratively grows the radius
  // if the initial one would cause overlap). Use positions from there.
  const positionFor = (positionIndex: number) => layout.positions[positionIndex];

  // Float keyframes — ONLY animates a tiny vertical bounce.
  // Position is set by inline transform (stable, no conflict).
  // This keyframe is identical for all spheres.
  const floatKeyframes = `@keyframes kcFloatBounce {
    0%, 100% { translate: 0 0; }
    50% { translate: 0 -3px; }
  }`;

  // Shooting star keyframe
  const shootSteps = 20;
  const shootKf = `@keyframes kcShoot {
${Array.from({ length: shootSteps + 1 }).map((_, s) => {
    const pct = (s / shootSteps) * 100;
    const a = -Math.PI / 2 + (s / shootSteps) * 2 * Math.PI;
    const sx = Math.cos(a) * r;
    const sy = Math.sin(a) * r;
    const op = s < shootSteps * 0.8 ? 1 : 1 - ((s - shootSteps * 0.8) / (shootSteps * 0.2));
    return `    ${pct.toFixed(0)}% { transform: translate(calc(-50% + ${sx.toFixed(1)}px), calc(-50% + ${sy.toFixed(1)}px)); opacity: ${op.toFixed(2)}; }`;
  }).join('\n')}
  }`;

  // Skip rendering until mounted on the client — prevents hydration mismatch
  // caused by float math differences between server (Node) and client (browser)
  // in the collision-free layout computation.
  if (!mounted) return null;

  return (
    <>
      <style>{floatKeyframes}{'\n'}{shootKf}</style>
      <Box
        {...(mode === 'absolute'
          ? {
              position: 'absolute' as const,
              top,
              left: `calc(${cardPaddingX ?? '0px'} + ${ROULETTE_SPHERE_SIZE / 2}px)`,
              zIndex: 40,
              css: {
                // (top, left) marks the LOGICAL CENTER of the orbit.
                transform: `translate(-50%, -50%)`,
              },
            }
          : {
              position: 'relative' as const,
            })}
        overflow="visible"
        onMouseEnter={showRoulette}
        onMouseLeave={handleMouseLeave}
        width={`${r * 2 + ROULETTE_SPHERE_SIZE}px`}
        height={`${r * 2 + ROULETTE_SPHERE_SIZE}px`}
      >
        <Box
          position="relative"
          width="100%"
          height="100%"
        >
          {/* Physical circles are FIXED in place — we iterate over positions
              (0..N-1), not items. The glyph shown at each position is
              determined by rotating the items list by activeIndex, so
              position 0 (top) always shows the active item's glyph. */}
          {items.map((_, positionIndex) => {
            // Fixed position for this slot (circular for even, vertical columns for odd)
            const { x, y } = positionFor(positionIndex);
            // Which item lands at this position (rotate list by activeIndex)
            const itemIndex = (activeIndex + positionIndex) % totalItems;
            const item = items[itemIndex];
            const isActive = positionIndex === 0;
            const floatDelay = `${positionIndex * -0.4}s`;
            const visible = isActive || rouletteOpen;
            const shootDelay = shooting && !isActive
              ? `${(positionIndex / totalItems) * 0.6}s`
              : '0s';

            return (
              <Box
                key={positionIndex}
                as="button"
                aria-label={item.label || item.title}
                title={item.label || item.title}
                onClick={() => isActive ? showRoulette() : onSelect(itemIndex)}
                position="absolute"
                top="50%"
                left="50%"
                width={`${ROULETTE_SPHERE_SIZE}px`}
                height={`${ROULETTE_SPHERE_SIZE}px`}
                borderRadius="50%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
                zIndex={isActive ? 30 : 25}
                style={{
                  // Position via inline transform (stable across re-renders).
                  // The `kcFloatBounce` animation only adds a tiny vertical
                  // wobble via the `translate` CSS property, which composes
                  // on top of `transform` without conflict.
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  animation: `kcFloatBounce 3s ease-in-out infinite ${floatDelay}`,
                  opacity: visible && !shooting ? 1 : isActive ? 1 : 0,
                  pointerEvents: visible ? 'auto' : 'none',
                  transitionProperty: 'opacity',
                  transitionDuration: '0.25s',
                  transitionTimingFunction: 'ease-out',
                  transitionDelay: shooting && !isActive ? shootDelay : '0s',
                }}
                fontFamily="glyph"
                fontSize="glyphH3"
                lineHeight={1}
                // Treat multi-glyph icons as one compact symbol: keep them
                // on a single line with a tiny breathing gap between chars
                // so they read as a group without blurring together.
                letterSpacing="0.04em"
                whiteSpace="nowrap"
                css={{
                  border: isActive ? `2px solid ${color}` : `1px solid ${color}50`,
                  background: isActive
                    ? `radial-gradient(circle at 30% 30%, ${color}80, ${color}30 60%, ${darkColor})`
                    : `${darkColor}dd`,
                  color: isActive ? 'var(--chakra-colors-white)' : `${color}aa`,
                  boxShadow: isActive
                    ? `0 0 20px ${color}80, inset 0 1px 0 var(--chakra-colors-outlineStrong)`
                    : `var(--chakra-shadows-card), inset 0 1px 0 var(--chakra-colors-outlineSoft)`,
                  '&:hover': {
                    borderColor: color,
                    boxShadow: `0 0 16px ${color}60`,
                    color: 'var(--chakra-colors-white)',
                  },
                }}
              >
                {item.icon}
              </Box>
            );
          })}

          {/* Shooting star particle */}
          {shooting && (
            <Box
              position="absolute"
              top="50%"
              left="50%"
              width="10px"
              height="10px"
              borderRadius="50%"
              pointerEvents="none"
              css={{
                background: `radial-gradient(circle, var(--chakra-colors-white) 0%, ${color} 50%, transparent 100%)`,
                boxShadow: `0 0 14px ${color}, 0 0 28px ${color}90, 0 0 6px var(--chakra-colors-white)`,
                filter: 'blur(0.5px)',
                animation: 'kcShoot 0.6s ease-in-out forwards',
              }}
            />
          )}
        </Box>
      </Box>
    </>
  );
}
