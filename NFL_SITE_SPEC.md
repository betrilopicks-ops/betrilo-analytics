# NFL Site Spec — betrilo.com Multi-Sport Extension

**Version:** 1.0 | **Created:** 2026-09-05 | **Status:** SPEC ONLY — no build this session

---

## 1. Current FE Contract (Audit Summary)

### 1.1 Data Pattern

All pages fetch `/data/{surface}_latest.json` from `public/data/` via `useEffect` + `fetch()`. No API layer, no abstraction. MLB pipeline writes JSON to `betrilo-analytics-publish` worktree, Vercel deploys on push.

NFL will follow the same pattern: NFL export scripts write `nfl_{surface}_latest.json` to the publish worktree, pages fetch from `/data/nfl_*_latest.json`.

### 1.2 Representative JSON Shape (MLB Reference)

**player_projections_latest.json (~430 KB):**
```
{ slate_date, last_refreshed (ISO), lineup_status,
  games: [{ away_team, home_team, time, batters: [{
    player, batter_id, team, proj_hits, proj_tb, proj_hr, proj_bb,
    l10_hit_pct, vp_ab, vp_h, h_streak, book_hits_line,
    game_log: { games: [{date, opp, ab, h, r, rbi, k, bb, tb}], l10_ba }
  }]}]
}
```

**track_record_latest.json:**
```
{ generated, verified (bool), window: {start, end, days},
  overall: {hits, scored, rate},
  by_prop: [{prop, hits, scored, rate}],
  daily: [{date, hits, scored, rate}]
}
```

### 1.3 Navigation

Header.jsx `navItems` array: 9 items, all `/mlb/*`. Hardcoded, no sport-tier logic. LandingPage renders 8 CARDS with hero TrackRecordBanner showing `67.3% hit rate`.

### 1.4 Status Monitoring

StatusPage.jsx monitors 9 surfaces via SURFACES array. Each defines: file path, freshness field, game-count extractor, record-count extractor, `noGameCount` flag. Health = today-fresh + game-count match. Auto-refresh 5 min.

### 1.5 Shared Components

**Reusable:** Header, Footer, PicksCTA (banner pattern).
**Not reusable:** Every page component is MLB-coupled (field names, prop types, position concepts). No generic table/dropdown/chart components exist.

---

## 2. Nav Architecture (Decision Required)

### Current State
9 MLB nav items. Adding 5-7 NFL items = 14-16 links. Already flagged in FE book as wrapping at 7+.

