#!/usr/bin/env node
/**
 * Theme token guard — runs in CI as part of the build.
 *
 * Checks:
 * 1. Raw hex color literals in ENFORCED files (NFL pages + components)
 * 2. References to dark.* tokens that don't exist in theme.js
 * 3. Raw hex in MONITORED files (MLB pages) — warns but doesn't fail
 *
 * Exit code 0 = clean, 1 = enforced violation found.
 * MLB violations are reported but do not fail the build (allowlisted
 * until the dark-theme migration). New hex in MLB files WILL show in
 * the warning count, making regressions visible even pre-migration.
 */

const fs = require('fs');
const path = require('path');

const THEME_PATH = path.join(__dirname, '..', 'src', 'theme.js');

// ENFORCED: raw hex = build failure
const ENFORCED_FILES = [
  'src/pages/NflMatchupsPage.jsx',
  'src/pages/NflProjectionsPage.jsx',
  'src/pages/NflSchedulePage.jsx',
  'src/pages/NflTeamRankingsPage.jsx',
  'src/components/NflPageWrapper.jsx',
  'src/components/NflValidationBanner.jsx',
  'src/components/NflFreshness.jsx',
  'src/components/SortableTable.jsx',
].map(f => path.join(__dirname, '..', f));

// MONITORED: raw hex = warning only (pre-migration allowlist)
const MONITORED_FILES = [
  'src/pages/BatterSplitsPage.jsx',
  'src/pages/BestBetsPage.jsx',
  'src/pages/EdgeReportPage.jsx',
  'src/pages/LandingPage.jsx',
  'src/pages/MatchupsPage.jsx',
  'src/pages/PitcherReportPage.jsx',
  'src/pages/PlayerProjectionsPage.jsx',
  'src/pages/ResultsPage.jsx',
  'src/pages/StartingLineupsPage.jsx',
  'src/pages/StatusPage.jsx',
  'src/pages/TrackRecordPage.jsx',
  'src/components/Footer.jsx',
  'src/components/Header.jsx',
  'src/components/PageErrorBoundary.jsx',
  'src/components/PicksCTA.jsx',
].map(f => path.join(__dirname, '..', f));

// Extract dark.* token names from theme.js
const themeContent = fs.readFileSync(THEME_PATH, 'utf8');
const darkTokens = new Set();
let inDark = false;
for (const line of themeContent.split('\n')) {
  if (line.includes('export const dark')) inDark = true;
  if (inDark && line.includes('};')) inDark = false;
  if (inDark) {
    const m = line.match(/^\s*(\w+):/);
    if (m) darkTokens.add(m[1]);
  }
}

function checkFile(filePath, isEnforced) {
  if (!fs.existsSync(filePath)) return { errors: 0, warnings: 0 };
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const fileName = path.relative(path.join(__dirname, '..'), filePath);
  let errors = 0;
  let warnings = 0;

  // Check raw hex literals
  lines.forEach((line, i) => {
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;
    if (line.includes('import ')) return;
    const hexMatches = line.match(/'#[0-9a-fA-F]{3,8}'|"#[0-9a-fA-F]{3,8}"/g);
    if (hexMatches) {
      hexMatches.forEach(hex => {
        const prefix = isEnforced ? 'ERROR' : 'WARN';
        console.log(`  ${prefix}: ${fileName}:${i + 1} — ${hex}`);
        if (isEnforced) errors++;
        else warnings++;
      });
    }
  });

  // Check ghost dark.* tokens (enforced files only)
  if (isEnforced) {
    const darkRefs = content.matchAll(/dark\.(\w+)/g);
    for (const match of darkRefs) {
      if (!darkTokens.has(match[1])) {
        const lineNum = content.substring(0, match.index).split('\n').length;
        console.log(`  ERROR: ${fileName}:${lineNum} — dark.${match[1]} does not exist in theme.js`);
        errors++;
      }
    }
  }

  return { errors, warnings };
}

let totalErrors = 0;
let totalWarnings = 0;

for (const f of ENFORCED_FILES) {
  const { errors, warnings } = checkFile(f, true);
  totalErrors += errors;
  totalWarnings += warnings;
}

for (const f of MONITORED_FILES) {
  const { errors, warnings } = checkFile(f, false);
  totalWarnings += warnings;
}

if (totalErrors === 0 && totalWarnings === 0) {
  console.log('✓ All files clean. No raw hex or ghost tokens.');
} else if (totalErrors === 0) {
  console.log(`\n⚠ ${totalWarnings} warning(s) in monitored files (pre-migration allowlist). Build continues.`);
} else {
  console.log(`\n✗ ${totalErrors} error(s) in enforced files. Build blocked.`);
  if (totalWarnings > 0) {
    console.log(`  (plus ${totalWarnings} warning(s) in monitored files)`);
  }
}

process.exit(totalErrors > 0 ? 1 : 0);
