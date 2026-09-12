import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { dark } from '../theme';
import SortableTable from '../components/SortableTable';
import NflPageWrapper from '../components/NflPageWrapper';
import fmtTime from '../utils/fmtTime';

const POS_TABS = ['All', 'QB', 'RB', 'WR', 'TE'];
const DVP_LEVELS = ['Smash', 'Favorable', 'Neutral', 'Tough', 'Avoid'];
const DVP_COLORS = {
  Smash: dark.dvpSmash, Favorable: dark.dvpFavorable,
  Neutral: dark.dvpNeutral, Tough: dark.dvpTough, Avoid: dark.dvpAvoid,
};

export default function NflProjectionsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activePos, setActivePos] = useState('All');
  const [selectedGame, setSelectedGame] = useState('all');
  const [injuryFilter, setInjuryFilter] = useState('all');
  const [selectedDvp, setSelectedDvp] = useState(new Set());

  useEffect(() => {
    fetch('/data/nfl_player_projections_latest.json')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const toggleDvp = (level) => {
    setSelectedDvp(prev => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level); else next.add(level);
      return next;
    });
  };

  const hasActiveFilters = selectedGame !== 'all' || injuryFilter !== 'all' || selectedDvp.size > 0;
  const clearFilters = () => {
    setSelectedGame('all');
    setInjuryFilter('all');
    setSelectedDvp(new Set());
  };

  const players = useMemo(() => {
    if (!data?.players) return [];
    let rows = data.players.map(p => ({
      player_name: p.player_name,
      team: p.team,
      position: p.position,
      opponent: p.opponent,
      game_id: p.game_id || '',
      dc: p.depth_chart_rank,
      dvp_rank: p.dvp?.rank,
      dvp_label: p.dvp?.label,
      injury_status: p.injury?.status || '',
      rec_yds: p.projections?.rec_yds,
      receptions: p.projections?.receptions,
      targets: p.projections?.targets,
      rec_tds: p.projections?.rec_tds,
      rush_yds: p.projections?.rush_yds,
      carries: p.projections?.carries,
      rush_tds: p.projections?.rush_tds,
      pass_yds: p.projections?.pass_yds,
      pass_tds: p.projections?.pass_tds,
      completions: p.projections?.completions,
      target_share: p.usage?.target_share,
    }));
    // Position filter
    if (activePos !== 'All') rows = rows.filter(r => r.position === activePos);
    // Matchup filter
    if (selectedGame !== 'all') rows = rows.filter(r => r.game_id === selectedGame);
    // Injury filter
    if (injuryFilter === 'healthy') rows = rows.filter(r => !r.injury_status);
    else if (injuryFilter === 'designated') rows = rows.filter(r => !!r.injury_status);
    // DvP filter (multi-select — empty set = all)
    if (selectedDvp.size > 0) rows = rows.filter(r => r.dvp_label && selectedDvp.has(r.dvp_label));
    return rows;
  }, [data, activePos, selectedGame, injuryFilter, selectedDvp]);

  // Build matchup dropdown options from games array, sorted by kickoff
  const matchupOptions = useMemo(() => {
    if (!data?.games) return [];
    return data.games.map(g => ({
      value: g.game_id,
      label: `${fmtTime(g.gameday, g.gametime)} — ${g.away_team} @ ${g.home_team}`,
    }));
  }, [data]);

  if (error) return <div style={{ textAlign: 'center', padding: '60px', color: dark.textSecondary, background: dark.pageBg, minHeight: '100vh' }}>Projections data is unavailable right now.</div>;

  const dvpFormat = (v) => {
    const c = DVP_COLORS;
    return <span style={{ color: c[v] || dark.textMuted, fontWeight: 600 }}>{v || '—'}</span>;
  };
  const injFormat = (v) => {
    if (!v) return null;
    const c = { Questionable: dark.injQuestionable, IR: dark.injIR, PUP: dark.injPUP, Suspended: dark.injSuspended, 'Did Not Report': dark.injIR, Out: dark.injIR, Doubtful: dark.injQuestionable, Unknown: dark.injUnknown };
    return <span style={{ color: c[v] || dark.textMuted, fontWeight: 600, fontSize: '11px' }}>{v}</span>;
  };

  const baseColumns = [
    { key: 'player_name', label: 'Player', sortable: true, width: '140px' },
    { key: 'team', label: 'Team', sortable: true, width: '45px' },
    { key: 'position', label: 'Pos', sortable: true, align: 'center', width: '35px' },
    { key: 'opponent', label: 'Opp', sortable: true, width: '45px' },
    { key: 'dvp_label', label: 'DvP', sortable: true, format: dvpFormat },
    { key: 'injury_status', label: 'Inj', sortable: true, align: 'center', format: injFormat },
  ];

  let statColumns = [];
  if (activePos === 'QB') {
    statColumns = [
      { key: 'pass_yds', label: 'Pass Yds', sortable: true, align: 'right' },
      { key: 'pass_tds', label: 'Pass TD', sortable: true, align: 'right', format: v => v?.toFixed(1) },
      { key: 'completions', label: 'Comp', sortable: true, align: 'right' },
      { key: 'rush_yds', label: 'Rush Yds', sortable: true, align: 'right' },
    ];
  } else if (activePos === 'RB') {
    statColumns = [
      { key: 'rush_yds', label: 'Rush Yds', sortable: true, align: 'right' },
      { key: 'carries', label: 'Carries', sortable: true, align: 'right' },
      { key: 'rush_tds', label: 'Rush TD', sortable: true, align: 'right', format: v => v?.toFixed(2) },
      { key: 'rec_yds', label: 'Rec Yds', sortable: true, align: 'right' },
      { key: 'receptions', label: 'Rec', sortable: true, align: 'right' },
    ];
  } else if (activePos === 'WR' || activePos === 'TE') {
    statColumns = [
      { key: 'rec_yds', label: 'Rec Yds', sortable: true, align: 'right' },
      { key: 'receptions', label: 'Rec', sortable: true, align: 'right' },
      { key: 'targets', label: 'Tgt', sortable: true, align: 'right' },
      { key: 'rec_tds', label: 'Rec TD', sortable: true, align: 'right', format: v => v?.toFixed(2) },
      { key: 'target_share', label: 'Tgt%', sortable: true, align: 'right', format: v => v ? (v * 100).toFixed(0) + '%' : '—' },
    ];
  } else {
    statColumns = [
      { key: 'pass_yds', label: 'Pass Yds', sortable: true, align: 'right' },
      { key: 'rush_yds', label: 'Rush Yds', sortable: true, align: 'right' },
      { key: 'rec_yds', label: 'Rec Yds', sortable: true, align: 'right' },
      { key: 'receptions', label: 'Rec', sortable: true, align: 'right' },
    ];
  }

  const columns = [...baseColumns, ...statColumns,
    { key: 'dc', label: 'DC', sortable: true, align: 'center', format: v => v <= 3 ? v : '—' },
  ];

  const defaultSortKey = activePos === 'QB' ? 'pass_yds' : activePos === 'RB' ? 'rush_yds' : 'rec_yds';

  return (
    <>
      <Helmet>
        <title>{data?.week ? `NFL Player Projections — Week ${data.week} | Betrilo` : 'NFL Player Projections | Betrilo'}</title>
        <meta name="description" content="NFL player projections for QB, RB, WR, TE — passing, rushing, receiving yards and touchdowns. Model in private validation, not published picks." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <NflPageWrapper generatedAt={data?.generated_at} freshLabel={data?.week1_mode ? 'Prior-season projections' : `Week ${data?.week || ''}`}>
        <h1 style={{ color: dark.textPrimary, fontSize: '30px', fontWeight: 800, marginBottom: '4px' }}>
          NFL Player Projections
        </h1>
        <p style={{ color: dark.textSecondary, fontSize: '13px', marginBottom: '16px' }}>
          {data?.week ? `Week ${data.week} ${data.season}` : ''}
          {data?.week1_mode && ' — Prior-season projections (no 2026 game data yet)'}
        </p>

        {/* Position tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
          {POS_TABS.map(pos => (
            <button key={pos} onClick={() => setActivePos(pos)} style={{
              background: activePos === pos ? dark.accentBg : dark.inactiveBg,
              color: activePos === pos ? dark.accentText : dark.inactiveText,
              border: activePos === pos ? 'none' : `1px solid ${dark.inactiveBorder}`,
              padding: '7px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
            }}>{pos}</button>
          ))}
        </div>

        {/* Filter bar: matchup + injury + DvP + clear */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center',
          padding: '10px 14px', background: dark.surfaceBg, borderRadius: '8px', marginBottom: '12px',
        }}>
          {/* Matchup dropdown */}
          <select
            value={selectedGame}
            onChange={e => setSelectedGame(e.target.value)}
            style={{
              background: dark.inputBg, color: dark.inputText, border: `1px solid ${dark.inputBorder}`,
              padding: '6px 10px', borderRadius: '4px', fontSize: '13px', maxWidth: '280px',
            }}
          >
            <option value="all">Matchup: All</option>
            {matchupOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* Injury dropdown */}
          <select
            value={injuryFilter}
            onChange={e => setInjuryFilter(e.target.value)}
            style={{
              background: dark.inputBg, color: dark.inputText, border: `1px solid ${dark.inputBorder}`,
              padding: '6px 10px', borderRadius: '4px', fontSize: '13px',
            }}
          >
            <option value="all">Injury: All</option>
            <option value="healthy">Healthy Only</option>
            <option value="designated">Has Designation</option>
          </select>

          {/* DvP toggle pills */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ color: dark.textSecondary, fontSize: '12px', marginRight: '2px' }}>DvP:</span>
            {DVP_LEVELS.map(level => {
              const active = selectedDvp.has(level);
              return (
                <button
                  key={level}
                  onClick={() => toggleDvp(level)}
                  style={{
                    background: active ? DVP_COLORS[level] : dark.inactiveBg,
                    color: active ? dark.pageBg : dark.textMuted,
                    border: active ? 'none' : `1px solid ${dark.inactiveBorder}`,
                    padding: '3px 8px', borderRadius: '4px', fontSize: '11px',
                    fontWeight: active ? 700 : 500, cursor: 'pointer',
                  }}
                >{level}</button>
              );
            })}
          </div>

          {/* Clear all */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              style={{
                background: 'none', border: 'none', color: dark.textSecondary,
                fontSize: '11px', cursor: 'pointer', textDecoration: 'underline',
                marginLeft: 'auto', padding: '4px',
              }}
            >Clear filters</button>
          )}
        </div>

        <SortableTable
          columns={columns} data={players}
          defaultSort={{ key: defaultSortKey, order: 'desc' }}
          filters={[]}
          searchKey="player_name" searchPlaceholder="Search players..."
          loading={loading}
          lastRefreshed={data?.generated_at ? new Date(data.generated_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : null}
          emptyMessage="No players match your filters"
        />

        <div style={{ marginTop: '16px', padding: '12px 16px', background: dark.surfaceBg, borderRadius: '8px', fontSize: '12px', color: dark.textSecondary, lineHeight: 1.6 }}>
          <strong style={{ color: dark.textPrimary }}>Key:</strong>{' '}
          DvP = Defense vs Position (Rank 1 = easiest matchup) |{' '}
          DC = Depth Chart rank (1 = starter) | Inj = Injury status | Tgt% = Target share |{' '}
          <span style={{ color: dark.dvpSmash }}>Smash</span>{' / '}
          <span style={{ color: dark.dvpFavorable }}>Favorable</span>{' / '}
          <span style={{ color: dark.dvpNeutral }}>Neutral</span>{' / '}
          <span style={{ color: dark.dvpTough }}>Tough</span>{' / '}
          <span style={{ color: dark.dvpAvoid }}>Avoid</span>
        </div>
      </NflPageWrapper>
    </>
  );
}
