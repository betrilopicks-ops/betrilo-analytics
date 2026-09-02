import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { colors } from '../theme';
import NflValidationBanner from '../components/NflValidationBanner';

const STATUS_COLORS = {
  Out: '#e05555', Doubtful: '#e05555', Questionable: '#e8a838',
  IR: '#e05555', PUP: '#e05555', Sus: '#e05555',
};

export default function NflSchedulePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/data/nfl_schedule_latest.json')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: colors.textMuted }}>Loading...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '60px', color: colors.textMuted }}>Schedule data is unavailable right now.</div>;

  const games = data?.games || [];
  const byeTeams = data?.bye_teams || [];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
      <Helmet>
        <title>NFL Schedule — Week {data?.week} | Betrilo</title>
        <meta name="description" content={`NFL Week ${data?.week} schedule with snap leaders, injuries, and game lines. Model in private validation, not published picks.`} />
      </Helmet>

      <NflValidationBanner />

      <h1 style={{ color: colors.text, fontSize: '24px', marginBottom: '4px' }}>
        NFL Week {data?.week} Schedule
      </h1>
      <p style={{ color: colors.textMuted, fontSize: '13px', marginBottom: '20px' }}>
        {data?.season} Season
        {data?.generated_at && ` | Updated ${new Date(data.generated_at).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`}
        {byeTeams.length > 0 && ` | Bye: ${byeTeams.join(', ')}`}
      </p>

      {games.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
          No games scheduled for this week.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {games.map(game => (
            <div key={game.game_id} style={{
              background: colors.navyLight, borderRadius: '10px',
              border: `1px solid ${colors.navy}`, overflow: 'hidden',
            }}>
              {/* Game header */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 20px', borderBottom: `2px solid ${colors.green}`,
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'baseline' }}>
                  <span style={{ color: colors.text, fontSize: '18px', fontWeight: 700 }}>
                    {game.away_team} @ {game.home_team}
                  </span>
                  <span style={{ color: colors.textMuted, fontSize: '13px' }}>
                    {game.gameday} {game.gametime}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: colors.textMuted }}>
                  {game.spread_line != null && <span>Spread: {game.spread_line > 0 ? '+' : ''}{game.spread_line}</span>}
                  {game.total_line != null && <span>O/U: {game.total_line}</span>}
                  {game.roof && <span>{game.roof}</span>}
                </div>
              </div>

              {/* Two-column: Away | Home */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
                {[
                  { label: game.away_team, leaders: game.away_snap_leaders, injuries: game.away_injuries },
                  { label: game.home_team, leaders: game.home_snap_leaders, injuries: game.home_injuries },
                ].map((side, idx) => (
                  <div key={idx} style={{
                    padding: '12px 16px',
                    borderLeft: idx === 1 ? `1px solid ${colors.navy}` : 'none',
                  }}>
                    <div style={{ color: colors.green, fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>
                      {side.label} {idx === 1 ? '(Home)' : '(Away)'}
                    </div>

                    {/* Snap leaders */}
                    {side.leaders && side.leaders.length > 0 && (
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ color: colors.textMuted, fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Snap Leaders</div>
                        {side.leaders.slice(0, 6).map((p, i) => (
                          <div key={i} style={{ color: colors.text, fontSize: '12px', padding: '2px 0' }}>
                            <span style={{ color: colors.textMuted, width: '28px', display: 'inline-block' }}>{p.position}</span>
                            {p.player}
                            <span style={{ color: colors.textMuted, marginLeft: '6px' }}>{Math.round(p.snap_pct * 100)}%</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Injuries */}
                    {side.injuries && side.injuries.length > 0 && (
                      <div>
                        <div style={{ color: colors.textMuted, fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Injuries</div>
                        {side.injuries.map((inj, i) => (
                          <div key={i} style={{ fontSize: '12px', padding: '2px 0' }}>
                            <span style={{ color: STATUS_COLORS[inj.status] || colors.textMuted, fontWeight: 600 }}>
                              {inj.status}
                            </span>
                            <span style={{ color: colors.text, marginLeft: '6px' }}>{inj.player}</span>
                            {inj.body_part && <span style={{ color: colors.textMuted, marginLeft: '4px' }}>({inj.body_part})</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
