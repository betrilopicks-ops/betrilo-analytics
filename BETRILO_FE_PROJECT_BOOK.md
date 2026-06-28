# @betrilopicks Frontend (betrilo.com) — Technical Project Book

**Version:** BFEv0.2.0 | **Last Updated:** June 27, 2026 | **Includes:** Footer tagline fix, Player Projections last-refreshed timestamp + lineup status display, Starting Lineups page (/mlb/starting-lineups; change pending preview review + merge, not yet live)

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

**Status:** On feature branch `starting-lineups`. Not yet live — pending operator review + merge to main.

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
**Status:** On feature branch `starting-lineups`. Not yet live — pending operator review + merge to main.
