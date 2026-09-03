import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { colors } from '../theme';
import SortableTable from '../components/SortableTable';
import NflPageWrapper from '../components/NflPageWrapper';

const DVP_COLORS = {
  Smash: '#19C93E', Favorable: '#7dd87d', Neutral: '#aaa',
  Tough: '#e8a838', Avoid: '#e05555',
};

const STATUS_COLORS = {
  Questionable: '#e8a838', IR: '#e05555', PUP: '#e05555',
  Suspended: '#e05555', 'Did Not Report': '#e05555', Unknown: '#888',
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
    if (activePos !== 'All') {
      rows = rows.filter(r => r.position === activePos);
    }
    return rows;
  }, [data, activePos]);

  if (error) return <div style={{ textAlign: 'center', padding: '60px', color: colors.textMuted }}>Projections data is unavailable right now.</div>;

  const injuryFormat = (v) => {
    if (!v) return null;
    return <span style={{ color: STATUS_COLORS[v] || '#888', fontWeight: 600, fontSize: '11px' }}>{v}</span>;
  };

  const baseColumns = [
    { key: 'player_name', label: 'Player', sortable: true, width: '140px' },
    { key: 'team', label: 'Team', sortable: true, width: '45px' },
    { key: 'position', label: 'Pos', sortable: true, align: 'center', width: '35px' },
    { key: 'opponent', label: 'Opp', sortable: true, width: '45px' },
    { key: 'dvp_label', label: 'DvP', sortable: true, format: (v) => (
      <span style={{ color: DVP_COLORS[v] || '#aaa', fontWeight: 600 }}>{v || '—'}</span>
    )},
    { key: 'injury_status', label: 'Inj', sortable: true, align: 'center', format: injuryFormat },
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

  const teams = [...new Set(players.map(p => p.team))].sort();
  const defaultSortKey = activePos === 'QB' ? 'pass_yds' : activePos === 'RB' ? 'rush_yds' : 'rec_yds';

  return (
    <>
      <Helmet>
        <title>{data?.week ? `NFL Player Projections — Week ${data.week} | Betrilo` : 'NFL Player Projections | Betrilo'}</title>
        <meta name="description" content="NFL player projections for QB, RB, WR, TE — passing, rushing, receiving yards and touchdowns. Model in private validation, not published picks." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <NflPageWrapper generatedAt={data?.generated_at} freshLabel={data?.week1_mode ? 'Prior-season projections' : `Week ${data?.week || ''}`}>
        <h1 style={{ color: colors.navy, fontSize: '30px', fontWeight: 800, marginBottom: '4px' }}>
          NFL Player Projections
        </h1>
        <p style={{ color: colors.subtitleOnWhite, fontSize: '13px', marginBottom: '16px' }}>
          {data?.week ? `Week ${data.week} ${data.season}` : ''}
          {data?.week1_mode && ' — Prior-season projections (no 2026 game data yet)'}
        </p>

        {/* Position tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {POS_TABS.map(pos => (
            <button
              key={pos}
              onClick={() => setActivePos(pos)}
              style={{
                background: activePos === pos ? colors.green : '#f0f0f0',
                color: activePos === pos ? colors.navy : colors.navy,
                border: activePos === pos ? 'none' : '1px solid #ccc',
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
          emptyMessage="No players match your filters"
        />

        {/* Legend */}
        <div style={{ marginTop: '16px', padding: '12px 16px', background: '#f0f4f7', borderRadius: '8px', fontSize: '12px', color: colors.subtitleOnWhite, lineHeight: 1.6 }}>
          <strong style={{ color: colors.navy }}>Key:</strong>{' '}
          DvP = Defense vs Position (Rank 1 = easiest matchup) |{' '}
          DC = Depth Chart rank (1 = starter) |{' '}
          Inj = Injury status |{' '}
          Tgt% = Target share (% of team targets) |{' '}
          <span style={{ color: DVP_COLORS.Smash }}>Smash</span>{' / '}
          <span style={{ color: DVP_COLORS.Favorable }}>Favorable</span>{' / '}
          <span style={{ color: DVP_COLORS.Neutral }}>Neutral</span>{' / '}
          <span style={{ color: DVP_COLORS.Tough }}>Tough</span>{' / '}
          <span style={{ color: DVP_COLORS.Avoid }}>Avoid</span>
        </div>
      </NflPageWrapper>
    </>
  );
}
