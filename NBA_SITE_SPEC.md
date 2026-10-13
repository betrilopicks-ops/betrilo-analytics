# NBA Site Spec — betrilo.com NBA Extension

**Version:** 1.2 | **Created:** October 13, 2026 | **Status:** SPEC — pending operator approval

**v1.2 changes:** Projections-only launch (§1.5, §2.1–2.3); picks gated behind pre-registration (§2.3); landing page revised (§6.4); calendar revised (§7.3); pick pages, ledger, results, track-record moved to Wave 2 (§2.3). All v1.1 record rules retained for Wave 2. Driven by PICKS_CALIBRATION_REVIEW.md findings: recommended picks 51.4% / ROI -4.2% over 5,940 rows; player props against sportsbook lines 46.9% in the Mar 22–Apr 5 window.

**v1.1 changes:** Record ledger (§2.4), publication rule (§2.5), Lock Parlay recommendation (§2.6), one-pick-one-count (§2.7), same-selection-as-bet-sheet (§4), strict grading (§2.5.4), BDL-grounded fields (§3), corrected calendar (§7), 21+ footer (§2.9), deploy path update (§6.1), sequencing constraint (§7.1).

---

## 1. Current FE Contract (Audit Summary)

### 1.1 Data Pattern

Same as MLB and NFL: pages fetch `/data/{surface}_latest.json` from `public/data/` via `useEffect` + `fetch()`. NBA pipeline writes JSON to `betrilo-analytics-publish` worktree. Vercel deploys on push.

NBA files follow the existing naming convention: `nba_{surface}_latest.json`.

### 1.2 Navigation

Header.jsx already implements a sport-scoped toggle (MLB | NFL) from the NFL build (BFEv0.22.0). NBA extends this to a three-way toggle: `MLB | NFL | NBA`. Detection: `isNba = location.pathname.startsWith('/nba')`. The `nbaNavItems` array is added alongside `mlbNavItems` and `nflNavItems`.

### 1.3 Status Monitoring

StatusPage.jsx monitors 13 surfaces (9 MLB + 4 NFL). NBA Wave 1 adds 2 surfaces (projections + health); Wave 2 adds 3 more (best_bets, results, track_record). Each defines: file path, freshness field, game-count extractor, `noGameCount` flag. NBA plays nearly every day, so the StatusPage cross-checks the NBA game count against `nba_slate_latest.json` game count on game days; a mismatch between expected and actual is a yellow flag. Off-days (no games in the slate) show green with "No games today."

### 1.4 Shared Components

**Reuse as-is:** Header (with 3-way toggle), Footer (with 21+ addition, see §2.9), SortableTable, NflFreshness (rename to `Freshness` or use directly), PageErrorBoundary.

**Generalize:** NflPageWrapper → `DarkPageWrapper` (remove NflValidationBanner import; accept optional banner as prop). Or clone as `NbaPageWrapper` with no validation banner.

**Do not reuse:** NflValidationBanner — NBA Wave 1 has no pick pages and therefore no validation banner. Wave 2 pick pages launch with a verified record, not under validation.

### 1.5 Key Difference from NFL — and Revised NBA Posture

NFL launched under a shadow validation gate — pages were noindex, pick surfaces were blocked pending 3 weeks graded at >=54%, and every page showed a "No Track Record" disclosure banner.

**NBA takes a similar posture, for different reasons.** An independent calibration review (PICKS_CALIBRATION_REVIEW.md) found that the EV engine's recommended picks hit 51.4% with -4.2% ROI over 5,940 graded rows — below break-even. Player props graded against sportsbook lines hit 46.9% in the Mar 22–Apr 5 window. The L10 hit-rate probability (p_model) is miscalibrated: stated 80%+ picks hit 52.4%. Edge size has zero predictive power.

**NBA launches October 20 with projections only.** Projection pages (`/nba`, `/nba/projections`) are live and indexable from day one. Pick surfaces (`/nba/best-bets`, `/nba/results`, `/nba/track-record`) are gated behind a pre-registered publish decision in the NBA repo — they ship only when picks have beaten the market over a real sample. This is the honest posture: show what works (projections), grade what doesn't yet work (picks) privately, and publish picks only when they've earned it.

---

## 2. Launch Scope

### 2.1 Wave 1 — Live October 20 (Opening Night)

| Route | Surface | Description |
|-------|---------|-------------|
| `/nba` | Hub | Today's slate summary + link to projections. No pick links, no track-record banner. |
| `/nba/projections` | Player projections | Per-player PTS, REB, AST, 3PM, STL, BLK, TOV, PRA; filter by game and team |

Both pages are indexable from day one and added to the sitemap. The hub page includes the line: "Picks: in private grading, not yet published."

### 2.2 Wave 2 — Gated Behind Pre-Registration

