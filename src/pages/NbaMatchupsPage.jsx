import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { dark } from '../theme';

/** Today's date in ET as YYYY-MM-DD */
function todayET() {
  return new Date().toLocaleString('sv-SE', { timeZone: 'America/New_York' }).slice(0, 10);
}

/** Format generated_at as human-readable ET time */
function fmtUpdatedTime(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d)) return null;
  return d.toLocaleString('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }) + ' ET';
}

/** Parse tip time for sorting — extract hour:minute from e.g. "6:30 PM EST" */
function tipTimeSortKey(tip) {
  if (!tip) return 9999;
  const m = tip.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return 9999;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ampm = m[3].toUpperCase();
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}

/* ── Player row inside the expandable section ──────────────────────────────── */
function PlayerRow({ p }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 36px 42px 42px 42px 42px',
      gap: '4px',
      alignItems: 'center',
      padding: '5px 0',
      borderBottom: `1px solid ${dark.border}`,
      fontSize: '13px',
    }}>
      <span style={{ color: dark.textPrimary, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {p.player}
      </span>
      <span style={{ color: dark.textMuted, textAlign: 'center', fontSize: '11px' }}>{p.position}</span>
      <span style={{ color: dark.textPrimary, textAlign: 'right', fontWeight: 600 }}>{p.proj_pts}</span>
      <span style={{ color: dark.textSecondary, textAlign: 'right' }}>{p.proj_reb}</span>
      <span style={{ color: dark.textSecondary, textAlign: 'right' }}>{p.proj_ast}</span>
      <span style={{ color: dark.textSecondary, textAlign: 'right' }}>{p.proj_3pm}</span>
    </div>
  );
}

/* ── Player section header ──────────────────────────────────────────────────── */
function PlayerHeader() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 36px 42px 42px 42px 42px',
      gap: '4px',
      padding: '4px 0',
      fontSize: '11px',
      color: dark.textMuted,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    }}>
      <span>Player</span>
      <span style={{ textAlign: 'center' }}>Pos</span>
      <span style={{ textAlign: 'right' }}>PTS</span>
      <span style={{ textAlign: 'right' }}>REB</span>
      <span style={{ textAlign: 'right' }}>AST</span>
      <span style={{ textAlign: 'right' }}>3PM</span>
    </div>
  );
}

/* ── Collapsible injury list ────────────────────────────────────────────────── */
function InjuryList({ injuries }) {
  const [expanded, setExpanded] = useState(false);
  if (!injuries || injuries.length === 0) return null;

  const show = expanded ? injuries : injuries.slice(0, 3);
  const hasMore = injuries.length > 3;

  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ fontSize: '11px', color: dark.textMuted, fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Injuries
      </div>
      {show.map((inj, i) => (
        <div key={i} style={{ fontSize: '12px', color: dark.statusAmber, padding: '1px 0' }}>
          {inj.player || inj.name} — {inj.status || inj.injury_status || 'Unknown'}
        </div>
      ))}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none', border: 'none', color: dark.accentBg,
            fontSize: '11px', cursor: 'pointer', padding: '2px 0', fontWeight: 600,
          }}
        >
          {expanded ? 'Show less' : `+${injuries.length - 3} more`}
        </button>
      )}
    </div>
  );
}

