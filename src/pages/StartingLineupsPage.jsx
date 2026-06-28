import React, { useState, useEffect } from 'react';
import { colors } from '../theme';

function formatRefreshed(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York',
      timeZoneName: 'short',
    });
  } catch {
    return iso;
  }
}

function PitcherBand({ awayPitcher, homePitcher }) {
  function pitcherLabel(p) {
    if (!p || p.name === 'TBD' || !p.name) return 'SP: TBD';
    const hand = p.throws ? ` · ${p.throws}` : '';
    const wl = (p.w != null && p.l != null) ? ` · ${p.w}-${p.l}` : '';
    const era = p.era != null ? ` · ${p.era} ERA` : '';
    const whip = p.whip != null ? ` · ${p.whip} WHIP` : '';
    return `SP: ${p.name}${hand}${wl}${era}${whip}`;
  }

  return (
    <div style={{
      background: colors.navy,
      borderTop: `1px solid rgba(25,201,62,0.2)`,
      borderBottom: `2px solid rgba(25,201,62,0.15)`,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
    }}>
      {/* Away pitcher — left */}
      <div style={{
        padding: '8px 16px',
        borderRight: `1px solid rgba(22,52,74,0.6)`,
      }}>
        <span style={{
          color: '#19C93E',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.2px',
        }}>
          {pitcherLabel(awayPitcher)}
        </span>
      </div>
      {/* Home pitcher — right */}
      <div style={{ padding: '8px 16px' }}>
        <span style={{
          color: '#19C93E',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.2px',
        }}>
          {pitcherLabel(homePitcher)}
        </span>
      </div>
    </div>
  );
}