These pages ship **only** when the pre-registered publish gate in `PREREGISTRATION_NBA_PICKS.md` (NBA repo) is met and the operator records a publish decision. Until then, these routes do not exist on the site.

| Route | Surface | Gate |
|-------|---------|------|
| `/nba/best-bets` | Picks | Pre-registration gate met + operator publish decision |
| `/nba/results` | Graded picks | Same |
| `/nba/track-record` | Season record | Same |

All v1.1 record rules (§2.4 ledger, §2.5 publication rule, §2.5.4 strict grading, §2.6 no Lock Parlay, §2.7 one-pick-one-count) are **unchanged** and apply to Wave 2 when it ships. The ledger, grading, and export infrastructure are built in the NBA repo now (for private shadow grading) but are not wired into the publish worktree until the gate is met.

### 2.3 Not in Either Wave

- Full edge report (per-prop EV/edge table)
- Safe projections (conservative model output)
- Lock Parlay (see §2.6 — recommendation: leave off permanently unless parlay legs are graded against sportsbook lines)

These may ship later if there's demand. No spec work needed now.

### 2.4 Record Ledger

**The public record lives in the NBA repo, not in a deployed file.**

An append-only file at `E:/Betrilo/NBA/nba_prod/published_picks_ledger.csv` is the single source of truth for what the site has shown. Every pick the site publishes is appended to this ledger at the moment it's pushed to the publish worktree. The ledger is tracked in git so it can't be lost if `outputs/` is cleaned.

**Ledger schema:**

| Column | Type | Description |
|--------|------|-------------|
| `bdl_game_id` | int | BallDontLie game ID |
| `bdl_player_id` | int | BallDontLie player ID |
| `player` | string | Display name |
| `team` | string | Team abbreviation |
| `stat` | string | PTS, REB, AST, 3PM, STL, BLK, TOV, PRA |
| `side` | string | OVER or UNDER |
| `line` | float | Sportsbook line at time of publication |
| `odds` | int | American odds at time of publication (e.g. -110) |
| `book` | string | Sportsbook name (e.g. DraftKings) |
| `tier` | string | BEST_BET or STRONG |
| `first_published_at` | ISO 8601 | Timestamp when first pushed to site |
| `run_id` | string | Pipeline run identifier (e.g. `20261020_v1`) |

**Rules:**

1. Rows are append-only. Once a pick is in the ledger, it is never deleted or modified.
2. The export script appends new picks and skips any pick whose `(bdl_game_id, bdl_player_id, stat)` key already exists in the ledger.
3. `nba_best_bets_latest.json` (the site-facing file) is regenerated from the ledger on every run. A later morning run overwriting the JSON cannot alter the record — the ledger is the authority.
4. Grading reads the ledger, not the site JSON.
5. The publish worktree's git history is a second, independent audit trail of what the site showed.

### 2.5 Publication Rule

**Once a pick appears on the site, it stays on the record.**

#### 2.5.1 Immutability

A later pipeline run before tip-off may **add** new picks for that game (e.g., a new player qualifies after a re-run), but it can **never remove or change** a published pick. The ledger enforces this: the `(bdl_game_id, bdl_player_id, stat)` key check prevents overwrites.

Picks are graded at the line and odds shown when first published — the values in the `first_published_at` ledger row.

#### 2.5.2 Why this is better than locking at tip-off

v1.0 locked picks at tip-off. This revision locks picks at publication (first push to site), which is stronger:

- **Tip-off locking** allowed a re-run before tip to silently replace picks. If the model changed its mind between 11 AM and 6 PM, the morning picks vanished. Users who saw the morning picks and the evening picks would see different sets.
- **Publication locking** prevents this. The morning run's picks survive a 6 PM re-run. The 6 PM run can only add picks for newly qualifying players.
- There is no scenario where publication locking is worse: it's strictly tighter.

#### 2.5.3 Void Picks

If a player does not play (DNP, scratch, rest), the pick is **void**: shown as "VOID" in results, excluded from the hit rate, as sportsbooks do.

A **manual void** (for a bug or data error) must include a `void_reason` string and is shown publicly in results. Manual voids are appended as a separate row in a `ledger_voids.csv` keyed to the ledger pick, never by editing the ledger itself.

#### 2.5.4 Grading Rules

- **OVER wins** when `actual > line`. (Strictly greater than.)
- **UNDER wins** when `actual < line`. (Strictly less than.)
- **PUSH** when `actual == line`. Shown as PUSH, excluded from the hit rate.
- **VOID** when the player didn't play or a manual void was logged. Excluded from the hit rate.
- **Hit rate** = `hits / (hits + misses)`. Pushes and voids are excluded from both numerator and denominator.

