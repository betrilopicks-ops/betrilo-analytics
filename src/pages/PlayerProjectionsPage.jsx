import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { colors } from '../theme';

export default function PlayerProjectionsPage() {
  const [games, setGames] = useState([]);
  const [slateDate, setSlateDate] = useState('');
  const [selectedGame, setSelectedGame] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('proj_hits');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState('');
  const [lineupStatus, setLineupStatus] = useState('projected');

  useEffect(() => {
    fetch('/data/player_projections_latest.json')
      .then((res) => { if (!res.ok) throw new Error('fetch failed'); return res.json(); })
      .then((data) => {
        setGames(data.games || []);
        setSlateDate(data.slate_date || '');
        setLastRefreshed(data.last_refreshed || '');
        setLineupStatus(data.lineup_status || 'projected');
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const isAllGames = selectedGame === 'all';

  const allRows = useMemo(() => {
    const build = (gameList) => {
      const rows = [];
      gameList.forEach((g) => {
        const matchup = `${g.away_team} @ ${g.home_team}`;
        (g.batters || []).forEach((b) => rows.push({ ...b, matchup }));
      });
      return rows;
    };
    if (!games.length) return [];
    if (isAllGames) return build(games);
    const g = games[parseInt(selectedGame, 10)];
    return g ? build([g]) : [];
  }, [games, selectedGame, isAllGames]);

  const filteredRows = useMemo(() => {
    let rows = allRows;
    if (searchText) {
      const s = searchText.toLowerCase();
      rows = rows.filter((r) =>
        (r.player && r.player.toLowerCase().includes(s)) ||
        (r.team && r.team.toLowerCase().includes(s)));
    }
    const textCols = ['player', 'team', 'matchup'];
    const isText = textCols.includes(sortBy);
    return [...rows].sort((a, b) => {
      let av = a[sortBy], bv = b[sortBy];
      if (isText) {
        av = (av || '').toString().toLowerCase();
        bv = (bv || '').toString().toLowerCase();
        if (av < bv) return sortOrder === 'asc' ? -1 : 1;
        if (av > bv) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      }
      av = typeof av === 'number' ? av : -Infinity;
      bv = typeof bv === 'number' ? bv : -Infinity;
      return sortOrder === 'asc' ? av - bv : bv - av;
    });
  }, [allRows, searchText, sortBy, sortOrder]);

  const handleSort = (key, type) => {
    if (sortBy === key) setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(key); setSortOrder(type === 'text' ? 'asc' : 'desc'); }
  };

  // Color by projected hits — Betrilo green scale (was the bet sheet's green/yellow/red)
  const projHitsColor = (v) => {
    if (typeof v !== 'number') return 'transparent';
    if (v >= 1.0) return 'rgba(25,201,62,0.18)';   // strong — brand green
    if (v >= 0.75) return 'rgba(25,201,62,0.07)';  // moderate — faint green
    return 'transparent';                           // low — none
  };

  const columns = [
    { key: 'player', label: 'Player', type: 'text', align: 'left' },
    { key: 'team', label: 'Team', type: 'text', align: 'left' },
    ...(isAllGames ? [{ key: 'matchup', label: 'Matchup', type: 'text', align: 'left' }] : []),
    { key: 'proj_hits', label: 'Proj H', type: 'num', align: 'center' },
    { key: 'proj_tb', label: 'Proj TB', type: 'num', align: 'center' },
    { key: 'proj_hr', label: 'Proj HR', type: 'num', align: 'center' },
    { key: 'proj_bb', label: 'Proj BB', type: 'num', align: 'center' },
    { key: 'l10_hit_pct', label: 'L10 Hit%', type: 'num', align: 'center' },
    { key: 'vp_pa', label: 'vP PA', type: 'num', align: 'center' },
    { key: 'vp_h', label: 'vP H', type: 'num', align: 'center' },
    { key: 'vp_hr', label: 'vP HR', type: 'num', align: 'center' },
    { key: 'vp_xwoba', label: 'vP xwOBA', type: 'num', align: 'center' },
    { key: 'h_streak', label: 'H Streak', type: 'num', align: 'center' },
  ];

  const fmt = (v, dec) => (typeof v === 'number' ? v.toFixed(dec) : '—');
  const fmtPct = (v) => (typeof v === 'number' ? `${Math.round(v * 100)}%` : '—');
  const fmtInt = (v) => (typeof v === 'number' ? String(Math.round(v)) : '—');
  const fmt3 = (v) => (typeof v === 'number' ? v.toFixed(3).replace(/^0/, '') : '—');

  const cellValue = (r, key) => {
    switch (key) {
      case 'proj_hits': return fmt(r.proj_hits, 2);
      case 'proj_tb': return fmt(r.proj_tb, 2);
      case 'proj_hr': return fmt(r.proj_hr, 2);
      case 'proj_bb': return fmt(r.proj_bb, 2);
      case 'l10_hit_pct': return fmtPct(r.l10_hit_pct);
      case 'vp_pa': return fmtInt(r.vp_pa);
      case 'vp_h': return fmtInt(r.vp_h);
      case 'vp_hr': return fmtInt(r.vp_hr);
      case 'vp_xwoba': return fmt3(r.vp_xwoba);
      case 'h_streak': return fmtInt(r.h_streak);
      default: return r[key];
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: colors.textMuted }}>Loading player projections…</div>;
  if (error) return (
    <div style={{ textAlign: 'center', padding: '60px', color: colors.textMuted }}>
      Player projections unavailable right now. Check back after today's slate posts.
    </div>
  );

  const niceDate = /^\d{4}-\d{2}-\d{2}$/.test(slateDate)
    ? new Date(slateDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  const niceRefreshed = lastRefreshed
    ? (() => {
        try {
          return new Date(lastRefreshed).toLocaleTimeString('en-US', {
            hour: 'numeric', minute: '2-digit', hour12: true,
            timeZone: 'America/New_York',
          }) + ' ET';
        } catch { return ''; }
      })()
    : '';

  const title = 'MLB Player Projections — Hits, TB, HR | Betrilo';
  const desc = 'Daily MLB batter projections for hits, total bases, and home runs based on opposing pitcher matchups.';
  const url = 'https://betrilo.com/mlb/player-projections';
  return (
    <div style={{ maxWidth: 1600, margin: '0 auto', padding: '24px 16px 60px' }}>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={url} />
      </Helmet>
      <div style={{ textAlign: 'center', marginBottom: '18px' }}>
        <h1 style={{ color: colors.navy, fontSize: '30px', fontWeight: 800, margin: 0 }}>Player Projections</h1>
        <p style={{ color: '#5a6b76', fontSize: '14px', margin: '6px 0 0' }}>
          Full projections, matchup splits, and streaks for every batter. {niceDate && `Slate: ${niceDate}.`}
        </p>
        {niceRefreshed && (
          <p style={{ color: '#5a6b76', fontSize: '13px', margin: '6px 0 0' }}>
            {lineupStatus === 'confirmed' ? 'Lineups & projections' : 'Projections'} last refreshed {niceRefreshed}
            {' — '}
            <span style={{ color: '#8a9ba8' }}>
              updates on confirmed lineups throughout the day.{' '}
              <a href="/best-bets" style={{ color: colors.navy, textDecoration: 'underline' }}>Best Bets</a>
              {' '}shows today's locked morning picks.
            </span>
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
        <select value={selectedGame} onChange={(e) => setSelectedGame(e.target.value)}
          style={{ padding: '8px 12px', fontSize: '14px', borderRadius: '6px', border: '1px solid #cdd8e0', minWidth: '260px' }}>
          <option value="all">All Games</option>
          {games.map((g, idx) => (
            <option key={idx} value={idx}>{g.time ? `${g.time} - ` : ''}{g.away_team} @ {g.home_team}</option>
          ))}
        </select>
        <input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search player or team"
          style={{ padding: '8px 12px', fontSize: '14px', borderRadius: '6px', border: '1px solid #cdd8e0', minWidth: '200px' }} />
      </div>

      {!isAllGames && games[parseInt(selectedGame, 10)] && (() => {
        const g = games[parseInt(selectedGame, 10)];
        return (
          <div style={{ textAlign: 'center', marginBottom: '14px', color: colors.navy, fontSize: '15px', fontWeight: 600 }}>
            Projected: {g.away_team} {g.away_score ?? '—'} – {g.home_team} {g.home_score ?? '—'}
            {g.winner && <span style={{ color: colors.green }}>  ·  Lean: {g.winner}</span>}
          </div>
        );
      })()}

      <div style={{ overflowX: 'auto', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', background: '#fff' }}>
          <thead style={{ background: colors.navy }}>
            <tr>
              {columns.map((col) => {
                const sticky = col.key === 'player';
                return (
                <th key={col.key} onClick={() => handleSort(col.key, col.type)} scope="col"
                  aria-sort={sortBy === col.key ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                  style={{ padding: '10px 11px', textAlign: col.align, cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
                    color: sortBy === col.key ? colors.green : '#fff', fontSize: '11px', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.4px',
                    ...(sticky ? { position: 'sticky', left: 0, zIndex: 3, background: colors.navy } : {}) }}>
                  {col.label}{sortBy === col.key ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
              );})}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((r, idx) => {
              const rowBg = idx % 2 ? '#fafcfd' : '#fff';
              return (
              <tr key={idx} style={{ borderTop: '1px solid #eef2f5', background: rowBg }}>
                <td style={{ padding: '9px 11px', textAlign: 'left', fontWeight: 600, color: colors.navy, whiteSpace: 'nowrap', position: 'sticky', left: 0, zIndex: 1, background: rowBg, borderRight: '2px solid #e3e9ed' }}>{r.player}</td>
                <td style={{ padding: '9px 11px', textAlign: 'left', color: '#5a6b76' }}>{r.team}</td>
                {isAllGames && <td style={{ padding: '9px 11px', textAlign: 'left', color: '#5a6b76' }}>{r.matchup}</td>}
                <td style={{ padding: '9px 11px', textAlign: 'center', fontWeight: 700, color: colors.navy, background: projHitsColor(r.proj_hits) }}>{cellValue(r, 'proj_hits')}</td>
                <td style={{ padding: '9px 11px', textAlign: 'center' }}>{cellValue(r, 'proj_tb')}</td>
                <td style={{ padding: '9px 11px', textAlign: 'center' }}>{cellValue(r, 'proj_hr')}</td>
                <td style={{ padding: '9px 11px', textAlign: 'center' }}>{cellValue(r, 'proj_bb')}</td>
                <td style={{ padding: '9px 11px', textAlign: 'center' }}>{cellValue(r, 'l10_hit_pct')}</td>
                <td style={{ padding: '9px 11px', textAlign: 'center', color: '#5a6b76' }}>{cellValue(r, 'vp_pa')}</td>
                <td style={{ padding: '9px 11px', textAlign: 'center', color: '#5a6b76' }}>{cellValue(r, 'vp_h')}</td>
                <td style={{ padding: '9px 11px', textAlign: 'center', color: '#5a6b76' }}>{cellValue(r, 'vp_hr')}</td>
                <td style={{ padding: '9px 11px', textAlign: 'center', color: '#5a6b76' }}>{cellValue(r, 'vp_xwoba')}</td>
                <td style={{ padding: '9px 11px', textAlign: 'center' }}>{cellValue(r, 'h_streak')}</td>
              </tr>
            );})}
          </tbody>
        </table>
        {filteredRows.length === 0 && <div style={{ padding: '24px', textAlign: 'center', color: colors.textMuted }}>No batters match those filters.</div>}
      </div>
      <div style={{ marginTop: '10px', padding: '12px 14px', background: '#f4f7f9', borderRadius: '8px', fontSize: '12px', color: '#5a6b76', lineHeight: 1.6 }}>
        <strong style={{ color: colors.navy }}>Key:</strong> Model projections for today's slate. <strong>Proj H/HR/R/RBI</strong> — projected hits, home runs, runs, RBIs. <strong>vP AVG/xwOBA</strong> — career performance vs. today's probable pitcher. <strong>H Streak</strong> — current games with a hit. Green shading marks projected hits ≥ 0.75. {filteredRows.length} batters{isAllGames ? ` across ${games.length} games` : ''}.
      </div>
    </div>
  );
}
