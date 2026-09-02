import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { colors } from '../theme';
import SortableTable from '../components/SortableTable';
import NflValidationBanner from '../components/NflValidationBanner';

const DVP_COLORS = {
  Smash: '#19C93E', Favorable: '#7dd87d', Neutral: '#aaa',
  Tough: '#e8a838', Avoid: '#e05555',
};

const POS_TABS = ['All', 'QB', 'RB', 'WR', 'TE'];

export default function NflProjectionsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activePos, setActivePos] = useState('All');

  useEffect(() => {
    fetch('/data/nfl_player_projections_latest.json')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const players = useMemo(() => {
    if (!data?.players) return [];
    let rows = data.players.map(p => ({
      player_name: p.player_name,
      team: p.team,
      position: p.position,
      opponent: p.opponent,
      dc: p.depth_chart_rank,
      dvp_rank: p.dvp?.rank,
      dvp_label: p.dvp?.label,
      // Flatten projections
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
      // Usage
      target_share: p.usage?.target_share,
      blend: p.usage?.blend_source,
    }));
    if (activePos !== 'All') {
      rows = rows.filter(r => r.position === activePos);
    }
    return rows;
  }, [data, activePos]);

  if (error) return <div style={{ textAlign: 'center', padding: '60px', color: colors.textMuted }}>Projections data is unavailable right now.</div>;

  // Position-specific columns
  const baseColumns = [
    { key: 'player_name', label: 'Player', sortable: true, width: '160px' },
    { key: 'team', label: 'Team', sortable: true, width: '50px' },
    { key: 'position', label: 'Pos', sortable: true, align: 'center', width: '40px' },
    { key: 'opponent', label: 'Opp', sortable: true, width: '50px' },
    { key: 'dvp_label', label: 'DvP', sortable: true, format: (v) => (
      <span style={{ color: DVP_COLORS[v] || '#aaa', fontWeight: 600 }}>{v || '—'}</span>
    )},
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
    // All positions — show most relevant columns
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

  // Build team filter options
  const teams = [...new Set(players.map(p => p.team))].sort();

  const defaultSortKey = activePos === 'QB' ? 'pass_yds' :
                         activePos === 'RB' ? 'rush_yds' : 'rec_yds';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      <Helmet>
        <title>NFL Player Projections — Week {data?.week} | Betrilo</title>
        <meta name="description" content={`NFL Week ${data?.week} player projections for QB, RB, WR, TE. Model in private validation, not published picks.`} />
      </Helmet>

      <NflValidationBanner />

      <h1 style={{ color: colors.text, fontSize: '24px', marginBottom: '4px' }}>
        NFL Player Projections
      </h1>
      <p style={{ color: colors.textMuted, fontSize: '13px', marginBottom: '16px' }}>
        Week {data?.week} {data?.season}
        {data?.week1_mode && ' — Prior-season projections (no 2026 game data yet)'}
      </p>

      {/* Position tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
        {POS_TABS.map(pos => (
          <button
            key={pos}
            onClick={() => setActivePos(pos)}
            style={{
              background: activePos === pos ? colors.green : 'transparent',
              color: activePos === pos ? colors.navy : colors.text,
              border: activePos === pos ? 'none' : `1px solid ${colors.textMuted}`,
              padding: '7px 16px', borderRadius: '6px', fontSize: '13px',
              fontWeight: 700, cursor: 'pointer',
            }}
          >
            {pos}
          </button>
        ))}
      </div>

      <SortableTable
        columns={columns}
        data={players}
        defaultSort={{ key: defaultSortKey, order: 'desc' }}
        filters={[{
          key: 'team', label: 'Team',
          options: teams.map(t => ({ value: t, label: t })),
        }]}
        searchKey="player_name"
        searchPlaceholder="Search players..."
        loading={loading}
        lastRefreshed={data?.generated_at ? new Date(data.generated_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : null}
        emptyMessage="No projections available for this week"
      />
    </div>
  );
}
