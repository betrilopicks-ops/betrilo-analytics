import React, { useState, useMemo, useEffect } from 'react';

export default function MatchupsPage() {
  const [games, setGames] = useState([]);
  const [exportedDate, setExportedDate] = useState('');
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);
  const [selectedSide, setSelectedSide] = useState('home');
  const [selectedPosition, setSelectedPosition] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    fetch('/data/game_matchups_latest.json')
      .then(res => res.json())
      .then(data => {
        setGames(data.games || []);
        setExportedDate(data.exported_date || '');
        setDataLoading(false);
      })
      .catch(err => {
        console.error('Failed to load games:', err);
        setDataLoading(false);
      });
  }, []);

  const currentGame = games[selectedGameIndex];

  const battersAndPitcher = useMemo(() => {
    if (!currentGame) return { batters: [], pitcher: null, teamName: '', vsTeam: '' };
    if (selectedSide === 'home') {
      return {
        batters: currentGame.home_batters || [],
        pitcher: currentGame.away_pitcher,
        teamName: currentGame.home_team,
        vsTeam: currentGame.away_team
      };
    }
    return {
      batters: currentGame.away_batters || [],
      pitcher: currentGame.home_pitcher,
      teamName: currentGame.away_team,
      vsTeam: currentGame.home_team
    };
  }, [currentGame, selectedSide]);

  const filteredBatters = useMemo(() => {
    let filtered = battersAndPitcher.batters;
    if (selectedPosition !== 'All') {
      filtered = filtered.filter(b => b.position === selectedPosition);
    }
    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(b => b.batter_name.toLowerCase().includes(search));
    }
    return filtered;
  }, [battersAndPitcher, selectedPosition, searchText]);

  const positions = ['All', 'C', '1B', '2B', '3B', 'SS', 'OF'];

  const prettyDate = exportedDate
    ? new Date(exportedDate + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
      })
    : '';

  const pitcherLabel = (p) => {
    if (!p || !p.pitcher_name) return 'TBD';
    return p.throws ? `${p.pitcher_name} (${p.throws})` : p.pitcher_name;
  };

  return (
    <div style={{ padding: '20px', background: '#f9f9f9', minHeight: '100vh' }}>
      {dataLoading ? (
        <div style={{ textAlign: 'center', color: '#666' }}>Loading games...</div>
      ) : (
        <>
          {/* Slate header */}
          <div style={{ marginBottom: '15px' }}>
            <h2 style={{ margin: '0 0 4px 0' }}>Batter vs Pitcher Matchups</h2>
            {prettyDate && (
              <div style={{ color: '#666', fontSize: '14px' }}>
                Showing matchups for {prettyDate}
              </div>
            )}
          </div>

          {/* Game Selector */}
          <div style={{ marginBottom: '20px', background: 'white', padding: '15px', borderRadius: '8px' }}>
            <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Game:</label>
            <select
              value={selectedGameIndex}
              onChange={(e) => {
                setSelectedGameIndex(parseInt(e.target.value));
                setSelectedSide('home');
              }}
              style={{ padding: '8px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '320px' }}
            >
              {games.map((game, idx) => (
                <option key={idx} value={idx}>
                  {game.away_team} @ {game.home_team}
                </option>
              ))}
            </select>
          </div>

          {currentGame && (
            <>
              {/* Side Selector */}
              <div style={{ marginBottom: '20px', background: 'white', padding: '15px', borderRadius: '8px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setSelectedSide('home')}
                  style={{
                    padding: '10px 20px',
                    background: selectedSide === 'home' ? '#007bff' : '#e9ecef',
                    color: selectedSide === 'home' ? 'white' : 'black',
                    border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                  }}
                >
                  {currentGame.home_team} batters vs {pitcherLabel(currentGame.away_pitcher)}
                </button>
                <button
                  onClick={() => setSelectedSide('away')}
                  style={{
                    padding: '10px 20px',
                    background: selectedSide === 'away' ? '#007bff' : '#e9ecef',
                    color: selectedSide === 'away' ? 'white' : 'black',
                    border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                  }}
                >
                  {currentGame.away_team} batters vs {pitcherLabel(currentGame.home_pitcher)}
                </button>
              </div>

              {/* Position Filters */}
              <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {positions.map(pos => (
                  <button
                    key={pos}
                    onClick={() => setSelectedPosition(pos)}
                    style={{
                      padding: '8px 16px',
                      background: selectedPosition === pos ? '#007bff' : '#f0f0f0',
                      color: selectedPosition === pos ? 'white' : 'black',
                      border: 'none', borderRadius: '4px', cursor: 'pointer',
                      fontWeight: selectedPosition === pos ? 'bold' : 'normal'
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

              {/* BvP Table */}
              <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>
                  <h3 style={{ margin: 0 }}>
                    {battersAndPitcher.teamName} batters vs {pitcherLabel(battersAndPitcher.pitcher)}
                  </h3>
                  <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                    {filteredBatters.length} batters
                  </p>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Batter</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Pitcher</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>PA</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>AB</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>H</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>1B</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>2B</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>3B</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>HR</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>BB</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>SO</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>AVG</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>OBP</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>SLG</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBatters.map((batter, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>
                            {batter.batter_name}
                            <span style={{ marginLeft: '6px', color: '#666', fontSize: '12px', fontWeight: 'normal' }}>
                              {batter.bats ? `(${batter.bats}) ` : ''}{batter.position}
                            </span>
                          </td>
                          <td style={{ padding: '10px', textAlign: 'left' }}>
                            {pitcherLabel(battersAndPitcher.pitcher)}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>{batter.pa || 0}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>{batter.ab || 0}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>{batter.h || 0}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>{batter.b1 || 0}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>{batter.b2 || 0}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>{batter.b3 || 0}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>{batter.hr || 0}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>{batter.bb || 0}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>{batter.so || 0}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>{typeof batter.avg === 'number' ? batter.avg.toFixed(3) : (batter.avg || '.000')}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>{typeof batter.obp === 'number' ? batter.obp.toFixed(3) : (batter.obp || '.000')}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>{typeof batter.slg === 'number' ? batter.slg.toFixed(3) : (batter.slg || '.000')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredBatters.length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                      No batters with history vs this pitcher.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}