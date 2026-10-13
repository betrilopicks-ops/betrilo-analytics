/**
 * gen-nba-meta.js — Post-build: generate build/nba.html with NBA-specific
 * OG tags from build/index.html. Vercel rewrite sends /nba → /nba.html
 * so crawlers (X, Threads) see NBA meta without running JavaScript.
 * The React app still loads and renders NbaLaunchPage via react-router.
 */
const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');
const src = path.join(buildDir, 'index.html');
const dest = path.join(buildDir, 'nba.html');

if (!fs.existsSync(src)) {
  console.error('[gen-nba-meta] build/index.html not found — run react-scripts build first');
  process.exit(1);
}

let html = fs.readFileSync(src, 'utf8');

// Replace title
html = html.replace(
  /<title>[^<]*<\/title>/,
  '<title>NBA on Betrilo launches Tuesday, October 20</title>'
);

// Replace meta description
html = html.replace(
  /<meta name="description" content="[^"]*"\/>/,
  '<meta name="description" content="Model-driven player projections for every NBA game, starting opening night."/>'
);

// Replace og:title
html = html.replace(
  /<meta property="og:title" content="[^"]*"\/>/,
  '<meta property="og:title" content="NBA on Betrilo launches Tuesday, October 20"/>'
);

// Replace og:description
html = html.replace(
  /<meta property="og:description" content="[^"]*"\/>/,
  '<meta property="og:description" content="Model-driven player projections for every NBA game, starting opening night."/>'
);

// Replace og:url
html = html.replace(
  /<meta property="og:url" content="[^"]*"\/>/,
  '<meta property="og:url" content="https://betrilo.com/nba"/>'
);

// Replace twitter:title
html = html.replace(
  /<meta name="twitter:title" content="[^"]*"\/>/,
  '<meta name="twitter:title" content="NBA on Betrilo launches Tuesday, October 20"/>'
);

// Replace twitter:description
html = html.replace(
  /<meta name="twitter:description" content="[^"]*"\/>/,
  '<meta name="twitter:description" content="Model-driven player projections for every NBA game, starting opening night."/>'
);

fs.writeFileSync(dest, html, 'utf8');

// Verify the replacements landed
const verify = fs.readFileSync(dest, 'utf8');
const checks = [
  ['og:title', 'NBA on Betrilo launches Tuesday, October 20'],
  ['og:description', 'Model-driven player projections for every NBA game'],
  ['twitter:title', 'NBA on Betrilo launches Tuesday, October 20'],
];
let ok = true;
for (const [tag, expected] of checks) {
  if (!verify.includes(expected)) {
    console.error(`[gen-nba-meta] FAIL: ${tag} not found in output`);
    ok = false;
  }
}
if (!ok) process.exit(1);

console.log(`[gen-nba-meta] wrote ${dest} (${verify.length} bytes)`);
