'use client';
import { Box } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

// Geometry constants — shared with KammaraCard so the gate label padding
// and the roulette horizontal offset stay in sync.
export const ROULETTE_SPHERE_SIZE = 56; // diameter of each orbiting sphere in px (fits composite glyphs like ⊹⊙⊹)
export const ROULETTE_ORBIT_RADIUS = 56; // base orbit radius in px — used as minimum; actual radius grows if needed to prevent sphere overlap
export const ROULETTE_GAP_AFTER = 10; // breathing room between sphere and gate label in px
/** Minimum gap between two adjacent spheres along the orbit (px). */
export const ROULETTE_SPHERE_GAP = 8;

/**
 * Compute the orbit radius needed to fit N spheres without overlap.
 * The chord between two adjacent points on a circle is 2*r*sin(π/N).
 * For no overlap: 2*r*sin(π/N) >= sphereSize + gap → r >= (sphereSize + gap) / (2*sin(π/N)).
 * Returns the larger of this minimum and the base radius, so we never shrink below it.
 */
export function computeOrbitRadius(itemCount: number): number {
  if (itemCount <= 1) return ROULETTE_ORBIT_RADIUS;
  const required = (ROULETTE_SPHERE_SIZE + ROULETTE_SPHERE_GAP) / (2 * Math.sin(Math.PI / itemCount));
  return Math.max(ROULETTE_ORBIT_RADIUS, Math.ceil(required));
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
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalItems = items.length;
  const r = computeOrbitRadius(totalItems);

  const scheduleHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setShooting(true);
      setTimeout(() => {
        setRouletteOpen(false);
        setShooting(false);
      }, 600);
    }, 6000);
  };

  const showRoulette = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setRouletteOpen(true);
    scheduleHide();
  };

  useEffect(() => {
    scheduleHide();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, []);

  // Compute the angle for each position (0 = active/top, others evenly
  // distributed around the circle). For odd counts, the active stays at
  // the top and the remaining items mirror symmetrically — left/right
  // balanced around the vertical axis.
  const angleForPosition = (positionIndex: number) => {
    if (positionIndex === 0) return -Math.PI / 2; // active at top
    const others = totalItems - 1;
    // Evenly distribute the remaining `others` around the arc below
    // (from the right of the top, going clockwise all the way to the
    // left of the top). Skip the top slot (occupied by the active).
    // Step = full circle minus the active slot, divided by (others + 1)
    // so there's symmetric spacing on each side.
    const arc = 2 * Math.PI; // full circle
    const step = arc / totalItems;
    // Position 1 → first slot clockwise from top (right side)
    // Position N-1 → last slot (left side, just before top)
    return -Math.PI / 2 + positionIndex * step;
  };

  // Float keyframes
  const floatKeyframes = items.map((_, positionIndex) => {
    const angle = angleForPosition(positionIndex);
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    return `@keyframes kcFloat${positionIndex} {
      0%, 100% { transform: translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) translateY(0); }
      50% { transform: translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) translateY(-3px); }
    }`;
  }).join('\n');

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
            // Fixed angle for this position (0 = top, clockwise)
            const angle = angleForPosition(positionIndex);
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
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
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  animation: `kcFloat${positionIndex} 3s ease-in-out infinite ${floatDelay}`,
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
