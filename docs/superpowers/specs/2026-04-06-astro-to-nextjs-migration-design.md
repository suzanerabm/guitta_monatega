# Migration Design: Astro to Next.js + Chakra UI v3

**Date:** 2026-04-06
**Status:** Draft
**Scope:** Full migration of guitta_monatega portfolio site from Astro 6 to Next.js + Chakra UI v3

---

## 1. Motivation

- CSS breakpoints in pure Astro are painful to maintain — Chakra's array/object syntax solves this
- React ecosystem is richer for interactivity (modal, filters, animations)
- Chakra v3 provides dark mode, theme tokens, and responsive props natively
- Site will grow (login area planned) — React is a better foundation
- Current project is ~5,600 LOC across 43 files — manageable migration size

## 2. Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Next.js | 15+ | Framework (App Router, SSG) |
| React | 19 | UI library |
| Chakra UI | v3 | Component library + theme system |
| next-intl | latest | i18n (pt-BR, en) |
| Vitest | latest | Unit test runner |
| React Testing Library | latest | Component testing |
| Storybook | 10+ | Component docs + visual regression |
| Playwright | latest | E2E tests |
| Vercel | - | Deployment target |

## 3. Project Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx           # BaseLayout: ChakraProvider + Header + Footer
│   │   ├── page.tsx             # Home
│   │   ├── about/page.tsx
│   │   ├── bichittos/page.tsx
│   │   ├── kammara/page.tsx
│   │   └── art/page.tsx
│   ├── layout.tsx               # Root layout: fonts, metadata
│   └── globals.css              # Minimal reset
├── components/
│   ├── Modal/
│   │   ├── Modal.tsx
│   │   ├── ModalProvider.tsx
│   │   ├── Modal.stories.tsx
│   │   ├── Modal.test.tsx
│   │   └── index.ts
│   ├── Header/
│   │   ├── Header.tsx
│   │   ├── Header.stories.tsx
│   │   ├── Header.test.tsx
│   │   └── index.ts
│   └── ... (same pattern for all 22 components)
├── hooks/
│   ├── useParallax.ts
│   ├── useScrollReveal.ts
│   ├── useStripAnimation.ts
│   └── useScrollHeader.ts
├── theme/
│   ├── index.ts                 # Chakra createSystem config
│   ├── tokens.ts                # Colors, typography, spacing, breakpoints
│   └── palettes.ts              # 13 creature/world palettes
├── i18n/
│   ├── request.ts               # next-intl server config
│   ├── routing.ts               # Locale routing config
│   └── messages/
│       ├── pt-BR.json
│       └── en.json
├── data/
│   └── image-manifest.json      # Generated — all image metadata + translations
├── lib/
│   └── images.ts                # Helpers to query the manifest
└── __tests__/
    └── e2e/                     # Playwright tests

scripts/
├── generate-manifest.ts         # Reads /public/imgs/, outputs manifest JSON

public/
├── imgs/                        # Same images as today, untouched

