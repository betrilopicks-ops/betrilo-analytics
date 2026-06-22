import React, { useState, useMemo, useEffect } from 'react';

export default function MatchupsPage() {
  const [games, setGames] = useState([]);
  const [exportedDate, setExportedDate] = useState('');
  const [selectedGame, setSelectedGame] = useState('all'); // 'all' or game index as string
  const [selectedPosition, setSelectedPosition] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('ab');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(false);
  const [statsMinYear, setStatsMinYear] = useState(null);

  useEffect(() => {
    fetch('/data/game_matchups_latest.json')
      .then(res => res.json())
      .then(data => {
        const sortedGames = (data.games || []).slice().sort((a, b) => {
          const ta = a.start_time || '';
          const tb = b.start_time || '';
          if (!ta && !tb) return 0;
          if (!ta) return 1;   // games without a start time sort last
          if (!tb) return -1;
          return ta < tb ? -1 : ta > tb ? 1 : 0;
        });
        setGames(sortedGames);
        setExportedDate(data.exported_date || '');
        setStatsMinYear(data.stats_min_year || null);
        setDataLoading(false);
      })
      .catch(err => {
        console.error('Failed to load games:', err);
        setDataError(true);
        setDataLoading(false);
      });
  }, []);

  const isAllGames = selectedGame === 'all';

  const pitcherName = (p) => (p && p.pitcher_name ? p.pitcher_name : 'TBD');

  const allRows = useMemo(() => {
    const buildRows = (gameList) => {
      const rows = [];
      gameList.forEach((game) => {
        const matchup = `${game.away_team} @ ${game.home_team}`;
        (game.home_batters || []).forEach((b) => {
          rows.push({
            ...b,
            matchup,
            batter_team: game.home_team,
            pitcher_team: game.away_team,
            pitcher_name: pitcherName(game.away_pitcher),
            pitcher_throws: game.away_pitcher?.throws || '',
          });
        });
        (game.away_batters || []).forEach((b) => {
          rows.push({
            ...b,
            matchup,
            batter_team: game.away_team,
            pitcher_team: game.home_team,
            pitcher_name: pitcherName(game.home_pitcher),
            pitcher_throws: game.home_pitcher?.throws || '',
          });
        });
      });
      return rows;
    };

    if (!games.length) return [];
    if (isAllGames) return buildRows(games);
    const idx = parseInt(selectedGame, 10);
    const g = games[idx];
    return g ? buildRows([g]) : [];
  }, [games, selectedGame, isAllGames]);

  const filteredRows = useMemo(() => {
    let rows = allRows;

    if (selectedPosition !== 'All') {
      rows = rows.filter((r) => r.position === selectedPosition);
    }

    if (searchText) {
      const s = searchText.toLowerCase();
      rows = rows.filter(
        (r) =>
          (r.batter_name && r.batter_name.toLowerCase().includes(s)) ||
          (r.pitcher_name && r.pitcher_name.toLowerCase().includes(s))
      );
    }

    const textCols = ['batter_name', 'pitcher_name', 'matchup', 'position', 'batter_team', 'pitcher_team'];
    const isText = textCols.includes(sortBy);

    const sorted = [...rows].sort((a, b) => {
      let av = a[sortBy];
      let bv = b[sortBy];
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

    return sorted;
  }, [allRows, selectedPosition, searchText, sortBy, sortOrder]);

  const handleSort = (key, type) => {
    if (sortBy === key) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortOrder(type === 'text' ? 'asc' : 'desc');
    }
  };

  const positions = ['All', 'C', '1B', '2B', '3B', 'SS', 'OF'];

  // Column definitions; 'matchup' only shown in All-Games view
  const columns = [
    { key: 'batter_team', label: 'Team', type: 'text', align: 'center' },
    { key: 'batter_name', label: 'Batter', type: 'text', align: 'left' },
    ...(isAllGames ? [{ key: 'matchup', label: 'Matchup', type: 'text', align: 'left' }] : []),
    { key: 'pitcher_team', label: 'P Team', type: 'text', align: 'center' },
    { key: 'pitcher_name', label: 'Pitcher', type: 'text', align: 'left' },
    { key: 'ab', label: 'AB', type: 'num', align: 'center' },
    { key: 'h', label: 'H', type: 'num', align: 'center' },
    { key: 'b1', label: '1B', type: 'num', align: 'center' },
    { key: 'b2', label: '2B', type: 'num', align: 'center' },
    { key: 'b3', label: '3B', type: 'num', align: 'center' },
    { key: 'hr', label: 'HR', type: 'num', align: 'center' },
    { key: 'bb', label: 'BB', type: 'num', align: 'center' },
    { key: 'so', label: 'SO', type: 'num', align: 'center' },
    { key: 'avg', label: 'AVG', type: 'num', align: 'center' },
    { key: 'obp', label: 'OBP', type: 'num', align: 'center' },
    { key: 'slg', label: 'SLG', type: 'num', align: 'center' },
  ];

  const fmt3 = (v) => (typeof v === 'number' ? v.toFixed(3) : v || '.000');

  const fmtTime = (iso) => {
    if (!iso) return 'TBD';
    try {
      return new Date(iso).toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York',
      });
    } catch {
      return 'TBD';
    }
  };

  const prettyDate = exportedDate
    ? new Date(exportedDate + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      })
    : '';

  return (
    <div style={{ padding: '20px', background: '#f9f9f9', minHeight: '100vh' }}>
      {dataLoading ? (
        <div style={{ textAlign: 'center', color: '#666' }}>Loading games...</div>
      ) : dataError ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
          Matchups unavailable right now. Check back after today's slate posts.
        </div>
      ) : (
        <>
          {/* Header */}
          <div style={{ marginBottom: '15px' }}>
            <h2 style={{ margin: '0 0 4px 0' }}>Batter vs. Pitcher</h2>
            {prettyDate && (
              <div style={{ color: '#666', fontSize: '14px' }}>
                Showing matchups for {prettyDate}
              </div>
            )}
            <div style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>
              Batter vs Pitcher stats cover {statsMinYear || '2021'} to present.
            </div>
          </div>

          {/* Game Selector */}
          <div style={{ marginBottom: '20px', background: 'white', padding: '15px', borderRadius: '8px' }}>
            <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Game:</label>
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              style={{ padding: '8px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '320px' }}
            >
              <option value="all">All Games</option>
              {games.map((game, idx) => (
                <option key={idx} value={idx}>
                  {fmtTime(game.start_time)} - {game.away_team} @ {game.home_team}
                </option>
              ))}
            </select>
          </div>

          {/* Position Filters */}
          <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {positions.map((pos) => (
              <button
                key={pos}
                onClick={() => setSelectedPosition(pos)}
                style={{
                  padding: '8px 16px',
                  background: selectedPosition === pos ? '#007bff' : '#f0f0f0',
                  color: selectedPosition === pos ? 'white' : 'black',
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
              placeholder="Search Player Name"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%', maxWidth: '400px', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          {/* Table */}
          <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                {filteredRows.length} matchups{isAllGames ? ` across ${games.length} games` : ''}
              </p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                    {columns.map((col, ci) => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key, col.type)}
                        style={{
                          padding: '10px',
                          textAlign: col.align,
                          cursor: 'pointer',
                          userSelect: 'none',
                          whiteSpace: 'nowrap',
                          background: sortBy === col.key ? '#e6e6e6' : '#f5f5f5',
                          fontWeight: 'bold',
                          ...(col.key === 'batter_team' ? { position: 'sticky', left: 0, zIndex: 3 } : {}),
                        }}
                      >
                        {col.label}
                        {sortBy === col.key ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eee', background: '#fff' }}>
                      <td style={{ padding: '10px', textAlign: 'center', fontWeight: 700, fontSize: '13px', color: '#0B2331', position: 'sticky', left: 0, zIndex: 1, background: '#fff' }}>
                        {r.batter_team}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold', borderRight: '2px solid #e3e9ed' }}>
                        {r.batter_name}
                        <span style={{ marginLeft: '6px', color: '#666', fontSize: '12px', fontWeight: 'normal' }}>
                          {r.bats ? `(${r.bats}) ` : ''}{r.position}
                        </span>
                      </td>
                      {isAllGames && (
                        <td style={{ padding: '10px', textAlign: 'left', color: '#555' }}>{r.matchup}</td>
                      )}
                      <td style={{ padding: '10px', textAlign: 'center', fontWeight: 600, fontSize: '13px', color: '#555' }}>
                        {r.pitcher_team}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'left' }}>
                        {r.pitcher_name}{r.pitcher_throws ? ` (${r.pitcher_throws})` : ''}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{r.ab || 0}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{r.h || 0}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{r.b1 || 0}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{r.b2 || 0}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{r.b3 || 0}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{r.hr || 0}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{r.bb || 0}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{r.so || 0}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{fmt3(r.avg)}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{fmt3(r.obp)}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{fmt3(r.slg)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRows.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  No matchups found.
                </div>
              )}
              <div style={{ marginTop: '12px', padding: '12px 14px', background: '#f4f7f9', borderRadius: '8px', fontSize: '12px', color: '#5a6b76', lineHeight: 1.6 }}>
                <strong style={{ color: '#0B2331' }}>Key:</strong> Career batter-vs-pitcher totals against today's probable pitcher. <strong>AB</strong> at-bats, <strong>H</strong> hits, <strong>1B/2B/3B</strong> singles/doubles/triples, <strong>HR</strong> home runs, <strong>BB</strong> walks, <strong>SO</strong> strikeouts, <strong>AVG/OBP/SLG</strong> average / on-base / slugging. Stats cover {statsMinYear || '2021'} to present.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