The accuracy runner's existing `err = actual - proj` scoring (which measures projection accuracy against model projections, using `>=`) is **not used for the public record.** The public record grades against the sportsbook line from the ledger.

### 2.6 Lock Parlay — Recommendation: Leave Off at Launch

Lock Parlay legs use the model's safe lines (~72% of projection), not sportsbook lines. Session 6 measured them clearing 77-80% by construction — they're almost guaranteed to hit because the threshold is set low enough to ensure it.

**Problem:** Including them in the headline hit rate would inflate it in a way that doesn't reflect real sportsbook edges. Separating them with their own labeled section is honest but adds UX complexity for launch.

**Recommendation: leave Lock Parlay off the site at launch.** Reasons:

1. They aren't sportsbook picks — they're model-projected safe lines. Mixing them with real sportsbook-line picks in any form is confusing.
2. Their hit rate is artificially high by design. Even in a separate section, users will conflate the numbers.
3. The parlay builder already lives in the PNG cards for social. The site doesn't need to duplicate it.

If Lock Parlay is wanted later, add a separate `/nba/parlay-builder` page with clear labeling: "Model safe lines — not sportsbook lines. These are thresholds the model expects players to clear ~77% of the time." With its own record, separate from the headline track record.

### 2.7 One Pick, One Count

The published pick set uses tier labels:

| Tier | Criteria (from `ev_engine.py:224-238`) |
|------|----------------------------------------|
| **Best Bet** | `ev >= 0.12 AND edge >= 0.15 AND \|delta\| >= 2.0` |
| **Strong** | `ev >= 0.07 AND edge >= 0.10 AND \|delta\| >= 1.0` (and not Best Bet) |

Each unique pick — defined by `(bdl_game_id, bdl_player_id, stat)` — is counted **once** in results and the track record, regardless of tier. A pick that qualifies as Best Bet is shown as "Best Bet" but counted once. The tier is a label, not a separate track.

The track record page can show a tier breakdown (Best Bet hit rate vs Strong hit rate) as a secondary view, but the headline number is always the combined set with each pick counted once.

### 2.8 Early-Season Carryover Notice

While any displayed player has `carryover_games > 0`, the projections and best-bets pages show a short note:

> Early-season projections blend in last season's games until a player has 10 this season.

**Players with `team_changed = true`** are marked with a visual indicator (e.g., a small badge or footnote) so users know their carryover data is from a different team.

Both flags come from the data (`carryover_games` and `team_changed` fields in the player projections and best-bets JSONs). The FE checks: if `any(player.carryover_games > 0)` in the current data, show the notice. When all players have 10+ current-season games (roughly 2-3 weeks into the season), the notice disappears on its own — no code change, no manual toggle.

### 2.9 Responsible Gambling — 21+ Addition

The site Footer (`Footer.jsx:16-22`) currently says:

> DISCLAIMER: This site is for entertainment purposes only and does not accept wagers or involve real-money gambling. If you or someone you know has a gambling problem, help is available — call 1-800-GAMBLER.

**Missing: age gate.** Update the footer disclaimer to:

> 21+. Gambling problem? Call 1-800-GAMBLER. This site is for entertainment purposes only and does not accept wagers or involve real-money gambling.

This is a site-wide Footer change — it affects MLB and NFL pages too. This is correct: the 21+ notice should apply everywhere, not just NBA.

### 2.10 Track Record Rules (Wave 2)

- **NBA only.** Starts at 0-0 on the date the publish gate is met. No pre-gate numbers — the private shadow log is not the public record. Never combined with MLB or NFL.
- Track record displays: overall hit rate, by-stat breakdown (PTS, REB, AST, 3PM, STL, BLK, TOV, PRA), and daily results.
- `verified` flag starts `false` and moves to `true` when the operator confirms the grading output matches the published picks ledger (manual check, same as MLB).

### 2.11 Search / Indexing

**Wave 1 pages are indexable from day one.** `/nba` and `/nba/projections` are added to the sitemap at launch. They make no pick claims, so there's nothing to gate.

**Wave 2 pages are not indexed until they ship.** `/nba/best-bets`, `/nba/results`, `/nba/track-record` are not in the sitemap, not routed, and do not exist until the publish gate is met.

- Add Wave 1 routes (2) to `public/sitemap.xml` at launch
- Helmet tags: title, description, og:title, og:description, canonical — no `robots: noindex` on Wave 1 pages
- JSON-LD: add NBA to the WebSite schema on the landing page (projections surface only)

---

## 3. Export Contracts

All IDs are BallDontLie IDs. All timestamps are ISO 8601 with timezone. Data sources are BDL (games, player stats, box scores, props/odds) via `bdl_client.py`.

### 3a. `nba_slate_latest.json`