/* ── Single game card ──────────────────────────────────────────────────────── */
function GameCard({ game }) {
  const [playersOpen, setPlayersOpen] = useState(false);

  const delta = game.delta_vs_market;
  const deltaColor = delta > 0 ? dark.statusGreen : delta < 0 ? dark.statusRed : dark.textSecondary;
  const deltaStr = delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1);

  return (
    <div style={{
      background: dark.surfaceBg,
      borderRadius: '10px',
      padding: '18px 20px',
      marginBottom: '14px',
      border: `1px solid ${dark.border}`,
    }}>
      {/* Header: matchup + tip time */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: dark.textPrimary }}>
          {game.away_team} @ {game.home_team}
        </h2>
        <span style={{ color: dark.textMuted, fontSize: '13px', fontWeight: 600 }}>
          {game.tip_time_et}
        </span>
      </div>

      {/* Projected score */}
      <div style={{ fontSize: '32px', fontWeight: 800, color: dark.textPrimary, marginBottom: '8px', letterSpacing: '-0.5px' }}>
        {game.away_proj_score} &ndash; {game.home_proj_score}
      </div>

      {/* Totals row */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '14px', marginBottom: '6px' }}>
        <span style={{ color: dark.textSecondary }}>
          Proj Total: <strong style={{ color: dark.textPrimary }}>{game.proj_total}</strong>
        </span>
        <span style={{ color: dark.textSecondary }}>
          Market: <strong style={{ color: dark.textPrimary }}>{game.market_total}</strong>
        </span>
        <span style={{ color: dark.textSecondary }}>
          Delta: <strong style={{ color: deltaColor }}>{deltaStr}</strong>
        </span>
      </div>

      {/* Blowout badge */}
      {game.blowout_flag && (
        <span style={{
          display: 'inline-block',
          background: 'rgba(232,168,56,0.15)',
          color: dark.statusAmber,
          fontSize: '11px',
          fontWeight: 700,
          padding: '3px 10px',
          borderRadius: '999px',
          border: `1px solid ${dark.statusAmber}`,
          marginTop: '4px',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
        }}>
          Projected Blowout
        </span>
      )}

      {/* Injuries */}
      <InjuryList injuries={game.injuries} />

      {/* Expandable top-5 players */}
      <div style={{ marginTop: '12px' }}>
        <button
          onClick={() => setPlayersOpen(!playersOpen)}
          style={{
            background: 'none', border: 'none', color: dark.accentBg,
            fontSize: '13px', cursor: 'pointer', padding: '4px 0',
            fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px',
          }}
        >
          {playersOpen ? '\u25BC' : '\u25B6'} Top Players
        </button>
        {playersOpen && (
          <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Away */}
            <div>
              <div style={{ color: dark.textMuted, fontSize: '12px', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {game.away_team}
              </div>
              <PlayerHeader />
              {(game.away_top_players || []).map((p, i) => <PlayerRow key={i} p={p} />)}
            </div>
            {/* Home */}
            <div>
              <div style={{ color: dark.textMuted, fontSize: '12px', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {game.home_team}
              </div>
              <PlayerHeader />
              {(game.home_top_players || []).map((p, i) => <PlayerRow key={i} p={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main page component ───────────────────────────────────────────────────── */
export default function NbaMatchupsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/data/nba_matchups_latest.json')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: dark.textSecondary, background: dark.pageBg, minHeight: '100vh' }}>
        Matchups data is unavailable right now.
      </div>
    );
  }

  const isSample = data?.is_sample === true;
  const today = todayET();
  const slateIsStale = data && data.slate_date !== today;
  const isStaleOrUpdating = isSample || slateIsStale;
  const games = data?.games || [];
  const sortedGames = [...games].sort((a, b) => tipTimeSortKey(a.tip_time_et) - tipTimeSortKey(b.tip_time_et));
  const isLiveSlate = !loading && data && !isSample && !slateIsStale && games.length > 0;
  const isNoGames = !loading && data && !isSample && !slateIsStale && games.length === 0;

  const updatedTime = fmtUpdatedTime(data?.generated_at);

  return (
    <>
      <Helmet>
        <title>NBA Matchups &mdash; Betrilo</title>
        <meta name="description" content="Model-driven NBA game matchup projections with team scores and player breakdowns." />
      </Helmet>

      <div style={{ background: dark.pageBg, minHeight: '100vh', padding: '24px 16px 60px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          <h1 style={{ color: dark.textPrimary, fontSize: '30px', fontWeight: 800, marginBottom: '4px' }}>
            NBA Matchups
          </h1>
          <p style={{ color: dark.textSecondary, fontSize: '13px', marginBottom: updatedTime ? '2px' : '16px' }}>
            {data?.season || ''} {data?.slate_date ? `\u00B7 ${data.slate_date}` : ''}
          </p>
          {updatedTime && (
            <p style={{ color: dark.textMuted, fontSize: '12px', marginBottom: '16px' }}>
              Updated {updatedTime}
            </p>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '80px', color: dark.textSecondary }}>
              Loading matchups...
            </div>
          )}

          {/* Stale / updating state */}
          {!loading && isStaleOrUpdating && (
            <div style={{
              background: '#3d2e0a',
              border: `1px solid ${dark.statusAmber}`,
              borderRadius: '8px',
              padding: '24px 18px',
              marginBottom: '16px',
              textAlign: 'center',
            }}>
              <div style={{ color: dark.statusAmber, fontWeight: 700, fontSize: '16px' }}>
                Matchups updating &mdash; check back shortly
              </div>
            </div>
          )}

          {/* No games today */}
          {isNoGames && (
            <div style={{
              textAlign: 'center', padding: '80px 20px',
              color: dark.textSecondary, fontSize: '18px',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>&#127936;</div>
              No NBA games today
            </div>
          )}

          {/* Live slate — game cards */}
          {isLiveSlate && sortedGames.map((game, i) => (
            <GameCard key={`${game.away_team}-${game.home_team}-${i}`} game={game} />
          ))}

          {/* Disclaimer */}
          <div style={{
            marginTop: '24px', textAlign: 'center',
            color: dark.textMuted, fontSize: '11px', lineHeight: 1.6,
          }}>
            21+ | Gambling problem? Call 1-800-GAMBLER
          </div>
        </div>
      </div>
    </>
  );
}
