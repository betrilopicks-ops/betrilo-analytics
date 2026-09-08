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
  textMuted: '#7e9fb4',        // placeholders, tertiary — 4.62:1 on surfaceBg, 5.78:1 on pageBg
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
  inputPlaceholder: '#7e9fb4',

  // Status colors (tuned for dark bg)
  statusGreen: '#19C93E',      // Smash, healthy — 7.5:1 on pageBg
  statusGreenLight: '#7dd87d', // Favorable — 5.2:1 on pageBg
  statusNeutral: '#9fb3c0',    // Neutral — 6.3:1 on pageBg
  statusAmber: '#e8a838',      // Tough, Questionable — 5.8:1 on pageBg
  statusRed: '#f27272',        // Avoid, IR, Out — 4.57:1 on surfaceBg, 5.72:1 on pageBg

  // DvP rating colors (same as status, named for clarity)
  dvpSmash: '#19C93E',
  dvpFavorable: '#7dd87d',
  dvpNeutral: '#9fb3c0',
  dvpTough: '#e8a838',
  dvpAvoid: '#f27272',

  // Injury status
  injQuestionable: '#e8a838',
  injOut: '#f27272',
  injIR: '#f27272',
  injPUP: '#f27272',
  injSuspended: '#f27272',
  injUnknown: '#7e9fb4',

  // Banner (validation disclosure)
  bannerBg: '#1a2d3d',
  bannerBorder: '#e8a838',
  bannerBadgeBg: '#e8a838',
  bannerBadgeText: '#1a2d3d',
  bannerText: '#e8eef2',
};

// ── MLB data-viz tokens (dark bg — used during MLB dark migration) ────────
// Conditional colors for data visualization, badges, and status indicators.
// Each is verified against dark.pageBg (#0B2331) in check-contrast.js.
// Values tuned for dark backgrounds — some differ from current light-theme values.
export const mlbDark = {
  // Result badges
  hitBg: '#19C93E',              // HIT badge bg — 7.3:1 on pageBg
  hitText: '#0B2331',            // HIT badge text
  missBg: '#f27272',             // MISS badge bg — was #c0392b (3.0:1 FAIL), now matches dark.statusRed (5.7:1)
  missText: '#0B2331',           // MISS badge text
  pushBg: '#16344a',             // PUSH badge bg
  pushText: '#9fb3c0',           // PUSH badge text

  // Calendar heat grid (TrackRecord)
  heatHigh: '#19C93E',           // >= 75% — 7.3:1 on pageBg
  heatGood: '#4eca6a',           // >= 65% — was #1a8a3a (3.6:1 FAIL), brightened to 6.0:1
  heatMid: '#16344a',            // >= 55% — surface bg with text accent
  heatMidText: '#19C93E',        // text on heatMid
  heatLow: '#16344a',            // >= 45%
  heatLowText: '#9fb3c0',        // text on heatLow
  heatBad: '#1a2a38',            // < 45%
  heatBadText: '#f27272',        // red text on heatBad
  heatAllStar: '#1e4460',        // all-star break
  heatNoData: '#16344a',         // no-data day
  heatNoDataText: '#7e9fb4',     // text on no-data
  heatFuture: '#0B2331',         // future day
  heatFutureText: '#3a5060',     // text on future

  // Pitcher Report badges
  hotBadgeBg: 'rgba(255,90,50,0.18)',
  hotBadgeText: '#ff7043',       // 5.9:1 on pageBg
  hotBadgeBorder: 'rgba(255,112,67,0.35)',
  coldBadgeBg: 'rgba(66,165,245,0.15)',
  coldBadgeText: '#64b5f6',      // 7.3:1 on pageBg
  coldBadgeBorder: 'rgba(100,181,246,0.30)',
  steadyBg: 'rgba(255,255,255,0.06)',
  steadyText: '#7e9fb4',         // matches dark.textMuted
  steadyBorder: 'rgba(255,255,255,0.08)',
  scratchedText: '#f27272',      // was #ef5350 (4.6:1), now matches statusRed (5.7:1)
  scratchedBg: 'rgba(242,114,114,0.12)',
  vintageText: '#ffb74d',        // 9.3:1 on pageBg
  vintageBg: 'rgba(255,183,77,0.12)',

  // Direction badges (Best Bets, Edge Report)
  overText: '#19C93E',           // OVER direction
  underText: '#f27272',          // UNDER — was #c0392b (3.0:1 FAIL), now 5.7:1

  // Status (StatusPage)
  statusHealthy: '#19C93E',
  statusAttention: '#e8a838',    // was #eab308 (similar), unified to dark.statusAmber
  statusError: '#f27272',        // was #ef4444, unified to dark.statusRed

  // Projected/Confirmed (StartingLineups)
  confirmedBg: '#19C93E',
  confirmedText: '#0B2331',
  projectedBg: 'rgba(159,179,192,0.15)',
  projectedText: '#9fb3c0',

  // Table stripes and surfaces
  rowStripe: '#16344a',          // alternating row (was #fafcfd)
  rowStripeBorder: '#1e4460',    // row border (was #eef2f5)
  footnoteBlockBg: '#16344a',   // footer/key block (was #f4f7f9)
  stickyBorder: '#1e4460',       // sticky column border (was #e3e9ed)
  disabledBg: '#1e4460',         // disabled button (was #d4e1ea)
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
  textMuted: '#586771',          // was #999 (2.8:1 FAIL) — fixed to 5.8:1 on white
  accentBg: '#19C93E',
  accentText: '#0B2331',
};
