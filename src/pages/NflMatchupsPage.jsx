import React, { useState, useMemo, useEffect } from 'react';
import { colors } from '../theme';

const DVP_COLORS = {
  'Smash': '#19C93E',
  'Favorable': '#7dd87d',
  'Neutral': '#aaa',
  'Tough': '#e8a838',
  'Avoid': '#e05555',
};

export default function NflMatchupsPage() {
  const [games, setGames] = useState([]);
  const [meta, setMeta] = useState({});
  const [selectedGame, setSelectedGame] = useState('all');
  const [selectedPosition, setSelectedPosition] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('primary_yds_per_game');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(false);

  useEffect(() => {
    fetch('/data/nfl_game_matchups_latest.json')
      .then(res => res.json())
      .then(data => {
        const sorted = (data.games || []).slice().sort((a, b) => {
          const da = a.gameday || '', db = b.gameday || '';
          if (da !== db) return da < db ? -1 : 1;
          const ta = a.gametime || '', tb = b.gametime || '';
          return ta < tb ? -1 : ta > tb ? 1 : 0;
        });
        setGames(sorted);
        setMeta({
          exportedDate: data.exported_date,
          week: data.week,
          season: data.season,
          dvpMethod: data.dvp_method,
          dvpRankNote: data.dvp_rank_note,
          vsNote: data.vs_opponent_note,
        });
        setDataLoading(false);
      })
      .catch(err => {
        console.error('Failed to load NFL matchups:', err);
        setDataError(true);
        setDataLoading(false);
      });
  }, []);

  const isAllGames = selectedGame === 'all';

  // Build flat rows from games
  const allRows = useMemo(() => {
    const build = (gameList) => {
      const rows = [];
      gameList.forEach(game => {
        const matchup = `${game.away_team} @ ${game.home_team}`;
        const addPlayers = (players, opponent) => {
          (players || []).forEach(p => {
            if (!p.season_stats) return; // skip players with no stats
            const ss = p.season_stats;
            const pos = p.position;

            // Primary yds/game for default sort (position-aware)
            let primaryYpg = 0;
            if (pos === 'QB') primaryYpg = ss.pass_yds_per_game || 0;
            else if (pos === 'RB') primaryYpg = ss.rush_yds_per_game || 0;
            else primaryYpg = ss.rec_yds_per_game || 0;

            rows.push({
              ...p,
              matchup,
              opponent,
              primary_yds_per_game: primaryYpg,
              gameday: game.gameday,
              gametime: game.gametime,
            });
          });
        };
        addPlayers(game.home_players, game.away_team);
        addPlayers(game.away_players, game.home_team);
      });
      return rows;
    };
    if (!games.length) return [];
    if (isAllGames) return build(games);
    const idx = parseInt(selectedGame, 10);
    return games[idx] ? build([games[idx]]) : [];
  }, [games, selectedGame, isAllGames]);

  const filteredRows = useMemo(() => {
    let rows = allRows;
    if (selectedPosition !== 'All') {
      rows = rows.filter(r => r.position === selectedPosition);
    }
    if (searchText) {
      const s = searchText.toLowerCase();
      rows = rows.filter(r =>
        (r.player_name && r.player_name.toLowerCase().includes(s)) ||
        (r.team && r.team.toLowerCase().includes(s))
      );
    }

    const textCols = ['player_name', 'team', 'opponent', 'matchup', 'position'];
    const isText = textCols.includes(sortBy);

    return [...rows].sort((a, b) => {
      let av, bv;
      // Handle nested sort keys
      if (sortBy === 'dvp_rank') {
        av = a.dvp?.rank ?? 99;
        bv = b.dvp?.rank ?? 99;
      } else if (sortBy === 'vs_games') {
        av = a.vs_opponent?.games ?? -1;
        bv = b.vs_opponent?.games ?? -1;
      } else if (sortBy === 'vs_ypg') {
        av = getVsYpg(a);
        bv = getVsYpg(b);
      } else if (sortBy === 'stat_games') {
        av = a.season_stats?.games ?? -1;
        bv = b.season_stats?.games ?? -1;
      } else {
        av = a[sortBy];
        bv = b[sortBy];
      }
      if (isText) {
        av = (av || '').toString().toLowerCase();
        bv = (bv || '').toString().toLowerCase();
        return sortOrder === 'asc'
          ? (av < bv ? -1 : av > bv ? 1 : 0)
          : (av > bv ? -1 : av < bv ? 1 : 0);
      }
      av = typeof av === 'number' ? av : -Infinity;
      bv = typeof bv === 'number' ? bv : -Infinity;
      return sortOrder === 'asc' ? av - bv : bv - av;
    });
  }, [allRows, selectedPosition, searchText, sortBy, sortOrder]);

  const handleSort = (key, type) => {
    if (sortBy === key) {
      setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder(type === 'text' ? 'asc' : 'desc');
    }
  };

  const positions = ['All', 'QB', 'RB', 'WR', 'TE'];

  const fmtTime = (gameday, gametime) => {
    if (!gameday || !gametime) return 'TBD';
    try {
      const dt = new Date(`${gameday}T${gametime}:00-04:00`);
      const day = dt.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'America/New_York' });
      const time = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' });
      return `${day} ${time}`;
    } catch { return gametime; }
  };

  const getVsYpg = (p) => {
    if (!p.vs_opponent) return -Infinity;
    const pos = p.position;
    if (pos === 'QB') return p.vs_opponent.pass_yds_per_game ?? -Infinity;
    if (pos === 'RB') return p.vs_opponent.rush_yds_per_game ?? -Infinity;
    return p.vs_opponent.rec_yds_per_game ?? -Infinity;
  };

  // Position-aware stat display helpers
  const statLabel = (pos, stat) => {
    const labels = {
      QB: { yds: 'Pass Yds', tds: 'Pass TDs', vol1: 'Cmp', vol2: 'Att', ypg: 'Pass Yds/G', extra: 'Rush Yds' },
      RB: { yds: 'Rush Yds', tds: 'Rush TDs', vol1: 'Car', vol2: 'Rec', ypg: 'Rush Yds/G', extra: 'Rec Yds' },
      WR: { yds: 'Rec Yds', tds: 'Rec TDs', vol1: 'Rec', vol2: 'Tgt', ypg: 'Rec Yds/G', extra: null },
      TE: { yds: 'Rec Yds', tds: 'Rec TDs', vol1: 'Rec', vol2: 'Tgt', ypg: 'Rec Yds/G', extra: null },
    };
    return labels[pos]?.[stat] || stat;
  };

  const getStatVal = (p, stat) => {
    const ss = p.season_stats;
    if (!ss) return null;
    const pos = p.position;
    switch (stat) {
      case 'yds':
        return pos === 'QB' ? ss.pass_yds : pos === 'RB' ? ss.rush_yds : ss.rec_yds;
      case 'tds':
        return pos === 'QB' ? ss.pass_tds : pos === 'RB' ? ss.rush_tds : ss.rec_tds;
      case 'vol1':
        return pos === 'QB' ? ss.completions : pos === 'RB' ? ss.carries : ss.receptions;
      case 'vol2':
        return pos === 'QB' ? ss.attempts : pos === 'RB' ? ss.receptions : ss.targets;
      case 'ypg':
        return pos === 'QB' ? ss.pass_yds_per_game : pos === 'RB' ? ss.rush_yds_per_game : ss.rec_yds_per_game;
      case 'extra':
        return pos === 'QB' ? ss.rush_yds : pos === 'RB' ? ss.rec_yds : null;
      default: return null;
    }
  };

  const getDvpYpg = (p) => {
    if (!p.dvp) return null;
    const pos = p.position;
    if (pos === 'QB') return p.dvp.pass_yds_per_game;
    if (pos === 'RB') return p.dvp.rush_yds_per_game;
    return p.dvp.rec_yds_per_game;
  };

  // Determine the stat_season label (current or prior)
  const statSeasons = useMemo(() => {
    const seasons = new Set();
    allRows.forEach(r => { if (r.season_stats?.stat_season) seasons.add(r.season_stats.stat_season); });
    return [...seasons].sort();
  }, [allRows]);

  const prettyDate = meta.exportedDate
    ? new Date(meta.exportedDate + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      })
    : '';

  // Column header for position-mixed view
  const posHeader = (stat) => {
    if (selectedPosition !== 'All') return statLabel(selectedPosition, stat);
    // Mixed view: use generic labels
    const map = { yds: 'Yds', tds: 'TDs', vol1: 'Vol 1', vol2: 'Vol 2', ypg: 'Yds/G', extra: 'Alt Yds' };
    return map[stat] || stat;
  };

  const stickyStyle = {
    position: 'sticky', left: 0, zIndex: 3, background: '#fff',
    borderRight: `2px solid ${colors.navyLight}`,
  };

  return (
    <div style={{ padding: '20px', background: '#f9f9f9', minHeight: '100vh' }}>
      {dataLoading ? (
        <div style={{ textAlign: 'center', color: '#666' }}>Loading NFL matchups...</div>
      ) : dataError ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
          NFL matchups unavailable right now. Check back when the weekly slate posts.
        </div>
      ) : (
        <>
          {/* Header */}
          <div style={{ marginBottom: '15px' }}>
            <h2 style={{ margin: '0 0 4px 0' }}>
              Player vs. Defense (DvP){meta.week ? ` — Week ${meta.week}` : ''}
            </h2>
            {prettyDate && (
              <div style={{ color: '#666', fontSize: '14px' }}>
                Showing matchups for {prettyDate}
              </div>
            )}
            <div style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>
              DvP rankings: recency-weighted ({meta.dvpMethod?.weights || 'current + prior season'}).
              {' '}Player stats: {statSeasons.length === 1 ? `${statSeasons[0]} season` : `${statSeasons.join(' & ')} seasons (per-player)`}.
            </div>
          </div>

          {/* Game Selector */}
          <div style={{ marginBottom: '20px', background: 'white', padding: '15px', borderRadius: '8px' }}>
            <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Game:</label>
            <select
              value={selectedGame}
              onChange={e => setSelectedGame(e.target.value)}
              style={{ padding: '8px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '320px' }}
            >
              <option value="all">All Games</option>
              {games.map((game, idx) => (
                <option key={idx} value={idx}>
                  {fmtTime(game.gameday, game.gametime)} — {game.away_team} @ {game.home_team}
                </option>
              ))}
            </select>
          </div>

          {/* Position Filters */}
          <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {positions.map(pos => (
              <button
                key={pos}
                onClick={() => setSelectedPosition(pos)}
                style={{
                  padding: '8px 16px',
                  background: selectedPosition === pos ? colors.green : '#f0f0f0',
                  color: selectedPosition === pos ? colors.navy : 'black',
                  border: 'none', borderRadius: '4px', cursor: 'pointer',
                  fontWeight: selectedPosition === pos ? 'bold' : 'normal',
                }}
              >
                {pos}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Search player or team..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: '100%', maxWidth: '400px', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          {/* Table */}
          <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                {filteredRows.length} players{isAllGames ? ` across ${games.length} games` : ''}
              </p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '1100px' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                    {[
                      { key: 'player_name', label: 'Player', type: 'text', align: 'left', sticky: true },
                      ...(isAllGames ? [{ key: 'matchup', label: 'Matchup', type: 'text', align: 'left' }] : []),
                      { key: 'position', label: 'Pos', type: 'text', align: 'center' },
                      { key: 'stat_games', label: 'GP', type: 'num', align: 'center', title: 'Games played' },
                      { key: 'primary_yds_per_game', label: posHeader('ypg'), type: 'num', align: 'center', title: 'Primary yards per game' },
                      { key: 'dvp_rank', label: 'DvP', type: 'num', align: 'center', title: meta.dvpRankNote || '1 = most yards allowed = easiest matchup' },
                      { key: 'vs_games', label: 'vs GP', type: 'num', align: 'center', title: 'Games vs this opponent (recent, up to 6 seasons)' },
                      { key: 'vs_ypg', label: 'vs Yds/G', type: 'num', align: 'center', title: 'Yards per game vs this opponent' },
                    ].map((col, ci) => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key, col.type)}
                        title={col.title || ''}
                        style={{
                          padding: '10px 8px',
                          textAlign: col.align,
                          cursor: 'pointer',
                          userSelect: 'none',
                          whiteSpace: 'nowrap',
                          background: sortBy === col.key ? '#e6e6e6' : '#f5f5f5',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          ...(col.sticky ? { ...stickyStyle, background: sortBy === col.key ? '#e6e6e6' : '#f5f5f5' } : {}),
                        }}
                      >
                        {col.label}
                        {sortBy === col.key ? (sortOrder === 'asc' ? ' \u25B2' : ' \u25BC') : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r, idx) => {
                    const dvpColor = r.dvp ? (DVP_COLORS[r.dvp.label] || '#aaa') : '#ddd';
                    const vsYpg = getVsYpg(r);
                    const isSmall = r.vs_opponent?.small_sample;

                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 'bold', ...stickyStyle }}>
                          {r.player_name}
                          <span style={{ marginLeft: '6px', color: '#888', fontSize: '11px', fontWeight: 'normal' }}>
                            {r.team}
                          </span>
                          {r.injury?.injury_status && (
                            <span style={{ marginLeft: '6px', color: '#e05555', fontSize: '11px', fontWeight: 'normal' }}>
                              {r.injury.injury_status}
                            </span>
                          )}
                        </td>
                        {isAllGames && (
                          <td style={{ padding: '10px 8px', textAlign: 'left', color: '#555', fontSize: '12px' }}>{r.matchup}</td>
                        )}
                        <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 600, fontSize: '12px' }}>{r.position}</td>
                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                          {r.season_stats?.games || '—'}
                          {r.season_stats?.stat_season && r.season_stats.stat_season !== meta.season && (
                            <span style={{ color: '#bbb', fontSize: '10px', marginLeft: '2px' }}>
                              '{String(r.season_stats.stat_season).slice(2)}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 600 }}>
                          {r.primary_yds_per_game > 0 ? r.primary_yds_per_game.toFixed(1) : '—'}
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                          {r.dvp ? (
                            <span style={{
                              display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
                              background: dvpColor, color: ['Smash', 'Avoid'].includes(r.dvp.label) ? '#fff' : '#222',
                              fontWeight: 700, fontSize: '12px', minWidth: '70px',
                            }}>
                              #{r.dvp.rank} {r.dvp.label}
                            </span>
                          ) : '—'}
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'center', color: isSmall ? '#bbb' : '#333' }}>
                          {r.vs_opponent ? r.vs_opponent.games : '—'}
                          {isSmall && <span style={{ color: '#e8a838', marginLeft: '2px' }} title="Small sample (<3 games)">*</span>}
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'center', color: isSmall ? '#bbb' : '#333' }}>
                          {vsYpg > 0 ? vsYpg.toFixed(1) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredRows.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  No matchups found.
                </div>
              )}
              <div style={{ marginTop: '12px', padding: '12px 14px', background: '#f4f7f9', borderRadius: '8px', fontSize: '12px', color: '#5a6b76', lineHeight: 1.6 }}>
                <strong style={{ color: colors.navy }}>Key:</strong>{' '}
                <strong>DvP</strong> = Defense vs Position ranking (1 = most yards allowed to this position = easiest matchup).{' '}
                <strong>GP</strong> games played.{' '}
                <strong>Yds/G</strong> primary yards per game (pass for QB, rush for RB, receiving for WR/TE).{' '}
                <strong>vs GP / vs Yds/G</strong> player's history vs this specific opponent (recent, up to 6 seasons; * = fewer than 3 games, treat with caution).{' '}
                NFL roster turnover makes individual vs-opponent history weaker than MLB BvP — treat as supplementary context, not headline data.
                {' '}DvP is recency-weighted: {meta.dvpMethod?.weights || 'current + prior season weighted'}.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