**Purpose:** Today's game slate — matchups, tip-off times, lines. Drives the `/nba` hub page.

```json
{
  "slate_date": "2026-10-20",
  "last_refreshed": "2026-10-20T10:30:00-04:00",
  "game_count": 4,
  "games": [
    {
      "bdl_game_id": 1048231,
      "away_team": "BOS",
      "home_team": "NYK",
      "tipoff": "2026-10-20T23:30:00Z",
      "tipoff_display": "7:30 PM ET",
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
| bdl_game_id | int | BDL game ID (`g.get("id")`) |
| tipoff | ISO 8601 UTC | BDL `g.get("datetime")` — full timestamp, used for lock checks |
| tipoff_display | string | Derived from tipoff, converted to ET for display |
| spread_line, total_line | float | BDL odds endpoint via `bdl_client.fetch_game_odds()` |

**Source:** New `nba_prod/export_nba_slate.py` — reads the schedule from the runner's BDL game list.
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
      "bdl_player_id": 434,
      "team": "BOS",
      "position": "SF",
      "opponent": "NYK",
      "bdl_game_id": 1048231,
      "is_home": false,
      "proj_pts": 28,
      "proj_reb": 8,
      "proj_ast": 5,
      "proj_3pm": 2.7,
      "proj_stl": 1,
      "proj_blk": 1,
      "proj_tov": 3,
      "proj_pra": 41,
      "confidence_rate": 80,
      "carryover_games": 0,
      "team_changed": false
    }
  ]
}
```

| Field | Type | Source |
|-------|------|--------|
| bdl_player_id | int | BDL player ID |
| bdl_game_id | int | BDL game ID |
| proj_pts, proj_reb, proj_ast, proj_stl, proj_blk, proj_tov, proj_pra | int | Prediction snapshot CSV (rounded integers from runner) |
| proj_3pm | float | Prediction snapshot CSV — `round(_, 1)` in runner (`runner:1477`), not rounded to int |
| confidence_rate | int, one of {0, 70, 80, 90, 100} | Bucketed from raw score (`runner:202-206`): >=88→100, >=75→90, >=60→80, >=45→70, else 0 |
| carryover_games | int | `logic_nbaapi.py` carryover system |
| team_changed | bool | `logic_nbaapi.py` carryover system |
| has_carryover | bool | derived: `any(p.carryover_games > 0 for p in players)` |

**Source:** New `nba_prod/export_nba_projections.py` — reads the prediction snapshot CSV directly. Does not parse Excel.
**Refresh:** Morning run, re-run after props.
**Size:** ~100-150 players × ~15 fields ≈ 30-50 KB.
**Empty state:** `"players": []` — page shows "No games today."

### 3c. `nba_best_bets_latest.json` (Wave 2)

**Purpose:** Pick recommendations. Drives `/nba/best-bets`. Generated from the ledger. **Not exported until the publish gate is met.**

```json
{
  "slate_date": "2026-10-20",
  "last_refreshed": "2026-10-20T14:30:00-04:00",
  "props_available": true,
  "picks": [
    {
      "player": "Jayson Tatum",
      "bdl_player_id": 434,
      "team": "BOS",
      "position": "SF",
      "opponent": "NYK",
      "bdl_game_id": 1048231,
      "tipoff": "2026-10-20T23:30:00Z",
      "stat": "PTS",
      "line": 26.5,
      "odds": -110,
      "book": "DraftKings",
      "direction": "OVER",
      "model_proj": 28,
      "tier": "BEST_BET",
      "first_published_at": "2026-10-20T14:30:00-04:00",
      "carryover_games": 0,
      "team_changed": false
    }
  ]
}
```

| Field | Type | Source |
|-------|------|--------|
| picks[] | array | Generated from ledger: today's picks from `published_picks_ledger.csv` |
| tier | "BEST_BET" or "STRONG" | From ledger, matching runner's recommendation mapping |
| line, odds, book | float/int/string | From ledger — frozen at first publication |
| first_published_at | ISO 8601 | From ledger |
| tipoff | ISO 8601 UTC | From slate data — included so the FE can show tip-off context |
| props_available | bool | `true` if BDL props endpoint returned lines for today |

**Source:** New `nba_prod/export_nba_best_bets.py` — reads the ledger and regenerates. The export never uses the previous `nba_best_bets_latest.json` as input; the ledger is the sole authority.
**Refresh:** After props post (typically 11 AM-2 PM ET). `props_available = false` before first prop run.
**Size:** ~5-10 KB (20-40 picks per slate).
**Empty state:** `"props_available": false, "picks": []` — page shows "Lines aren't posted yet — picks appear once they are."

### 3d. `nba_results_latest.json` (Wave 2)

**Purpose:** Graded picks. Drives `/nba/results`. **Not exported until the publish gate is met.**