function LineupTable({ lineup, lineupStatus }) {
  const isConfirmed = lineupStatus === 'confirmed';

  if (!lineup || lineup.length === 0) {
    return (
      <div style={{ color: colors.textMuted, fontSize: '13px', padding: '16px 0', textAlign: 'center' }}>
        {isConfirmed ? 'Lineup not yet posted' : 'Projected lineup unavailable'}
      </div>
    );
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
      <thead>
        <tr style={{ borderBottom: `1px solid ${colors.navyLight}` }}>
          <th style={{ padding: '6px 8px', textAlign: 'left', color: colors.textMuted, fontWeight: 600, width: '28px' }}>#</th>
          <th style={{ padding: '6px 8px', textAlign: 'left', color: colors.textMuted, fontWeight: 600 }}>Player</th>
          <th style={{ padding: '6px 8px', textAlign: 'left', color: colors.textMuted, fontWeight: 600, width: '40px' }}>Pos</th>
          <th style={{ padding: '6px 8px', textAlign: 'left', color: colors.textMuted, fontWeight: 600, width: '36px' }}>Bats</th>
        </tr>
      </thead>
      <tbody>
        {lineup.map((p, i) => (
          <tr
            key={i}
            style={{
              borderBottom: i < lineup.length - 1 ? `1px solid rgba(22,52,74,0.5)` : 'none',
              background: i % 2 === 0 ? 'rgba(22,52,74,0.25)' : 'transparent',
            }}
          >
            <td style={{ padding: '7px 8px', color: colors.green, fontWeight: 700 }}>{p.order}</td>
            <td style={{ padding: '7px 8px', color: colors.text, fontWeight: 500, textAlign: 'left' }}>{p.name || '—'}</td>
            <td style={{ padding: '7px 8px', color: colors.textMuted }}>{p.position === 'TWP' ? 'P/DH' : (p.position || '—')}</td>
            <td style={{ padding: '7px 8px', color: colors.textMuted }}>{p.bats || '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function GameCard({ game }) {
  const isConfirmed = game.lineup_status === 'confirmed';
  const badge = isConfirmed
    ? { label: '✓ Confirmed', bg: colors.green, color: colors.navy }
    : { label: 'Projected (TBD)', bg: 'rgba(159,179,192,0.15)', color: colors.textMuted };

  const awayName = game.away_team_full || game.away_team;
  const homeName = game.home_team_full || game.home_team;

  return (
    <div style={{
      background: colors.navyLight,
      borderRadius: '10px',
      marginBottom: '20px',
      overflow: 'hidden',
      border: `1px solid rgba(25,201,62,0.15)`,
    }}>
      {/* Game header */}
      <div style={{
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `2px solid ${colors.green}`,
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: '16px' }}>
          {game.away_team} @ {game.home_team}
          {game.time ? <span style={{ color: colors.textMuted, fontWeight: 400, fontSize: '13px', marginLeft: '10px' }}>{game.time}</span> : null}
        </span>
        <span style={{
          background: badge.bg,
          color: badge.color,
          padding: '3px 10px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.3px',
        }}>
          {badge.label}
        </span>
      </div>

      {/* Pitcher band */}
      <PitcherBand
        awayPitcher={game.away_pitcher || null}
        homePitcher={game.home_pitcher || null}
      />

      {/* Side-by-side lineups */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
        {/* Away */}
        <div style={{ padding: '12px 16px', borderRight: `1px solid rgba(22,52,74,0.6)` }}>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>{awayName}</span>
            <span style={{ color: colors.textMuted, fontSize: '11px', fontWeight: 600, marginLeft: '6px' }}>(Away)</span>
          </div>
          <LineupTable lineup={game.away_lineup} lineupStatus={game.lineup_status} />
        </div>
        {/* Home */}
        <div style={{ padding: '12px 16px' }}>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>{homeName}</span>
            <span style={{ color: colors.textMuted, fontSize: '11px', fontWeight: 600, marginLeft: '6px' }}>(Home)</span>
          </div>
          <LineupTable lineup={game.home_lineup} lineupStatus={game.lineup_status} />
        </div>
      </div>
    </div>
  );
}

// ?forceProjected=1 overrides all lineup_status to 'projected' — used to verify the note on preview
const forceProjected = new URLSearchParams(window.location.search).get('forceProjected') === '1';

export default function StartingLineupsPage() {
  const [games, setGames] = useState([]);
  const [slateDate, setSlateDate] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState('');
  const [selectedGame, setSelectedGame] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/data/starting_lineups_latest.json')
      .then((res) => { if (!res.ok) throw new Error('fetch failed'); return res.json(); })
      .then((data) => {
        const raw = data.games || [];
        setGames(forceProjected ? raw.map(g => ({ ...g, lineup_status: 'projected' })) : raw);
        setSlateDate(data.slate_date || '');
        setLastRefreshed(data.last_refreshed || '');
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const displayedGames = selectedGame === 'all'
    ? games
    : [games[parseInt(selectedGame, 10)]].filter(Boolean);

  const confirmedCount = games.filter(g => g.lineup_status === 'confirmed').length;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Page header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 800, margin: '0 0 4px' }}>
          Starting Lineups
        </h1>
        {slateDate && (
          <div style={{ color: colors.textMuted, fontSize: '13px' }}>
            {slateDate}
            {lastRefreshed
              ? <span> · Lineups as of {formatRefreshed(lastRefreshed)}</span>
              : null}
            {games.length > 0
              ? <span> · {confirmedCount} of {games.length} {confirmedCount === 1 ? 'game' : 'games'} confirmed</span>
              : null}
          </div>
        )}
      </div>

      {/* Loading / error */}
      {loading && (
        <div style={{ color: colors.textMuted, textAlign: 'center', padding: '48px 0' }}>
          Loading lineups…
        </div>
      )}
      {error && !loading && (
        <div style={{ color: colors.textMuted, textAlign: 'center', padding: '48px 0' }}>
          Could not load lineups. Check back closer to game time.
        </div>
      )}

      {!loading && !error && games.length === 0 && (
        <div style={{ color: colors.textMuted, textAlign: 'center', padding: '48px 0' }}>
          No games scheduled for today.
        </div>
      )}

      {/* Game selector */}
      {!loading && !error && games.length > 0 && (
        <>
          <div style={{ marginBottom: '16px' }}>
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              style={{
                background: colors.navyLight,
                color: colors.text,
                border: `1px solid rgba(25,201,62,0.3)`,
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '14px',
                cursor: 'pointer',
                minWidth: '220px',
              }}
            >
              <option value="all">All Games ({games.length})</option>
              {games.map((g, i) => (
                <option key={g.game_pk || i} value={String(i)}>
                  {g.away_team} @ {g.home_team}{g.time ? ` · ${g.time}` : ''}
                </option>
              ))}
            </select>
          </div>

          {displayedGames.some(g => g.lineup_status !== 'confirmed') && (
            <div style={{
              color: colors.text,
              fontSize: '12px',
              fontWeight: 500,
              marginBottom: '14px',
              padding: '8px 12px',
              background: colors.navyLight,
              borderLeft: `3px solid ${colors.green}`,
              borderRadius: '0 4px 4px 0',
            }}>
              Projected lineups based on each team&apos;s most recent batting order — they&apos;ll refresh to confirmed as official lineups post.
            </div>
          )}

          {displayedGames.map((g, i) => (
            <GameCard key={g.game_pk || i} game={g} />
          ))}
        </>
      )}
    </div>
  );
}
