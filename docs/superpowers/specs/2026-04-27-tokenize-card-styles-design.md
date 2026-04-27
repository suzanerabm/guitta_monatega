# Tokenize Card Styles — Design

## Goal

Eliminate hardcoded inline style values in the 6 Kammara "card-family"
components, replacing them with semantic tokens defined in
`src/theme/tokens.ts`. The change must be **visually invisible** —
Storybook and the live `/kammara` page must render identically before
and after.

## Why

`AGENTS.md` (project conventions) explicitly bans literal style values
in components:

> **Proibido** hex codes (`#fff`), rgba literais, `fontWeight="bold"`
> hardcoded, `fontSize="1.2rem"`, `letterSpacing="0.1em"` em código de
> componente. Sempre use tokens.

The audit run on 2026-04-27 found **156 violations across 28
components**. Six of those components form the visual "card family" used
across Kammara (`/kammara` page + storybook stories) and share the same
underlying patterns — so tokenizing them as a unit eliminates ~70% of
the project debt while keeping the scope small enough for a single PR.

## Scope

### In scope (6 components)

| Component | Role | File |
|---|---|---|
| `DSTextPanel` | base panel idiom (creature variant + dropcap) | `src/components/DSTextPanel/DSTextPanel.tsx` |
| `KammaraCard` | TCG-style world card | `src/components/KammaraCard/KammaraCard.tsx` |
| `KammaraCardRegion` | region card (TripleC sub-regions) | `src/components/KammaraCardRegion/KammaraCardRegion.tsx` |
| `KammaraCardSubsystem` | subsystem card (vertical) | `src/components/KammaraCardSubsystem/KammaraCardSubsystem.tsx` |
| `KammaraCardSubsystemHorizontal` | subsystem card (horizontal) | `src/components/KammaraCardSubsystem/KammaraCardSubsystemHorizontal.tsx` |
| `KammaraEventCard` | events grid card (clone of region) | `src/components/KammaraEventCard/KammaraEventCard.tsx` |

### Out of scope (deferred to a later PR)

The other 22 components flagged in the audit (`Footer`, `Modal`,
`Breadcrumb`, `CharacterStrip`, `SubSystem`, `RegionDivider`, etc.).
They are not visually intertwined with the card family.

### Non-goals

- No visual changes. Pixel parity is the success criterion.
- No new component features.
- No refactor of component prop APIs.
- Storybook stories and tests are NOT modified — they consume the
  components through their public API, which doesn't change.

## Token catalogue (additions)

The audit grouped repeated literals into 14 new tokens. Names follow
the existing convention: semantic when possible (`cardBody`, not
`fontSize-088rem`), structural when the value is purely decorative
(`glyphWatermarkLg`).

### `fontSizes` (8 new)

| Token | Value | Used by |
|---|---|---|
| `cardBody` | `0.88rem` | body paragraphs inside card scroll area |
| `cardLabel` | `0.62rem` | `<h3>` eyebrow ("CICLO", "FUNÇÃO", etc.) |
| `cardFooter` | `0.9rem` | footer line `⊹ ⊙ ⊹  Kammara` |
| `glyphWatermarkXl` | `24rem` | parent planet crest, gigantic, faintest |
| `glyphWatermarkLg` | `22rem` | card crest watermark (region/subsystem) |
| `glyphWatermarkMd` | `14rem` | secondary crest echo |
| `glyphWatermarkSmCenter` | `8rem` | banner watermark, center span |
| `glyphWatermarkSmSides` | `5rem` | banner watermark, side spans |

`KammaraCardSubsystemHorizontal` also has `28rem`, `7rem` and `12rem`
watermark sizes specific to its horizontal layout. Those become
`glyphWatermarkXxl`, `glyphWatermarkSmCenterAlt` and
`glyphWatermarkMdAlt` — same naming pattern.

### `letterSpacings` (1 new)

| Token | Value | Used by |
|---|---|---|
| `cardLabel` | `0.22em` | `<h3>` eyebrow letter-spacing |

`0.04em` already maps to existing `tight`, `0.12em` to `wide`, `0.3em`
to `hero`. No new tokens needed for those.

### `spacing` (3 new)

| Token | Value | Used by |
|---|---|---|
| `cardSection` | `1.1rem` | top margin of `<h3>` (gap between sections) |
| `cardLabelGap` | `0.3rem` | bottom margin of `<h3>` (label → value) |
| `cardBodyParagraph` | `0.7rem` | bottom margin of `<p>` in body |

`0.5rem`/`0.6rem`/`0.8rem` already map to `sm`/`cozy`/`md`; no new
tokens needed for those.

## File-by-file plan

The order is **bottom-up by dependency**: tokens first, then the panel
base (`DSTextPanel`), then each card. Each step keeps the previous
working state — no big-bang refactor.

### Step 0 — Add tokens

Modify `src/theme/tokens.ts`:
- Add 8 entries to `fontSizes`, 1 to `letterSpacings`, 3 to `spacing`
  per the catalogue above.
- Verify `tokens.ts` still compiles (Chakra picks them up at theme
  build time).

### Step 1 — `DSTextPanel`

Lines flagged: 178, 184, 209, 220, 265, 278, 280, 284, 286, 288–289,
296, 300–302, 310, 315.

