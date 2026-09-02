import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { colors } from '../theme';
import SortableTable from '../components/SortableTable';
import NflValidationBanner from '../components/NflValidationBanner';
import NflFreshness from '../components/NflFreshness';

const DVP_COLORS = {
  Smash: '#19C93E', Favorable: '#7dd87d', Neutral: '#aaa',
  Tough: '#e8a838', Avoid: '#e05555',
};

const POS_TABS = ['QB', 'RB', 'WR', 'TE'];

const COLUMNS = {
  QB: [
    { key: 'rank', label: 'Rank', sortable: true, align: 'center', width: '50px' },
    { key: 'team', label: 'Defense', sortable: true, width: '70px' },
    { key: 'label', label: 'Rating', sortable: true, format: (v) => (
      <span style={{ color: DVP_COLORS[v] || '#aaa', fontWeight: 700 }}>{v}</span>
    )},
    { key: 'passing_yards_per_game', label: 'Pass Yds/G', sortable: true, align: 'right' },
    { key: 'passing_tds_per_game', label: 'Pass TD/G', sortable: true, align: 'right' },
    { key: 'completions_per_game', label: 'Comp/G', sortable: true, align: 'right' },
    { key: 'rushing_yards_per_game', label: 'QB Rush/G', sortable: true, align: 'right' },
    { key: 'games', label: 'Games', sortable: true, align: 'center' },
  ],
  RB: [
    { key: 'rank', label: 'Rank', sortable: true, align: 'center', width: '50px' },
    { key: 'team', label: 'Defense', sortable: true, width: '70px' },
    { key: 'label', label: 'Rating', sortable: true, format: (v) => (
      <span style={{ color: DVP_COLORS[v] || '#aaa', fontWeight: 700 }}>{v}</span>
    )},
    { key: 'rushing_yards_per_game', label: 'Rush Yds/G', sortable: true, align: 'right' },
    { key: 'carries_per_game', label: 'Carries/G', sortable: true, align: 'right' },
    { key: 'receptions_per_game', label: 'Rec/G', sortable: true, align: 'right' },
    { key: 'receiving_yards_per_game', label: 'Rec Yds/G', sortable: true, align: 'right' },
    { key: 'games', label: 'Games', sortable: true, align: 'center' },
  ],
  WR: [
    { key: 'rank', label: 'Rank', sortable: true, align: 'center', width: '50px' },
    { key: 'team', label: 'Defense', sortable: true, width: '70px' },
    { key: 'label', label: 'Rating', sortable: true, format: (v) => (
      <span style={{ color: DVP_COLORS[v] || '#aaa', fontWeight: 700 }}>{v}</span>
    )},
    { key: 'receiving_yards_per_game', label: 'Rec Yds/G', sortable: true, align: 'right' },
    { key: 'receptions_per_game', label: 'Rec/G', sortable: true, align: 'right' },
    { key: 'targets_per_game', label: 'Tgt/G', sortable: true, align: 'right' },
    { key: 'receiving_tds_per_game', label: 'TD/G', sortable: true, align: 'right' },
    { key: 'games', label: 'Games', sortable: true, align: 'center' },
  ],
  TE: [
    { key: 'rank', label: 'Rank', sortable: true, align: 'center', width: '50px' },
    { key: 'team', label: 'Defense', sortable: true, width: '70px' },
    { key: 'label', label: 'Rating', sortable: true, format: (v) => (
      <span style={{ color: DVP_COLORS[v] || '#aaa', fontWeight: 700 }}>{v}</span>
    )},
    { key: 'receiving_yards_per_game', label: 'Rec Yds/G', sortable: true, align: 'right' },
    { key: 'receptions_per_game', label: 'Rec/G', sortable: true, align: 'right' },
    { key: 'targets_per_game', label: 'Tgt/G', sortable: true, align: 'right' },
    { key: 'receiving_tds_per_game', label: 'TD/G', sortable: true, align: 'right' },
    { key: 'games', label: 'Games', sortable: true, align: 'center' },
  ],
};

export default function NflTeamRankingsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activePos, setActivePos] = useState('QB');

  useEffect(() => {
    fetch('/data/nfl_team_rankings_latest.json')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  if (error) {
    return <div style={{ textAlign: 'center', padding: '60px', color: colors.textMuted }}>
      Team rankings data is unavailable right now.
    </div>;
  }

  const teams = data?.position_groups?.[activePos] || [];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
      <Helmet>
        <title>NFL Team Rankings (DvP) | Betrilo</title>
        <meta name="description" content="NFL defense-vs-position rankings — find easiest and toughest matchups for QB, RB, WR, TE. Model in private validation, not published picks." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <NflValidationBanner />
      <NflFreshness generatedAt={data?.generated_at} label={`${data?.season || ''} Season`} />

      <h1 style={{ color: colors.text, fontSize: '24px', marginBottom: '4px' }}>
        NFL Team Rankings
      </h1>
      <p style={{ color: colors.textMuted, fontSize: '14px', marginBottom: '20px' }}>
        Defense vs Position (DvP) — Rank 1 = most stats allowed = easiest matchup.
        {data?.dvp_method && <><br /><span style={{ fontSize: '12px' }}>{data.dvp_method}</span></>}
      </p>

      {/* Position tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        {POS_TABS.map(pos => (
          <button
            key={pos}
            onClick={() => setActivePos(pos)}
            style={{
              background: activePos === pos ? colors.green : 'transparent',
              color: activePos === pos ? colors.navy : colors.text,
              border: activePos === pos ? 'none' : `1px solid ${colors.textMuted}`,
              padding: '8px 20px', borderRadius: '6px', fontSize: '14px',
              fontWeight: 700, cursor: 'pointer',
            }}
          >
            {pos}
          </button>
        ))}
      </div>

      <SortableTable
        columns={COLUMNS[activePos]}
        data={teams}
        defaultSort={{ key: 'rank', order: 'asc' }}
        loading={loading}
        lastRefreshed={data?.generated_at ? new Date(data.generated_at).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : null}
        emptyMessage="No rankings data available"
        stickyFirst={false}
      />
    </div>
  );
}
