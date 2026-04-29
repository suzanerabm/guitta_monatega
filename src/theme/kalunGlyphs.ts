// src/theme/kalunGlyphs.ts
//
// Single source of truth for all Kalún glyphs used across the Kammara
// universe. Centralizing these here ensures that every component (card,
// subsystem card, planet title, watermark, etc.) uses the same glyph for
// the same world / subsystem — no inline literals scattered in pages or
// components.
//
// Glyph definitions come from the canonical texts in
// `public/09_Texts/<WORLD> — Textos por Tema.md`, where each world's
// crest appears as the H1 heading and each subsystem as H2.

// ---------------------------------------------------------------------------
// World crests — used as the watermark / identity glyph of each world.
// ---------------------------------------------------------------------------

export type WorldKey =
  | 'kammara'
  | 'lunnp1'
  | 'eni4'
  | 'triplec'
  | 'orfv'
  | 'z1'
  | 'gotto'
  | 'malloc'
  | 'mesh'
  | 'sharp';

const WORLD_CREST: Record<WorldKey, string> = {
  // Stored without spaces so callers can render them as single compact
  // symbols (watermarks, spheres, titles). Add CSS letterSpacing when you
  // want the components to breathe visually.
  kammara: '⊹⊙⊹',
  lunnp1: '⊙—⊹—⊙',
  eni4: '⋄⊙⋄',
  triplec: '⊙⊙⊙',
  orfv: '⊶—⋄—⊷',
  z1: '⊷⊙⊷',
  gotto: '⊷⊶',
  malloc: '•⊙',
  mesh: '⊶⊙⊶⊙⊶',
  sharp: '⊹⊙⊷',
};

/**
 * Returns the canonical crest glyph for a given world / region.
 * Falls back to `⊙` (centro/foco — the generic "this is a subsystem" glyph)
 * if the id is unknown.
 */
export function worldCrestGlyph(id: string): string {
  return WORLD_CREST[id as WorldKey] ?? '⊙';
}

// ---------------------------------------------------------------------------
// Subsystem glyphs — semantic Kalún sequences per subsystem type.
// ---------------------------------------------------------------------------

/**
 * Maps a subsystem title (PT or EN, any world) to its semantic Kalún glyph.
 * Matching is substring-based and case-insensitive, so translated titles
 * resolve correctly.
 */
export function subsystemGlyph(title: string): string {
  const key = title.toLowerCase().trim();
  // Canonical glyph assignments extracted directly from 09_Texts/<WORLD> — Textos por Tema.md
  // where each subsystem's H2 starts with its glyph.
  // Glyphs are stored WITHOUT spaces so callers can render them as a single
  // compact symbol inside constrained spaces (like the roulette sphere).

  // --- Shared across worlds ---
  if (key.includes('cultur')) return '⊶⊙⊷';                              // Cultura
  if (key.includes('flora') || key.includes('fauna')) return '•⊹•';      // Flora & Fauna
  // Inhabitants — "Bunniets", "Habitantes", "Castas", "ElePHPants", "Basiks"
  if (
    key.includes('habitantes') ||
    key.includes('bunniets') ||
    key.includes('inhabitants') ||
    key.includes('basiks') ||
    key.includes('elephpants') ||
    key.includes('castas')
  ) return '⊙•⊙';
  if (key.includes('geograf') || key.includes('geography')) return '⊹—⊙'; // Geografia
  if (key.includes('ciclo') || key.includes('lua') || key.includes('tempo') ||
      key.includes('cycle') || key.includes('moon') || key.includes('time')) return '⊶—⊶'; // Ciclos & Luas/Tempo
  if (key.includes('água') || key.includes('agua') || key.includes('water')) return '—•—'; // A Água
  if (key.includes('linguagem') || key.includes('language') ||
      key.includes('idioma') || key.includes('comunica') || key.includes('communication'))
    return '⊶••⊷'; // Linguagem/Idioma/Comunicação
  if (key.includes('glifo') || key.includes('glyph')) return '⊶••⊷';     // Os Glifos Kalún (same family as language)
  if (key.includes('origem') || key.includes('origin') || key.includes('história') || key.includes('history'))
    return '⊹⊹⊹'; // Origem / Origem & História
  if (key.includes('niul') || key.includes('forest')) return '⊹—⊹';     // A Niul Forest
  if ((key.includes('kemita') && key.includes('cshift')) ||
      key.includes('a kemita e o cshift')) return '⊙⊹⊙';                 // A Kemita e o Cshift
  if (key.includes('kemita')) return '⊙⊹⊙';                              // A Kemita (Kammara)
  if (key.includes('cshift')) return '⊷⊙⊶';                              // O Cshift (Kammara)
  if (key.includes('energia') || key.includes('sobreviv') || key.includes('energy') ||
      key.includes('survival')) return '⊙•⊹'; // Energia, Energia & Sobrevivência
  if (key.includes('governan') || key.includes('governance')) return '⊶⊷⊙'; // Governança
  if (key.includes('perigo') || key.includes('danger')) return '⊶⊶⊶';    // Perigos (and general "alert")
  if (key.includes('relaç') || key.includes('relation') || key.includes('outros planetas') ||
      key.includes('other planets')) return '⊶—⊙—⊷'; // Relações com Outros Planetas (Gotto)
  if (key.includes('conflit') || key.includes('conflict')) return '⊶⋄⊷';  // Conflitos (ORF-V)
  if (key.includes('protocolos de ataque') || key.includes('attack protocol')) return '⋄⋄⊷'; // Protocolos de Ataque (ENI-4Δ)
  if (key.includes('asm') || key.includes('código dos vírus') || key.includes('virus code'))
    return '⋄—⋄'; // O Código dos Vírus — ASM-Δ (ENI-4Δ)
  if (key.includes('vírus') || key.includes('virus')) return '⋄•⋄';       // Os Vírus (Kammara)
  if (key.includes('protocol auryn') || key.includes('auryn')) return '⊶⊹⊷'; // O Protocol AURYN / A Tríade e o AURYN (shared)
  if (key.includes('tríade') || key.includes('triade') || key.includes('triad')) return '⊹⊙⊹⊙⊹'; // A Tríade das Raízes / A Tríade e o AURYN
  if (key.includes('guerra') || key.includes('war')) return '⋄⊶⊷';       // A Guerra (Kammara)
  if (key.includes('universo') || key.includes('universe')) return '⊹⊙⊹'; // O Universo (Kammara)
  if (key.includes('criptokemita') || key.includes('cryptokemita')) return '⊶⊶⊶'; // O CriptoKemita (TripleC)
  return '⊙';
}

// ---------------------------------------------------------------------------
// Semantic declarers — Kalún sequences that name an entity type.
// (reference only; not used programmatically yet)
// ---------------------------------------------------------------------------

export const DECLARERS = {
  planet: '— ⊙ —',     // "— ⊙ —" declares a PLANET
  universe: '⊹ ⊙ ⊹',   // "⊹ ⊙ ⊹" declares the UNIVERSE (Kammara)
  home: '⊶ ⊙ ⊷',       // "⊶ ⊙ ⊷" declares HOME
  subsystem: '⊙',      // "⊙" alone declares a SUBSYSTEM
} as const;
