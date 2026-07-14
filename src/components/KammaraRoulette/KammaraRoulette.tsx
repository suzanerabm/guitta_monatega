'use client';
import { Box } from '@chakra-ui/react';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

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

/**
 * Imperative API exposed via a ref. Lets parents "command" the roulette
 * without coupling their own state to the roulette's internals — handy
 * when the card wants to close the menu on scroll, for example.
 */
export interface KammaraRouletteHandle {
  /** Closes the roulette (triggers the shooting-star exit animation). */
  close: () => void;
}

export const KammaraRoulette = forwardRef<KammaraRouletteHandle, KammaraRouletteProps>(function KammaraRoulette({
  items,
  activeIndex,
  onSelect,
  color,
  darkColor,
  mode = 'inline',
  cardPaddingX,
  top = '50%',
}, ref) {
  const [rouletteOpen, setRouletteOpen] = useState(true);
  const [shooting, setShooting] = useState(false);
  // Mount flag prevents hydration mismatch: server renders an empty shell,
  // client mounts and then renders the real positions. The collision-free
  // layout computation can produce subtly different floats on server vs
  // client, causing React to discard and re-create the subtree.
  const [mounted, setMounted] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Timer para a segunda etapa da saída (após a animação de shooting).
  // Guardado à parte para que um clique/abertura no meio da animação possa
  // cancelá-lo — senão a roleta reabre e fecha logo em seguida (bug mobile:
  // "só mostra a estrelinha e não abre").
  const shootTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref used by the IntersectionObserver below to auto-open the roulette
  // when the card first scrolls into view. Gives users a visual hint that
  // there's a menu here — especially important on mobile where the
  // collapsed state was "invisible".
  const rootRef = useRef<HTMLDivElement>(null);
  const hasAutoOpenedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = items.length;
  // Layout has N+1 slots: slot 0 is the "display" sphere at the top
  // (shows the currently active item), slots 1..N are the orbital spheres
  // (one per item, in their fixed positions along the arc).
  const layout = computeArcLayout(totalItems + 1);
  const r = layout.radius;

  const cancelHide = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    if (shootTimer.current) {
      clearTimeout(shootTimer.current);
      shootTimer.current = null;
    }
  };

  const scheduleHide = () => {
    cancelHide();
    hideTimer.current = setTimeout(() => {
      setShooting(true);
      shootTimer.current = setTimeout(() => {
        setRouletteOpen(false);
        setShooting(false);
      }, 600);
    }, 2500);
  };

  const showRoulette = () => {
    cancelHide();
    // Aborta qualquer saída em andamento: se a animação de shooting já tinha
    // começado, `shooting` continuaria true e as esferas orbitais ficariam
    // com opacity 0 (invisíveis) mesmo com a roleta "aberta". Resetar aqui
    // garante que abrir sempre mostra o menu completo.
    setShooting(false);
    setRouletteOpen(true);
  };

  // Imperative close — fires the shooting-star animation and then hides.
  // Same two-step pattern used by the internal `scheduleHide` so the exit
  // looks identical whether triggered by the timer or by a parent.
  const closeRoulette = () => {
    cancelHide();
    if (!rouletteOpen) return;
    setShooting(true);
    shootTimer.current = setTimeout(() => {
      setRouletteOpen(false);
      setShooting(false);
    }, 600);
  };

  useImperativeHandle(ref, () => ({
    close: closeRoulette,
  }));

  const handleMouseLeave = () => {
    // Only start the auto-hide timer when the mouse leaves — not while it
    // hovers over the roulette. The user stays in control while interacting.
    if (rouletteOpen) scheduleHide();
  };

  useEffect(() => {
    scheduleHide();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (shootTimer.current) clearTimeout(shootTimer.current);
    };
  }, []);

  // Auto-open once when the roulette scrolls into view — the initial
  // `rouletteOpen=true` state schedules a hide right after mount, so by the
  // time the user actually scrolls to the card, the roulette is already
  // closed and looks like a lonely sphere. This observer re-opens it once
  // the user gets there, which re-schedules a hide from `showRoulette()`.
  // We only do it once per page load (tracked via `hasAutoOpenedRef`) so
  // scrolling past and back doesn't re-pop the menu repeatedly.
  useEffect(() => {
    if (!mounted) return;
    const el = rootRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !hasAutoOpenedRef.current) {
            hasAutoOpenedRef.current = true;
            showRoulette();
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [mounted]);

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
        ref={rootRef}
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
          {/* Display sphere (slot 0, top) — always mirrors the active item. */}
          {(() => {
            const activeItem = items[activeIndex];
            if (!activeItem) return null;
            const { x, y } = positionFor(0);
            return (
              <Box
                key="display"
                as="button"
                aria-label={activeItem.label || activeItem.title}
                title={activeItem.label || activeItem.title}
                onClick={showRoulette}
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
                zIndex={30}
                style={{
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  animation: `kcFloatBounce 3s ease-in-out infinite 0s`,
                }}
                fontFamily="glyph"
                fontSize={activeItem.icon.length >= 5 ? '0.95rem' : 'glyphH3'}
                lineHeight={1}
                letterSpacing="0.04em"
                whiteSpace="nowrap"
                css={{
                  border: `2px solid ${color}`,
                  background: `radial-gradient(circle at 30% 30%, ${color}80, ${color}30 60%, ${darkColor})`,
                  color: 'var(--chakra-colors-white)',
                  boxShadow: `0 0 20px ${color}80, inset 0 1px 0 var(--chakra-colors-outlineStrong)`,
                  '&:hover': {
                    borderColor: color,
                    boxShadow: `0 0 16px ${color}60`,
                  },
                }}
              >
                {activeItem.icon}
              </Box>
            );
          })()}

          {/* Orbital spheres — fixed to their items; iterating over `items`
              directly means each glyph stays on its own sphere regardless
              of which is active. Slot 0 is reserved for the display above. */}
          {items.map((item, itemIndex) => {
            // Orbital slots start at position 1 (skip 0, reserved for display).
            const positionIndex = itemIndex + 1;
            const { x, y } = positionFor(positionIndex);
            const floatDelay = `${positionIndex * -0.4}s`;
            const visible = rouletteOpen;
            // Visual-only hint: which orbital matches the current selection.
            // Does NOT affect visibility/behavior — sphere still closes with
            // the rest of the orbit, still clickable, etc.
            const isSelected = itemIndex === activeIndex;
            const shootDelay = shooting
              ? `${(positionIndex / (totalItems + 1)) * 0.6}s`
              : '0s';

            return (
              <Box
                key={itemIndex}
                as="button"
                aria-label={item.label || item.title}
                title={item.label || item.title}
                onClick={() => {
                  onSelect(itemIndex);
                  showRoulette();
                }}
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
                zIndex={25}
                style={{
                  // Position via inline transform (stable across re-renders).
                  // The `kcFloatBounce` animation only adds a tiny vertical
                  // wobble via the `translate` CSS property, which composes
                  // on top of `transform` without conflict.
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  animation: `kcFloatBounce 3s ease-in-out infinite ${floatDelay}`,
                  opacity: visible && !shooting ? 1 : 0,
                  pointerEvents: visible ? 'auto' : 'none',
                  transitionProperty: 'opacity',
                  transitionDuration: '0.25s',
                  transitionTimingFunction: 'ease-out',
                  transitionDelay: shooting ? shootDelay : '0s',
                }}
                fontFamily="glyph"
                // Long glyph icons (5+ chars) shrink so they fit inside the sphere.
                fontSize={item.icon.length >= 5 ? '0.95rem' : 'glyphH3'}
                lineHeight={1}
                // Treat multi-glyph icons as one compact symbol: keep them
                // on a single line with a tiny breathing gap between chars
                // so they read as a group without blurring together.
                letterSpacing="0.04em"
                whiteSpace="nowrap"
                css={{
                  border: isSelected ? `1.5px solid ${color}` : `1px solid ${color}50`,
                  background: `${darkColor}dd`,
                  color: isSelected ? color : `${color}aa`,
                  boxShadow: isSelected
                    ? `0 0 8px ${color}40, inset 0 1px 0 var(--chakra-colors-outlineSoft)`
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
});
