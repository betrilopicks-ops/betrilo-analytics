# NBA Site Recon — betrilo.com

**Session:** October 13, 2026 | **FE Version:** BFEv0.34.0 | **NBA Version:** BNv4-2.4.0

---

## Handshake Results

| Book | Line 3 | VERSION.md | Expected | Status |
|------|--------|------------|----------|--------|
| FE | BFEv0.34.0 | BFEv0.34.0 | BFEv0.25.0 | **Consistent** — 9 versions ahead of prompt expectation |
| NBA | BNv4-2.4.0 | BNv4-2.4.0 | BNv4-2.4.0 or 2.5.0 | **Consistent** — go-live session has not run yet |

NBA repo: 2 untracked analysis scripts (`session6_analysis.py`, `session6_full_analysis.py`), no uncommitted changes to tracked files.

---

## Part A: Deploy Path

### A1. How a New NBA Page Reaches Production

**Deploy path (confirmed safe):**

1. Branch from `origin/main` (current production state)
2. Add NBA page code on that branch
3. Push `HEAD:main` from that branch — the pre-push hook (`scripts/hooks/pre-push:26`) only blocks `refs/heads/main` → `refs/heads/main`; a non-main branch pushing `HEAD:main` is allowed (line 103-104)
4. Vercel auto-deploys from main

**This ships the NBA page without any of the 5 unreleased commits on local main** (opponent defense column, game log modal — BFEv0.33.0–0.34.0).

**Current state:**
- `origin/main`: `c064f69` — "Update NFL site data 2026-10-13 07:00" (data-only commits)
- `local main`: `360a69f` — 5 ahead (unreleased NFL enhancements), 218 behind (data commits)
- Active branches: 18 total; `publish-main` is the data worktree (425 ahead / 286 behind)

**Pre-push hook** (`scripts/hooks/pre-push:1-109`):
- Blocks `refs/heads/main` → `refs/heads/main` unless `NFL_GATE_MET=1`
- Allows `refs/heads/publish-main` → `refs/heads/main` (data pushes)
- Allows any other branch → `refs/heads/main` (our NBA deploy path)

**NFL on production:** Yes — 4 NFL routes (`/nfl/matchups`, `/nfl/schedule`, `/nfl/projections`, `/nfl/team-rankings`) are live on `origin/main`. The sport toggle (MLB | NFL) is live. All NFL components (NflPageWrapper, NflValidationBanner, NflFreshness, SortableTable) are on production.

### A2. How a Sport Plugs In

| Component | File:Line | NBA Reuse Status |
|-----------|-----------|------------------|
| Sport toggle | `Header.jsx:29-62` | **Generalize** — add 3-way detection: `isNba = pathname.startsWith('/nba')`, add NBA toggle button, add `nbaNavItems` array |
| Routes | `App.js:39-58` | **Add** — `/nba` route alongside NFL routes; update `isNfl` guard on line 32 to include `isNba` for PicksCTA gating |
| LandingPage sections | `LandingPage.jsx:175-282` | **Add** — `NBA_CARDS` array + NBA sport section with launch banner |
| Theme tokens (dark) | `theme.js:12-69` | **Reuse as-is** — NBA uses identical dark palette |
| Theme guard | `check-theme-tokens.js:22-32` | **Add** — NBA page files to `ENFORCED_FILES` once built |
| SortableTable | `SortableTable.jsx:1-197` | **Reuse as-is** — sport-agnostic, dark-themed |
| NflPageWrapper | `NflPageWrapper.jsx:1-28` | **Generalize or clone** — layout shell is reusable, but imports NflValidationBanner. NBA needs its own wrapper or a sport-agnostic `DarkPageWrapper` |
| NflValidationBanner | `NflValidationBanner.jsx:34` | **Wrong for NBA** — hardcodes "No Track Record" and "no track record yet" text. NBA has a track record from day one. NBA pages don't need this banner at all. |
| NflFreshness | `NflFreshness.jsx:1-52` | **Reuse as-is** — shows `last_refreshed` with staleness warning. Generic enough; adjust stale threshold if NBA cadence differs. |
| StatusPage | `StatusPage.jsx:6-155` | **Add** — NBA surfaces to SURFACES array |
| Sitemap | `sitemap.xml:1-63` | **Add** — NBA pages are indexable from day one (unlike NFL which is noindex during shadow) |
| Helmet | `LandingPage.jsx:200-225`, `NflSchedulePage.jsx:32-36` | **Pattern reuse** — each NBA page sets its own Helmet; NBA pages are indexable (no noindex) |
| Footer | `Footer.jsx:16-22` | **Covers NBA** — disclaimer says "entertainment purposes" and "gambling problem" — sport-agnostic, no change needed |

