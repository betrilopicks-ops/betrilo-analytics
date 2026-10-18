/**
 * gen-route-meta.js — Post-build: generate route-specific HTML files from
 * build/index.html with per-route OG tags. Vercel rewrites send /mlb, /nfl,
 * /nba to their respective .html files so crawlers see correct meta without
 * running JavaScript. The React app still loads and renders via react-router.
 */
const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');
const src = path.join(buildDir, 'index.html');

if (!fs.existsSync(src)) {
  console.error('[gen-route-meta] build/index.html not found — run react-scripts build first');
  process.exit(1);
}

const baseHtml = fs.readFileSync(src, 'utf8');

const ROUTES = [
  {
    file: 'nba_matchups.html',
    title: 'NBA Matchups \u2014 Betrilo',
    desc: 'Model-driven NBA game matchup projections with team scores and player breakdowns.',
    url: 'https://betrilo.com/nba/matchups',
  },
  {
    file: 'nba_projections.html',
    title: 'NBA Player Projections \u2014 Betrilo',
    desc: 'Model-driven NBA player projections for every game.',
    url: 'https://betrilo.com/nba/projections',
  },
  {
    file: 'nba.html',
    title: 'NBA Player Projections — Betrilo',
    ogTitle: 'NBA on Betrilo launches Tuesday, October 20',
    desc: 'Model-driven NBA player projections for every game, starting opening night October 20, 2026.',
    url: 'https://betrilo.com/nba',
  },
  {
    file: 'mlb.html',
    title: 'MLB Projections & Picks — Betrilo',
    desc: 'Model-driven MLB projections, daily picks, and a publicly tracked record. Starting lineups, pitcher reports, BvP, and edge analysis.',
    url: 'https://betrilo.com/mlb',
  },
  {
    file: 'nfl.html',
    title: 'NFL Projections & Matchups — Betrilo',
    desc: 'Model-driven NFL projections, DvP matchup rankings, and weekly schedule analysis.',
    url: 'https://betrilo.com/nfl',
  },
];

let allOk = true;

for (const route of ROUTES) {
  let html = baseHtml;

  // Replace title
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${route.title}</title>`
  );

  // Replace meta description
  html = html.replace(
    /<meta name="description" content="[^"]*"\/>/,
    `<meta name="description" content="${route.desc}"/>`
  );

  // Replace og:title (use ogTitle if set, otherwise title)
  const ogTitle = route.ogTitle || route.title;
  html = html.replace(
    /<meta property="og:title" content="[^"]*"\/>/,
    `<meta property="og:title" content="${ogTitle}"/>`
  );

  // Replace og:description
  html = html.replace(
    /<meta property="og:description" content="[^"]*"\/>/,
    `<meta property="og:description" content="${route.desc}"/>`
  );

  // Replace og:url
  html = html.replace(
    /<meta property="og:url" content="[^"]*"\/>/,
    `<meta property="og:url" content="${route.url}"/>`
  );

  // Replace twitter:title
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"\/>/,
    `<meta name="twitter:title" content="${ogTitle}"/>`
  );

  // Replace twitter:description
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"\/>/,
    `<meta name="twitter:description" content="${route.desc}"/>`
  );

  const dest = path.join(buildDir, route.file);
  fs.writeFileSync(dest, html, 'utf8');

  // Verify replacements landed
  const verify = fs.readFileSync(dest, 'utf8');
  const checks = [
    ['title', route.title],
    ['og:description', route.desc],
    ['og:url', route.url],
  ];
  for (const [tag, expected] of checks) {
    if (!verify.includes(expected)) {
      console.error(`[gen-route-meta] FAIL: ${tag} not found in ${route.file}`);
      allOk = false;
    }
  }

  console.log(`[gen-route-meta] wrote ${dest} (${verify.length} bytes)`);
}

if (!allOk) {
  process.exit(1);
}

console.log('[gen-route-meta] all route meta files generated successfully.');
