# Tokenize Card Styles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded inline style literals (`fontSize: '0.62rem'`, `letterSpacing: '0.22em'`, etc.) with semantic tokens across the 6 Kammara card-family components, eliminating ~70% of the project's style debt without changing visuals.

**Architecture:** Bottom-up refactor in 7 commits. Step 0 introduces all new tokens to `src/theme/tokens.ts`. Steps 1–6 refactor one component per commit (DSTextPanel → KammaraCard → KammaraCardRegion → KammaraCardSubsystem → KammaraCardSubsystemHorizontal → KammaraEventCard). Step 7 visual regression check. Working directory: worktree at `/tmp/guitta-tokenize-cleanup` on branch `chore/tokenize-card-styles`.

**Tech Stack:** Next.js 15, Chakra UI v3 with `defineTokens`/`defineSemanticTokens`, TypeScript, Storybook, Vitest.

---

## File Structure

### Modified
- `src/theme/tokens.ts` — Step 0 only (token additions).
- `src/components/DSTextPanel/DSTextPanel.tsx` — Step 1.
- `src/components/KammaraCard/KammaraCard.tsx` — Step 2.
- `src/components/KammaraCardRegion/KammaraCardRegion.tsx` — Step 3.
- `src/components/KammaraCardSubsystem/KammaraCardSubsystem.tsx` — Step 4.
- `src/components/KammaraCardSubsystem/KammaraCardSubsystemHorizontal.tsx` — Step 5.
- `src/components/KammaraEventCard/KammaraEventCard.tsx` — Step 6.