```json
{
  "last_refreshed": "2026-10-21T08:00:00-04:00",
  "days": [
    {
      "date": "2026-10-20",
      "game_count": 4,
      "summary": {"hits": 18, "misses": 12, "pushes": 1, "voids": 2, "rate": 0.600},
      "picks": [
        {
          "player": "Jayson Tatum",
          "bdl_player_id": 434,
          "team": "BOS",
          "opponent": "NYK",
          "stat": "PTS",
          "line": 26.5,
          "direction": "OVER",
          "model_proj": 28,
          "actual": 31,
          "grade": "HIT",
          "tier": "BEST_BET"
        }
      ]
    }
  ]
}
```

**Windowed:** The `days` array holds at most 14 days of results. Older days roll off. This prevents the file from growing like MLB's `results_by_date.json` (currently 3.6 MB and climbing). A 14-day window at ~30-40 picks/day ≈ 15-25 KB max.

| Field | Type | Source |
|-------|------|--------|
| days[].picks[] | array | Graded from ledger vs BDL box scores |
| days[].summary | object | `rate = hits / (hits + misses)`. Pushes and voids excluded. |
| grade | "HIT" / "MISS" / "PUSH" / "VOID" | Strict grading per §2.5.4 |
| tier | "BEST_BET" / "STRONG" | From ledger |

**Source:** New `nba_prod/export_nba_results.py` — reads ledger + BDL box scores. Does not use accuracy runner output (which grades against projections, not lines).
**Refresh:** After games finish (~10-11 PM ET, or next morning).
**Size:** ~15-25 KB (14-day window).
**Empty state:** `"days": []` — page shows "No results yet — check back after games are graded."

### 3e. `nba_track_record_latest.json` (Wave 2)

**Purpose:** Season aggregate. Drives `/nba/track-record`. **Not exported until the publish gate is met.**

```json
{
  "sport": "NBA",
  "generated": "2026-10-21",
  "verified": false,
  "window": {"start": "2026-10-20", "end": "2026-10-21", "days": 1},
  "overall": {"hits": 18, "misses": 12, "pushes": 1, "voids": 2, "rate": 0.600},
  "by_stat": [
    {"stat": "PTS", "hits": 5, "misses": 3, "pushes": 0, "voids": 0, "rate": 0.625},
    {"stat": "REB", "hits": 3, "misses": 2, "pushes": 0, "voids": 1, "rate": 0.600},
    {"stat": "AST", "hits": 3, "misses": 2, "pushes": 1, "voids": 0, "rate": 0.600},
    {"stat": "3PM", "hits": 2, "misses": 1, "pushes": 0, "voids": 0, "rate": 0.667},
    {"stat": "STL", "hits": 2, "misses": 1, "pushes": 0, "voids": 0, "rate": 0.667},
    {"stat": "BLK", "hits": 1, "misses": 2, "pushes": 0, "voids": 1, "rate": 0.333},
    {"stat": "TOV", "hits": 1, "misses": 0, "pushes": 0, "voids": 0, "rate": 1.000},
    {"stat": "PRA", "hits": 1, "misses": 1, "pushes": 0, "voids": 0, "rate": 0.500}
  ],
  "daily": [
    {"date": "2026-10-20", "hits": 18, "misses": 12, "pushes": 1, "voids": 2, "rate": 0.600}
  ]
}
```

| Field | Type | Source |
|-------|------|--------|
| overall | object | Running aggregate across all graded days. `rate = hits / (hits + misses)`. |
| by_stat | array | Per-stat breakdown |
| daily | array | Full season history (one entry per graded day) |
| verified | bool | Operator-set flag |

**Source:** New `nba_prod/export_nba_track_record.py` — accumulates from graded ledger picks.
**Refresh:** After grading run.
**Size:** ~3-8 KB (grows linearly with season days, ~180 entries max ≈ 15 KB by season end).
**Empty state:** `"overall": {"hits": 0, "misses": 0, "pushes": 0, "voids": 0, "rate": null}` — track record page shows "Season starts October 20."

### 3f. `nba_health_latest.json`

**Purpose:** Pipeline health for /status monitoring.

```json
{
  "last_refreshed": "2026-10-20T10:30:00-04:00",
  "pipeline_version": "BNv4-2.4.0",
  "verdict": "healthy",
  "slate_game_count": 4,
  "surfaces": {
    "projections": {"status": "ok", "last_refreshed": "2026-10-20T10:30:00-04:00", "player_count": 120},
    "best_bets": {"status": "ok", "last_refreshed": "2026-10-20T14:30:00-04:00", "pick_count": 35},
    "results": {"status": "ok", "last_refreshed": "2026-10-21T08:00:00-04:00", "days_graded": 1},
    "track_record": {"status": "ok", "last_refreshed": "2026-10-21T08:00:00-04:00"}
  }
}
```

