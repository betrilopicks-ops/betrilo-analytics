import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { dark } from '../theme';
import SortableTable from '../components/SortableTable';
import NflPageWrapper from '../components/NflPageWrapper';
import NflGameLogModal from '../components/NflGameLogModal';
import fmtTime from '../utils/fmtTime';

const POS_TABS = ['All', 'QB', 'RB', 'WR', 'TE'];
const DVP_LEVELS = ['Smash', 'Favorable', 'Neutral', 'Tough', 'Avoid'];
const DVP_COLORS = {
  Smash: dark.dvpSmash, Favorable: dark.dvpFavorable,
  Neutral: dark.dvpNeutral, Tough: dark.dvpTough, Avoid: dark.dvpAvoid,
};

// Primary market per position for the Gap column
const PRIMARY_MARKET = { QB: 'pass_yds', RB: 'rush_yds', WR: 'rec_yds', TE: 'rec_yds' };

/** Format a stat cell showing projection + line + diff when a line exists. */
const statWithLine = (lineKey, decimals = 1) => (v, row) => {
  if (v == null) return '—';
  const line = row[lineKey];
  const fmt = n => n != null ? Number(n).toFixed(decimals) : null;
  const projStr = fmt(v);
  if (line == null) return projStr;
  const diff = v - line;
  const diffSign = diff > 0 ? '+' : '';
  return (
    <div style={{ lineHeight: 1.3 }}>
      <div>{projStr}</div>
      <div style={{ fontSize: '10px', color: dark.textMuted }}>
        Ln {fmt(line)}{' '}
        <span style={{ color: Math.abs(diff) > 0.05 ? (diff > 0 ? dark.statusGreen : dark.statusAmber) : dark.textMuted }}>
          ({diffSign}{fmt(diff)})
        </span>
      </div>
    </div>
  );
};

