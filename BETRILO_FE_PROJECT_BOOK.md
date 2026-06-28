# @betrilopicks Frontend (betrilo.com) — Technical Project Book

**Version:** BFEv0.2.2 | **Last Updated:** June 28, 2026 | **Includes:** Footer tagline fix, Player Projections last-refreshed timestamp + lineup status display, Starting Lineups page (/mlb/starting-lineups; LIVE — merged to main 2026-06-27), Projected-lineups note bugfix (text color contrast; forceProjected test param), Lineups polish: projected-note solid bg + updated wording; TWP→P/DH position display

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

**Branch:** `lineups-polish` — preview-only, pending operator merge.
**Files changed:** `src/pages/StartingLineupsPage.jsx`
**Build:** pending
**Status:** PENDING — merge to main is operator go-live step.
