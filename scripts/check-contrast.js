#!/usr/bin/env node
/**
 * WCAG Contrast Checker — companion to check-theme-tokens.js.
 *
 * Checks declared foreground/background token pairings against WCAG 2.1
 * contrast requirements:
 *   - Normal text (<18.66px bold, <24px regular): >= 4.5:1  (AA)
 *   - Large text  (>=18.66px bold, >=24px regular): >= 3.0:1 (AA)
 *
 * The pairing table is the source of truth for which foreground tokens
 * appear on which backgrounds. Add new pairings here, not as inline
 * comments in pages.
 *
 * Exit code 0 = all pass, 1 = contrast failure(s) found.
 * Reports the full table on every run (ratios visible, not just pass/fail).
 *
 * BFEv0.24.0 (September 8, 2026)
 */

// ── WCAG relative luminance and contrast computation ─────────────────────

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  const n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(fg, bg) {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ── Token values (must match src/theme.js) ───────────────────────────────

const TOKENS = {
  // Dark theme backgrounds
  'dark.pageBg':       '#0B2331',
  'dark.surfaceBg':    '#16344a',
  'dark.surfaceBgAlt': '#0B2331',
  'dark.bannerBg':     '#1a2d3d',
  'dark.accentBg':     '#19C93E',
  'dark.inactiveBg':   '#16344a',

  // Dark theme foregrounds
  'dark.textPrimary':   '#e8eef2',
  'dark.textSecondary': '#9fb3c0',
  'dark.textMuted':     '#7e9fb4',
  'dark.textOnAccent':  '#0B2331',
  'dark.accentText':    '#0B2331',
  'dark.inactiveText':  '#9fb3c0',
  'dark.bannerText':    '#e8eef2',
  'dark.bannerBadgeText': '#1a2d3d',

  // Dark theme status (used as foreground on pageBg/surfaceBg)
  'dark.statusGreen':      '#19C93E',
  'dark.statusGreenLight': '#7dd87d',
  'dark.statusNeutral':    '#9fb3c0',
  'dark.statusAmber':      '#e8a838',
  'dark.statusRed':        '#f27272',

  // MLB conditional colors (data-viz, will become tokens during migration)
  'mlb.hitBadge':      '#19C93E',  // HIT result on pageBg
  'mlb.missBadge':     '#c0392b',  // MISS result
  'mlb.heatHigh':      '#19C93E',  // calendar >= 75%
  'mlb.heatMid':       '#1a8a3a',  // calendar >= 65%
  'mlb.hotBadge':      '#ff7043',  // pitcher hot
  'mlb.coldBadge':     '#64b5f6',  // pitcher cold
  'mlb.vintageBadge':  '#ffb74d',  // 2025 data label
  'mlb.scratchedBadge':'#ef5350',  // scratched
  'mlb.statusAmber':   '#eab308',  // status attention
  'mlb.statusRed':     '#ef4444',  // status error

  // Light theme (current MLB production)
  'light.pageBg':      '#ffffff',
  'light.surfaceBg':   '#f0f4f7',
  'light.textPrimary': '#0B2331',
  'light.textSecondary':'#586771',
  'light.textMuted':   '#586771',  // was #999 (2.8:1 FAIL), fixed to 5.8:1
};

// ── Declared pairings: [foreground, background, size, description] ──────
// size: 'normal' (requires 4.5:1) or 'large' (requires 3.0:1)
// Large text = >=18.66px bold OR >=24px regular. NOT 11px bold.

// ENFORCED pairings — build fails if any ratio is below threshold
const ENFORCED_PAIRINGS = [
  // ── Dark theme (NFL live + future MLB dark) ──
  ['dark.textPrimary',   'dark.pageBg',     'normal', 'Primary text on page background'],
  ['dark.textPrimary',   'dark.surfaceBg',  'normal', 'Primary text on card/panel'],
  ['dark.textSecondary', 'dark.pageBg',     'normal', 'Secondary text on page background'],
  ['dark.textSecondary', 'dark.surfaceBg',  'normal', 'Secondary text on card/panel'],
  ['dark.textMuted',     'dark.pageBg',     'normal', 'Muted text on page background'],
  ['dark.textMuted',     'dark.surfaceBg',  'normal', 'Muted text on card/panel'],
  ['dark.textOnAccent',  'dark.accentBg',   'normal', 'Text on green accent'],
  ['dark.accentText',    'dark.accentBg',   'normal', 'Button text on green'],
  ['dark.inactiveText',  'dark.inactiveBg', 'normal', 'Inactive tab text'],
  ['dark.bannerText',    'dark.bannerBg',   'normal', 'Banner text'],
  ['dark.bannerBadgeText','dark.statusAmber','normal', 'Badge text on amber'],
  ['dark.statusGreen',     'dark.pageBg',   'normal', 'Green status on page bg'],
  ['dark.statusGreenLight','dark.pageBg',   'normal', 'Light green on page bg'],
  ['dark.statusAmber',     'dark.pageBg',   'normal', 'Amber on page bg'],
  ['dark.statusRed',       'dark.pageBg',   'normal', 'Red on page bg'],
  ['dark.statusRed',       'dark.surfaceBg','normal', 'Red on card bg'],
];

// MONITORED pairings — reported but do not fail the build (pre-migration)
const MONITORED_PAIRINGS = [
  // MLB conditional colors on dark backgrounds (migration target — fix during migration)
  ['mlb.missBadge',     'dark.pageBg',   'normal', 'MISS badge on dark bg (needs brighter red)'],
  ['mlb.heatMid',       'dark.pageBg',   'normal', 'Calendar mid on dark bg (needs brighter green)'],
  ['mlb.hitBadge',      'dark.pageBg',   'normal', 'HIT badge on dark bg'],
  ['mlb.heatHigh',      'dark.pageBg',   'normal', 'Calendar high on dark bg'],
  ['mlb.hotBadge',      'dark.pageBg',   'normal', 'Hot badge on dark bg'],
  ['mlb.coldBadge',     'dark.pageBg',   'normal', 'Cold badge on dark bg'],
  ['mlb.vintageBadge',  'dark.pageBg',   'normal', 'Vintage label on dark bg'],
  ['mlb.scratchedBadge','dark.pageBg',   'normal', 'Scratched badge on dark bg'],
  // Light theme (current production — existing issues)
  ['light.textPrimary', 'light.pageBg',   'normal', 'MLB text on white'],
  ['light.textSecondary','light.pageBg',  'normal', 'MLB subtitle on white'],
  ['light.textMuted',   'light.pageBg',   'normal', 'MLB muted on white (existing fail)'],
  ['light.textPrimary', 'light.surfaceBg','normal', 'MLB text on surface'],
];

// ── Run checks ──────────────────────────────────────────────────────────

function checkPairings(pairings, label, failOnError) {
  let errors = 0;
  let warnings = 0;
  const COL = { name: 54, ratio: 8, req: 6 };

  console.log(`\n${label}`);
  console.log('-'.repeat(76));

  for (const [fgKey, bgKey, size, desc] of pairings) {
    const fg = TOKENS[fgKey];
    const bg = TOKENS[bgKey];
    if (!fg || !bg) {
      console.log(`  SKIP: ${desc} — token not found`);
      continue;
    }

    const ratio = contrastRatio(fg, bg);
    const required = size === 'large' ? 3.0 : 4.5;
    const pass = ratio >= required;

    if (!pass) {
      if (failOnError) errors++;
      else warnings++;
    }

    const marker = pass ? '✓' : '✗';
    const status = pass ? 'PASS' : (failOnError ? 'FAIL' : 'WARN');
    console.log(
      `${marker} ${desc}`.padEnd(COL.name) +
      `${ratio.toFixed(1)}:1`.padStart(COL.ratio) +
      `${required}:1`.padStart(COL.req) +
      `  ${status}`
    );
  }
  return { errors, warnings };
}

console.log('WCAG Contrast Check');
console.log('='.repeat(76));

const enforced = checkPairings(ENFORCED_PAIRINGS, 'ENFORCED (build fails on error):', true);
const monitored = checkPairings(MONITORED_PAIRINGS, 'MONITORED (pre-migration, warn only):', false);

console.log('\n' + '='.repeat(76));
const total = ENFORCED_PAIRINGS.length + MONITORED_PAIRINGS.length;
if (enforced.errors === 0 && monitored.warnings === 0) {
  console.log(`✓ All ${total} pairings pass WCAG AA.`);
} else if (enforced.errors === 0) {
  console.log(`⚠ ${monitored.warnings} warning(s) in monitored pairings. Build continues.`);
} else {
  console.log(`✗ ${enforced.errors} error(s) in enforced pairings. Build blocked.`);
}

process.exit(enforced.errors > 0 ? 1 : 0);