`slate_game_count` is the number of games in today's slate, used by /status to cross-check.

**Source:** New `nba_prod/export_nba_health.py` — reads timestamps from other exports.
**Refresh:** Every pipeline run.
**Size:** ~1 KB.

---

## 4. Sources: Pipeline → Export Mapping

| Export JSON | Wave | Pipeline Source | Runner Change Required |
|-------------|------|---------------|----------------------|
| `nba_slate_latest.json` | 1 | BDL game schedule (`bdl_client.py` game list, already fetched) | New export script; no runner change |
| `nba_player_projections_latest.json` | 1 | `nba_predictions_YYYYMMDD_vN.csv` (already written) | New export script; no runner change |
| `nba_health_latest.json` | 1 | Timestamps from other exports + slate game count | New export script |
| `nba_best_bets_latest.json` | 2 | `published_picks_ledger.csv` (new) ← `build_edge_report()` + publishing rules | **Runner change:** factor pick selection out of the Excel renderer so exports and workbook call the same code (see below) |
| `nba_results_latest.json` | 2 | Ledger + BDL box scores | New grading script (grades against ledger lines, not projections) |
| `nba_track_record_latest.json` | 2 | Accumulated from graded ledger | New export script |

**Any runner change that alters an output contract requires a BNv4 version bump under the NBA repo's rule.** The FE consumes the JSON contracts above; the internal runner format is the NBA pipeline's concern.

### 4.1 Same Selection as the Bet Sheet

The site shows exactly the picks the bet sheet selects, through the same functions:

1. **`ev_engine.build_edge_report()`** (`ev_engine.py:290`) — computes all EdgeRow objects with EV, edge, recommendation
2. **Publishing rules** (`runner:1788-1810`) — team-changed exclusion, heat-check L3 carryover gate
3. **Tier assignment** — Best Bet (`ev >= 0.12 AND edge >= 0.15 AND |delta| >= 2.0`), Strong (remaining recommendations)

Currently, the publishing rules live inline in the runner between `build_edge_report()` and the Excel render calls. **The spec requires these to be factored into a shared function** (e.g., `apply_publishing_rules(edge_rows, use_carryover)`) that both the workbook renderer and the site export call. This ensures the site never shows a different pick set than the bet sheet.

If the factoring has already happened by the time the NBA go-live session (session 7) finishes, the export calls the shared function directly. If not, the site export session does the factoring.

---

## 5. Cadence and Push Schedule

### NBA Refresh Schedule (Wave 1)

| Trigger | Time (ET) | Surfaces Updated | Deploy |
|---------|-----------|-----------------|--------|
| Morning run | ~10 AM | slate, projections, health | Yes |

The shadow log and private grader run in the NBA repo but do **not** push to the publish worktree.

### NBA Refresh Schedule (Wave 2 — after publish gate met)

| Trigger | Time (ET) | Surfaces Updated | Deploy |
|---------|-----------|-----------------|--------|
| Morning run | ~10 AM | slate, projections | Yes |
| Props available | ~11 AM-2 PM | best_bets (first picks published; ledger appended) | Yes |
| Re-run (props update) | ~2-5 PM | best_bets (new picks added; published picks preserved via ledger) | Yes |
| Post-games grading | ~10-11 PM or next AM | results, track_record, health | Yes |

### Deploys Per Day Added

- **Wave 1 game days:** 1 deploy (morning projections)
- **Wave 2 game days:** 3-4 deploys (morning + props + re-run + grading)
- **Off days:** 0-1 deploys (health check only)

### Storage Effect

Wave 1 adds ~35 KB of JSON per deploy (3 files: slate, projections, health). The shadow log CSV in the NBA repo grows ~2 KB/day (~360 KB/season) but is not deployed. **Negligible impact.**

### "Last Refreshed" Display

NBA pages show: `"Updated Oct 20, 2:30 PM ET"` — absolute timestamp with relative indicator ("2 hours ago"). The NflFreshness component handles this already. Stale threshold: amber warning if data is > 24 hours old on a game day.

---

## 6. Pages

### 6.1 Deploy Path

**For the page build (code changes):**

1. Branch from `origin/main` (current production)
2. Merge `origin/main` into the branch (fast-forward) so the branch includes all data commits
3. Add NBA page code on that branch
4. Push branch to origin as a named branch (e.g., `origin/nba-pages`)
5. After operator approval: merge to main locally, then push `main` with `NBA_SITE_APPROVED=1` override (the pre-push hook is being updated to key on the remote ref and accept explicit override env vars for approved code pushes)
6. Vercel auto-deploys from main