### Untouched (consume the components through their public API)
- All `*.stories.tsx`, `*.test.tsx` files for the 6 components above.
- `src/app/[locale]/kammara/KammaraClient.tsx` (page that uses them).
- `src/components/RegionBanner/RegionBanner.tsx` (wraps DSTextPanel — its API doesn't change).

---

## Task 0: Add tokens to the theme

**Files:**
- Modify: `src/theme/tokens.ts`

- [ ] **Step 0.1: Add 8 new `fontSizes` entries**

In `src/theme/tokens.ts`, locate the `fontSizes:` object and append these entries inside it (alphabetical order is not required; place them grouped at the end of the existing list before the `glyphH1` entry for readability):

```ts
fontSizes: {
  // ... existing entries unchanged ...
  // ── Card-family typography (DSTextPanel + Kammara*Card*) ──────
  cardBody: { value: '0.88rem' },
  cardLabel: { value: '0.62rem' },
  cardFooter: { value: '0.9rem' },
  // Decorative crest watermarks rendered behind card titles
  glyphWatermarkXl: { value: '24rem' },
  glyphWatermarkLg: { value: '22rem' },
  glyphWatermarkMd: { value: '14rem' },
  glyphWatermarkSmCenter: { value: '8rem' },
  glyphWatermarkSmSides: { value: '5rem' },
  // Sizes specific to KammaraCardSubsystemHorizontal
  glyphWatermarkXxl: { value: '28rem' },
  glyphWatermarkSmCenterAlt: { value: '7rem' },
  glyphWatermarkMdAlt: { value: '12rem' },
  // existing glyphH1, glyphH2, glyphH3 stay where they are
},
```

- [ ] **Step 0.2: Add `cardLabel` entry to `letterSpacings`**

In the same file, inside `letterSpacings:`:

```ts
letterSpacings: {
  // ... existing entries unchanged ...
  cardLabel: { value: '0.22em' },
},
```

- [ ] **Step 0.3: Add 3 new `spacing` entries**

Inside `spacing:`:

```ts
spacing: {
  // ... existing entries unchanged ...
  cardSection: { value: '1.1rem' },
  cardLabelGap: { value: '0.3rem' },
  cardBodyParagraph: { value: '0.7rem' },
},
```

- [ ] **Step 0.4: Type-check**

Run from `/tmp/guitta-tokenize-cleanup`:
```
npx tsc --noEmit
```
Expected: no new errors related to `tokens.ts`.

- [ ] **Step 0.5: Commit**

```bash
git add src/theme/tokens.ts
git commit -m "chore(theme): add card-family tokens (fontSizes, letterSpacings, spacing)

Adds 11 new fontSizes, 1 letterSpacing and 3 spacing tokens used by
DSTextPanel + KammaraCard + KammaraCardRegion + KammaraCardSubsystem
+ KammaraCardSubsystemHorizontal + KammaraEventCard. No component
consumes them yet — they're activated in subsequent commits."
```

---

## Task 1: Refactor `DSTextPanel`

**Files:**
- Modify: `src/components/DSTextPanel/DSTextPanel.tsx`

The component already uses tokens (`xs`, `wide`, `sm`, `md`, `lg`, `cozy`, `snug`) for many properties. Only the literals listed below remain. Replace each occurrence inline; when a Chakra prop accepts the token name (e.g. `letterSpacing="hero"`), prefer that over CSS-string form.

- [ ] **Step 1.1: Replace literals in the title-heading block (lines 175–229)**

Search for the `<Heading as="h2">` element inside the panel header (around line 206) and the badge `<Box as="span">` (around line 180). Replace:

| Old | New |
|---|---|
| `marginBottom={{ base: '0.5rem', md: '0.8rem' }}` | `marginBottom={{ base: 'sm', md: 'md' }}` |
| `marginBottom="0.6rem"` (badge) | `marginBottom="cozy"` |
| `marginTop="0.7rem"` (gradient bar) | `marginTop="snug"` |

Note: `padding={compact ? { ... '1rem 2rem 0' ... } : { ... '1.5rem 2rem 0' ... }}` stays inline — those are unique padding shorthands, and tokenizing them would require composite-padding tokens (out of scope per spec).

- [ ] **Step 1.2: Replace literals in the scroll-body inline-CSS block (lines 264–319)**

This is the `css={{ ... }}` object on the scroll body. Replace:

| Old | New |
|---|---|
| `'& h2': { fontSize: '1rem', ... marginBottom: '0.5rem' }` | `'& h2': { fontSize: 'token(fontSizes.md)', ... marginBottom: 'token(spacing.sm)' }` |
| `'& h3': { fontSize: '0.65rem', letterSpacing: '0.2em', ... marginTop: '1.2rem', marginBottom: '0.3rem' }` | `'& h3': { fontSize: 'token(fontSizes.xs)', letterSpacing: 'token(letterSpacings.wider)', ... marginTop: 'token(spacing.cardSection)', marginBottom: 'token(spacing.cardLabelGap)' }` |
| `'& p': { marginBottom: '0.5rem' }` | `'& p': { marginBottom: 'token(spacing.sm)' }` |
| `'@media (min-width: 48em)': { '& h2': { fontSize: '2rem', marginBottom: '0.8rem' }, '& h3': { fontSize: '0.75rem' }, '& p': { marginBottom: '0.8rem' } }` | replace `'2rem'` → `'token(fontSizes.h2)'` (existing token), `'0.8rem'` → `'token(spacing.md)'`, `'0.75rem'` → `'token(fontSizes.h4)'` |

For descendant CSS rules (`'& h3'`, `'& p'`, etc.) Chakra v3 supports `token(...)` references inside CSS values. Verify by inspecting the rendered DOM after the change — the resolved CSS variable values should match the literal-based version pixel-perfect.

The `0.8rem` font-size value at line 265 (`fontSize={{ base: '0.8rem', md: '1rem', '2xl': 'lg' }}`) maps to **no existing token**. Either:
- Keep it inline (semantic: it's the body-text base font scaled responsively), OR
- Add a `bodySm` token. **Decision:** keep inline with a comment, since this responsive size isn't reused elsewhere. Add comment:
```ts
// `0.8rem` is the mobile body text — not tokenized because it only
// appears here and is responsively bumped to `md` on desktop.
fontSize={{ base: '0.8rem', md: 'md', '2xl': 'lg' }}
```

- [ ] **Step 1.3: Keep dropcap exception with explanatory comment**

Around line 308, the `'& p:first-of-type::first-letter'` rule has `fontSize: '3.2em'`, `padding: '0.05em 0.15em 0 0'`, and `textShadow: \`0 2px 12px ${accent}66\``. Keep these inline. Above the rule, add:

```ts
// Dropcap for the creature variant — semantically unique decorative
// effect; tokenizing 3.2em / 0.05em / 0.15em would create tokens
// used by exactly one CSS rule. Kept inline by design.
'& p:first-of-type::first-letter': { ... unchanged ... }
```

- [ ] **Step 1.4: Type-check + visual smoke test**

```
npx tsc --noEmit
```
Then start storybook (`npm run storybook`), open the DSTextPanel stories, confirm visual parity. The kammara world banners (which use DSTextPanel through RegionBanner) and the TripleC sub-region banners must look identical.

- [ ] **Step 1.5: Commit**

```bash
git add src/components/DSTextPanel/DSTextPanel.tsx
git commit -m "refactor(DSTextPanel): replace inline literals with tokens

Migrates fontSize/letterSpacing/margin literals to existing tokens
(md, h4, sm, cozy, snug, wider) and the new cardSection/cardLabelGap
tokens introduced in 0Task. Keeps the dropcap rule (3.2em) inline
because it's a one-off decorative effect.

No visual change — DSTextPanel renders pixel-perfect identically."
```

---

## Task 2: Refactor `KammaraCard`

**Files:**
- Modify: `src/components/KammaraCard/KammaraCard.tsx`

20 violations flagged at lines 102, 139, 145, 151, 156, 166, 168, 172, 262, 268, 302, 306, 316, 318, 321, 322, 325, 351, 356, 357.

- [ ] **Step 2.1: Replace watermark sizes (lines 102, 145, 151)**

| Line | Old | New |
|---|---|---|
| 102 | `fontSize: '22rem'` | `fontSize: 'token(fontSizes.glyphWatermarkLg)'` |
| 145 | `fontSize: '5rem'` | `fontSize: 'token(fontSizes.glyphWatermarkSmSides)'` |
| 151 | `fontSize: '8rem'` | `fontSize: 'token(fontSizes.glyphWatermarkSmCenter)'` |

- [ ] **Step 2.2: Replace breadcrumb font + letter-spacing (lines 166, 168, 172)**

| Line | Old | New |
|---|---|---|
| 166 | `fontSize: '1rem'` | `fontSize: 'token(fontSizes.md)'` |
| 168 | `letterSpacing: '0.3em'` | `letterSpacing: 'token(letterSpacings.hero)'` |
| 172 | `fontSize: '1.3rem'` | `fontSize: 'token(fontSizes.h3)'` |

- [ ] **Step 2.3: Replace banner watermark padding (line 139)**

```ts
padding="0 1.5rem"  // → padding="0 lg"  (chakra resolves "lg" → spacing.lg = 1.5rem)
```
Use the `padding="0 lg"` form — Chakra v3 spacing tokens work in shorthand.

- [ ] **Step 2.4: Replace stats bar paddings (lines 262, 268)**

| Line | Old | New |
|---|---|---|
| 262 | `padding: '0.6rem 1.8rem'` (outer Flex) | KEEP inline with comment `/* composite — keep inline */` |
| 268 | `padding: '0.35rem 0.6rem'` (stats pill) | KEEP inline with comment `/* composite — keep inline */` |

**Decision (revised after implementation):** Composite paddings stay fully inline. The previous draft of this step proposed adding a `cardPaddingX: { value: '1.8rem' }` token + applying `padding="cozy cardPaddingX"` partial substitution. That was discarded for two reasons:

1. The component already exports a file-level constant `CARD_PADDING_X = '1.8rem'` (used by the gate-label/roulette positioning logic). Adding a token would duplicate the source of truth.
2. Partial tokenization on multi-axis paddings creates ambiguous patterns — readers have to decide which half is meaningful. Keeping the literal with `/* composite — keep inline */` is clearer.

Apply this same rule to `'0.4rem 1.5rem'` (footer), `'0.8rem 1.8rem 1.2rem'` (content), `'0.35rem 0.6rem'` (stats pill), and `'0.6rem 1.8rem'` (stats outer) — all four composite paddings stay inline. Do this for Tasks 3, 4, 5 and 6 too.

- [ ] **Step 2.5: Replace content-block fonts and margins (lines 302, 306, 316, 318, 321, 322, 325)**

| Line | Old | New |
|---|---|---|
| 302 | `padding: '0.8rem 1.8rem 1.2rem'` | inline keep — composite |
| 306 | `fontSize: '0.88rem'` | `fontSize: 'token(fontSizes.cardBody)'` |
| 316 | `fontSize: '0.62rem'` | `fontSize: 'token(fontSizes.cardLabel)'` |
| 318 | `letterSpacing: '0.22em'` | `letterSpacing: 'token(letterSpacings.cardLabel)'` |
| 321 | `marginTop: '1.1rem'` | `marginTop: 'token(spacing.cardSection)'` |
| 322 | `marginBottom: '0.3rem'` | `marginBottom: 'token(spacing.cardLabelGap)'` |
| 325 | `marginBottom: '0.7rem'` | `marginBottom: 'token(spacing.cardBodyParagraph)'` |

- [ ] **Step 2.6: Replace footer (lines 351, 356, 357)**

| Line | Old | New |
|---|---|---|
| 351 | `padding: '0.4rem 1.5rem'` | inline keep — composite |
| 356 | `fontSize: '0.9rem'` | `fontSize: 'token(fontSizes.cardFooter)'` |
| 357 | `letterSpacing: '0.3em'` | `letterSpacing: 'token(letterSpacings.hero)'` |

- [ ] **Step 2.7: Type-check + visual check**

```
npx tsc --noEmit
```
In storybook, check `KammaraCard` stories — should be identical. In `/kammara`, scroll through each world card (lunnp1, eni4, triplec, orfv, z1, gotto) — pixel parity.

- [ ] **Step 2.8: Commit**

```bash
git add src/components/KammaraCard/KammaraCard.tsx src/theme/tokens.ts
git commit -m "refactor(KammaraCard): replace inline literals with tokens

Migrates the world-card body, footer and watermark glyph sizes to
the new card-family tokens. Composite paddings stay inline with
/* composite — keep inline */ comments (see revised Step 2.4).

No visual change."
```

---

## Task 3: Refactor `KammaraCardRegion`

**Files:**
- Modify: `src/components/KammaraCardRegion/KammaraCardRegion.tsx`

24 violations (lines 117, 122, 135, 140, 174, 180, 186, 201, 203, 208, 209, 210, 321, 327, 361, 365, 375, 377, 380, 381, 384, 410, 415, 416). Pattern is the same as `KammaraCard` plus the parent-echo crest at `24rem`.

- [ ] **Step 3.1: Replace watermarks (lines 117, 135, 180, 186)**

| Line | Old | New |
|---|---|---|
| 117 | `fontSize: '24rem'` (parent echo) | `fontSize: 'token(fontSizes.glyphWatermarkXl)'` |
| 135 | `fontSize: '14rem'` (region echo) | `fontSize: 'token(fontSizes.glyphWatermarkMd)'` |
| 180 | `fontSize: '5rem'` | `fontSize: 'token(fontSizes.glyphWatermarkSmSides)'` |
| 186 | `fontSize: '8rem'` (inline style) | `fontSize: 'token(fontSizes.glyphWatermarkSmCenter)'` |

Note: line 186 is inside an inline `style={{ fontSize: '8rem' }}` on a `<span>`. CSS-in-JS `style` doesn't resolve theme tokens. Use Chakra Box `as="span"` instead, or compute the resolved value via `useToken('fontSizes', 'glyphWatermarkSmCenter')` hook.

**Decision:** swap that `<span style={...}>` for a `<Box as="span" fontSize="glyphWatermarkSmCenter">` — preserves semantics, uses the token system.

- [ ] **Step 3.2: Replace letter-spacings (lines 122, 140, 203)**

| Line | Old | New |
|---|---|---|
| 122 | `letterSpacing: '0.04em'` | `letterSpacing: 'token(letterSpacings.tight)'` |
| 140 | `letterSpacing: '0.04em'` | `letterSpacing: 'token(letterSpacings.tight)'` |
| 203 | `letterSpacing: '0.12em'` | `letterSpacing: 'token(letterSpacings.wide)'` |

- [ ] **Step 3.3: Replace breadcrumb fonts (lines 174, 201, 208, 209, 210)**

Same pattern as KammaraCard — `1rem` → `md`, `0.85rem` → `base`, `1.3rem` → `h3`. The `0.85rem` at line 209 is inside a `<span style={{...}}>`; convert to Box-as-span like Step 3.1.

- [ ] **Step 3.4: Replace content + footer (lines 321, 327, 361, 365, 375, 377, 380, 381, 384, 410, 415, 416)**

Same mapping as Task 2 (Steps 2.5 + 2.6). All composite paddings (`'0.6rem 1.8rem'`, `'0.35rem 0.6rem'`, `'0.8rem 1.8rem 1.2rem'`, `'0.4rem 1.5rem'`) stay fully inline with `/* composite — keep inline */` comments — see revised Step 2.4 for rationale.

- [ ] **Step 3.5: Type-check + visual check**

`npx tsc --noEmit`. Visual: TripleC sub-regions (malloc, mesh, sharp) on `/kammara`, plus storybook stories.

- [ ] **Step 3.6: Commit**

```bash
git add src/components/KammaraCardRegion/KammaraCardRegion.tsx
git commit -m "refactor(KammaraCardRegion): replace inline literals with tokens

Same migration as KammaraCard plus the parent-echo crest at
glyphWatermarkXl (24rem). Inline <span style> elements that contain
font sizes are converted to <Box as=span> so theme tokens resolve.

No visual change."
```

---

## Task 4: Refactor `KammaraCardSubsystem`

**Files:**
- Modify: `src/components/KammaraCardSubsystem/KammaraCardSubsystem.tsx`

21 violations at lines 135, 178, 184, 190, 200, 201, 267, 269, 273, 288, 294, 333, 337, 347, 349, 352, 353, 356, 383, 388, 389. Same pattern as KammaraCardRegion (it shares the body+footer architecture).

- [ ] **Step 4.1: Replace watermarks (lines 135, 184, 190)**

| Line | Old | New |
|---|---|---|
| 135 | `fontSize: '22rem'` | `fontSize: 'token(fontSizes.glyphWatermarkLg)'` |
| 184 | `fontSize: '5rem'` | `fontSize: 'token(fontSizes.glyphWatermarkSmSides)'` |
| 190 | `fontSize: '8rem'` (inline `<span style>`) | Convert to `<Box as="span" fontSize="glyphWatermarkSmCenter">` |

- [ ] **Step 4.2: Replace banner padding + tab paddings (lines 178, 200, 201, 288, 294, 333, 383)**

| Line | Old | New |
|---|---|---|
| 178 | `padding="0 1.5rem"` | `padding="0 lg"` |
| 200 | `paddingBottom: '0.4rem'` | inline keep — value not in catalogue (would create one-off) |
| 201 | `paddingLeft: '1.2rem'` (and Right) | inline keep — composite tab spacing not worth tokenizing |
| 288 | composite (`'0.6rem 1.8rem'`) | inline keep |
| 294 | composite (`'0.35rem 0.6rem'`) | inline keep |
| 333 | composite (`'0.8rem 1.8rem 1.2rem'`) | inline keep |
| 383 | composite (`'0.4rem 1.5rem'`) | inline keep |

- [ ] **Step 4.3: Replace breadcrumb + content + footer fonts and margins (lines 267, 269, 273, 337, 347, 349, 352, 353, 356, 388, 389)**

Apply the same Task 2.5+2.6 mapping (`0.88rem`→`cardBody`, `0.62rem`→`cardLabel`, etc.).

- [ ] **Step 4.4: Type-check + visual check**

Storybook + `/kammara` subsystems for all 9 worlds. Pixel parity.

- [ ] **Step 4.5: Commit**

```bash
git add src/components/KammaraCardSubsystem/KammaraCardSubsystem.tsx
git commit -m "refactor(KammaraCardSubsystem): replace inline literals with tokens

Same pattern as KammaraCardRegion. Composite paddings that don't
match existing tokens are kept inline with comments.

No visual change."
```

---

## Task 5: Refactor `KammaraCardSubsystemHorizontal`

**Files:**
- Modify: `src/components/KammaraCardSubsystem/KammaraCardSubsystemHorizontal.tsx`

28 violations at lines 140, 188, 194, 258, 260, 264, 277, 327, 332, 334, 337, 338, 389, 478, 555, 557, 562, 577, 601, 603, 615, 617, 620, 621, 639, 644, 645, 689. The horizontal layout uses larger watermarks (`28rem`, `7rem`, `12rem`) — those map to the "Alt" tokens.

- [ ] **Step 5.1: Replace horizontal-specific watermarks (lines 140, 194, 478)**

| Line | Old | New |
|---|---|---|
| 140 | `fontSize: '28rem'` | `fontSize: 'token(fontSizes.glyphWatermarkXxl)'` |
| 194 | `fontSize: '7rem'` (inline `<span style>`) | Convert to `<Box as="span" fontSize="glyphWatermarkSmCenterAlt">` |
| 478 | `fontSize: '12rem'` (Variant C inline `<span style>`) | Convert to `<Box as="span" fontSize="glyphWatermarkMdAlt">` |

- [ ] **Step 5.2: Replace shared watermark (line 188)**

| Line | Old | New |
|---|---|---|
| 188 | `fontSize: '5rem'` | `fontSize: 'token(fontSizes.glyphWatermarkSmSides)'` |

- [ ] **Step 5.3: Replace remaining literals**

The remaining lines (258, 260, 264, 327, 332, 334, 337, 338, 389, 555, 557, 562, 601, 603, 615, 617, 620, 621, 644, 645) follow Task 2.5+2.6 patterns. Lines 277, 577, 689 are composite paddings — keep inline with comments.

Note: line 332 has `fontSize: '0.65rem'` which maps to existing `xs` token. Line 327 has `fontSize: '0.95rem'` which is **not** in the catalogue — keep inline with a comment ("variant C body — slightly larger than cardBody by design").

- [ ] **Step 5.4: Type-check + visual check**

This component has **two variants** (A and C). Test both in storybook. C is the cinematic one — most likely to surface regressions.

- [ ] **Step 5.5: Commit**

```bash
git add src/components/KammaraCardSubsystem/KammaraCardSubsystemHorizontal.tsx
git commit -m "refactor(KammaraCardSubsystemHorizontal): replace inline literals with tokens

Adds horizontal-specific watermark tokens (Xxl, SmCenterAlt, MdAlt).
Variant A and Variant C share the same token catalogue.

No visual change."
```

---

## Task 6: Refactor `KammaraEventCard`

**Files:**
- Modify: `src/components/KammaraEventCard/KammaraEventCard.tsx`

26 violations at lines 155, 160, 173, 178, 212, 218, 224, 238, 240, 245, 358, 364, 398, 402, 412, 414, 417, 418, 424, 427, 428, 431, 434, 462, 467, 468.

This is a literal clone of KammaraCardRegion plus the inline metadata pattern (`<strong>LABEL:</strong> value`) added recently. The `<strong>` styles re-use `cardLabel` font + `cardLabel` letter-spacing.

- [ ] **Step 6.1: Replace watermarks + breadcrumb (lines 155, 160, 173, 178, 212, 218, 224, 238, 240, 245)**

Same as KammaraCardRegion Steps 3.1–3.3.

- [ ] **Step 6.2: Replace content fonts + margins (lines 358, 364, 398, 402, 412, 414, 417, 418, 424, 427, 428, 431, 434)**

Apply Task 2.5+2.6 mapping. The `<strong>` rule (line 427–431) uses `cardLabel` font + `cardLabel` letter-spacing — same tokens already created. The new `<p.kec-description>` margin-top of `0.9rem` at line 434 — there's no token for `0.9rem`, but that's the same value as `cardFooter` font (coincidence). **Decision:** keep `0.9rem` inline with a comment ("kec-description gap — bridges metadata stack to body, not reused").

The `marginBottom: '0.25rem'` at line 424 and `marginRight: '0.4rem'` at line 431 are also unique — keep inline with comments.

- [ ] **Step 6.3: Replace footer (lines 462, 467, 468)**

Same as Task 2.6.

- [ ] **Step 6.4: Type-check + visual check**

Storybook stories + `/kammara` events section. Cards with and without `bgImage`.

- [ ] **Step 6.5: Commit**

```bash
git add src/components/KammaraEventCard/KammaraEventCard.tsx
git commit -m "refactor(KammaraEventCard): replace inline literals with tokens

Last component of the card-family migration. <strong> labels reuse
the cardLabel font + cardLabel letter-spacing tokens, matching the
<h3> eyebrow used in the other cards.

No visual change."
```

---

## Task 7: Visual regression sweep + final commit

**Files:** none modified — verification only.

- [ ] **Step 7.1: Final type-check**

```
npx tsc --noEmit
```
Expected: zero new errors compared to the branch start. Pre-existing errors in unrelated files (e.g. `BichittosBannerWithNinha.tsx`, `Header.test.tsx`) are out of scope.

- [ ] **Step 7.2: Tests**

```
npm test
```
Expected: all card-component tests pass. Stories build cleanly:
```
npm run storybook -- --build
```

- [ ] **Step 7.3: Storybook side-by-side**

Open storybook locally on this branch (`/tmp/guitta-tokenize-cleanup`) AND on `kammara` branch (main repo). Compare each story:

- `Kammara/KammaraEventCard` (3 stories)
- `Kammara/KammaraProgressHeatmap` (not refactored — sanity check)
- `Components/KammaraCard` (all stories)
- `Components/KammaraCardRegion` (all stories)
- `Components/KammaraCardSubsystem` (all stories)
- `Components/KammaraCardSubsystemHorizontal` (Variant A + Variant C)
- `Components/DSTextPanel` (all stories)

Acceptance: pixel parity. If any difference is detectable by eye, file a bug and fix.

- [ ] **Step 7.4: Live page check**

```
npm run dev
```
Navigate to `http://localhost:3000/kammara` and visit each section:
- Hero
- Próximos Eventos (KammaraEventCard cards)
- Próximos Planetas (heatmap — not refactored, sanity)
- Each world section (KammaraCard + KammaraCardSubsystem)
- TripleC sub-regions (KammaraCardRegion)

Also `/en/kammara` for English locale.

Acceptance: pixel parity vs. the pre-refactor branch.

- [ ] **Step 7.5: Open PR**

```bash
gh pr create --base kammara --title "chore: tokenize Kammara card-family styles" --body "$(cat <<'EOF'
## Summary

Replaces hardcoded inline style literals with semantic tokens across
the 6 Kammara card components. Eliminates ~70% of the project's style
debt flagged in the 2026-04-27 audit.

- 14 new tokens added to `src/theme/tokens.ts` (8 fontSizes + 1
  letterSpacing + 3 spacing + 2 horizontal-variant fontSizes).
- 6 components refactored, one per commit.
- Documented exceptions: dropcap (3.2em) and a few one-off composite
  paddings stay inline with explanatory comments.

## Visual diff

None expected — every commit was reviewed against storybook +
`/kammara` for pixel parity. See linked spec for the full list of
literals → token mappings.

## Test plan

- [x] `npx tsc --noEmit` clean (no new errors).
- [x] `npm test` passes for all 6 components.
- [x] Storybook stories render identically.
- [x] `/kammara` pt-BR + en render identically.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Self-review checklist

- [x] Spec coverage: every section of the spec has a matching task.
  - 6 components → Tasks 1–6
  - Token additions → Task 0
  - Visual regression → Task 7
- [x] No placeholders: all token names are concrete (`cardBody`, etc.).
- [x] Type consistency: token names used in tasks match Step 0.1–0.3.
- [x] Each step has runnable commands (no "implement appropriately").
- [x] Each commit message is concrete with what changed and why.
