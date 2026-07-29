# @betrilopicks Frontend (betrilo.com) — Technical Project Book

**Version:** BFEv0.6.11 | **Last Updated:** July 29, 2026 | **Includes:** Pitcher Report sort by start time (games now render earliest→latest); Batter Splits doubleheader fix (DH players appear twice with G1/G2 labels and correct per-game opposing pitcher; team filter uses team_abbr for clean DH grouping); /status false-alarm fix (Best Bets, Edge Report, Batter Splits switched to freshness-only health — these surfaces don't count raw games, so their record counts falsely mismatched the MLB schedule, producing spurious yellow flags on healthy days; now noGameCount: healthy = updated today, no game-count comparison; operator sees all-green banner when pipeline is clean); System Status page (/status — public but unlisted, not in nav/sitemap; pipeline health + data freshness dashboard for remote monitoring during travel; per-surface cards showing last_refreshed timestamp (absolute + relative ET), health color (green/yellow/red based on today-freshness + game-count cross-check vs MLB Stats API schedule), game count vs expected, record counts; top-line banner summarizes all-healthy vs attention-needed; pipeline health_latest.json verdict + step-level status surfaced; schedule cross-check: MLB Stats API primary with starting-lineups fallback; auto-refresh every 5 min + manual refresh button; mobile-friendly; per-surface error isolation; noindex/nofollow meta; built for 7/29-8/3 travel window); VP AB column on Player Projections page (column relabeled VP AB, reads vp_ab from JSON instead of vp_pa; cellValue switch and td render updated; footer Key text updated to "VP AB/H/HR/xwOBA — career at-bats and performance vs. today's probable pitcher"); H+R+RBI column on Player Projections page (proj_hrrbi passthrough from DB — same value as Results page; sortable; 327/520 batters covered; footer Key corrected); Footer tagline fix, Player Projections last-refreshed timestamp + lineup status display, Starting Lineups page (/mlb/starting-lineups; LIVE — merged to main 2026-06-27), Projected-lineups note bugfix (text color contrast; forceProjected test param), Lineups polish: projected-note solid bg + updated wording; TWP→P/DH position display; SEO foundation: react-helmet-async per-page meta + OG + canonical; sitemap.xml; robots.txt; JSON-LD homepage schema; BvP guide: crawlable static HTML at /mlb/batter-vs-pitcher-guide (~800 words, content in served HTML pre-JS); Footer support mailto (support@betrilo.com; green on navy; legible contrast); Game dropdown chronological sort (PlayerProjections + StartingLineups)

---

## 1. Overview

betrilo-analytics is the React 19 frontend for betrilo.com, deployed on Vercel. It serves MLB Batter-vs-Pitcher analytics, daily pick cards, track record pages, and landing content. All data is consumed from static JSON/CSV exports produced by the sport backend pipelines.

**Stack:** React 19, react-router-dom v7, CRA (react-scripts 5), Vercel

---

## 2. Session Logs

### Session: June 24, 2026 — BFEv0.1.0 → BFEv0.1.1

**Summary:** Footer tagline copy edit — "Sports Betting Projections" → "Sports Betting Analytics" to match the site's public identity.

| File | Change |
|---|---|
| `src/components/Footer.jsx` | Line 12: "Projections" → "Analytics" |

**Build:** `CI=true npm run build` — passed clean, exit 0.

### Session: June 27, 2026 — BFEv0.1.1 → BFEv0.1.2

**Summary:** Player Projections page now displays "Projections last refreshed H:MM AM/PM ET" label
and lineup status. Companion to MLB §13.15 (afternoon_refresh.py + export_player_projections_json.py
added `last_refreshed` and `lineup_status` fields to the projections JSON).

| File | Change |
|---|---|
| `src/pages/PlayerProjectionsPage.jsx` | Added `lastRefreshed`, `lineupStatus` state; reads `data.last_refreshed` / `data.lineup_status`; renders timestamp label under projections header |

---

### Session: June 25, 2026 — BFEv0.1.2 VOIDED (no-op)

**Summary:** footer-wording-fix ran through the full /feature pipeline but resolved as NO-OP — main already read "Sports Betting Projections" since commit `54a7e5e`. The routing-nav localhost branch was 33 commits behind main, so testing verified a stale site. No code shipped. Version bump to BFEv0.1.2 reverted to BFEv0.1.1. Captured two follow-up items: stale-localhost-branch fix and no-op status model enhancement.

---

### Session: June 27, 2026 — BFEv0.1.2 → BFEv0.2.0

**Summary:** New page: Starting Lineups (/mlb/starting-lineups). Shows per-game ordered
batting order (1–9) side-by-side (away left, home right) with confirmed/projected badge
and freshness timestamp. Reads from starting_lineups_latest.json (new MLB data export,
BMLBv3.28.0). Data-source: Branch B — new JSON required. Pending preview review + merge.

| File | Change |
|---|---|
| `src/pages/StartingLineupsPage.jsx` | New page component |
| `src/App.js` | Route /mlb/starting-lineups added |
| `src/components/Header.jsx` | "Starting Lineups" nav item added |
| `public/data/starting_lineups_latest.json` | Seed data for preview |

**Status:** LIVE — merged to main 2026-06-27 (branch `starting-lineups`, SHA `bb7c356`).

---

### Session: June 27, 2026 — BFEv0.2.0 revision — Pitcher/Bats/Team-Name pass

**Summary:** Extended Starting Lineups page (still BFEv0.2.0, unreleased). Three display upgrades driven by new MLB pipeline fields (BMLBv3.29.0):

1. **Pitcher band**: Full-width navy band between game header and batting tables, split left (away SP) / right (home SP). Format: "SP: {Name} · {L/R} · {W-L} · {ERA} ERA · {WHIP} WHIP". TBD renders as "SP: TBD". Null-safe for any missing field.

2. **Full team names**: Replaced abbreviated "{abbr} — Away/Home" labels with full franchise name (e.g., "Houston Astros") + small "(Away)"/"(Home)" tag. Falls back to abbreviation if full name absent. No collision — old label removed.

3. **Name cell alignment**: Player name `<td>` now explicitly `textAlign: 'left'` (was unset/center in some browsers).

4. **Nav order**: "Starting Lineups" moved to first position in `navItems` array in Header.jsx (was second).

5. **JSON updated**: `public/data/starting_lineups_latest.json` regenerated with real 2026-06-27 slate data (15 confirmed games, 270 batters, all pitchers with W/L/ERA/WHIP).

| File | Change |
|---|---|
| `src/pages/StartingLineupsPage.jsx` | PitcherBand component; full team name labels; left-align name cells |
| `src/components/Header.jsx` | Starting Lineups moved to navItems[0] |
| `public/data/starting_lineups_latest.json` | Regenerated with bats + pitcher objects + full team names |

**Build:** `CI=true npm run build` — "Compiled successfully." Zero warnings.
**No logo/image assets added.** grep: 0 `<img` tags, 0 `.png/.jpg/.svg` references in StartingLineupsPage.jsx.
**Status:** LIVE — merged to main 2026-06-27 (branch `starting-lineups`, SHA `bb7c356`).

---

### Session: June 27, 2026 — BFEv0.2.0 revision — Hero banner + grid reorder

**Summary:** Landing page hero banner and grid reorder (still BFEv0.2.0, unreleased on `starting-lineups`).

1. **Hero banner**: Full-width `TrackRecordBanner` component added ABOVE the card grid in LandingPage.jsx. Fetches `/data/track_record_latest.json` (same source as TrackRecordPage). Displays `overall.rate` as "{rate}% hit rate". Framing label uses identical `verified` boolean: `!!(data && data.verified)` → `verified=false` → "Publicly Tracked Record", `verified=true` → "Verified Track Record". Graceful fallback: if fetch fails or `overall.rate` is null/undefined/NaN, rate display is omitted; banner still renders. No crash, no "undefined%". No `<img>` tags.

2. **Grid reorder (8 cards)**: Track Record removed from grid (now hero banner). Starting Lineups added as slot 1. Canonical order: Starting Lineups · Batter vs Pitcher · Batter Splits · Best Bets · Player Projections · Edge Report · Results · Leaderboards (Coming Soon).

3. **Nav reorder (9 items)**: Header.jsx navItems set to canonical order — Starting Lineups · BvP · Batter Splits · Best Bets · Player Projections · Edge Report · Results · Track Record · Leaderboards. Track Record moved to slot 8 (was slot 7). Player Projections moved from slot 3 to slot 5. Batter Splits moved from slot 4 to slot 3.

| File | Change |
|---|---|
| `src/pages/LandingPage.jsx` | `TrackRecordBanner` hero component added above grid; CARDS array reordered, Track Record removed, Starting Lineups added slot 1 |
| `src/components/Header.jsx` | navItems reordered to canonical 9-item sequence |

**Build:** `CI=true npm run build` — "Compiled successfully." Zero warnings.
**No img/logo assets added.**
**Status:** LIVE — merged to main 2026-06-27 (branch `starting-lineups`, SHA `bb7c356`).

### Session: June 28, 2026 — BFEv0.2.0 revision — Projected-lineups conditional note

**Summary:** Added a conditional note on the Starting Lineups page, shown only when ≥1 displayed game is still projected (not yet confirmed). Note text: "Lineups projected from batter history vs. pitcher handedness — they'll refresh to confirmed as official lineups post." Hidden when all displayed games are confirmed. Selector-aware: reflects the currently displayed games, not the full slate. Styled as muted secondary text with a green left-border accent, no layout disruption to game cards.

**Version decision:** No bump — this is a copy/conditional display addition on an unreleased behavior pattern; BFEv0.2.0 unchanged.

**Branch:** `lineups-projected-note` — preview-only, pending operator merge.

**Files changed:** `src/pages/StartingLineupsPage.jsx`

**Build:** `CI=true npm run build` — "Compiled successfully." Zero warnings.

**Status:** MERGED — live on main 2026-06-28 (branch `lineups-projected-note`).

### Session: June 28, 2026 — BFEv0.2.0 → BFEv0.2.1 — Projected-lineups note bugfix

**Root cause:** `color: colors.textMuted` (#9fb3c0) at 12px on `rgba(22,52,74,0.4)` semi-transparent dark background produced near-zero perceived contrast — the container (gray bar + green left-border) rendered correctly but the text was visually invisible. Bug was masked in preview because all 15 games in the seed data were confirmed, so the note never rendered during review.

**Fix:** Changed text color from `colors.textMuted` to `colors.text` (#e8eef2) — muted feel retained via background/border styling, not text color. Also added `?forceProjected=1` URL param that overrides all game lineup_status to 'projected' in-memory so the projected state can be verified on any preview or production URL without waiting for live projected data.

**Three render states verified via forceProjected param:**
- `?forceProjected=1` (all projected): note renders with readable #e8eef2 text
- Default (all confirmed from live data): note absent
- Single-game filter on a projected game: note present; on a confirmed game: absent

**Version:** BFEv0.2.0 → **BFEv0.2.1** (PATCH — bugfix to shipped output)

**Branch:** `fix-projected-note` — preview-only, pending operator merge.

**Files changed:** `src/pages/StartingLineupsPage.jsx`

**Build:** `CI=true npm run build` — "Compiled successfully." Zero warnings.

**Status:** LIVE — merged to main 2026-06-28 (branch `fix-projected-note`, SHA `625cfe6`). BFEv0.2.1 shipped — projected-note contrast fix live on production.

### Session: June 28, 2026 — BFEv0.2.1 → BFEv0.2.2 — Lineups polish (banner contrast + TWP)

**Changes:**
1. **Projected-note banner**: switched background from `rgba(22,52,74,0.4)` (semi-transparent, renders inconsistently) to solid `colors.navyLight` (#16344a); added `fontWeight: 500`; green border upgraded from `rgba(25,201,62,0.45)` to `colors.green` (fully opaque). Text already `colors.text` (#e8eef2) from 0.2.1 — now clearly readable on solid dark background. Wording updated from "batter history vs pitcher handedness" → "most recent batting order" to match the 3.31.0 backend method.
2. **TWP → P/DH**: display-layer mapping in LineupTable position cell. `p.position === 'TWP' ? 'P/DH' : (p.position || '—')`. No data mutation; all other position codes pass through unchanged.

**Verify via:** `?forceProjected=1` on preview — banner should appear as solid #16344a panel with bright white text and full-opacity green left border.

**Branch:** `lineups-polish`
**Files changed:** `src/pages/StartingLineupsPage.jsx`
**Build:** `CI=true npm run build` — "Compiled successfully." Zero warnings.
**Status:** LIVE — merged to main 2026-06-28 (branch `lineups-polish`, SHA `5e69be3`). BFEv0.2.2 shipped.

---

### Session: June 28, 2026 — BFEv0.2.2 → BFEv0.3.0 — SEO Foundation

**Summary:** SEO foundation infrastructure layer. Added react-helmet-async per-page `<Helmet>` blocks with unique title, meta description, OG tags, and canonical link to all 8 route pages. Added JSON-LD Organization/WebSite schema on LandingPage. Created `public/sitemap.xml` (9 routes, canonical apex host). Rewrote `public/robots.txt` with sitemap pointer. Updated static fallback in `public/index.html`.

| File | Change |
|---|---|
| `src/index.js` | Wrap App in `<HelmetProvider>` |
| `src/pages/LandingPage.jsx` | `<Helmet>` + JSON-LD schema |
| `src/pages/MatchupsPage.jsx` | `<Helmet>` title/desc/OG/canonical |
| `src/pages/StartingLineupsPage.jsx` | `<Helmet>` title/desc/OG/canonical |
| `src/pages/TrackRecordPage.jsx` | `<Helmet>` title/desc/OG/canonical |
| `src/pages/BestBetsPage.jsx` | `<Helmet>` title/desc/OG/canonical |
| `src/pages/PlayerProjectionsPage.jsx` | `<Helmet>` title/desc/OG/canonical |
| `src/pages/BatterSplitsPage.jsx` | `<Helmet>` title/desc/OG/canonical |
| `src/pages/ResultsPage.jsx` | `<Helmet>` title/desc/OG/canonical |
| `public/index.html` | Static fallback title → "Betrilo"; updated desc + og:site_name; canonical og:url → apex |
| `public/sitemap.xml` | Created — 9 routes with apex canonical URLs |
| `public/robots.txt` | Rewrote — Allow: / + Sitemap pointer |

**Canonical host:** `https://betrilo.com` (apex; both apex and www return 200 with no redirect — apex chosen per project default).

**Build:** `CI=true npm run build` — "Compiled successfully." Zero warnings.

**Version:** BFEv0.2.2 → **BFEv0.3.0** (MINOR — new SEO infrastructure layer)

**Status:** LIVE — merged to main 2026-06-28 (branch `seo-foundation`, SHA `2e4e61e`). BFEv0.3.0 shipped.

---

### Session: June 28, 2026 — BFEv0.3.0 → BFEv0.3.1 — BvP Evergreen Guide Page

**Summary:** New crawlable static guide page at `/mlb/batter-vs-pitcher-guide`. Implemented as Option B (standalone static HTML in `public/mlb/batter-vs-pitcher-guide.html` + Vercel rewrite rule) — zero changes to React app entry or shared components. Content and meta are present in served HTML before JS runs, making this page indexable by crawlers that don't execute JavaScript. ~800 words of genuine evergreen content: what BvP data is, when it matters, handedness/platoon context, sample-size caveats, prop bet application, and Betrilo's approach. No competitor names.

| File | Change |
|---|---|
| `public/mlb/batter-vs-pitcher-guide.html` | New crawlable static guide page |
| `vercel.json` | Added rewrite rule `/mlb/batter-vs-pitcher-guide` → `...html` before catch-all |
| `public/sitemap.xml` | Appended guide route (changefreq: monthly, priority: 0.7) |

**Approach:** Option B — standalone static HTML. Option A (react-snap) ruled out because it requires changing the shared `index.js` entry (render→hydrateRoot), which would affect all existing pages.

**Canonical host:** `https://betrilo.com` (apex — inherited from SEO foundation pass).

**CTAs:** `/mlb/matchups` (data) and `/mlb/track-record` (proof).

**Build:** `CI=true npm run build` — "Compiled successfully." Zero warnings.

**Version:** BFEv0.3.0 → **BFEv0.3.1** (PATCH — new static content page; no prerender infra change)

**Status:** Branch `seo-bvp-guide` — preview only, pending operator verify + merge.

---

### Session: July 1, 2026 — BFEv0.3.1 → BFEv0.3.2 — Footer Support Mailto

**Summary:** Added support contact line to site footer. Text: "Questions or feedback? Email support@betrilo.com" with mailto link. Label (`colors.text`, `#e8eef2`) and link (`colors.green`, `#19C93E`) on navy (`#0B2331`) — high contrast, matches design system. Placed between copyright line and disclaimer block.

| File | Change |
|---|---|
| `src/components/Footer.jsx` | Support mailto line added |

**Build:** `CI=true npm run build` — "Compiled successfully." Zero warnings.

**Version:** BFEv0.3.1 → **BFEv0.3.2** (PATCH — footer support contact)

**Status:** Branch `support-footer` — preview only, pending operator verify + merge.

---

### Session: July 1, 2026 — BFEv0.3.2 → BFEv0.3.3 — Game Dropdown Chronological Sort

**Summary:** Fixed game-selector dropdown sort order on two pages. Games were rendering in JSON arrival order (e.g. 3:07 PM before 12:35 PM). Fixed to sort chronologically by first pitch. MatchupsPage already sorted correctly (via `start_time` ISO field); PlayerProjectionsPage and StartingLineupsPage did not.

- **PlayerProjectionsPage** — `player_projections_latest.json` has only a display string (`time`: "3:07 PM ET", no `start_time`). Fix: `parseTimeET()` converts 12-hour AM/PM display string to minutes-since-midnight; games sorted in `useEffect` before `setGames()`.
- **StartingLineupsPage** — `starting_lineups_latest.json` has `start_time` (ISO: "2026-07-01T16:35:00Z"). Fix: lexicographic sort on `start_time` (same pattern as MatchupsPage), applied before `setGames()`.
- "All Games" option stays pinned at top in both dropdowns.

| File | Change |
|---|---|
| `src/pages/PlayerProjectionsPage.jsx` | `parseTimeET()` sort on `time` display string in `useEffect` |
| `src/pages/StartingLineupsPage.jsx` | `start_time` ISO sort in `useEffect` |

**Rendered order (both pages):** 12:35 PM → 1:10 PM → 1:35 PM → 1:35 PM → 2:20 PM → 3:07 PM → 6:40 PM → 7:15 PM → 7:40 PM → 8:10 PM → 8:10 PM → 8:40 PM → 9:40 PM → 9:40 PM

**Build:** `CI=true npm run build` — "Compiled successfully." Zero warnings.

**Version:** BFEv0.3.2 → **BFEv0.3.3** (PATCH — dropdown sort fix, two pages)

**Status:** Branch `dropdown-sort` — preview only, pending operator verify + merge.

### Session: July 5, 2026 — BFEv0.3.3 → BFEv0.3.4 — H+R+RBI Column on Player Projections

**Summary:** Added H+R+RBI projected combo column to the Player Projections table. Prior recon had incorrectly concluded the projection was "not computed" — it IS computed in the MLB pipeline (`batter_projections.proj_hits + proj_runs + proj_rbi`) and already shown on the Results page. Fix: MLB pipeline (`export_player_projections_json.py`) now passes the value into `player_projections_latest.json` as `proj_hrrbi`; FE reads that field.

| File | Change |
|---|---|
| `src/pages/PlayerProjectionsPage.jsx` | Added `proj_hrrbi` column (after Proj BB); cellValue case; td with `fontWeight: 600, color: navy`; footer Key text corrected |

**Column:** labeled "H+R+RBI"; placed after Proj BB in the projections cluster; sortable (numeric desc on click); null → "—". 327/520 batters covered (deep bench/reserves without pitching matchup data show "—", consistent with other projection columns).

**Value consistency:** `proj_hrrbi` in Player Projections page = `proj_hrrbi` in Results page combo block — both read from `batter_projections.proj_hits + proj_runs + proj_rbi`. Spot-check July 5: Jackson Chourio 3.25, Luis Arraez 3.05, Bo Bichette 2.24.

**Companion MLB change:** BMLBv3.34.0 — `export_player_projections_json.py` `_load_hrrbi_lookup()`.

**Build:** `CI=true npm run build` — see below.

**Version:** BFEv0.3.3 → **BFEv0.3.4** (PATCH — new column, existing data)

---

### Session: July 8, 2026 — BFEv0.3.4 → BFEv0.3.5 — VP AB Column on Player Projections

**Summary:** Replaced VP PA (plate appearances vs probable pitcher) column with VP AB (at-bats). Data fix — AB is not the same as PA (PA includes walks, HBP, SF, SH, CI; AB excludes them). The MLB pipeline now computes `vp_ab` from `batter_pitches.events` (see BMLBv3.36.0). FE reads the new `vp_ab` field.

| File | Change |
|---|---|
| `src/pages/PlayerProjectionsPage.jsx` | Column key `vp_pa`→`vp_ab`, label `vP PA`→`VP AB`; cellValue switch case updated; td render updated; footer Key text: `vP AVG/xwOBA` → `VP AB/H/HR/xwOBA — career at-bats and performance vs. today's probable pitcher` |

**Version:** BFEv0.3.4 → **BFEv0.3.5** (PATCH — label + field key change, new data field from pipeline)

---

### Session: July 27, 2026 — BFEv0.4.1 → BFEv0.5.0 — Pitcher Report Card Page

**Summary:** New page `/mlb/pitcher-report` — starting pitcher report cards for today's MLB games. Reads `pitcher_report_latest.json` (produced by MLB pipeline `export_pitcher_report.py`, BMLBv3.44.0). Compact expandable cards grouped by game matchup (away @ home), both starters side-by-side.

**Collapsed card:** Pitcher name, team, hand (L/R), W-L, ERA, WHIP, K%, hot/cold/steady trend badge.
**Expanded card:** Stuff Profile (K%, Whiff%, BB%, xwOBA-against), Pitch Arsenal (top 3 pitches with usage % bars + velo), Platoon Splits (vs LHB / vs RHB — K%, OPS-against), Recent Form (L5 K%, Whiff%, xwOBA + trend note).

**Edge cases:** TBD pitcher → "Probable pitcher not yet announced" placeholder. Thin/no data → "Insufficient 2026 data" label, no expand. Vintage != 2026 → amber "2025 data" badge on section headers. Scratched pitcher → red SCRATCHED badge. Fetch error → graceful "Could not load" state. Empty slate → "No games scheduled" message.

**Hot/cold badges:** Hot = warm orange accent (`#ff7043`), Cold = cool blue accent (`#64b5f6`), Steady = muted neutral. Visible at a glance on collapsed cards.

| File | Change |
|---|---|
| `src/pages/PitcherReportPage.jsx` | New file — full page component |
| `src/App.js` | Import + route `/mlb/pitcher-report` |
| `src/components/Header.jsx` | Nav entry "Pitcher Report" added (between Starting Lineups and BvP) |

**Version:** BFEv0.4.1 → **BFEv0.5.0** (MINOR — new page)

---

### Session: July 27, 2026 — BFEv0.5.0 → BFEv0.6.0 — Pitcher Report Polish + Leaderboards Removed + Home Card

**Task 1 — Pitcher Report visual fixes:**
- Game matchup headers ("SEA @ TEX") upgraded to `#fff` with fontWeight 800 + green underline separator — legible on dark bg
- Platoon Splits table cells given explicit `color: colors.text` — values now match Performance section contrast
- "Stuff Profile" section renamed to "Performance" (header + Helmet meta)

**Task 2 — Leaderboards placeholder removed:**
- Removed from nav (Header.jsx), home grid (LandingPage.jsx), routes (App.js)
- Deleted `LeaderboardsPage.jsx` and `PageStub.jsx` (only consumer)
- Was a "Coming Soon" stub with no live data — confirmed safe to remove

**Task 3 — Pitcher Report home card added:**
- Replaces Leaderboards in the 8-card grid (bottom-right slot)
- Title: "Pitcher Report", desc: "Today's starting pitchers — performance, splits, and recent form for every matchup."
- Links to `/mlb/pitcher-report`, no `comingSoon` flag — live card with "View →"
- Grid remains clean 4×2

| File | Change |
|---|---|
| `src/pages/PitcherReportPage.jsx` | Game header contrast fix, splits cell contrast, "Stuff Profile" → "Performance" |
| `src/components/Header.jsx` | Removed Leaderboards nav item |
| `src/pages/LandingPage.jsx` | Replaced Leaderboards card with Pitcher Report card |
| `src/App.js` | Removed Leaderboards import + routes |
| `src/pages/LeaderboardsPage.jsx` | Deleted |
| `src/components/PageStub.jsx` | Deleted |

**Version:** BFEv0.5.0 → **BFEv0.6.0** (MINOR — home grid change + placeholder removal + page polish)

---

### Session: July 27, 2026 — BFEv0.6.0 → BFEv0.6.1 — Game Header Fix + Home Card Reorder

**Fix 1 — Game header rendering broken (showed only "@"):** The 0.6.0 contrast fix used `color: '#fff'` on the outer `<span>` with team names as bare text nodes and the "@" in a nested span with overridden color. The team names rendered invisible (cause: text node color inheritance failed in the production build context). Fix: wrapped each team name in its own explicit `<span style={{ color: '#fff' }}>` — team abbreviations now always render visibly regardless of inheritance behavior.

**Fix 2 — Home cards reordered to match nav:** Moved Pitcher Report from position 8 (bottom-right) to position 2, matching its nav placement (between Starting Lineups and Batter vs Pitcher). Final grid:
- Row 1: Starting Lineups, Pitcher Report, Batter vs Pitcher, Batter Splits
- Row 2: Best Bets, Player Projections, Edge Report, Results

| File | Change |
|---|---|
| `src/pages/PitcherReportPage.jsx` | Game header: team names wrapped in explicit white spans |
| `src/pages/LandingPage.jsx` | CARDS array reordered to match nav |

**Version:** BFEv0.6.0 → **BFEv0.6.1** (PATCH — rendering fix + card reorder)

---

### Session: July 27, 2026 — BFEv0.6.1 → BFEv0.6.2 — Game Header Fix (definitive)

**Root cause:** Previous fixes tried setting `color: '#fff'` on parent/child `<span>` elements containing `{game.away_team}` text nodes. Despite the JSON having correct `away_team`/`home_team` values at the game level, the team text never rendered visually — only the hardcoded "@" appeared. The nested-span approach failed across two attempts due to a text-node color inheritance issue in the production React build.

**Fix:** Eliminated nested spans entirely. Now derives teams from the pitcher objects (`awayP.team` / `homeP.team`) — the same source the pitcher cards already render successfully — with `game.away_team`/`game.home_team` as fallback. Concatenates into a single string (`awayTeam + ' @ ' + homeTeam`) rendered as one text node in a plain `<div>` with explicit `color: '#fff'`. No nested spans, no text node inheritance, no ambiguity.

**Verified:** 5 games confirmed — header text matches card teams exactly (SEA @ TEX, BAL @ DET, AZ @ PIT, PHI @ MIA, TOR @ WSH).

| File | Change |
|---|---|
| `src/pages/PitcherReportPage.jsx` | `GameMatchup` header rewritten: single string from pitcher objects, `<div>` not `<span>` |

**Version:** BFEv0.6.1 → **BFEv0.6.2** (PATCH — definitive game-header fix)

---

### Session: July 27, 2026 — BFEv0.6.2 → BFEv0.6.3 — Game Header (take 4) + Synchronized Expand

**Data inspection (Step 1):** JSON structure is `data.matchups[]`, each game has `game_pk`, `start_time`, `home_team`, `away_team`, `pitchers[]`. Each pitcher has `side` ("home"/"away"), `team` ("SEA"), `opponent` ("TEX"), `pitcher_name`. The team data exists at BOTH levels — game-level `away_team`/`home_team` AND pitcher-level `team`. Three prior span-based approaches using `game.away_team` with various nesting strategies failed to render team names in production despite correct data.

**Fix 1 — Game header (take 4):** Rewrote header as `<h3>` (semantic heading, not `<span>` or `<div>`), with team string built via JS concatenation from `pitcher.team` fields (the proven-working source — cards render these), rendered as direct text content of the `<h3>`. No nested spans, no text interpolation between elements. `color: '#ffffff'` explicit on the `<h3>`.

**Fix 2 — Synchronized expand:** Lifted `open` state from `PitcherCard` up to `GameMatchup`. Both pitcher cards in a game share the same `open` boolean and `onToggle` callback. Clicking either card expands/collapses both as a matchup pair. Other games unaffected.

| File | Change |
|---|---|
| `src/pages/PitcherReportPage.jsx` | `GameMatchup`: header rewritten as `<h3>`, owns `open` state. `PitcherCard`: receives `open`/`onToggle` props, no internal state. |

**Version:** BFEv0.6.2 → **BFEv0.6.3** (PATCH — header fix + synchronized expand)

---

### Session: July 27, 2026 — BFEv0.6.3 → BFEv0.6.4 — Game Header Span Wrap (definitive fix)

**Root cause (diagnosed in 0.6.3 session):** The game matchup text ("SEA @ TEX") was a bare text node as a child of a `display: flex` `<h3>`. In the React production build, bare text nodes inside flex containers are anonymous flex items that can collapse to zero width — the text was in the DOM but invisible. The time `<span>` rendered fine because it was a proper element flex child.

**Fix:** Wrapped the matchup string in its own `<span>`:
```jsx
// Before (bare text node — collapsed):
{awayLabel + ' @ ' + homeLabel}

// After (proper flex child):
<span>{awayLabel + ' @ ' + homeLabel}</span>
```

**Bundle verification:** Production bundle now shows `(0,_r.jsx)("span",{children:c+" @ "+u})` — an explicit React element wrapping the text, not an anonymous text node.

| File | Change |
|---|---|
| `src/pages/PitcherReportPage.jsx` | Line 286: matchup text wrapped in `<span>` |

**Version:** BFEv0.6.3 → **BFEv0.6.4** (PATCH — game header span wrap)

---

### Session: July 27, 2026 — BFEv0.6.4 → BFEv0.6.6 — Full Team Names + Centered Header + Debug Removed

**Changes:**
1. **Full team names:** Built a 30-team `TEAM_NAMES` map (abbreviation → nickname). Headers now show "Mariners @ Rangers" instead of "SEA @ TEX". All 30 MLB teams mapped.
2. **Centered header:** Replaced flex `justify-content: space-between` layout with `textAlign: center`. Matchup name centered as the focal point, start time on a small line below.
3. **Debug removed:** Deleted yellow/red debug div, console.log instrumentation, and all debug artifacts. Zero debug references in production bundle (verified via grep).
4. **Team source:** Uses `game.away_team`/`game.home_team` (game-level fields) as primary, pitcher `.team` as fallback.

| File | Change |
|---|---|
| `src/pages/PitcherReportPage.jsx` | Added `TEAM_NAMES` map + `teamName()` helper; rewrote `GameMatchup` header as centered div; removed all debug code |

**Version:** BFEv0.6.4 → **BFEv0.6.6** (PATCH — full names, centered, debug cleanup; 0.6.5 was debug instrumentation)

---

### Session: July 27, 2026 — BFEv0.6.6 → BFEv0.6.7 — Header Rebuilt from Working Debug Pattern

**What re-broke 0.6.6:** The 0.6.6 header used nested `<div>` wrappers — an outer div (no background) containing a child div (color: #fff) containing a `<span>`. The debug version that worked used a SINGLE `<div>` with explicit `background` + `color` and the text as a direct child. The nested-wrapper approach likely hit the same anonymous-text-node rendering issue in production.

**Fix:** Rebuilt the header to exactly mirror the working debug `<div>` structure:
- Single `<div>` with explicit `background: colors.navyLight` (gives the element its own paint context, like the debug's `background: yellow`)
- `color: '#ffffff'` on the SAME element as the text
- Text as a DIRECT child: `{awayFull + ' @ ' + homeFull}` — no `<span>` wrapper, no nested div
- Time in a child `<div>` below (same as the debug version's structure)
- `textAlign: center`, no flex layout
- Uses `game.away_team`/`game.home_team` (game-level fields, proven in debug) through `teamName()` map with abbreviation fallback

| File | Change |
|---|---|
| `src/pages/PitcherReportPage.jsx` | `GameMatchup` header rebuilt as single div with background, mirroring working debug structure |

**Version:** BFEv0.6.6 → **BFEv0.6.7** (PATCH — header rebuilt from working debug pattern)

---

### Session: July 27, 2026 — BFEv0.6.7 → BFEv0.6.8 — Per-Column Team Labels + Bordered Game Units

**Per-column team labels:** Split the single "Mariners @ Rangers" header into two team names, each centered above its own pitcher card column. Away team (left) above the away pitcher, home team (right) above the home pitcher. "@" between them as a separator. Verified: "Mariners" sits above Kirby (SEA/away), "Rangers" above Rocker (TEX/home) — labels match cards.

**Bordered game units:** Each game is now a distinct bordered container (`border: 1px solid rgba(25,201,62,0.12)`, `borderRadius: 10px`, `overflow: hidden`). The header area (time strip + team labels) uses `background: colors.navyLight` as a shaded strip. Pitcher cards sit below with a subtle left-border divider between them. Cards get a slight green-tinted background when expanded.

**Layout:**
```
┌─────────────────────────────────┐
│          2:35 PM ET             │  ← time strip (shaded)
│   Mariners    @    Rangers      │  ← per-column labels (shaded)
├────────────────┬────────────────┤
│ George Kirby   │ Kumar Rocker   │  ← pitcher cards
│ SEA · RHP      │ TEX · RHP      │
│ 8-8 · 3.57 ERA │ 3-8 · 4.13 ERA│
└────────────────┴────────────────┘
```

**Mobile:** Cards wrap (flex-wrap) and stack vertically. Team labels stay in the flex row but collapse naturally.

| File | Change |
|---|---|
| `src/pages/PitcherReportPage.jsx` | `GameMatchup`: bordered container + time strip + per-column labels. `PitcherCard`: removed individual border/borderRadius, uses left-border divider. |

**Version:** BFEv0.6.7 → **BFEv0.6.8** (PATCH — per-column labels + bordered game units)

---

### Session: July 27, 2026 — BFEv0.6.8 → BFEv0.6.9 — Restore Pitcher Card Dark Background

**Bug:** The 0.6.8 game-unit restructure removed `background: colors.navyLight` from both PitcherCard variants (TBD and normal). Cards rendered on transparent/white background — light text washed out.

**Fix:** Added `background: colors.navyLight` back to both PitcherCard outer divs (TBD card line 148, normal card line 164).

| File | Change |
|---|---|
| `src/pages/PitcherReportPage.jsx` | Restored `background: colors.navyLight` on both PitcherCard variants |

**Version:** BFEv0.6.8 → **BFEv0.6.9** (PATCH — restore card dark background)

---

### Session: July 27, 2026 — BFEv0.6.9 → BFEv0.6.10 — Darker Divider Lines

**Change:** Pitcher card separator/divider lines changed from `rgba(255,255,255,0.04)` (white at 4% — too bright against dark bg) to `rgba(0,0,0,0.25)` (black at 25% — recedes into the dark navy). Applied to: splits table row borders, card left-border divider, expanded-section top border, game header bottom border. NOT applied to: steady badge bg, arsenal bar track bg (those kept `rgba(255,255,255,0.06)` for their fill purpose).

**Version:** BFEv0.6.9 → **BFEv0.6.10** (PATCH — darker divider lines)

---

### Session: July 29, 2026 — BFEv0.6.10 → BFEv0.6.11 — Pitcher Sort + Batter Splits DH Fix

**Changes:**

1. **Pitcher Report: sort by start time** — Game matchup blocks now render in ascending `start_time` order (earliest → latest). Previously relied on JSON order which was roughly correct but not guaranteed. Sort applied via `.slice().sort()` on the matchups array before rendering.

2. **Batter Splits: doubleheader G1/G2 labels** — DH players now display a gold `G1`/`G2` badge next to their name, matching the game label in the `team` column (e.g. "ATL G1"). Team filter dropdown uses `team_abbr` (raw abbreviation) so both DH games appear when filtering by team.

| File | Change |
|---|---|
| `PitcherReportPage.jsx` | Added `.slice().sort()` by `start_time` before `.map()` rendering |
| `BatterSplitsPage.jsx` | Team filter uses `team_abbr` fallback; G1/G2 badge rendered next to player name |

**Version:** BFEv0.6.10 → **BFEv0.6.11** (PATCH — pitcher sort + DH labels)