.storybook/
├── main.ts
└── preview.tsx
```

### Component file convention

Every component follows this pattern:
```
ComponentName/
├── ComponentName.tsx            # Component implementation
├── ComponentName.stories.tsx    # Storybook stories (all states/variants)
├── ComponentName.test.tsx       # Unit tests (Vitest + RTL)
└── index.ts                     # Re-export
```

## 4. Component Mapping

### Presentational Components (stateless)

| Astro Source | React Component | Chakra Primitives |
|---|---|---|
| Header.astro | Header.tsx | Flex, Link, useScrollHeader hook |
| Footer.astro | Footer.tsx | Box, Link |
| Breadcrumb.astro | Breadcrumb.tsx | Chakra Breadcrumb |
| LanguageToggle.astro | LanguageToggle.tsx | useLocale() + Link |
| HomeBanner.astro | HomeBanner.tsx | Box + CSS keyframes (shapes, gradients) |
| HeroSection.astro | HeroSection.tsx | Heading, Text + useTranslations() |
| CreatureCard.astro | CreatureCard.tsx | Card, Image |
| CharacterCard.astro | CharacterCard.tsx | Box + CSS float animation |
| SoonBadge.astro | SoonBadge.tsx | Badge + lucide-react icon |
| SoonPanel.astro | SoonPanel.tsx | Box placeholder |
| WorldCard.astro | WorldCard.tsx | Card with dynamic palette prop |
| DSMainCard.astro | DSMainCard.tsx | Box layout container |
| DSTextPanel.astro | DSTextPanel.tsx | Box with overflow scroll |
| SubSystem.astro | SubSystem.tsx | SimpleGrid (3 cols) |
| BookGallery.astro | BookGallery.tsx | Grid of cover images |
| ArtSection.astro | ArtSection.tsx | Grid of art images |

### Interactive Components (stateful)

| Astro Source | React Component | State Management |
|---|---|---|
| Modal.astro | Modal.tsx + ModalProvider.tsx | React Context: isOpen, images[], currentIndex, galleryId |
| FilterBar.astro | FilterBar.tsx | useState for active filter, callback to parent |
| CharacterStrip.astro | CharacterStrip.tsx | useRef + useStripAnimation hook |
| SceneStrip.astro | SceneStrip.tsx | useRef + useStripAnimation hook (same hook, different config) |
| ScrollReveal.astro | ScrollReveal.tsx | useScrollReveal hook (Intersection Observer) |
| CreatureSection.astro | CreatureSection.tsx | useParallax hook |

### Page Content → Pages

| Astro Source | Next.js Page | Composition |
|---|---|---|
| HomeContent.astro | app/[locale]/page.tsx | HomeBanner + HeroSection + WorldCards |
| AboutContent.astro | app/[locale]/about/page.tsx | Static translated content |
| BichittosContent.astro | app/[locale]/bichittos/page.tsx | FilterBar + CreatureSection + BookGallery + Modal |
| KammaraContent.astro | app/[locale]/kammara/page.tsx | Star field CSS + WorldCards + SceneStrip |
| ArtContent.astro | app/[locale]/art/page.tsx | FilterBar + ArtSections + Modal |

### What Disappears

| Astro | Replaced By |
|---|---|
| BaseLayout.astro | app/[locale]/layout.tsx |
| tokens.css | theme/tokens.ts + theme/palettes.ts |
| global.css | globals.css (minimal reset, Chakra handles the rest) |
| Inline `<script>` tags | React hooks in hooks/ |

## 5. Modal / Gallery System

### Architecture

```
ModalProvider (React Context)
├── State: { isOpen, images[], currentIndex, galleryId }
├── Actions: openGallery(id, startIndex), close(), next(), prev()
└── Keyboard: Escape closes, ← → navigates
```

### Flow

1. `ModalProvider` wraps the locale layout (`app/[locale]/layout.tsx`)
2. Components with galleries register images via `useModal().registerGallery(id, images)`
3. Click on image calls `openGallery(id, startIndex)`
4. Modal renders in portal with overlay, current image, navigation arrows
5. Keyboard support (Escape, ArrowLeft, ArrowRight) via `useEffect` with cleanup

### Consumers

- **BichittosPage** — registers book and creature galleries
- **ArtPage** — registers galleries per art section
- **KammaraPage** — registers scene galleries

### Migration from Astro

| Before (Astro) | After (React) |
|---|---|
| `window.openModal()` | `useModal().openGallery()` |
| `window.__bookGalleries` | Internal Context state, no globals |
| Manual event listeners | `useEffect` with cleanup |
| Direct DOM manipulation | React state, automatic re-render |

## 6. Custom Hooks

### useParallax

Replaces `requestAnimationFrame` parallax loops in CreatureSection and HomeContent.

```ts
useParallax(ref: RefObject<HTMLElement>, speed: number): void
// Applies translateY based on scroll position * speed
```

### useScrollReveal

Replaces ScrollReveal.astro's Intersection Observer.

```ts
useScrollReveal(ref: RefObject<HTMLElement>, options?: { threshold?: number }): boolean
// Returns isVisible, applies fade-in class
```

### useStripAnimation

Replaces inline `<script>` animation in CharacterStrip and SceneStrip.

```ts
useStripAnimation(ref: RefObject<HTMLElement>, options: {
  speed: number;
  direction: 'left' | 'right';
  pauseOnHover: boolean;
}): { pause: () => void; resume: () => void }
// Uses Web Animations API with dynamic playback rate
```

### useScrollHeader

Replaces BaseLayout scroll listener for header compact mode.

```ts
useScrollHeader(threshold: number): { isCompact: boolean }
```

## 7. Theme System (Chakra v3)

### Breakpoints

The primary motivation for this migration:

```ts
breakpoints: {
  sm: '30em',    // 480px
  md: '48em',    // 768px
  lg: '62em',    // 992px
  xl: '80em',    // 1280px
  '2xl': '96em'  // 1536px
}
```

Usage in components:
```tsx
<Grid templateColumns={['1fr', '1fr 1fr', '1fr 1fr 1fr']}>
<Text fontSize={['sm', 'md', 'lg']}>
```

### Color Tokens

Mapped from current tokens.css values:

```ts
colors: {
  brand: { 50: '...', 100: '...', ..., 900: '...' },
  text: { primary: '...', secondary: '...' },
  bg: { main: '...', dark: '...' }
}
```

### 13 Palettes

Each creature/world has a complete color scheme. Stored in `theme/palettes.ts`:

```ts
export const palettes = {
  napcat: { bg: '...', accent: '...', text: '...', gradient: '...' },
  zeco: { ... },
  taylo: { ... },
  bichittos: { ... },
  miscelania: { ... },
  kammara: { ... },
  lunnp1: { ... },
  eni4: { ... },
  triplec: { ... },
  orfv: { ... },
  z1: { ... },
  gotto: { ... },
  arte: { ... },
}
```

Components receive palette as prop:
```tsx
<WorldCard palette="napcat" />
<CreatureSection palette="zeco" />
```

### Typography

```ts
fonts: { body: "'Fira Sans', system-ui, sans-serif", heading: "'Fira Sans', system-ui, sans-serif" },
fontSizes: {
  xs: '0.65rem',     // 10.4px — brand, labels
  sm: '0.72rem',     // 11.5px — filter buttons
  base: '0.85rem',   // 13.6px — breadcrumb, subtitles
  md: '1rem',        // 16px — body, links
  lg: '1.05rem',     // 16.8px — paragraphs
  xl: '1.1rem',      // 17.6px — header name
  '2xl': '1.6rem',   // 25.6px — modal title
  '3xl': '1.8rem',   // 28.8px — section titles
  // Heading scale
  h1: 'clamp(3rem, 8vw, 6rem)',   // hero title
  h2: 'clamp(2rem, 4vw, 3rem)',   // creature/world name
  h3: '1.3rem',                    // DSTextPanel title
  h4: '0.75rem',                   // DSTextPanel subtitle
},
fontWeights: { thin: 100, light: 300, regular: 400, medium: 500, semibold: 600, bold: 700 },
letterSpacings: {
  tight: '0.04em',
  normal: '0.08em',
  wide: '0.12em',
  wider: '0.2em',
  widest: '0.25em',
}
```

### Spacing

Mapped from tokens.css (not Chakra defaults):

```ts
space: {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '0.8rem',
  lg: '1.5rem',
  xl: '3rem',
  '2xl': '5rem',
}
```

### Transitions

```ts
transitions: {
  default: '0.2s ease',
  slow: '0.4s ease',
}
```

### Dark Mode

Replaces `[data-theme="dark"]` attribute with Chakra's `useColorMode()` — works natively.

## 8. i18n (next-intl)

### Routing

```
/about          → pt-BR (default locale)
/en/about       → English
```

Configured via next-intl middleware with prefix-based routing.

### Translation Files

Convert current TypeScript translation objects to JSON:

- `src/i18n/pt-BR.ts` (568 LOC) → `src/i18n/messages/pt-BR.json`
- `src/i18n/en.ts` (462 LOC) → `src/i18n/messages/en.json`

### Usage in Components

```tsx
const t = useTranslations('home');
return <Heading>{t('title')}</Heading>
```

## 9. Image Manifest System

### Generator Script

`scripts/generate-manifest.ts` reads `/public/imgs/` directory tree and outputs `src/data/image-manifest.json`.

### Manifest Structure

```json
{
  "characters": {
    "bichittos": {
      "napcat": {
        "images": ["napcat-01.webp", "napcat-02.webp"],
        "label": { "pt-BR": "NapCat", "en": "NapCat" },
        "alt": { "pt-BR": "Gato dorminhoco", "en": "Sleepy cat" }
      }
    }
  },
  "books": {
    "bichittos": {
      "napcat-adventure": {
        "cover": "cover.webp",
        "pages": ["page-01.webp", "page-02.webp"],
        "title": { "pt-BR": "Aventura do NapCat", "en": "NapCat Adventure" }
      }
    }
  },
  "art": {
    "digital": {
      "images": ["art-001.webp", "art-002.webp"],
      "label": { "pt-BR": "Arte Digital", "en": "Digital Art" }
    }
  },
  "scenes": {
    "kammara": {
      "lunnp1": {
        "images": ["scene-01.webp", "scene-02.webp"],
        "bg": "#1a1a2e"
      }
    }
  }
}
```

### Helper Functions

`src/lib/images.ts` provides typed helpers:

```ts
getCharacters(creature: string): Character[]
getBooks(section: string): Book[]
getBookPages(bookId: string): string[]
getArtImages(section: string): ArtImage[]
getScenes(world: string): Scene[]
```

## 10. Testing Strategy

### Unit Tests (Vitest + React Testing Library)

Every component gets a `.test.tsx`:
- Renders without errors
- Required props work correctly
- Visual variants (palettes, themes) apply correctly
- Translated content renders per locale

### Integration Tests

- `ModalProvider` — open, navigate, close gallery flow
- `FilterBar` — filter state propagates to parent
- `useParallax` — calculates offset correctly
- `useStripAnimation` — controls playback rate
- Image manifest helpers return correct data

### Visual Regression (Storybook Test Runner)

- Every `.stories.tsx` documents all component states
- Storybook Test Runner compares screenshots between builds
- Catches unintended visual regressions automatically

### E2E Tests (Playwright)

- Page navigation between all 5 pages
- Language switching (pt-BR ↔ en) preserves current page
- Modal: open, navigate with arrows, close with Escape
- FilterBar filters content on Bichittos and Art pages
- Responsive: mobile (375px), tablet (768px), desktop (1280px)
- Dark mode toggle works across pages

## 11. Visual Fidelity

**Zero visual changes.** The migration is technology-only:

- All CSS animations (keyframes, transforms, transitions) are preserved as-is
- The 13 color palettes map 1:1 from tokens.css to Chakra theme
- Layout, spacing, typography remain identical
- Parallax, scroll effects, strip animations produce the same visual result
- A user visiting the site should not notice any difference

## 12. What Gets Deleted

After migration is complete and validated:

- All `.astro` files in `src/`
- `astro.config.mjs`
- Astro dependencies from `package.json`
- `src/styles/tokens.css` (replaced by theme/tokens.ts)
- `src/styles/global.css` (replaced by globals.css minimal reset)
- Old Storybook config (`@storybook/html-vite` → `@storybook/react-vite`)

## 13. Out of Scope

- Login area (future work, benefits from React foundation)
- New pages or features
- SEO optimization beyond what exists today
- Performance optimization (beyond what Chakra/Next.js provide by default)
- CI/CD pipeline setup (beyond basic Vercel deployment)