**Key generalization needed:** The NflValidationBanner is completely wrong for NBA. NBA is tracked from day one — there's no "no track record" period. The NBA pages need no validation banner at all at launch; they need the early-season carryover notice instead (driven from data).

### A3. Data Path

**Pipeline → Publish Worktree → Production:**

1. Sport pipeline writes JSON to `public/data/` in the `betrilo-analytics-publish` worktree
2. Commit: `git add public/data/nba_*.json && git commit -m "Update NBA site data..."`
3. Push: `git push origin HEAD:main` from publish-main branch
4. Vercel auto-deploys; pages fetch `/data/nba_*.json`

**Standing rules:**
- Only `*_latest.json` committed — no date-stamped files (`.gitignore:33-35`)
- No `/data/` mirror (`.gitignore:29` ignores root `/data/`)
- `public/data/` is the deploy target

**Current size:**
- Publish worktree `public/data/`: ~47 MB (dominated by game logs: batter 9.3 MB, pitcher 4.5 MB, results_by_date 3.6 MB)
- Built deployment: ~6.1 MB per deploy
- NBA additions (estimated): +120 KB across 6 JSONs — negligible

**Deploys per day:** 6+ (MLB morning lineups, afternoon projections, results, health checks; NFL 2-3 on game weeks)

**Weekly cleanup:** Automated via Task Scheduler — deletes old Vercel deployments. Phase 3 cleanup deleted 324 deployments (~6 GB) per FE book. Script is in the FE repo.

### A4. NBA Pipeline Outputs (Read-Only)

**Daily production runner:** `nba_prod/nba_bet_sheet_nbaapi_prod_runner.py`

**Outputs per day:**

| Output | Path | Format |
|--------|------|--------|
| Bet sheet | `outputs/daily_bet_sheets/NBA_Bet_Sheet_YYYYMMDD_vN.xlsx` | Excel (tabs: Summary, Safe Projections, Game Cards, Edge Report) |
| Prediction snapshot | `outputs/daily_predictions/nba_predictions_YYYYMMDD_vN.csv` | CSV |
| Accuracy report | `outputs/accuracy_reports/NBA_Accuracy_Report_YYYYMMDD_v1.xlsx` | Excel (tabs: Summary, Game Cards, Leaderboard) |
| Cards | `outputs/cards/MMDDYY/branded/` + `unbranded/` | PNG |

**Prediction CSV columns:**
`game_id, team_id, team, player_id, player, position, confidence_rate, proj_pts, proj_reb, proj_ast, proj_3pm, proj_stl, proj_blk, proj_tov, proj_pra, carryover_games, team_changed`

**EdgeRow dataclass** (`ev_engine.py:180-221`):
`player, team, stat, line, book, over_odds, under_odds, model_proj, l10_series, position, p_over_raw, p_under_raw, p_over_novig, p_under_novig, p_model_over, edge_over, edge_under, ev_over, ev_under, best_side, best_ev, best_edge, l10_rate, n_games, recommendation, carryover_games, team_changed`

**Recommendation thresholds** (`ev_engine.py:224-238`):
- STRONG: `ev >= 0.12 AND edge >= 0.15 AND |delta| >= 2.0`
- LEAN: `ev >= 0.07 AND edge >= 0.10 AND |delta| >= 1.0`

**Best Bets, Strong Picks, Lock Parlay:** Exist only in Excel cells and PNG cards today. The card generator (`generate_cards_png.py`) parses the Excel Summary sheet by cell position — exactly the fragility the site exports should avoid. **Site exports must consume the EdgeRow list directly, not parse Excel.**

**Carryover system** (`logic_nbaapi.py:89-217`):
- Threshold: 10 current-season games triggers carryover off
- Team game limit: carryover disabled after team plays 20 games
- `carryover_games`: count of prior-season games in the 10-game window
- `team_changed`: flag if any carryover game was on a different team
- Team-changed + carryover players are excluded from recommendations (`runner:1805-1808`)

**What exists as machine-readable data today:**
1. Prediction CSV (projections + carryover flags) — **usable**
2. Value edges CSV (when `--value-check` flag) — model vs implied odds

**What does NOT exist and needs to be added by the NBA pipeline:**
1. Best bets / Strong Picks / Lock Parlay as JSON (currently only in Excel)
2. Game summaries (matchups, lines, excluded players) as JSON
3. Accuracy results as JSON (currently only Excel)
4. Track record aggregation as JSON

**Pipeline schedule:** Manual trigger via `scripts/run_prod_bdl.ps1`. Three steps:
1. Morning: bet sheet + predictions CSV
2. After games (~10-11 PM ET): accuracy report
3. After accuracy: card generation

---

*Recon complete — October 13, 2026*
