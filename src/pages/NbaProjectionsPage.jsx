import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { dark } from '../theme';
import SortableTable from '../components/SortableTable';

const CONF_OPTIONS = ['All', '70+', '80+', '90+', '100'];
const CONF_MIN = { 'All': 0, '70+': 70, '80+': 80, '90+': 90, '100': 100 };

const INJ_COLORS = {
  Questionable: dark.statusAmber,
  'Day-To-Day': dark.statusAmber,
  Out: dark.statusRed,
  Suspended: dark.statusRed,
};

export default function NbaProjectionsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [confFilter, setConfFilter] = useState('All');
  const [selectedGame, setSelectedGame] = useState('all');

  useEffect(() => {
    fetch('/data/nba_player_projections_latest.json')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  // Build matchup dropdown options from games array
  const matchupOptions = useMemo(() => {
    if (!data?.games) return [];
    return data.games.map(g => ({
      value: g.game_id,
      label: `${g.away_team_code} @ ${g.home_team_code} \u00B7 ${g.game_time || 'TBD'}`,
    }));
  }, [data]);

  const players = useMemo(() => {
    if (!data?.players) return [];
    let rows = data.players.map(p => ({
      player_id: p.player_id,
      player: p.player,
      team: p.team,
      position: p.position,
      opp: p.opp,
      game_id: p.game_id || '',
      confidence_rate: p.confidence_rate,
      injury_status: p.injury_status || '',
      proj_pts: p.proj_pts,
      proj_reb: p.proj_reb,
      proj_ast: p.proj_ast,
      proj_3pm: p.proj_3pm,
      proj_pra: p.proj_pra,
    }));
    // Confidence filter
    const minConf = CONF_MIN[confFilter] || 0;
    if (minConf > 0) rows = rows.filter(r => r.confidence_rate >= minConf);
    // Game filter
    if (selectedGame !== 'all') rows = rows.filter(r => r.game_id === selectedGame);
    return rows;
  }, [data, confFilter, selectedGame]);

  const injFormat = (v) => {
    if (!v) return null;
    const color = INJ_COLORS[v] || dark.textMuted;
    return <span style={{ color, fontWeight: 600, fontSize: '11px' }}>{v}</span>;
  };

  const confFormat = (v) => {
    if (v == null) return '\u2014';
    const color = v >= 90 ? dark.statusGreen : v >= 70 ? dark.statusAmber : dark.textMuted;
    return <span style={{ color, fontWeight: 600 }}>{v}</span>;
  };

  const columns = [
    { key: 'player', label: 'Player', sortable: true, width: '150px' },
    { key: 'team', label: 'Team', sortable: true, width: '50px' },
    { key: 'position', label: 'Pos', sortable: true, align: 'center', width: '35px' },
    { key: 'opp', label: 'Opp', sortable: true, width: '50px' },
    { key: 'injury_status', label: 'Inj', sortable: true, align: 'center', format: injFormat },
    { key: 'proj_pts', label: 'PTS', sortable: true, align: 'right', format: v => v ?? '\u2014' },
    { key: 'proj_reb', label: 'REB', sortable: true, align: 'right', format: v => v ?? '\u2014' },
    { key: 'proj_ast', label: 'AST', sortable: true, align: 'right', format: v => v ?? '\u2014' },
    { key: 'proj_3pm', label: '3PM', sortable: true, align: 'right', format: v => v ?? '\u2014' },
    { key: 'proj_pra', label: 'PRA', sortable: true, align: 'right', format: v => v ?? '\u2014' },
    { key: 'confidence_rate', label: 'Conf', sortable: true, align: 'center', format: confFormat },
  ];

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: dark.textSecondary, background: dark.pageBg, minHeight: '100vh' }}>
        Projections data is unavailable right now.
      </div>
    );
  }

  const isSample = data?.is_sample === true;
  const hasPlayers = players.length > 0 || loading;

  return (
    <>
      <Helmet>
        <title>NBA Player Projections &mdash; Betrilo</title>
        <meta name="description" content="Model-driven NBA player projections for every game." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div style={{ background: dark.pageBg, minHeight: '100vh', padding: '24px 16px 60px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* Sample data banner */}
          {isSample && (
            <div style={{
              background: '#3d2e0a',
              border: `1px solid ${dark.statusAmber}`,
              borderRadius: '8px',
              padding: '12px 18px',
              marginBottom: '16px',
            }}>
              <div style={{ color: dark.statusAmber, fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>
                SAMPLE DATA &mdash; {data.slate_date}
              </div>
              <div style={{ color: dark.textSecondary, fontSize: '12px', lineHeight: 1.5 }}>
                Projections from {data.slate_date}. Live data begins when NBA games are played.
              </div>
            </div>
          )}

          <h1 style={{ color: dark.textPrimary, fontSize: '30px', fontWeight: 800, marginBottom: '4px' }}>
            NBA Player Projections
          </h1>
          <p style={{ color: dark.textSecondary, fontSize: '13px', marginBottom: '16px' }}>
            {data?.season || ''} {data?.slate_date ? `\u00B7 ${data.slate_date}` : ''}
          </p>

          {/* Filter bar */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center',
            padding: '10px 14px', background: dark.surfaceBg, borderRadius: '8px', marginBottom: '12px',
          }}>
            {/* Game dropdown */}
            <select
              value={selectedGame}
              onChange={e => setSelectedGame(e.target.value)}
              style={{
                background: dark.inputBg, color: dark.inputText, border: `1px solid ${dark.inputBorder}`,
                padding: '6px 10px', borderRadius: '4px', fontSize: '13px', maxWidth: '280px',
              }}
            >
              <option value="all">Game: All</option>
              {matchupOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Confidence filter pills */}
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ color: dark.textSecondary, fontSize: '12px', marginRight: '2px' }}>Conf:</span>
              {CONF_OPTIONS.map(opt => {
                const active = confFilter === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setConfFilter(opt)}
                    style={{
                      background: active ? dark.accentBg : dark.inactiveBg,
                      color: active ? dark.accentText : dark.inactiveText,
                      border: active ? 'none' : `1px solid ${dark.inactiveBorder}`,
                      padding: '3px 10px', borderRadius: '4px', fontSize: '11px',
                      fontWeight: active ? 700 : 500, cursor: 'pointer',
                    }}
                  >{opt}</button>
                );
              })}
            </div>
          </div>

          {/* Empty state */}
          {!loading && !hasPlayers ? (
            <div style={{
              textAlign: 'center', padding: '80px 20px',
              color: dark.textSecondary, fontSize: '18px',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>&#127936;</div>
              No NBA games today
            </div>
          ) : (
            <SortableTable
              columns={columns}
              data={players}
              defaultSort={{ key: 'proj_pts', order: 'desc' }}
              filters={[]}
              searchKey="player"
              searchPlaceholder="Search players..."
              loading={loading}
              lastRefreshed={
                data?.generated_at
                  ? new Date(data.generated_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
                  : null
              }
              emptyMessage="No players match your filters"
            />
          )}

          {/* Key */}
          <div style={{ marginTop: '16px', padding: '12px 16px', background: dark.surfaceBg, borderRadius: '8px', fontSize: '12px', color: dark.textSecondary, lineHeight: 1.6 }}>
            <strong style={{ color: dark.textPrimary }}>Key:</strong>{' '}
            PTS = Points | REB = Rebounds | AST = Assists | 3PM = Three-Pointers Made | PRA = Points + Rebounds + Assists |{' '}
            Conf = Model Confidence (0-100)
          </div>

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
