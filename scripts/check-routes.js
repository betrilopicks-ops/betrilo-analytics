#!/usr/bin/env node
/**
 * Route-vs-nav consistency check.
 *
 * Parses Header.jsx nav arrays and App.js routes, then verifies every
 * nav link and in-page internal link has a matching route. Fails the
 * build if any link points to a nonexistent route.
 *
 * Also scans all .jsx files for <a href="/..."> and <Link to="/...">
 * patterns pointing at internal paths, and checks those too.
 *
 * BFEv0.29.0 (September 8, 2026)
 */

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');

// ── Extract routes from App.js ──
const appJs = fs.readFileSync(path.join(SRC, 'App.js'), 'utf8');
const routeRegex = /path=["']([^"']+)["']/g;
const routes = new Set();
let m;
while ((m = routeRegex.exec(appJs)) !== null) {
  if (m[1] !== '*') routes.add(m[1]);
}

// ── Extract nav links from Header.jsx ──
const headerJsx = fs.readFileSync(path.join(SRC, 'components', 'Header.jsx'), 'utf8');
const navLinkRegex = /to:\s*['"]([^'"]+)['"]/g;
const navLinks = [];
while ((m = navLinkRegex.exec(headerJsx)) !== null) {
  navLinks.push({ path: m[1], file: 'Header.jsx', type: 'nav' });
}

// ── Scan all .jsx files for internal links ──
function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      results.push(...scanDir(full));
    } else if (e.name.endsWith('.jsx') || e.name.endsWith('.js')) {
      results.push(full);
    }
  }
  return results;
}

const inPageLinks = [];
// Match to="/path" and href="/path" for any internal path (starts with /)
// Exclude: external URLs, /data/ (JSON), hash-only, and # fragments
const linkRegex = /(?:to=["']|href=["'])(\/[a-z][a-z0-9/-]*)/gi;
const IGNORED_PREFIXES = ['/data/', '/static/'];
for (const file of scanDir(SRC)) {
  const content = fs.readFileSync(file, 'utf8');
  const rel = path.relative(SRC, file);
  while ((m = linkRegex.exec(content)) !== null) {
    const p = m[1].split('#')[0]; // strip hash fragments
    if (IGNORED_PREFIXES.some(pfx => p.startsWith(pfx))) continue;
    inPageLinks.push({ path: p, file: rel, type: 'in-page' });
  }
}

// ── Check all links against routes ──
const errors = [];
const allLinks = [...navLinks, ...inPageLinks];

for (const link of allLinks) {
  // Strip hash fragments for matching
  const cleanPath = link.path.split('#')[0];
  if (!routes.has(cleanPath)) {
    errors.push(`${link.type} link "${link.path}" in ${link.file} → no matching route`);
  }
}

// ── Report ──
if (errors.length > 0) {
  console.error(`\n✗ ${errors.length} broken internal link(s) found:\n`);
  for (const e of errors) {
    console.error(`  ${e}`);
  }
  console.error('\nRoutes defined in App.js:');
  for (const r of [...routes].sort()) {
    console.error(`  ${r}`);
  }
  console.error('\nFix the link or add the route. Build blocked.\n');
  process.exit(1);
} else {
  const linkCount = allLinks.length;
  console.log(`✓ ${linkCount} internal links checked, all have matching routes.`);
}
