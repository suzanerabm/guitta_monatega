// src/theme/proseHeadings.ts
//
// Shared `& h2` / `& h3` descendant CSS for panels that render markdown-like
// prose (`##`/`###` prefixes turned into raw <h2>/<h3> elements — see
// renderStory in KammaraClient.tsx). These headings can't take a `textStyle`
// prop directly (they're plain DOM elements the caller renders as children,
// not Chakra components), so every panel that hosts them needs the same
// descendant selector. Import this instead of hand-writing `'& h2'`/`'& h3'`
// again — change the look of every prose heading site-wide by editing here.
//
// Usage: css={{ ...proseHeadingStyles({ h2Color: titleColor, h3Color: subtitleColor }), /* rest */ }}

interface ProseHeadingOptions {
  /** Color of `<h2>` (section title). */
  h2Color?: string;
  /** Color of `<h3>` (subtitle). Defaults to h2Color. */
  h3Color?: string;
}

export function proseHeadingStyles({ h2Color, h3Color }: ProseHeadingOptions = {}) {
  return {
    '& h2': {
      fontFamily: 'var(--chakra-fonts-heading)',
      fontSize: '1rem',
      fontWeight: 600,
      marginBottom: '0.5rem',
      color: h2Color,
    },
    '& h3': {
      fontFamily: 'var(--chakra-fonts-heading)',
      fontSize: '0.65rem',
      fontWeight: 600,
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      marginTop: '1.2rem',
      marginBottom: '0.3rem',
      color: h3Color ?? h2Color,
    },
    '& h3:first-of-type': { marginTop: 0 },
    '@media (min-width: 48em)': {
      '& h2': { fontSize: '2rem', marginBottom: '0.8rem' },
      '& h3': { fontSize: '0.75rem' },
    },
    '@media (min-width: 120em)': {
      '& h2': { fontSize: 'clamp(2rem, 4vw, 3rem)' },
      '& h3': { fontSize: '1.3rem' },
    },
  } as const;
}