### Option A: Sport-Scoped Nav with Toggle
- Top bar: `⚾ MLB | 🏈 NFL` toggle (or tab)
- Below toggle: sport-specific nav items (only the current sport's pages)
- Landing page: two sport cards, each linking to its landing section
- Mobile: sport toggle in hamburger menu, then page links
- **Pro:** Scales to 3+ sports. Clean. No wrapping.
- **Con:** Two clicks to switch sports. Users must know the toggle exists.

### Option B: Grouped Dropdowns
- Nav shows: `MLB ▼` and `NFL ▼` dropdown menus
- Each dropdown lists that sport's pages
- Landing page: two sport sections side by side
- Mobile: collapsible sport sections
- **Pro:** Both sports always visible. One click to any page.
- **Con:** Dropdown interaction on mobile is finicky. Gets ugly at 3 sports.

### Option C: Flat Nav with Sport Prefix
- All pages in one row: `MLB Lineups | MLB BvP | ... | NFL Schedule | NFL Projections | ...`
- Landing page: combined card grid
- **Pro:** Simple. No new UI pattern.
- **Con:** 14+ items wraps badly. Unusable on mobile. Dead on arrival.

### Recommendation: **Option A (Sport-Scoped Nav with Toggle)**

Matches the FE book's existing recommendation (§7.4 "sport-scoped nav with toggle"). Scales to NBA. The toggle is a simple `<button>` that swaps the navItems array and the route prefix. Implementation: ~2 hours.

Landing page becomes a sport selector: two cards (MLB, NFL), each with its track record summary and link to that sport's section. The hero banner shows MLB's rate and NFL's rate (or "Tracking" during shadow) side by side.

---

## 3. Export Contracts (NFL Wave 1)

### 3a. `nfl_schedule_latest.json`

**Purpose:** Weekly slate with projected snap leaders, injury designations, bye teams.

```json
{
  "season": 2026,
  "week": 1,
  "generated_at": "2026-09-05T14:00:00-04:00",
  "bye_teams": [],
  "games": [
    {
      "game_id": "2026_01_KC_DEN",
      "away_team": "KC",
      "home_team": "DEN",
      "gameday": "2026-09-10",
      "gametime": "20:15",
      "spread_line": -3.5,
      "total_line": 47.5,
      "roof": "outdoors",
      "stadium": "Empower Field at Mile High",
      "away_snap_leaders": [
        {"player": "Patrick Mahomes", "position": "QB", "snap_pct": 1.00},
        {"player": "Rashee Rice", "position": "WR", "snap_pct": 0.85}
      ],
      "home_snap_leaders": [...],
      "away_injuries": [
        {"player": "Ja'Marr Chase", "status": "Questionable", "body_part": "Knee"}
      ],
      "home_injuries": [...],
      "inactives": null
    }
  ]
}
```

| Field | Type | Source |
|---|---|---|
| season, week | int | schedules table |
| bye_teams | string[] | derived (32 teams minus teams in this week's games) |
| games[].spread_line, total_line | float | schedules table (nflreadpy) |
| games[].snap_leaders | object[] | snap_counts + rosters (top 3 per position group per team) |
| games[].injuries | object[] | injury_report table (Q/D/O only) |
| games[].inactives | string[] or null | injury_ingestor (Sunday only, null until 10:30 AM ET) |

**Source module:** New `nfl_prod/export_nfl_schedule.py`
**Refresh:** Friday 2 PM (after designations); Sunday 10:30 AM (inactives update)
**Size:** ~30 KB for a full 16-game slate
**Empty state:** Bye week = `games` array shorter; pre-season = empty; off-season = last regular-season week

### 3b. `nfl_player_projections_latest.json`

**Purpose:** Per-player projections across all 5 markets with usage context.

```json
{
  "season": 2026,
  "week": 1,
  "generated_at": "2026-09-05T14:00:00-04:00",
  "week1_mode": true,
  "players": [
    {
      "player_name": "Rashee Rice",
      "player_id": "00-0039856",
      "team": "KC",
      "position": "WR",
      "opponent": "DEN",
      "game_id": "2026_01_KC_DEN",
      "is_home": false,
      "depth_chart_rank": 1,
      "usage": {
        "target_share": 0.277,
        "targets_per_game": 9.0,
        "receptions_per_game": 6.4,
        "rec_yds_per_game": 71.6,
        "blend_source": "prior_season (12 games)"
      },
      "projections": {
        "rec_yds": 84.0,
        "receptions": 8.0,
        "targets": 11.0,
        "rec_tds": 0.69
      },
      "dvp": {
        "rank": 4,
        "label": "Smash",
        "rec_yds_allowed_per_game": 168.5
      },
      "injury": null
    }
  ]
}
```

| Field | Type | Source |
|---|---|---|
| projections.* | float | projection_engine.py |
| usage.* | float | usage_engine.py |
| dvp.* | int/string/float | dvp_engine.py |
| injury | object or null | injury_report table |

**Source module:** New `nfl_prod/export_nfl_projections.py`
**Refresh:** Wednesday 2 PM, Thursday 2 PM, Friday 2 PM
**Size:** ~200 players × ~25 fields ≈ 60-80 KB
**Empty state:** Bye-week players excluded; pre-season = empty

### 3c. `nfl_team_rankings_latest.json`

**Purpose:** DvP rankings — offensive and defensive strength by position group.

```json
{
  "season": 2026,
  "generated_at": "2026-09-05T14:00:00-04:00",
  "dvp_method": "recency-weighted (2026=1.0x, 2025=0.6x, 2024=0.3x)",
  "position_groups": {
    "QB": [
      {"team": "CAR", "rank": 1, "label": "Smash",
       "pass_yds_per_game": 260.2, "pass_tds_per_game": 1.8, "games": 34},
      ...
    ],
    "RB": [...],
    "WR": [...],
    "TE": [...]
  }
}
```

**Source module:** New `nfl_prod/export_nfl_rankings.py` (thin wrapper around dvp_engine.compute_dvp)
**Refresh:** Wednesday 2 PM (weekly, after stats ingest)
**Size:** 4 × 32 teams × ~8 fields ≈ 15 KB
**Empty state:** Always populated (uses historical data even in Week 1)

### 3d. `nfl_game_logs_{season}.json` (partitioned by season)

**Purpose:** Historical player-week stats for filtering/searching.

**Cannot ship as one 107K-row blob.** Partition strategy: one file per season.

```json
{
  "season": 2025,
  "generated_at": "2026-09-05T14:00:00-04:00",
  "row_count": 18540,
  "players": [
    {
      "player_id": "00-0039856",
      "player_name": "Rashee Rice",
      "team": "KC",
      "position": "WR",
      "weeks": [
        {
          "week": 1, "opponent": "BAL",
          "receptions": 7, "targets": 9, "rec_yds": 103, "rec_tds": 1,
          "carries": 0, "rush_yds": 0, "fantasy_ppr": 20.3
        },
        ...
      ]
    }
  ]
}
```

**Partition:** One JSON per season (2020-2026). Each ~300 KB compressed. The FE page loads the selected season on demand, not all at once.

**Source module:** New `nfl_prod/export_nfl_game_logs.py`
**Refresh:** Weekly (after stats ingest); historical seasons are static
**Size per season:** ~18K rows grouped by ~2000 players, nested → ~300-500 KB
**Empty state:** 2026 season = empty until Week 1 stats land

---

## 4. Cadence

### NFL Refresh Schedule

| Day | Time (ET) | Action | Surfaces Updated |
|---|---|---|---|
| Tuesday | 06:00 AM | Stats ingest (prior week results) | game_logs |
| Wednesday | 02:00 PM | Full pipeline: projections + DvP + schedule | all except results |
| Thursday | 02:00 PM | Refresh injuries + TNF subset | schedule, projections |
| Friday | 02:00 PM | Final projections with game designations | all except results |
| Sunday | 10:30 AM | Inactives update | schedule (inactives field) |
| Monday | 06:00 AM | Score Week N, generate recap | results, track_record |

### "Last Refreshed" Display

NFL pages should show: `"Updated Friday Sep 5, 2:00 PM ET — Week 1 (Sep 7-10)"` instead of just a timestamp. The week context prevents "Thursday timestamp on Sunday" from reading stale.

For /status, NFL surfaces need:
- `noGameCount: true` for most of the week (no games today is normal)
- Freshness check: "updated this week" instead of "updated today"
- A custom `nfl_health_latest.json` separate from MLB's `health_latest.json`

### "Healthy" When No Games Today

NFL plays 3-4 days per week. The other 3-4 days, "no games today" is the correct state. /status should show green with "No games scheduled — next: Sunday Sep 7, 1:00 PM ET" rather than yellow/red for staleness.

---

## 5. Pick-Related Pages (Gated)

### Gate Specification

**BLOCKED PENDING SHADOW VALIDATION.** The following pages must not ship until:
1. Three shadow weeks graded (Weeks 1-3, pooled n≈450+)
2. Pooled STRONG hit rate ≥ 54%
3. Operator publish decision recorded in NFL book

Until the gate is met, these pages show a "Coming Soon — Tracking accuracy privately" stub. The exports exist but are not deployed.

### 5a. `nfl_best_bets_latest.json`

```json
{
  "season": 2026, "week": 3,
  "generated_at": "...",
  "picks": [
    {
      "player": "Rashee Rice",
      "team": "KC",
      "position": "WR",
      "opponent": "DEN",
      "market": "player_reception_yds",
      "market_label": "Receiving Yards",
      "line": 62.5,
      "direction": "OVER",
      "projection": 84.0,
      "confidence": 8.2,
      "edge": 0.12,
      "best_odds": -110,
      "best_book": "draftkings",
      "dvp_label": "Smash"
    }
  ]
}
```

### 5b. `nfl_results_latest.json`

```json
{
  "season": 2026, "week": 1,
  "generated_at": "...",
  "picks": [
    {
      "player": "Rashee Rice", "team": "KC", "market": "Receiving Yards",
      "line": 62.5, "direction": "OVER", "projection": 84.0,
      "actual": 103, "grade": "HIT", "pick_label": "STRONG OVER"
    }
  ]
}
```

### 5c. `nfl_track_record_latest.json`

```json
{
  "sport": "NFL",
  "generated": "2026-10-15",
  "verified": false,
  "window": { "start": "2026-09-10", "end": "2026-10-14", "weeks": 5 },
  "overall": { "hits": 180, "scored": 340, "rate": 0.529 },
  "by_market": [
    { "market": "Receiving Yards", "hits": 45, "scored": 80, "rate": 0.5625 }
  ],
  "weekly": [
    { "week": 1, "hits": 35, "scored": 65, "rate": 0.538 }
  ]
}
```

**Track record is per-sport.** No site-wide aggregate combining NFL with MLB's 67%.

### Landing Page Hero Banner with Two Sports

Current: single "67.3% Verified" badge. With two sports:

```
┌────────────────────────────────────┐
│  ⚾ MLB: 67.3% Verified           │
│  🏈 NFL: Tracking (Week 1-3)      │
│     or                             │
│  🏈 NFL: 54.2% (5 weeks tracked)  │
└────────────────────────────────────┘
```

Each sport shows its own rate and verification status. "Tracking" = shadow period (pre-gate). "Verified" = post-gate (3+ weeks, ≥54%). The banner fetches both `track_record_latest.json` and `nfl_track_record_latest.json`.

---

## 6. Phased Build Plan

### Wave 1: Informational (ships during shadow)

No pick data. Pure data presentation.

| # | Page | Backend Export | FE Page | Backend hrs | FE hrs |
|---|---|---|---|---|---|
| W1.1 | Sport-scoped nav | — | Header refactor + toggle | 0 | 3 |
| W1.2 | Landing page (two sports) | — | LandingPage refactor | 0 | 2 |
| W1.3 | NFL Schedule | `export_nfl_schedule.py` | NflSchedulePage.jsx | 4 | 6 |
| W1.4 | NFL Projections | `export_nfl_projections.py` | NflProjectionsPage.jsx | 3 | 5 |
| W1.5 | NFL Team Rankings (DvP) | `export_nfl_rankings.py` | NflRankingsPage.jsx | 2 | 4 |
| W1.6 | NFL Game Logs | `export_nfl_game_logs.py` | NflGameLogsPage.jsx | 3 | 5 |
| W1.7 | /status NFL surfaces | `nfl_health_latest.json` | StatusPage update | 1 | 2 |
| | **Wave 1 total** | | | **13 hrs** | **27 hrs** |

### Wave 2: Post-Validation (blocked pending shadow gate)

| # | Page | Backend Export | FE Page | Backend hrs | FE hrs |
|---|---|---|---|---|---|
| W2.1 | NFL Best Bets | `export_nfl_best_bets.py` | NflBestBetsPage.jsx | 4 | 5 |
| W2.2 | NFL Results | `export_nfl_results.py` | NflResultsPage.jsx | 3 | 5 |
| W2.3 | NFL Track Record | `export_nfl_track_record.py` | NflTrackRecordPage.jsx | 3 | 4 |
| W2.4 | NFL Edge Report | `export_nfl_edge.py` | NflEdgeReportPage.jsx | 3 | 4 |
| W2.5 | NFL Injury Report | `export_nfl_injuries.py` | NflInjuryPage.jsx | 2 | 4 |
| | **Wave 2 total** | | | **15 hrs** | **22 hrs** |

### Total Effort

| | Backend (export scripts) | Frontend (React pages) | Total |
|---|---|---|---|
| Wave 1 | 13 hrs | 27 hrs | **40 hrs** |
| Wave 2 | 15 hrs | 22 hrs | **37 hrs** |
| **Grand total** | **28 hrs** | **49 hrs** | **77 hrs** |

**Backend vs Frontend split: 36% / 64%.** Most work is React — the NFL data pipeline already produces the underlying data; the exports are thin wrappers.

---

## 7. Biggest Unknowns

1. **Odds API prop line formatting for the FE** — Best Bets and Edge Report need line + odds + book name from the Odds API cache. The current snapshot CSV has this, but the export script needs to pull from the cached per-day JSON. Untested path.

2. **Game logs pagination UX** — 18K rows per season. The FE has no precedent for paginated data (MLB surfaces are all single-fetch). Options: client-side filter/search with full season loaded (300-500 KB is fine for modern browsers), or server-side pagination (requires API, breaks the static-JSON model). Recommend: client-side with season selector dropdown.

3. **Sunday inactives timing** — The pipeline runs Friday. Inactives land Sunday 10:30 AM. The schedule export needs a lightweight Sunday-morning update path (re-run injury_ingestor + update schedule JSON only, not full pipeline). This is ~30 min of backend work but needs a scheduled task.

---

*NFL Site Spec v1.0 — September 5, 2026. Spec only, no build.*
