import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { colors } from '../theme';

// ── Surface definitions ─────────────────────────────────────────────────────
const SURFACES = [
  {
    key: 'player_projections',
    label: 'Player Projections',
    file: '/data/player_projections_latest.json',
    getFreshness: d => d.last_refreshed,
    getGames: d => d.games?.length ?? 0,
    getRecords: d => {
      const n = d.games?.reduce((s, g) => s + (g.batters?.length ?? 0), 0) ?? 0;
      return { count: n, label: 'batters' };
    },
  },
  {
    key: 'best_bets',
    label: 'Best Bets',
    file: '/data/best_bets_latest.json',
    getFreshness: d => parseSlateDateHuman(d.slate_date),
    getGames: () => null,
    getRecords: d => {
      const b = d.blocks ?? {};
      const n = (b.top8?.length ?? 0) + (b.per_game?.length ?? 0) + (b.top_hit?.length ?? 0);
      return { count: n, label: 'picks' };
    },
    noGameCount: true, // games with qualifying bets ≤ total games — not a mismatch signal
  },
  {
    key: 'edge_report',
    label: 'Edge Report',
    file: '/data/edge_report_latest.json',
    getFreshness: d => d.slate_date ? d.slate_date + 'T06:00:00-04:00' : null,
    getGames: () => null,
    getRecords: d => ({ count: d.count ?? d.picks?.length ?? 0, label: 'picks' }),
    noGameCount: true, // pick count ≠ game count — freshness-only health
  },
  {
    key: 'batter_splits',
    label: 'Batter Splits',
    file: '/data/batter_splits_latest.json',
    getFreshness: d => d.generated ? d.generated + 'T06:00:00-04:00' : null,
    getGames: () => null,
    getRecords: d => ({ count: d.count ?? d.players?.length ?? 0, label: 'players' }),
    noGameCount: true, // team count ≠ game count — freshness-only health
  },
  {
    key: 'game_matchups',
    label: 'Game Matchups',
    file: '/data/game_matchups_latest.json',
    getFreshness: d => d.exported_date ? d.exported_date + 'T06:00:00-04:00' : null,
    getGames: d => d.games_count ?? d.games?.length ?? 0,
    getRecords: d => {
      const n = d.games?.reduce((s, g) =>
        s + (g.home_batters?.length ?? 0) + (g.away_batters?.length ?? 0), 0) ?? 0;
      return { count: n, label: 'batters' };
    },
  },
  {
    key: 'starting_lineups',
    label: 'Starting Lineups',
    file: '/data/starting_lineups_latest.json',
    getFreshness: d => d.last_refreshed,
    getGames: d => d.games?.length ?? 0,
    getRecords: d => {
      const n = d.games?.reduce((s, g) =>
        s + (g.home_lineup?.length ?? 0) + (g.away_lineup?.length ?? 0), 0) ?? 0;
      return { count: n, label: 'lineup slots' };
    },
  },
  {
    key: 'track_record',
    label: 'Track Record',
    file: '/data/track_record_latest.json',
    getFreshness: d => d.generated ? d.generated + 'T06:00:00-04:00' : null,
    getGames: () => null, // not game-scoped
    getRecords: d => {
      const o = d.overall ?? {};
      const pct = o.rate != null ? (o.rate * 100).toFixed(1) + '%' : '—';
      return { count: d.daily?.length ?? 0, label: `days scored (${pct} overall)` };
    },
    noGameCount: true,
  },
  {
    key: 'results_by_date',
    label: 'Results by Date',
    file: '/data/results_by_date.json',
    getFreshness: d => d.generated ? d.generated + 'T06:00:00-04:00' : null,
    getGames: () => null,
    getRecords: d => ({ count: d.total_days ?? d.days?.length ?? 0, label: 'days' }),
    noGameCount: true,
  },
  {
    key: 'health',
    label: 'Pipeline Health',
    file: '/data/health_latest.json',
    getFreshness: d => d.checked_at,
    getGames: () => null,
    getRecords: d => {
      const steps = d.steps ?? {};
      const total = Object.keys(steps).length;
      const ok = Object.values(steps).filter(v => v === 'OK').length;
      return { count: ok, label: `of ${total} steps OK` };
    },
    noGameCount: true,
    getVerdict: d => d.verdict,
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Parse human-readable slate_date like "July 12, 2026" → ISO string */
function parseSlateDateHuman(s) {
  if (!s) return null;
  // Already ISO-like?
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.length === 10 ? s + 'T06:00:00-04:00' : s;
  const d = new Date(s + ' EDT');
  if (isNaN(d)) return null;
  return d.toISOString().slice(0, 10) + 'T06:00:00-04:00';
}

/** Today's date string in ET (YYYY-MM-DD) */
function todayET() {
  return new Date().toLocaleString('sv-SE', { timeZone: 'America/New_York' }).slice(0, 10);
}

/** Parse an ISO-ish timestamp into a Date */
function parseTS(ts) {
  if (!ts) return null;
  const d = new Date(ts);
  return isNaN(d) ? null : d;
}

/** Format a Date as "2026-07-22 6:04 AM ET" */
function fmtAbsolute(d) {
  if (!d) return '—';
  return d.toLocaleString('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).replace(',', '') + ' ET';
}

/** Relative time: "2 hours ago", "22 hours ago", "3 days ago" */
function fmtRelative(d) {
  if (!d) return '';
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/** Extract YYYY-MM-DD (in ET) from a Date */
function dateStrET(d) {
  if (!d) return null;
  return d.toLocaleString('sv-SE', { timeZone: 'America/New_York' }).slice(0, 10);
}

// ── Health logic ─────────────────────────────────────────────────────────────

function computeHealth(surface, data, expectedGames) {
  if (!data) return { color: '#ef4444', status: 'ERROR', detail: 'Failed to load' };

  const ts = parseTS(surface.getFreshness(data));
  const today = todayET();
  const fileDate = dateStrET(ts);
  const isToday = fileDate === today;

  if (surface.noGameCount) {
    if (surface.key === 'health') {
      const verdict = data.verdict;
      if (verdict === 'ALL GOOD' && isToday) return { color: colors.green, status: 'HEALTHY', detail: 'Pipeline ran clean' };
      if (verdict === 'ALL GOOD') return { color: '#eab308', status: 'STALE', detail: `Last clean run: ${fileDate}` };
      if (isToday) return { color: '#eab308', status: 'ATTENTION', detail: data.headline || verdict };
      return { color: '#ef4444', status: 'STALE', detail: `Last run: ${fileDate}` };
    }
    // Track record, results: only freshness matters
    if (isToday) return { color: colors.green, status: 'HEALTHY', detail: 'Updated today' };
    // These accumulate — 1 day stale is yellow, 2+ is red
    if (ts) {
      const daysOld = Math.floor((Date.now() - ts.getTime()) / 86400000);
      if (daysOld <= 1) return { color: '#eab308', status: 'OK', detail: `${daysOld}d old (may be off-day)` };
    }
    return { color: '#ef4444', status: 'STALE', detail: `Last updated: ${fileDate || '?'}` };
  }

  const fileGames = surface.getGames(data);

  if (isToday && expectedGames != null && fileGames === expectedGames) {
    return { color: colors.green, status: 'HEALTHY', detail: 'Updated today, full slate' };
  }
  if (isToday && expectedGames != null && fileGames !== expectedGames) {
    return { color: '#eab308', status: 'MISMATCH', detail: `${fileGames} vs ${expectedGames} expected games` };
  }
  if (isToday) {
    return { color: colors.green, status: 'HEALTHY', detail: 'Updated today' };
  }
  // Not today
  if (expectedGames === 0) {
    return { color: '#eab308', status: 'OFF-DAY', detail: 'No games today — holding prior data' };
  }
  return { color: '#ef4444', status: 'STALE', detail: `Last updated: ${fileDate || '?'}` };
}

// ── Auto-refresh interval (ms) ──────────────────────────────────────────────
const AUTO_REFRESH_MS = 5 * 60 * 1000; // 5 minutes

// ── Component ────────────────────────────────────────────────────────────────

export default function StatusPage() {
  const [surfaces, setSurfaces] = useState({});
  const [loading, setLoading] = useState(true);
  const [expectedGames, setExpectedGames] = useState(null);
  const [scheduleSource, setScheduleSource] = useState(null);
  const [lastCheck, setLastCheck] = useState(null);
  const timerRef = useRef(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const results = {};

    // Fetch schedule count — try MLB Stats API first, fall back to starting lineups
    let expGames = null;
    let schSource = null;
    const today = todayET();
    try {
      const r = await fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${today}`);
      if (r.ok) {
        const sched = await r.json();
        const games = sched.dates?.[0]?.games ?? [];
        expGames = games.length;
        schSource = 'MLB Stats API';
      }
    } catch { /* CORS or network — fall through */ }

    // Fetch all surfaces in parallel
    const fetches = SURFACES.map(async (s) => {
      try {
        const r = await fetch(s.file + '?t=' + Date.now());
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        results[s.key] = { data, error: false };
      } catch (err) {
        results[s.key] = { data: null, error: true, errorMsg: err.message };
      }
    });
    await Promise.all(fetches);

    // Fallback schedule source: starting lineups
    if (expGames == null && results.starting_lineups?.data) {
      expGames = results.starting_lineups.data.games?.length ?? null;
      schSource = 'Starting Lineups (fallback)';
    }
    // Second fallback: player projections game count
    if (expGames == null && results.player_projections?.data) {
      expGames = results.player_projections.data.games?.length ?? null;
      schSource = 'Player Projections (fallback)';
    }

    setExpectedGames(expGames);
    setScheduleSource(schSource);
    setSurfaces(results);
    setLoading(false);
    setLastCheck(new Date());
  }, []);

  useEffect(() => {
    fetchAll();
    timerRef.current = setInterval(fetchAll, AUTO_REFRESH_MS);
    return () => clearInterval(timerRef.current);
  }, [fetchAll]);

  // ── Compute per-surface health ───────────────────────────────────────────
  const healthMap = {};
  let redCount = 0, yellowCount = 0;
  SURFACES.forEach(s => {
    const entry = surfaces[s.key];
    if (!entry) return;
    const h = entry.error
      ? { color: '#ef4444', status: 'ERROR', detail: entry.errorMsg || 'Failed to load' }
      : computeHealth(s, entry.data, expectedGames);
    healthMap[s.key] = h;
    if (h.color === '#ef4444') redCount++;
    else if (h.color === '#eab308') yellowCount++;
  });

  const allHealthy = redCount === 0 && yellowCount === 0 && !loading;

  // ── Styles ─────────────────────────────────────────────────────────────────
  const pageStyle = {
    minHeight: '100vh',
    background: colors.navy,
    color: colors.text,
    padding: '24px 16px 60px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };
  const containerStyle = { maxWidth: 720, margin: '0 auto' };
  const titleStyle = {
    fontSize: 22, fontWeight: 800, color: '#fff',
    margin: '0 0 4px', letterSpacing: '0.5px',
  };
  const subtitleStyle = { fontSize: 13, color: colors.textMuted, margin: '0 0 20px' };
  const bannerBase = {
    padding: '14px 18px', borderRadius: 8, marginBottom: 20,
    fontSize: 15, fontWeight: 600, lineHeight: 1.4,
  };
  const cardStyle = {
    background: colors.navyLight, borderRadius: 8,
    padding: '14px 16px', marginBottom: 10,
    borderLeft: '4px solid',
  };
  const labelStyle = { fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 };
  const metaRow = {
    display: 'flex', flexWrap: 'wrap', gap: '6px 18px',
    fontSize: 13, color: colors.textMuted, marginTop: 6,
  };
  const badgeStyle = (bg) => ({
    display: 'inline-block', fontSize: 11, fontWeight: 700,
    padding: '2px 8px', borderRadius: 4,
    background: bg, color: bg === '#eab308' ? '#000' : '#fff',
    letterSpacing: '0.5px', marginLeft: 8, verticalAlign: 'middle',
  });
  const btnStyle = {
    background: 'transparent', border: `1px solid ${colors.textMuted}`,
    color: colors.text, padding: '6px 14px', borderRadius: 6,
    fontSize: 13, fontWeight: 600, cursor: 'pointer', marginLeft: 8,
  };
  const footerMetaStyle = {
    fontSize: 12, color: colors.textMuted, marginTop: 20,
    borderTop: `1px solid ${colors.navyLight}`, paddingTop: 12,
  };

  return (
    <>
      <Helmet>
        <title>System Status | Betrilo</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div style={pageStyle}>
        <div style={containerStyle}>
          {/* Title bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h1 style={titleStyle}>System Status</h1>
              <p style={subtitleStyle}>
                Pipeline health &amp; data freshness
                {lastCheck && <> — checked {fmtAbsolute(lastCheck)}</>}
              </p>
            </div>
            <button style={btnStyle} onClick={fetchAll} disabled={loading}>
              {loading ? 'Checking…' : 'Refresh'}
            </button>
          </div>

          {/* Top-line banner */}
          {!loading && (
            allHealthy ? (
              <div style={{ ...bannerBase, background: 'rgba(25,201,62,0.12)', border: `1px solid ${colors.green}` }}>
                <span role="img" aria-label="check">&#x2705;</span>&nbsp;
                All systems healthy — last updated {lastCheck ? fmtRelative(lastCheck) : '—'}
              </div>
            ) : (
              <div style={{ ...bannerBase, background: 'rgba(239,68,68,0.10)', border: '1px solid #ef4444' }}>
                <span role="img" aria-label="warning">&#x26A0;&#xFE0F;</span>&nbsp;
                Attention: {redCount > 0 && `${redCount} surface(s) stale/error`}
                {redCount > 0 && yellowCount > 0 && ', '}
                {yellowCount > 0 && `${yellowCount} surface(s) need review`}
                <div style={{ fontSize: 13, fontWeight: 400, marginTop: 4, color: colors.textMuted }}>
                  {SURFACES.filter(s => healthMap[s.key] && healthMap[s.key].color !== colors.green)
                    .map(s => `${s.label}: ${healthMap[s.key]?.status}`)
                    .join('  •  ')}
                </div>
              </div>
            )
          )}

          {/* Loading state */}
          {loading && (
            <div style={{ textAlign: 'center', padding: 40, color: colors.textMuted }}>
              Checking all surfaces…
            </div>
          )}

          {/* Per-surface cards */}
          {!loading && SURFACES.map(s => {
            const entry = surfaces[s.key];
            if (!entry) return null;
            const h = healthMap[s.key];
            const data = entry.data;
            const ts = data ? parseTS(s.getFreshness(data)) : null;
            const records = data ? s.getRecords(data) : null;
            const fileGames = data && !s.noGameCount ? s.getGames(data) : null;

            return (
              <div key={s.key} style={{ ...cardStyle, borderLeftColor: h?.color ?? colors.textMuted }}>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                  <p style={labelStyle}>{s.label}</p>
                  {h && <span style={badgeStyle(h.color)}>{h.status}</span>}
                </div>
                {entry.error ? (
                  <div style={{ ...metaRow, color: '#ef4444' }}>
                    Failed to load: {entry.errorMsg}
                  </div>
                ) : (
                  <div style={metaRow}>
                    <span title={ts ? ts.toISOString() : ''}>
                      {fmtAbsolute(ts)} ({fmtRelative(ts)})
                    </span>
                    {fileGames != null && (
                      <span>
                        {s.gamesLabel ?? 'Games'}: <strong style={{ color: '#fff' }}>
                          {fileGames}{expectedGames != null ? ` / ${expectedGames}` : ''}
                        </strong>
                        {expectedGames != null && fileGames !== expectedGames && ' ⚠'}
                      </span>
                    )}
                    {records && (
                      <span>
                        <strong style={{ color: '#fff' }}>{records.count}</strong> {records.label}
                      </span>
                    )}
                    {h?.detail && <span style={{ fontSize: 12 }}>{h.detail}</span>}
                    {s.key === 'health' && data?.verdict && (
                      <span>Verdict: <strong style={{ color: data.verdict === 'ALL GOOD' ? colors.green : '#eab308' }}>
                        {data.verdict}
                      </strong></span>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Team-drop guard warning */}
          {!loading && surfaces.player_projections?.data?.team_drop_guard && (
            <div style={{ ...bannerBase, background: 'rgba(239,68,68,0.10)', border: '1px solid #ef4444', marginTop: 14 }}>
              <strong style={{ color: '#ef4444' }}>TEAM-DROP GUARD FIRED</strong>
              <div style={{ fontSize: 13, fontWeight: 400, marginTop: 4, color: colors.textMuted }}>
                {surfaces.player_projections.data.team_drop_guard.map((w, i) => (
                  <div key={i}>{w}</div>
                ))}
              </div>
            </div>
          )}

          {/* Footer metadata */}
          <div style={footerMetaStyle}>
            Schedule source: {scheduleSource ?? 'unavailable'} •
            Expected games today: {expectedGames ?? '?'} •
            Auto-refresh: every 5 min •
            <span style={{ opacity: 0.6 }}> This page is unlisted — not linked from site navigation.</span>
          </div>
        </div>
      </div>
    </>
  );
}