Most replacements use existing tokens (`md`, `lg`, `xs`, `h4`, `sm`,
`md`, `cozy`, `snug`, `tight`). New tokens used: `cardLabel` (font +
letter-spacing), `cardSection` (margin), `cardLabelGap`,
`cardBodyParagraph`, `glyphWatermark*` are NOT used here (DSTextPanel
has no watermarks of its own; only the dropcap `3.2em` stays inline
because it's a unique, semantic literal — see "Acceptable
exceptions").

### Step 2 — `KammaraCard`

Lines flagged: 102, 139, 145, 151, 156, 166, 168, 172, 262, 268, 302,
306, 316, 318, 321, 322, 325, 351, 356, 357.

Watermarks (`22rem`, `5rem`, `8rem`) → `glyphWatermarkLg`,
`glyphWatermarkSmSides`, `glyphWatermarkSmCenter`. Body/label/footer
fonts → `cardBody`/`cardLabel`/`cardFooter`. Margins → `cardSection`,
`cardLabelGap`, `cardBodyParagraph`. Letter-spacings (`0.22em`,
`0.3em`) → `cardLabel`/`hero`.

### Step 3 — `KammaraCardRegion`

Lines flagged: 117, 122, 135, 140, 174, 180, 186, 201, 203, 208, 209,
210, 321, 327, 361, 365, 375, 377, 380, 381, 384, 410, 415, 416.

Same pattern as `KammaraCard` plus the parent-echo glyph at `24rem`
(`glyphWatermarkXl`) and the `0.04em` letter-spacings (`tight`).

### Step 4 — `KammaraCardSubsystem`

Lines flagged: 135, 178, 184, 190, 200, 201, 267, 269, 273, 288, 294,
333, 337, 347, 349, 352, 353, 356, 383, 388, 389.

Same pattern as `KammaraCardRegion`. No new tokens needed beyond what
Step 0 introduced.

### Step 5 — `KammaraCardSubsystemHorizontal`

Lines flagged: 140, 188, 194, 258, 260, 264, 277, 327, 332, 334, 337,
338, 389, 478, 555, 557, 562, 577, 601, 603, 615, 617, 620, 621, 639,
644, 645, 689.

Three additional watermark sizes (`28rem`, `7rem`, `12rem`) →
`glyphWatermarkXxl`, `glyphWatermarkSmCenterAlt`, `glyphWatermarkMdAlt`.
Otherwise the same pattern.

### Step 6 — `KammaraEventCard`

Lines flagged: 155, 160, 173, 178, 212, 218, 224, 238, 240, 245, 358,
364, 398, 402, 412, 414, 417, 418, 424, 427, 428, 431, 434, 462, 467,
468.

Same pattern as `KammaraCardRegion` (it's a literal clone of it). Plus
the inline metadata pattern `<strong>LABEL:</strong> value` introduced
recently — `<strong>` styles use `cardLabel` (font + letter-spacing).

### Step 7 — Visual regression check

- Run `npm run storybook` → check stories for the 6 components render
  identically (compare side-by-side with the pre-refactor branch).
- Run `npm run dev`, navigate to `/kammara`, scroll through:
  - Heatmap (no card changes here, but make sure nothing broke).
  - Events section (KammaraEventCard).
  - Each world section (KammaraCard).
  - TripleC sub-regions (KammaraCardRegion + KammaraCardSubsystem).
- Type-check: `npx tsc --noEmit` — must be clean.

## Acceptable exceptions

Some literals are kept inline because they're semantically unique and
shouldn't be normalized into the shared token catalogue:

- **Dropcap `3.2em` in `DSTextPanel`** — unique decorative effect for
  the creature variant's first-letter pattern. Tokenizing it would
  create `fontSizes.dropcap` used by exactly one rule. Keep inline
  with a clarifying comment.
- **`0.05em 0.15em 0 0` padding on the dropcap** — the same one-off.
  Keep inline.
- **Dynamic CSS using props** (e.g. `${color}80`, `${darkColor}b3`) —
  these are template literals using prop values, not hardcoded
  literals. Already compliant.
- **Numeric `lineHeight` values** (e.g. `1.05`, `1.65`) — Chakra v3
  doesn't have a `lineHeights` token category in the project's
  current setup. Tokenizing would require schema changes. Out of
  scope; flag for a follow-up.

## Risk and mitigation

**Risk:** A token rename could shift pixel rendering due to em/rem
rounding or CSS specificity. Mitigation: every step is one component
in one commit, so any regression bisects to a single file.

**Risk:** Storybook might cache theme tokens. Mitigation: kill storybook
between Step 0 and Step 1 to force a fresh theme build.

**Risk:** Production page `/kammara` is in active use. Mitigation:
worktree branch (`chore/tokenize-card-styles`) is isolated from
`kammara`. PR opens at the end for review before merge.

## Success criteria

- [ ] All 6 listed components have zero `fontSize: '...'`,
  `letterSpacing: '...'`, hardcoded `marginTop/Bottom: '...rem/px'`
  literals (except documented exceptions).
- [ ] `tokens.ts` has 8 new fontSizes, 1 letterSpacing, 3 spacing
  entries, all used.
- [ ] `npx tsc --noEmit` passes.
- [ ] Storybook renders the 6 components without visual diff.
- [ ] `/kammara` page renders without visual diff.
- [ ] Each component refactor lives in its own commit.