**For data pushes (unchanged):** The publish-main worktree pushes `HEAD:main` as before. The pre-push hook continues to allow this path because the local ref is `refs/heads/publish-main`, not `refs/heads/main`.

**Fast-forward-only rule:** Code merges to main must be fast-forward-only (`git merge --ff-only`) to avoid merge commits that could silently include unintended changes.

### 6.2 Components

**Wave 1 (October 20):**

| Component | Action | Notes |
|-----------|--------|-------|
| `NbaHubPage.jsx` | **New** | Today's slate + projections link. "Picks: in private grading, not yet published." No pick links. |
| `NbaProjectionsPage.jsx` | **New** | SortableTable with PTS/REB/AST/3PM/STL/BLK/TOV/PRA columns; filter by game, team; carryover notice driven by `has_carryover` |
| `NbaPageWrapper.jsx` | **New** | Clone of NflPageWrapper without NflValidationBanner; accepts optional notice as children |
| `NbaCarryoverNotice.jsx` | **New** | Early-season blending notice; rendered when `has_carryover === true` in data |
| Header.jsx | **Modify** | Add `nbaNavItems` (hub + projections only), 3-way sport detection, NBA toggle button |
| LandingPage.jsx | **Modify** | Add NBA sport section — projections only, "Picks: in private grading, not yet published." No track-record banner. |
| StatusPage.jsx | **Modify** | Add Wave 1 NBA surfaces (health, projections, slate) |
| App.js | **Modify** | Add `/nba` and `/nba/projections` routes only |
| Footer.jsx | **Modify** | 21+ responsible gambling text (site-wide, affects all sports) |
| sitemap.xml | **Modify** | Add 2 NBA routes (`/nba`, `/nba/projections`) |
| check-theme-tokens.js | **Modify** | Add NBA page files to ENFORCED_FILES |

**Wave 2 (after publish gate met):**

| Component | Action | Notes |
|-----------|--------|-------|
| `NbaBestBetsPage.jsx` | **New** | Best Bets and Strong Picks with tier labels; "last updated" time; empty state for no-props. No Lock Parlay. |
| `NbaResultsPage.jsx` | **New** | Day-by-day graded picks, HIT/MISS/PUSH/VOID badges; daily summary; tier labels |
| `NbaTrackRecordPage.jsx` | **New** | Season aggregate, by-stat breakdown, daily chart |
| Header.jsx | **Modify** | Expand `nbaNavItems` to include best-bets, results, track-record |
| LandingPage.jsx | **Modify** | Add track-record banner and pick links to NBA section |
| StatusPage.jsx | **Modify** | Add Wave 2 NBA surfaces (best_bets, results, track_record) |
| App.js | **Modify** | Add `/nba/best-bets`, `/nba/results`, `/nba/track-record` routes |
| sitemap.xml | **Modify** | Add 3 Wave 2 NBA routes |

### 6.3 StatusPage Surfaces

**Wave 1:**

```js
// NBA surfaces (Wave 1)
{ label: 'NBA Health', file: 'nba_health_latest.json', freshnessField: 'last_refreshed',
  countExtractor: d => d.slate_game_count, countLabel: 'games today' },
{ label: 'NBA Projections', file: 'nba_player_projections_latest.json', freshnessField: 'last_refreshed',
  countExtractor: d => d.players?.length, countLabel: 'players' },
```

**Wave 2 (add when publish gate met):**

```js
// NBA surfaces (Wave 2)
{ label: 'NBA Best Bets', file: 'nba_best_bets_latest.json', freshnessField: 'last_refreshed',
  countExtractor: d => d.picks?.length, countLabel: 'picks' },
{ label: 'NBA Results', file: 'nba_results_latest.json', freshnessField: 'last_refreshed', noGameCount: true },
{ label: 'NBA Track Record', file: 'nba_track_record_latest.json', freshnessField: 'generated', noGameCount: true },
```

### 6.4 Landing Page NBA Section

```
┌──────────────────────────────────────────────────────────┐
│  🏀 NBA                                                  │
│  Model-driven player projections for every NBA game       │
│                                                           │
│  Picks: in private grading, not yet published.            │
│                                                           │
│  [Projections]                                            │
└──────────────────────────────────────────────────────────┘
```

No track-record banner. No pick links. No mention of best bets, a record, or tracked picks. When Wave 2 ships, the section expands to include the track-record banner and pick links — that is a separate FE change gated on the publish decision.

---

## 7. Plan

### 7.1 Sequencing Constraint

**NBA-repo work (export scripts, ledger, publishing-rule refactor) starts only after the NBA go-live session (session 7) is finished.** Both session 7 and the site exports change the runner and `run_prod_bdl.ps1`. Running them concurrently would create merge conflicts and risk breaking the pipeline before opening night. The FE page build can proceed in parallel since it touches a different repo.