export default function NflProjectionsPage() {
  const [data, setData] = useState(null);
  const [gameLogs, setGameLogs] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activePos, setActivePos] = useState('All');
  const [selectedGame, setSelectedGame] = useState('all');
  const [injuryFilter, setInjuryFilter] = useState('all');
  const [selectedDvp, setSelectedDvp] = useState(new Set());
  const [modalPlayer, setModalPlayer] = useState(null);

  useEffect(() => {
    fetch('/data/nfl_player_projections_latest.json')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
    fetch(`/data/nfl_game_logs_${new Date().getFullYear()}.json`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setGameLogs(d))
      .catch(() => {});
    fetch('/data/nfl_accuracy_latest.json')
      .then(r => r.ok ? r.json() : null)
      .then(d => setAccuracy(d))
      .catch(() => {});
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
    const logPlayers = gameLogs?.players || {};
    let rows = data.players.map(p => {
      const hasLog = !!logPlayers[p.player_id];
      const ln = p.lines || {};
      // Compute gap for sorting: primary market's absolute gap
      const pm = PRIMARY_MARKET[p.position];
      const proj_pm = p.projections?.[pm];
      const line_pm = ln[pm];
      const gap = (proj_pm != null && line_pm != null) ? proj_pm - line_pm : null;
      return {
        player_id: p.player_id,
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
        // Book lines
        rec_yds_line: ln.rec_yds,
        receptions_line: ln.receptions,
        rush_yds_line: ln.rush_yds,
        pass_yds_line: ln.pass_yds,
        pass_tds_line: ln.pass_tds,
        // Gap for sorting (raw difference, primary market)
        gap: gap,
        _clickable: hasLog,
      };
    });
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
  }, [data, gameLogs, activePos, selectedGame, injuryFilter, selectedDvp]);

  const handleRowClick = useCallback((row) => {
    if (!gameLogs?.players?.[row.player_id]) return;
    const log = gameLogs.players[row.player_id];
    setModalPlayer({
      ...log,
      currentOpponent: row.opponent,
    });
  }, [gameLogs]);

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
    { key: 'player_name', label: 'Player', sortable: true, width: '140px',
      format: (v, row) => row._clickable ? <span>{v} <span style={{ color: dark.textMuted, fontSize: '10px' }}>&#9656;</span></span> : v },
    { key: 'team', label: 'Team', sortable: true, width: '45px' },
    { key: 'position', label: 'Pos', sortable: true, align: 'center', width: '35px' },
    { key: 'opponent', label: 'Opp', sortable: true, width: '45px' },
    { key: 'dvp_label', label: 'DvP', sortable: true, format: dvpFormat },
    { key: 'injury_status', label: 'Inj', sortable: true, align: 'center', format: injFormat },
  ];

  let statColumns = [];
  if (activePos === 'QB') {
    statColumns = [
      { key: 'pass_yds', label: 'Pass Yds', sortable: true, align: 'right', format: statWithLine('pass_yds_line', 1) },
      { key: 'pass_tds', label: 'Pass TD', sortable: true, align: 'right', format: statWithLine('pass_tds_line', 1) },
      { key: 'completions', label: 'Comp', sortable: true, align: 'right' },
      { key: 'rush_yds', label: 'Rush Yds', sortable: true, align: 'right', format: statWithLine('rush_yds_line', 1) },
    ];
  } else if (activePos === 'RB') {
    statColumns = [
      { key: 'rush_yds', label: 'Rush Yds', sortable: true, align: 'right', format: statWithLine('rush_yds_line', 1) },
      { key: 'carries', label: 'Carries', sortable: true, align: 'right' },
      { key: 'rush_tds', label: 'Rush TD', sortable: true, align: 'right', format: v => v?.toFixed(2) },
      { key: 'rec_yds', label: 'Rec Yds', sortable: true, align: 'right', format: statWithLine('rec_yds_line', 1) },
      { key: 'receptions', label: 'Rec', sortable: true, align: 'right', format: statWithLine('receptions_line', 1) },
    ];
  } else if (activePos === 'WR' || activePos === 'TE') {
    statColumns = [
      { key: 'rec_yds', label: 'Rec Yds', sortable: true, align: 'right', format: statWithLine('rec_yds_line', 1) },
      { key: 'receptions', label: 'Rec', sortable: true, align: 'right', format: statWithLine('receptions_line', 1) },
      { key: 'targets', label: 'Tgt', sortable: true, align: 'right' },
      { key: 'rec_tds', label: 'Rec TD', sortable: true, align: 'right', format: v => v?.toFixed(2) },
      { key: 'target_share', label: 'Tgt%', sortable: true, align: 'right', format: v => v ? (v * 100).toFixed(0) + '%' : '—' },
    ];
  } else {
    statColumns = [
      { key: 'pass_yds', label: 'Pass Yds', sortable: true, align: 'right', format: statWithLine('pass_yds_line', 1) },
      { key: 'rush_yds', label: 'Rush Yds', sortable: true, align: 'right', format: statWithLine('rush_yds_line', 1) },
      { key: 'rec_yds', label: 'Rec Yds', sortable: true, align: 'right', format: statWithLine('rec_yds_line', 1) },
      { key: 'receptions', label: 'Rec', sortable: true, align: 'right', format: statWithLine('receptions_line', 1) },
    ];
  }

  // Gap column — shows how much the model disagrees with the book line
  const gapCol = {
    key: 'gap', label: 'Gap', sortable: true, align: 'right',
    format: (v) => {
      if (v == null) return '—';
      const sign = v > 0 ? '+' : '';
      return (
        <span style={{ color: Math.abs(v) > 0.5 ? (v > 0 ? dark.statusGreen : dark.statusAmber) : dark.textMuted, fontWeight: 600 }}>
          {sign}{v.toFixed(1)}
        </span>
      );
    },
  };

  const columns = [...baseColumns, ...statColumns, gapCol,
    { key: 'dc', label: 'DC', sortable: true, align: 'center', format: v => v <= 3 ? v : '—' },
  ];

  const defaultSortKey = activePos === 'QB' ? 'pass_yds' : activePos === 'RB' ? 'rush_yds' : 'rec_yds';

  return (
    <>
      <Helmet>
        <title>{data?.week ? `NFL Player Projections — Week ${data.week} | Betrilo` : 'NFL Player Projections | Betrilo'}</title>
        <meta name="description" content="NFL player projections for QB, RB, WR, TE — passing, rushing, receiving yards and touchdowns. Model projections shown alongside consensus book lines with measured accuracy." />
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
          onRowClick={handleRowClick}
        />

        <div style={{ marginTop: '16px', padding: '12px 16px', background: dark.surfaceBg, borderRadius: '8px', fontSize: '12px', color: dark.textSecondary, lineHeight: 1.6 }}>
          <strong style={{ color: dark.textPrimary }}>Key:</strong>{' '}
          Stat columns show model projection; <span style={{ color: dark.textMuted }}>Ln</span> = consensus book line |{' '}
          Gap = model minus line (sort to find biggest disagreements) |{' '}
          DvP = Defense vs Position (Rank 1 = easiest matchup) |{' '}
          DC = Depth Chart rank (1 = starter) | Inj = Injury status | Tgt% = Target share |{' '}
          <span style={{ color: dark.dvpSmash }}>Smash</span>{' / '}
          <span style={{ color: dark.dvpFavorable }}>Favorable</span>{' / '}
          <span style={{ color: dark.dvpNeutral }}>Neutral</span>{' / '}
          <span style={{ color: dark.dvpTough }}>Tough</span>{' / '}
          <span style={{ color: dark.dvpAvoid }}>Avoid</span>
        </div>

        {/* Accuracy Transparency Section */}
        {accuracy?.pooled && (
          <div style={{
            marginTop: '24px', padding: '16px 20px',
            background: dark.surfaceBg, borderRadius: '8px',
            border: `1px solid ${dark.border}`,
          }}>
            <h2 style={{ color: dark.textPrimary, fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0' }}>
              Model Accuracy
            </h2>
            <p style={{ color: dark.textSecondary, fontSize: '12px', margin: '0 0 14px 0' }}>
              Measured weekly against actual results. Ratio = model error / line error
              (below 1.00 = model is more accurate).
              {accuracy.graded_weeks && ` Based on ${accuracy.total_graded} projections across Weeks ${accuracy.graded_weeks.join(', ')}.`}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {Object.entries(accuracy.pooled).map(([mkt, m]) => {
                const better = m.ratio < 1.0;
                const close = m.ratio >= 1.0 && m.ratio <= 1.05;
                const pctLabel = better
                  ? `${((1 - m.ratio) * 100).toFixed(0)}% more accurate than the market line`
                  : `${((m.ratio - 1) * 100).toFixed(0)}% less accurate than the market line`;
                return (
                  <div key={mkt} style={{
                    flex: '1 1 180px', padding: '10px 14px',
                    background: dark.pageBg, borderRadius: '6px',
                    border: `1px solid ${better ? dark.statusGreen : close ? dark.statusAmber : dark.border}`,
                  }}>
                    <div style={{ color: dark.textPrimary, fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>
                      {m.display_name}
                    </div>
                    <div style={{
                      color: better ? dark.statusGreen : close ? dark.statusAmber : dark.statusRed,
                      fontWeight: 700, fontSize: '20px',
                    }}>
                      {m.ratio.toFixed(2)}x
                    </div>
                    <div style={{ color: dark.textSecondary, fontSize: '11px', lineHeight: 1.4 }}>
                      {pctLabel}
                    </div>
                    <div style={{ color: dark.textMuted, fontSize: '10px', marginTop: '4px' }}>
                      n={m.n} | Model MAE: {m.model_mae} | Line MAE: {m.line_mae}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </NflPageWrapper>

      {modalPlayer && (
        <NflGameLogModal player={modalPlayer} onClose={() => setModalPlayer(null)} />
      )}
    </>
  );
}
