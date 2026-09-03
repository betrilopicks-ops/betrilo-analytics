#!/usr/bin/env node
/**
 * Check NFL pages for raw hex color literals and ghost theme tokens.
 * Run: node scripts/check-theme-tokens.js
 * Exit code 0 = clean, 1 = issues found.
 *
 * Checks:
 * 1. Raw hex color literals (#xxx, #xxxxxx) in NFL page/component files
 *    (these should use dark.* tokens instead)
 * 2. References to dark.* tokens that don't exist in theme.js
 */

const fs = require('fs');
const path = require('path');

const THEME_PATH = path.join(__dirname, '..', 'src', 'theme.js');
const NFL_FILES = [
  'src/pages/NflMatchupsPage.jsx',
  'src/pages/NflProjectionsPage.jsx',
  'src/pages/NflSchedulePage.jsx',
  'src/pages/NflTeamRankingsPage.jsx',
  'src/components/NflPageWrapper.jsx',
  'src/components/NflValidationBanner.jsx',
  'src/components/NflFreshness.jsx',
  'src/components/SortableTable.jsx',
].map(f => path.join(__dirname, '..', f));

// Extract dark.* token names from theme.js
const themeContent = fs.readFileSync(THEME_PATH, 'utf8');
const darkTokens = new Set();
const tokenRegex = /^\s*(\w+):/gm;
let inDark = false;
for (const line of themeContent.split('\n')) {
  if (line.includes('export const dark')) inDark = true;
  if (inDark && line.includes('};')) inDark = false;
  if (inDark) {
    const m = line.match(/^\s*(\w+):/);
    if (m) darkTokens.add(m[1]);
  }
}

let issues = 0;

for (const filePath of NFL_FILES) {
  if (!fs.existsSync(filePath)) continue;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const fileName = path.relative(path.join(__dirname, '..'), filePath);

  // Check 1: Raw hex literals (skip theme.js imports, comments, and DVP_COLORS definitions)
  lines.forEach((line, i) => {
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;
    if (line.includes('import ')) return;
    const hexMatches = line.match(/'#[0-9a-fA-F]{3,8}'|"#[0-9a-fA-F]{3,8}"/g);
    if (hexMatches) {
      hexMatches.forEach(hex => {
        console.log(`  RAW HEX: ${fileName}:${i + 1} — ${hex} (should use dark.* token)`);
        issues++;
      });
    }
  });

  // Check 2: Ghost dark.* tokens
  const darkRefs = content.matchAll(/dark\.(\w+)/g);
  for (const match of darkRefs) {
    const token = match[1];
    if (!darkTokens.has(token)) {
      const lineNum = content.substring(0, match.index).split('\n').length;
      console.log(`  GHOST TOKEN: ${fileName}:${lineNum} — dark.${token} does not exist in theme.js`);
      issues++;
    }
  }
}

if (issues === 0) {
  console.log('✓ All NFL pages use theme tokens exclusively. No raw hex or ghost tokens.');
  process.exit(0);
} else {
  console.log(`\n✗ ${issues} issue(s) found. Fix before committing.`);
  process.exit(1);
}