### 7.2 Hours

**Wave 1 (October 20 launch):**

| # | Item | Backend (NBA repo) | Frontend (FE repo) | Total |
|---|------|-------------------|--------------------| ------|
| 1 | Export scripts: slate, projections, health | 4 hrs | — | 4 hrs |
| 2 | Publish script integration (Wave 1 JSONs → publish worktree) | 2 hrs | — | 2 hrs |
| 3 | Private shadow log + grader + weekly report | 4 hrs | — | 4 hrs |
| 4 | Pre-registration document | 1 hr | — | 1 hr |
| 5 | Honest accuracy reporting (split categories) | 2 hrs | — | 2 hrs |
| 6 | Header 3-way toggle + NBA nav items (hub + projections) | — | 1 hr | 1 hr |
| 7 | NbaPageWrapper + NbaCarryoverNotice | — | 1 hr | 1 hr |
| 8 | /nba hub (NbaHubPage.jsx) | — | 2 hrs | 2 hrs |
| 9 | /nba/projections (NbaProjectionsPage.jsx) | — | 4 hrs | 4 hrs |
| 10 | StatusPage Wave 1 surfaces + sitemap + theme guard + Footer 21+ | — | 1.5 hrs | 1.5 hrs |
| 11 | LandingPage NBA section (projections only) | — | 1 hr | 1 hr |
| | **Wave 1 Total** | **13 hrs** | **10.5 hrs** | **23.5 hrs** |

**Wave 2 (after publish gate met — separate sessions):**

| # | Item | Backend (NBA repo) | Frontend (FE repo) | Total |
|---|------|-------------------|--------------------| ------|
| W2-1 | Export scripts: best_bets, results, track_record | 4 hrs | — | 4 hrs |
| W2-2 | Published-picks ledger + publication rule (§2.4-2.5) | 4 hrs | — | 4 hrs |
| W2-3 | Factor publishing rules into shared function (§4.1) | 2 hrs | — | 2 hrs |
| W2-4 | Public grading script (grades against ledger lines, §2.5.4) | 3 hrs | — | 3 hrs |
| W2-5 | /nba/best-bets, /nba/results, /nba/track-record pages | — | 9 hrs | 9 hrs |
| W2-6 | Landing page upgrade (track-record banner, pick links) | — | 1.5 hrs | 1.5 hrs |
| | **Wave 2 Total** | **13 hrs** | **10.5 hrs** | **23.5 hrs** |

### 7.3 Calendar

Today is Tuesday, October 13.

**Wave 1:**

| Day | Work | Deliverable |
|-----|------|-------------|
| **Wed Oct 14** | NBA export scripts, shadow log, pre-registration, accuracy fix | NBA pipeline writes Wave 1 JSONs; shadow log ready; pre-registration committed; accuracy reports split |
| **Thu Oct 15** | FE pages (hub + projections only) | Wave 1 pages built on branch; Footer 21+ applied |
| **Fri Oct 16** | Preview build + operator review | Preview URL with real NBA data for approval |
| **Sat-Sun Oct 17-18** | Merge after approval | Code on production; data not yet flowing (no games) |
| **Mon Oct 19** | Dry run using a replayed past date | Wave 1 exports pushed to preview branch only. Shadow log records but does not publish. |
| **Tue Oct 20** | Opening night — NBA live | Morning: projections go live on site. Shadow log starts recording pick candidates privately. |

**Wave 2:** Scheduled only after the pre-registration gate is met. Not on this calendar.

---

## 8. Disagreements with Operator Decisions

**None.** The projections-only launch is the correct call given the calibration review findings. Specific notes:

1. **Projections-only launch** — correct. Recommended picks hit 51.4% / ROI -4.2%. Publishing them on day one would damage credibility.
2. **Private shadow grading** — the only honest path. Grade privately, publish if the gate is met.
3. **Pre-registration** — makes the gate tamper-evident and pre-committed. The 600-pick / +2% ROI bar is a minimum, not proof of an edge — stated plainly in the document.
4. **All v1.1 record rules retained for Wave 2** — correct. The ledger, strict grading, publication locking, no Lock Parlay, one-pick-one-count infrastructure is built now for shadow grading and ships unchanged when the gate is met.
5. **Landing page: "Picks: in private grading, not yet published."** — honest, minimal, no false claims.
6. **21+ footer** — still in Wave 1 scope, site-wide.
7. **Accuracy reporting split** — critical. The 55.1% blended rate mixed parlay-floor hits with sportsbook-line hits. Separate categories prevent this.
8. **Calendar** — Wave 1 is smaller (hub + projections), so the timeline is tighter. Wave 2 is scheduled only after the gate is met.

---

*NBA Site Spec v1.2 — October 13, 2026. Spec pending operator approval.*
