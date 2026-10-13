# NBA Site Spec — betrilo.com NBA Extension

**Version:** 1.0 | **Created:** October 13, 2026 | **Status:** SPEC — pending operator approval

---

## 1. Current FE Contract (Audit Summary)

### 1.1 Data Pattern

Same as MLB and NFL: pages fetch `/data/{surface}_latest.json` from `public/data/` via `useEffect` + `fetch()`. NBA pipeline writes JSON to `betrilo-analytics-publish` worktree. Vercel deploys on push.

NBA files follow the existing naming convention: `nba_{surface}_latest.json`.

### 1.2 Navigation

Header.jsx already implements a sport-scoped toggle (MLB | NFL) from the NFL build (BFEv0.22.0). NBA extends this to a three-way toggle: `MLB | NFL | NBA`. Detection: `isNba = location.pathname.startsWith('/nba')`. The `nbaNavItems` array is added alongside `mlbNavItems` and `nflNavItems`.

### 1.3 Status Monitoring

StatusPage.jsx monitors 13 surfaces (9 MLB + 4 NFL). NBA adds 5 surfaces (one per data contract + health). Each defines: file path, freshness field, game-count extractor, `noGameCount` flag. NBA surfaces use `noGameCount: true` on off-days (NBA plays ~3-4 days per week, similar to NFL's pattern).

### 1.4 Shared Components

**Reuse as-is:** Header (with 3-way toggle), Footer, SortableTable, NflFreshness (rename to `Freshness` or use directly), PageErrorBoundary.

**Generalize:** NflPageWrapper → `DarkPageWrapper` (remove NflValidationBanner import; accept optional banner as prop). Or clone as `NbaPageWrapper` with no validation banner.

**Do not reuse:** NflValidationBanner — NBA is tracked from day one, not in shadow validation. NBA pages have no "No Track Record" banner.

### 1.5 Key Difference from NFL

NFL launched under a shadow validation gate — pages were noindex, pick surfaces were blocked pending 3 weeks graded at >=54%, and every page showed a "No Track Record" disclosure banner.

**NBA launches differently.** Picks are tracked and graded in public from day one. There is no shadow gate, no validation banner, no noindex. NBA pages are indexable immediately and added to the sitemap at launch. The early-season carryover notice (see §2.5) is the only disclosure, and it's data-driven — it disappears on its own as players accumulate games.

---

## 2. Launch Scope

### 2.1 Live October 20 (Opening Night)

| Route | Surface | Description |
|-------|---------|-------------|
| `/nba` | Hub | Today's slate summary + links to all NBA pages |
| `/nba/projections` | Player projections | Per-player PTS, REB, AST, 3PM, STL, BLK, TOV, PRA; filter by game and team |
| `/nba/best-bets` | Picks | Best Bets, Strong Picks, Lock Parlay legs; "last updated" time |

**Best-bets empty state:** When props haven't posted yet (morning before books release lines), the page shows: "Lines aren't posted yet — picks appear once they are." Never a blank page, never a spinner that doesn't resolve.

### 2.2 Live October 21 (First Graded Day)

| Route | Surface | Description |
|-------|---------|-------------|
| `/nba/results` | Graded picks | Each day's graded picks — wins, losses, and pushes |
| `/nba/track-record` | Season record | NBA season to date, starting 0-0 on October 20 |

### 2.3 Not at Launch

- Full edge report (per-prop EV/edge table)
- Safe projections (conservative model output)

These may ship later if there's demand. No spec work needed now.

### 2.4 Pick Integrity

**The public record grades exactly the picks the site showed.**

A game's picks **lock at its tip-off time**: a pipeline re-run after tip cannot change, add, or remove that game's published picks. Only games that haven't tipped can have picks updated by a re-run.

**Lock mechanism:**

1. The NBA export script writes `nba_best_bets_latest.json` with a `locked_games` array:
   ```json
   {
     "locked_games": [
       {"game_id": "20261020_BOS_NYK", "locked_at": "2026-10-20T19:30:00-04:00", "pick_count": 8}
     ],
     "picks": [...]
   }
   ```
2. On each run, the export script reads the current published `nba_best_bets_latest.json` from the publish worktree. For any game whose `gametime` has passed (tip-off occurred), it preserves the existing picks verbatim and adds the game to `locked_games`. Only pre-tip games have their picks regenerated.
3. Grading (`nba_accuracy_runner.py`) grades against the `locked_games` pick set, not the latest model output.

**Mid-day re-run scenario:** Props post at 11 AM, pipeline runs at 11:30 AM. A 7:00 PM game hasn't tipped — its picks can update. A 12:30 PM game has tipped — its picks are locked and preserved from the earlier run.

**Pushes:** Displayed as pushes in results and track record. A push is never counted as a hit or miss — it's excluded from the rate calculation (hits / (hits + misses), pushes excluded).

**Nothing is ever dropped or re-graded.** The locked pick set is the permanent record.

**Storage:** The locked pick set is stored in `nba_best_bets_latest.json` (the same file the site reads). The `locked_games` array is the audit trail. Grading reads this file as the source of truth.

### 2.5 Early-Season Carryover Notice

While any displayed player has `carryover_games > 0`, the projections and best-bets pages show a short note:

> Early-season projections blend in last season's games until a player has 10 this season.

**Players with `team_changed = true`** are marked with a visual indicator (e.g., a small badge or footnote) so users know their carryover data is from a different team.

Both flags come from the data (`carryover_games` and `team_changed` fields in the player projections and best-bets JSONs). The FE checks: if `any(player.carryover_games > 0)` in the current data, show the notice. When all players have 10+ current-season games (roughly 2-3 weeks into the season), the notice disappears on its own — no code change, no manual toggle.

### 2.6 Track Record Rules

- **NBA only.** Starts at 0-0 on October 20, 2026. No 2025-26 numbers (the model has changed, and that record was never published on the site). Never combined with MLB or NFL.
- Track record displays: overall hit rate, by-stat breakdown (PTS, REB, AST, 3PM, STL, BLK, TOV, PRA), and daily results.
- `verified` flag starts `false` and moves to `true` when the operator confirms the accuracy runner's output matches the published picks (manual check, same as MLB).

### 2.7 Search / Indexing

NBA pages are **indexable** from day one. Unlike NFL (noindex during shadow validation), NBA picks are tracked from the start, so there's no reason to hide from search engines.

- Add all 5 NBA routes to `public/sitemap.xml` at launch
- Helmet tags: title, description, og:title, og:description, canonical — no `robots: noindex`
- JSON-LD: add NBA to the WebSite schema on the landing page

### 2.8 Responsible Gambling

The site Footer (`Footer.jsx:16-22`) already covers all sports:

> DISCLAIMER: This site is for entertainment purposes only and does not accept wagers or involve real-money gambling. If you or someone you know has a gambling problem, help is available — call 1-800-GAMBLER.

This is sport-agnostic. **No change needed.** NBA pages inherit the footer automatically.

---

## 3. Export Contracts

### 3a. `nba_slate_latest.json`

**Purpose:** Today's game slate — matchups, tip-off times, lines. Drives the `/nba` hub page.

```json
{
  "slate_date": "2026-10-20",
  "last_refreshed": "2026-10-20T10:30:00-04:00",
  "game_count": 4,
  "games": [
    {
      "game_id": "20261020_BOS_NYK",
      "away_team": "BOS",
      "home_team": "NYK",
      "tipoff": "19:30",
      "spread_line": -2.5,
      "total_line": 218.5,
      "arena": "Madison Square Garden"
    }
  ]
}
```

| Field | Type | Source |
|-------|------|--------|
| slate_date | string (YYYY-MM-DD) | pipeline run date |
| games[].spread_line, total_line | float | SmartBets API cache or NBA API |
| games[].tipoff | string (HH:MM ET) | NBA API schedule |
| games[].arena | string | NBA API schedule |

**Source:** New `nba_prod/export_nba_slate.py` — thin wrapper reading the schedule portion of the runner's game data.
**Refresh:** Morning run (~10 AM ET), re-run after props post.
**Size:** ~2-5 KB (4-8 games per day).
**Empty state:** `"game_count": 0, "games": []` — hub page shows "No games today."

### 3b. `nba_player_projections_latest.json`

**Purpose:** Per-player stat projections. Drives `/nba/projections`.

```json
{
  "slate_date": "2026-10-20",
  "last_refreshed": "2026-10-20T10:30:00-04:00",
  "has_carryover": true,
  "players": [
    {
      "player": "Jayson Tatum",
      "player_id": "1628369",
      "team": "BOS",
      "position": "SF",
      "opponent": "NYK",
      "game_id": "20261020_BOS_NYK",
      "is_home": false,
      "proj_pts": 28,
      "proj_reb": 8,
      "proj_ast": 5,
      "proj_3pm": 3,
      "proj_stl": 1,
      "proj_blk": 1,
      "proj_tov": 3,
      "proj_pra": 41,
      "confidence_rate": 82,
      "carryover_games": 0,
      "team_changed": false
    }
  ]
}
```

| Field | Type | Source |
|-------|------|--------|
| proj_* | int | prediction snapshot CSV (same values as `nba_predictions_YYYYMMDD_vN.csv`) |
| confidence_rate | int (0-100) | prediction snapshot CSV |
| carryover_games | int | `logic_nbaapi.py` carryover system |
| team_changed | bool | `logic_nbaapi.py` carryover system |
| has_carryover | bool | derived: `any(p.carryover_games > 0 for p in players)` |

**Source:** New `nba_prod/export_nba_projections.py` — reads the prediction snapshot CSV directly. Does not parse Excel.
**Refresh:** Morning run, re-run after props.
**Size:** ~100-150 players × ~15 fields ≈ 30-50 KB.
**Empty state:** `"players": []` — page shows "No games today."

### 3c. `nba_best_bets_latest.json`

**Purpose:** Pick recommendations. Drives `/nba/best-bets`.

```json
{
  "slate_date": "2026-10-20",
  "last_refreshed": "2026-10-20T14:30:00-04:00",
  "props_available": true,
  "locked_games": [],
  "best_bets": [
    {
      "player": "Jayson Tatum",
      "team": "BOS",
      "position": "SF",
      "opponent": "NYK",
      "game_id": "20261020_BOS_NYK",
      "stat": "PTS",
      "line": 26.5,
      "book": "DraftKings",
      "direction": "OVER",
      "model_proj": 28,
      "ev": 0.14,
      "edge": 0.18,
      "l10_rate": 70,
      "recommendation": "STRONG OVER",
      "carryover_games": 0,
      "team_changed": false
    }
  ],
  "strong_picks": [...],
  "lock_parlay_legs": [
    {
      "player": "Jayson Tatum",
      "team": "BOS",
      "stat": "PTS",
      "line": 26.5,
      "direction": "OVER",
      "ev": 0.14,
      "hit_rate_l10": 70
    }
  ]
}
```

| Field | Type | Source |
|-------|------|--------|
| best_bets[] | array | EdgeRow list filtered: `recommendation != ""`, sorted by EV desc |
| strong_picks[] | array | EdgeRow list filtered: `recommendation.startswith("STRONG")` |
| lock_parlay_legs[] | array | Parlay-qualified picks from runner's lock parlay logic |
| locked_games[] | array | Games past tip-off with preserved picks (see §2.4) |
| props_available | bool | `true` if SmartBets API returned lines for today |

**Source:** New `nba_prod/export_nba_best_bets.py` — reads the EdgeRow list from the runner. **Does not parse Excel.** Consumes the in-memory EdgeRow objects or a serialized version.
**Refresh:** After props post (typically 11 AM-2 PM ET). `props_available = false` before first prop run.
**Size:** ~5-15 KB (20-50 picks per slate).
**Empty state:** `"props_available": false, "best_bets": [], "strong_picks": [], "lock_parlay_legs": []` — page shows "Lines aren't posted yet — picks appear once they are."

### 3d. `nba_results_latest.json`

**Purpose:** Graded picks. Drives `/nba/results`.

```json
{
  "last_refreshed": "2026-10-21T08:00:00-04:00",
  "days": [
    {
      "date": "2026-10-20",
      "game_count": 4,
      "summary": {"hits": 18, "misses": 12, "pushes": 1, "rate": 0.600},
      "picks": [
        {
          "player": "Jayson Tatum",
          "team": "BOS",
          "opponent": "NYK",
          "stat": "PTS",
          "line": 26.5,
          "direction": "OVER",
          "model_proj": 28,
          "actual": 31,
          "grade": "HIT",
          "recommendation": "STRONG OVER"
        }
      ]
    }
  ]
}
```

**Windowed:** The `days` array holds at most 14 days of results. Older days roll off. This prevents the file from growing like MLB's `results_by_date.json` (currently 3.6 MB and climbing). A 14-day window at ~30-50 picks/day ≈ 15-25 KB max.

| Field | Type | Source |
|-------|------|--------|
| days[].picks[] | array | Graded from locked pick set in `nba_best_bets_latest.json` vs NBA API box scores |
| days[].summary | object | Computed: hits/(hits+misses), pushes excluded |
| grade | "HIT" / "MISS" / "PUSH" | actual vs line + direction |

**Source:** New `nba_prod/export_nba_results.py` — reads accuracy runner output + locked pick set. Does not parse Excel.
**Refresh:** After accuracy run (~10-11 PM ET, or next morning).
**Size:** ~15-25 KB (14-day window).
**Empty state:** `"days": []` — page shows "No results yet — check back after games are graded."

### 3e. `nba_track_record_latest.json`

**Purpose:** Season aggregate. Drives `/nba/track-record`.

```json
{
  "sport": "NBA",
  "generated": "2026-10-21",
  "verified": false,
  "window": {"start": "2026-10-20", "end": "2026-10-21", "days": 1},
  "overall": {"hits": 18, "misses": 12, "pushes": 1, "rate": 0.600},
  "by_stat": [
    {"stat": "PTS", "hits": 5, "misses": 3, "pushes": 0, "rate": 0.625},
    {"stat": "REB", "hits": 3, "misses": 2, "pushes": 0, "rate": 0.600},
    {"stat": "AST", "hits": 3, "misses": 2, "pushes": 1, "rate": 0.600},
    {"stat": "3PM", "hits": 2, "misses": 1, "pushes": 0, "rate": 0.667},
    {"stat": "STL", "hits": 2, "misses": 1, "pushes": 0, "rate": 0.667},
    {"stat": "BLK", "hits": 1, "misses": 2, "pushes": 0, "rate": 0.333},
    {"stat": "TOV", "hits": 1, "misses": 0, "pushes": 0, "rate": 1.000},
    {"stat": "PRA", "hits": 1, "misses": 1, "pushes": 0, "rate": 0.500}
  ],
  "daily": [
    {"date": "2026-10-20", "hits": 18, "misses": 12, "pushes": 1, "rate": 0.600}
  ]
}
```

| Field | Type | Source |
|-------|------|--------|
| overall | object | Running aggregate across all graded days |
| by_stat | array | Per-stat breakdown |
| daily | array | Full season history (one entry per graded day) |
| verified | bool | Operator-set flag |

**Source:** New `nba_prod/export_nba_track_record.py` — accumulates from accuracy results.
**Refresh:** After accuracy run.
**Size:** ~3-8 KB (grows linearly with season days, ~180 entries max ≈ 15 KB by season end).
**Empty state:** `"overall": {"hits": 0, "misses": 0, "pushes": 0, "rate": null}` — track record page shows "Season starts October 20."

### 3f. `nba_health_latest.json`

**Purpose:** Pipeline health for /status monitoring.

```json
{
  "last_refreshed": "2026-10-20T10:30:00-04:00",
  "pipeline_version": "BNv4-2.4.0",
  "verdict": "healthy",
  "surfaces": {
    "projections": {"status": "ok", "last_refreshed": "2026-10-20T10:30:00-04:00", "player_count": 120},
    "best_bets": {"status": "ok", "last_refreshed": "2026-10-20T14:30:00-04:00", "pick_count": 35},
    "results": {"status": "ok", "last_refreshed": "2026-10-21T08:00:00-04:00", "days_graded": 1},
    "track_record": {"status": "ok", "last_refreshed": "2026-10-21T08:00:00-04:00"}
  }
}
```

**Source:** New `nba_prod/export_nba_health.py` — reads timestamps from other exports.
**Refresh:** Every pipeline run.
**Size:** ~1 KB.

---

## 4. Sources: Pipeline → Export Mapping

| Export JSON | Pipeline Source | Runner Change Required |
|-------------|---------------|----------------------|
| `nba_slate_latest.json` | Game schedule from NBA API (already fetched by runner) | New export script; no runner change |
| `nba_player_projections_latest.json` | `nba_predictions_YYYYMMDD_vN.csv` (already written) | New export script; no runner change |
| `nba_best_bets_latest.json` | EdgeRow list from `ev_engine.py` (in-memory during runner) | **Runner change:** serialize EdgeRow list to JSON before Excel write, or write a picks CSV alongside the workbook |
| `nba_results_latest.json` | Accuracy runner output + locked pick set | New export script; minor accuracy runner change to output JSON |
| `nba_track_record_latest.json` | Accumulated from results | New export script |
| `nba_health_latest.json` | Timestamps from other exports | New export script |

**Any runner change that alters an output contract requires a BNv4 version bump under the NBA repo's rule.** The FE consumes the JSON contracts above; the internal runner format is the NBA pipeline's concern.

**Critical design choice:** The best-bets export must consume the EdgeRow list directly (in Python memory or via a machine-readable intermediate), not parse Excel by cell position. The card generator's Excel-parsing fragility is exactly what the site export avoids.

---

## 5. Cadence and Push Schedule

### NBA Refresh Schedule

| Trigger | Time (ET) | Surfaces Updated | Deploy |
|---------|-----------|-----------------|--------|
| Morning run | ~10 AM | slate, projections | Yes |
| Props available | ~11 AM-2 PM | best_bets (first run of picks) | Yes |
| Re-run (props update) | ~2-5 PM | best_bets (updated picks; locked games preserved) | Yes |
| Post-games accuracy | ~10-11 PM or next AM | results, track_record, health | Yes |

### Deploys Per Day Added

- **Game days:** 3-4 deploys (morning + props + re-run + accuracy)
- **Off days:** 0-1 deploys (health check only)
- **Weekly total:** ~15-20 additional deploys (NBA plays ~3-4 days/week early season)
- Combined with MLB's ~6/day and NFL's ~2-3/week, total is well within Vercel's limits

### Storage Effect

NBA adds ~120 KB of JSON per deploy (6 files, all small). At 20 deploys/week, that's ~2.4 KB/week of net data growth (since `*_latest.json` files replace, not accumulate). The only growth file is `nba_track_record_latest.json` at ~15 KB max by season end. **Negligible impact.**

### "Last Refreshed" Display

NBA pages show: `"Updated Oct 20, 2:30 PM ET"` — absolute timestamp with relative indicator ("2 hours ago"). The NflFreshness component handles this already. Stale threshold: amber warning if data is > 24 hours old on a game day, > 48 hours on an off day.

---

## 6. Pages

### 6.1 Deploy Path

1. Branch from `origin/main` (production)
2. Add NBA page components, route entries, Header toggle, LandingPage section, StatusPage surfaces, sitemap entries, theme guard entries
3. Push branch `HEAD:main` — pre-push hook allows (not `refs/heads/main`)
4. Vercel auto-deploys

### 6.2 Components

| Component | Action | Notes |
|-----------|--------|-------|
| `NbaLaunchPage.jsx` | **New** → becomes `NbaHubPage.jsx` at launch | Pre-launch: "launches Oct 20" teaser. Post-launch: today's slate + links |
| `NbaProjectionsPage.jsx` | **New** | SortableTable with PTS/REB/AST/3PM/STL/BLK/TOV/PRA columns; filter by game, team; carryover notice driven by `has_carryover` |
| `NbaBestBetsPage.jsx` | **New** | Best Bets, Strong Picks, Lock Parlay sections; "last updated" time; empty state for no-props; carryover notice |
| `NbaResultsPage.jsx` | **New** | Day-by-day graded picks, HIT/MISS/PUSH badges; daily summary |
| `NbaTrackRecordPage.jsx` | **New** | Season aggregate, by-stat breakdown, daily chart; "starts Oct 20" empty state |
| `NbaPageWrapper.jsx` | **New** | Clone of NflPageWrapper without NflValidationBanner; accepts optional notice as children |
| `NbaCarryoverNotice.jsx` | **New** | Early-season blending notice; rendered when `has_carryover === true` in data |
| Header.jsx | **Modify** | Add `nbaNavItems`, 3-way sport detection, NBA toggle button |
| LandingPage.jsx | **Modify** | Add `NBA_CARDS` array, NBA sport section, NBA banner |
| StatusPage.jsx | **Modify** | Add NBA surfaces to SURFACES array |
| App.js | **Modify** | Add `/nba/*` routes, update PicksCTA guard for `isNba` |
| sitemap.xml | **Modify** | Add 5 NBA routes |
| check-theme-tokens.js | **Modify** | Add NBA page files to ENFORCED_FILES |

### 6.3 StatusPage Surfaces

```js
// NBA surfaces
{ label: 'NBA Health', file: 'nba_health_latest.json', freshnessField: 'last_refreshed', noGameCount: true },
{ label: 'NBA Projections', file: 'nba_player_projections_latest.json', freshnessField: 'last_refreshed',
  countExtractor: d => d.players?.length, countLabel: 'players' },
{ label: 'NBA Best Bets', file: 'nba_best_bets_latest.json', freshnessField: 'last_refreshed',
  countExtractor: d => d.best_bets?.length, countLabel: 'picks', noGameCount: true },
{ label: 'NBA Results', file: 'nba_results_latest.json', freshnessField: 'last_refreshed', noGameCount: true },
{ label: 'NBA Track Record', file: 'nba_track_record_latest.json', freshnessField: 'generated', noGameCount: true },
```

### 6.4 Landing Page NBA Section

```
┌──────────────────────────────────────────────────────────┐
│  🏀 NBA                                                  │
│  Daily player projections and picks, tracked from day one │
│                                                           │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Publicly Tracked Record                             │ │
│  │  XX.X% hit rate (or "Season starts October 20")      │ │
│  │  On published NBA picks — every win and loss counted. │ │
│  │                                          [See it →]  │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
│  [Projections] [Best Bets] [Results] [Track Record]       │
└──────────────────────────────────────────────────────────┘
```

The NBA banner fetches `nba_track_record_latest.json`. Before October 20 or if fetch fails, shows "Season starts October 20" instead of a rate.

---

## 7. Plan

| # | Item | Backend (NBA repo) | Frontend (FE repo) | Total |
|---|------|-------------------|--------------------| ------|
| 1 | Export scripts: slate, projections, best_bets, results, track_record, health | 10 hrs | — | 10 hrs |
| 2 | Pick locking mechanism (§2.4) | 3 hrs | — | 3 hrs |
| 3 | Header 3-way toggle + NBA nav items | — | 1 hr | 1 hr |
| 4 | NbaPageWrapper + NbaCarryoverNotice | — | 1 hr | 1 hr |
| 5 | /nba hub (NbaHubPage.jsx) | — | 2 hrs | 2 hrs |
| 6 | /nba/projections (NbaProjectionsPage.jsx) | — | 4 hrs | 4 hrs |
| 7 | /nba/best-bets (NbaBestBetsPage.jsx) | — | 4 hrs | 4 hrs |
| 8 | /nba/results (NbaResultsPage.jsx) | — | 3 hrs | 3 hrs |
| 9 | /nba/track-record (NbaTrackRecordPage.jsx) | — | 3 hrs | 3 hrs |
| 10 | StatusPage NBA surfaces + sitemap + theme guard | — | 1 hr | 1 hr |
| 11 | LandingPage NBA section | — | 1.5 hrs | 1.5 hrs |
| 12 | Publish script integration (NBA → publish worktree) | 2 hrs | — | 2 hrs |
| | **Total** | **15 hrs** | **20.5 hrs** | **35.5 hrs** |

### Calendar

| Day | Work | Deliverable |
|-----|------|-------------|
| **Wed Oct 15** | Export scripts (#1, #2, #12) | NBA pipeline writes all 6 JSONs to publish worktree |
| **Thu Oct 16** | FE pages (#3-#11) | All NBA pages built on branch |
| **Fri Oct 17** | Preview build + operator review | Preview URL with real NBA data for approval |
| **Sat-Sun Oct 18-19** | Merge after approval | Code on production; data not yet flowing (no games) |
| **Mon Oct 19** | Dry run with preseason/test data | End-to-end: pipeline → publish → site renders |
| **Tue Oct 20** | Opening night — NBA live | Morning: projections + empty best-bets. Afternoon: picks post. Evening: first graded results. |
| **Wed Oct 21** | Results + track record live | First graded day published |

---

## 8. Disagreements with Operator Decisions

**None.** All decisions in the prompt are consistent with the recon findings. Specific confirmations:

1. **No validation banner for NBA** — correct. NBA is tracked from day one. The NFL-style "No Track Record" banner would be misleading.
2. **Indexable from day one** — correct. Unlike NFL's shadow period, NBA picks are public immediately.
3. **Results windowed at 14 days** — solves the MLB results_by_date.json growth problem (currently 3.6 MB).
4. **Carryover notice data-driven** — correct. The `has_carryover` boolean in the projections JSON drives it; no manual toggle.
5. **Footer covers NBA** — confirmed. The disclaimer is sport-agnostic.
6. **Separate track record** — correct. Never combined with MLB. The `sport: "NBA"` field makes this explicit.
7. **Export from EdgeRow, not Excel** — strongly agree. The card generator's Excel-position parsing is the fragility to avoid.

---

*NBA Site Spec v1.0 — October 13, 2026. Spec pending operator approval.*
