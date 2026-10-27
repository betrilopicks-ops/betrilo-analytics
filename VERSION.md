# @betrilopicks Project Book Versions

FE: BFEv0.40.1

## Rules

- **No data in FE commits.** Files under `public/data/` are never committed
  by FE feature branches or code pushes. Data reaches main exclusively via
  the pipelines' `publish-main:main` pushes (MLB, NBA, NFL publish scripts).
  If a preview branch needs test data, copy it locally but `.gitignore` or
  exclude from `git add`.

## BFEv0.40.1 — Collapse consecutive DNP rows + multi-season dividers (2026-10-27)

Consecutive DNP rows in game log modal collapsed into single summary row:
"DNP × N (date – date)". Single DNPs unchanged. Reduces visual clutter
for injury-prone players (Porter Jr: 18 rows → 2). Season divider rows
now appear at every season transition (supports 3-season logs: 2026-27 →
2025-26 → 2024-25 for players whose projections use deep carryover).

## BFEv0.40.0 — NBA last-10 game log modal (2026-10-27)

NBA Projections page: click a player row to open a game log modal showing
last 10 games (same modal pattern as NFL). Fetches nba_game_logs_latest.json
lazily on first click (cached in state after). Columns: Date, Opp, MIN, PTS,
REB, AST, 3PM, PRA. Last-season rows marked with muted text + divider.
Summary row shows L10 averages alongside today's projection. Handles DNPs,
team changes, loading/error/empty states gracefully. Mobile horizontal scroll.
Data contract: separate compact JSON file (not embedded in projections).

## BFEv0.37.1 — og:image absolute URL + twitter:card fix (2026-10-13)

og:image changed from %PUBLIC_URL%/appicon_512.png (relative, breaks in OG
crawlers) to https://betrilo.com/appicon_512.png (absolute). twitter:card
changed from summary_large_image to summary (square icon, not wide banner).
Applies to all routes via index.html; gen-route-meta inherits both.

## BFEv0.37.0 — NFL accuracy transparency + side-by-side (2026-10-13)

NFL projections page (/nfl/projections) now shows:
1. **Side-by-side**: model projection + consensus book line + difference inline
   in each stat cell. Sortable "Gap" column for finding biggest disagreements.
2. **Accuracy section**: per-market ratio cards with human-readable labels
   ("X% more/less accurate than the market line"), loaded from
   nfl_accuracy_latest.json.
3. **Updated banner**: replaces "NO TRACK RECORD" with measured accuracy
   disclosure. Keeps amber treatment. Includes responsible gambling notice.

noindex/nofollow KEPT — no market individually qualifies under the published
standard (ratio <=1.05x, n>=150, CI upper <1.15x). Revisit at Week 8.

Data contract: FE reads nfl_accuracy_latest.json (NFL-side export).
Page gracefully degrades if the file is missing (accuracy section hidden).
