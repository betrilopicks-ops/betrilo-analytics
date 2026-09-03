// ── Brand palette (raw values, not used directly in pages) ─────────────────
export const colors = {
  blue: '#015283',
  green: '#19C93E',
  navy: '#0B2331',
  navyLight: '#16344a',
  text: '#e8eef2',       // light text — for dark surfaces only
  textMuted: '#9fb3c0',  // muted light text — for dark surfaces only
  subtitleOnWhite: '#586771',
};

// ── Semantic tokens: DARK theme (NFL pages, future site-wide) ──────────────
// Every page-level color reads from here. No inline hex values in pages.
export const dark = {
  // Page structure
  pageBg: '#0B2331',           // full-page background
  surfaceBg: '#16344a',        // cards, panels, table control bars
  surfaceBgAlt: '#0B2331',     // alternating row stripe
  border: '#1e4460',           // subtle separators
  borderAccent: '#19C93E',     // green accent borders (sticky column, active elements)

  // Text
  textPrimary: '#e8eef2',      // headings, primary content — 13.2:1 on pageBg
  textSecondary: '#9fb3c0',    // subtitles, timestamps — 6.3:1 on pageBg
  textMuted: '#6b8a9e',        // placeholders, tertiary — 3.7:1 on pageBg (large text only)
  textOnAccent: '#0B2331',     // text on green accent bg — 6.7:1

  // Interactive
  accentBg: '#19C93E',         // active tabs, buttons, CTA
  accentText: '#0B2331',       // text inside accent bg
  inactiveBg: '#16344a',       // inactive tabs, pills
  inactiveText: '#9fb3c0',     // inactive tab text
  inactiveBorder: '#2a5670',   // inactive pill border

  // Inputs
  inputBg: '#0B2331',
  inputText: '#e8eef2',
  inputBorder: '#19C93E',
  inputPlaceholder: '#6b8a9e',

  // Status colors (tuned for dark bg)
  statusGreen: '#19C93E',      // Smash, healthy — 7.5:1 on pageBg
  statusGreenLight: '#7dd87d', // Favorable — 5.2:1 on pageBg
  statusNeutral: '#9fb3c0',    // Neutral — 6.3:1 on pageBg
  statusAmber: '#e8a838',      // Tough, Questionable — 5.8:1 on pageBg
  statusRed: '#e05555',        // Avoid, IR, Out — 4.5:1 on pageBg

  // DvP rating colors (same as status, named for clarity)
  dvpSmash: '#19C93E',
  dvpFavorable: '#7dd87d',
  dvpNeutral: '#9fb3c0',
  dvpTough: '#e8a838',
  dvpAvoid: '#e05555',

  // Injury status
  injQuestionable: '#e8a838',
  injOut: '#e05555',
  injIR: '#e05555',
  injPUP: '#e05555',
  injSuspended: '#e05555',
  injUnknown: '#6b8a9e',

  // Banner (validation disclosure)
  bannerBg: '#1a2d3d',
  bannerBorder: '#e8a838',
  bannerBadgeBg: '#e8a838',
  bannerBadgeText: '#1a2d3d',
  bannerText: '#e8eef2',
};

// ── Semantic tokens: LIGHT theme (MLB pages, current production) ───────────
// MLB pages continue using inline colors from the `colors` export until
// migrated. This object exists so the migration has a target, not because
// MLB pages read it today.
export const light = {
  pageBg: '#ffffff',
  surfaceBg: '#f0f4f7',
  textPrimary: '#0B2331',
  textSecondary: '#586771',
  textMuted: '#999',
  accentBg: '#19C93E',
  accentText: '#0B2331',
};
