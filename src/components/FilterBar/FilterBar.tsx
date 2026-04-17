'use client';
import { useState, useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';
import { useChromeTint } from '@/components/ChromeTint';
import { useScrollHeader } from '@/hooks/useScrollHeader';

export interface FilterItem {
  id: string;
  label: string;
  color?: string;
  bgColor?: string;
}

interface FilterBarProps {
  filters: FilterItem[];
  allLabel?: string;
  onFilter: (filterId: string) => void;
}

export function FilterBar({ filters, allLabel = 'Todos', onFilter }: FilterBarProps) {
  const [active, setActive] = useState('all');
  // Combined height of the chrome that sits above the FilterBar:
  // fixed header + fixed breadcrumb (the breadcrumb is the one with
  // aria-label="breadcrumb").
  const [chromeHeight, setChromeHeight] = useState(60);
  const { setTintColor } = useChromeTint();
  const { isHidden } = useScrollHeader(80);
  const navRef = useRef<HTMLElement>(null);

  // Measure header + breadcrumb heights dynamically so the sticky
  // FilterBar sits flush below them and scroll offsets stay correct.
  useEffect(() => {
    const measure = () => {
      const header = document.querySelector('header');
      const breadcrumb = document.querySelector('nav[aria-label="breadcrumb"]');
      const headerH = header?.getBoundingClientRect().height ?? 0;
      const breadcrumbH = breadcrumb?.getBoundingClientRect().height ?? 0;
      setChromeHeight(headerH + breadcrumbH);
    };
    measure();
    const observer = new ResizeObserver(measure);
    const header = document.querySelector('header');
    const breadcrumb = document.querySelector('nav[aria-label="breadcrumb"]');
    if (header) observer.observe(header);
    if (breadcrumb) observer.observe(breadcrumb);
    window.addEventListener('scroll', measure, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', measure);
    };
  }, []);

  // Sync tint color with the chrome (header)
  useEffect(() => {
    const f = filters.find((x) => x.id === active);
    setTintColor(f?.bgColor ?? null);
    return () => setTintColor(null);
  }, [active, filters, setTintColor]);

  const handleClick = (id: string) => {
    setActive(id);
    onFilter(id);

    // 'all' jumps to the very top of the page so the user sees the hero
    // again — fire immediately, no need to wait for re-render.
    if (id === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Specific filter: wait for the hidden->visible transition (max-height
    // 0.5s) to finish so getBoundingClientRect returns the final, expanded
    // section positions. Otherwise sections that were collapsed report
    // stale coordinates and the scroll lands in the wrong place.
    setTimeout(() => {
      const bar = navRef.current;
      if (!bar) return;

      const selectors = [
        `[data-section-creature="${id}"]`,
        `[data-section-art="${id}"]`,
        `[data-section-world="${id}"]`,
      ];
      let target: HTMLElement | null = null;
      for (const sel of selectors) {
        target = document.querySelector(sel);
        if (target) break;
      }
      if (!target) return;

      const barRect = bar.getBoundingClientRect();
      const offset = barRect.bottom + 10;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }, 550);
  };

  // When a filter with bgColor is active, the whole bar takes that color
  // and all non-active buttons become white-translucent.
  const activeFilter = filters.find((f) => f.id === active);
  const barBg = activeFilter?.bgColor || 'overlayLight';
  const tintMode = !!activeFilter?.bgColor;

  return (
    <Box
      ref={navRef}
      as="nav"
      position="sticky"
      top={isHidden ? '0' : `${chromeHeight}px`}
      zIndex={98}
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexWrap="wrap"
      gap={{ base: '0.35rem', md: '0.5rem' }}
      px={{ base: '1rem', md: '1.5rem' }}
      py={{ base: '0.6rem', md: '0.8rem' }}
      bg={barBg}
      backdropFilter="blur(14px)"
      borderBottom={tintMode ? 'none' : '1px solid'}
      borderColor="borderSoft"
      transition="background 0.4s ease, top 0.3s ease, transform 0.3s ease, opacity 0.3s ease"
    >
      <FilterButton
        label={allLabel}
        active={active === 'all'}
        tintMode={tintMode}
        onClick={() => handleClick('all')}
      />
      {filters.map((f) => (
        <FilterButton
          key={f.id}
          label={f.label}
          active={active === f.id}
          tintMode={tintMode}
          color={f.color}
          bgColor={f.bgColor}
          onClick={() => handleClick(f.id)}
        />
      ))}
    </Box>
  );
}

interface FilterButtonProps {
  label: string;
  active: boolean;
  tintMode: boolean;
  color?: string;
  bgColor?: string;
  onClick: () => void;
}

function FilterButton({
  label,
  active,
  tintMode,
  color,
  onClick,
}: FilterButtonProps) {
  // When the bar is in "tint mode" (some colored filter active), all
  // non-active buttons get white-translucent border/text
  let borderColor: string;
  let textColor: string;
  let bg: string;

  if (active) {
    bg = color || 'ink';
    borderColor = color || 'ink';
    textColor = 'white';
  } else if (tintMode) {
    bg = 'transparent';
    borderColor = 'textOverlayGhost';
    textColor = 'bannerLabel';
  } else {
    bg = 'transparent';
    borderColor = 'border';
    textColor = 'inkSoft';
  }

  return (
    <Box
      as="button"
      onClick={onClick}
      fontFamily="body"
      fontSize={{ base: 'xs', md: 'sm' }}
      letterSpacing="normal"
      textTransform="uppercase"
      px={{ base: '0.7rem', md: '1rem' }}
      py={{ base: '0.3rem', md: '0.4rem' }}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="20px"
      bg={bg}
      color={textColor}
      cursor="pointer"
      transition="all 0.25s ease"
      _hover={{
        borderColor: active ? borderColor : tintMode ? 'textOverlayDim' : 'inkMuted',
        color: active ? textColor : tintMode ? 'white' : 'ink',
      }}
    >
      {label}
    </Box>
  );
}
