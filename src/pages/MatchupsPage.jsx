import React, { useState, useMemo, useEffect } from 'react';

export default function MatchupsPage() {
  const [games, setGames] = useState([]);
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);
  const [selectedSide, setSelectedSide] = useState('home'); // 'home' = home batters vs away pitcher
  const [selectedPosition, setSelectedPosition] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    fetch('/data/game_matchups_2026-06-18.json')
      .then(res => res.json())
      .then(data => {
        setGames(data.games || []);
        setDataLoading(false);
      })
      .catch(err => {
        console.error('Failed to load games:', err);
        setDataLoading(false);
      });
  }, []);

  const currentGame = games[selectedGameIndex];

  // Get batters and pitcher for current view
  const battersAndPitcher = useMemo(() => {
    if (!currentGame) return { batters: [], pitcher: null };

    if (selectedSide === 'home') {
      return {
        batters: currentGame.home_batters || [],
        pitcher: currentGame.away_pitcher,
        teamName: currentGame.home_team,
        vsTeam: currentGame.away_team
      };
    } else {
      return {
        batters: currentGame.away_batters || [],
        pitcher: currentGame.home_pitcher,
        teamName: currentGame.away_team,
        vsTeam: currentGame.home_team
      };
    }
  }, [currentGame, selectedSide]);

  // Filter and search batters
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

  return (
    <div style={{ padding: '20px', background: '#f9f9f9', minHeight: '100vh' }}>
      {dataLoading ? (
        <div style={{ textAlign: 'center', color: '#666' }}>Loading games...</div>
      ) : (
        <>
          {/* Game Selector */}
          <div style={{ marginBottom: '20px', background: 'white', padding: '15px', borderRadius: '8px' }}>
            <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Game:</label>
            <select
              value={selectedGameIndex}
              onChange={(e) => {
                setSelectedGameIndex(parseInt(e.target.value));
                setSelectedSide('home');
              }}
              style={{
                padding: '8px',
                fontSize: '16px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                minWidth: '300px'
              }}
            >
              {games.map((game, idx) => (
                <option key={idx} value={idx}>
                  {game.game_date} - {game.away_team} @ {game.home_team}
                </option>
              ))}
            </select>
          </div>

          {currentGame && (
            <>
              {/* Side Selector */}
              <div style={{ marginBottom: '20px', background: 'white', padding: '15px', borderRadius: '8px', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setSelectedSide('home')}
                  style={{
                    padding: '10px 20px',
                    background: selectedSide === 'home' ? '#007bff' : '#e9ecef',
                    color: selectedSide === 'home' ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {currentGame.home_team} batters vs {currentGame.away_pitcher?.pitcher_name || 'Away P'}
                </button>
                <button
                  onClick={() => setSelectedSide('away')}
                  style={{
                    padding: '10px 20px',
                    background: selectedSide === 'away' ? '#007bff' : '#e9ecef',
                    color: selectedSide === 'away' ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {currentGame.away_team} batters vs {currentGame.home_pitcher?.pitcher_name || 'Home P'}
                </button>
              </div>

              {/* Position Filters */}
              <div style={{ marginBottom: '20px', display: 'flex', gap: '8px' }}>
                {positions.map(pos => (
                  <button
                    key={pos}
                    onClick={() => setSelectedPosition(pos)}
                    style={{
                      padding: '8px 16px',
                      background: selectedPosition === pos ? '#007bff' : '#f0f0f0',
                      color: selectedPosition === pos ? 'white' : 'black',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
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
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '10px',
                    fontSize: '16px',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                />
              </div>

              {/* BvP Table */}
              <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>
                  <h3 style={{ margin: 0 }}>
                    {battersAndPitcher.teamName} vs {battersAndPitcher.pitcher?.pitcher_name || 'Unknown'}
                  </h3>
                  <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                    {filteredBatters.length} batters
                  </p>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                        <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Batter</th>
                        <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Pitcher</th>
                        <th style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>PA</th>
                        <th style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>AB</th>
                        <th style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>H</th>
                        <th style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>1B</th>
                        <th style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>2B</th>
                        <th style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>3B</th>
                        <th style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>HR</th>
                        <th style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>BB</th>
                        <th style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>SO</th>
                        <th style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>AVG</th>
                        <th style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>OBP</th>
                        <th style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>SLG</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBatters.map((batter, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>
                            {batter.batter_name}
                            <span style={{ marginLeft: '5px', color: '#666', fontSize: '12px' }}>({batter.position})</span>
                          </td>
                          <td style={{ padding: '10px', textAlign: 'left' }}>
                            {battersAndPitcher.pitcher?.pitcher_name || 'Unknown'}
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
                          <td style={{ padding: '10px', textAlign: 'center' }}>{typeof batter.avg === 'number' ? batter.avg.toFixed(3) : batter.avg || '.000'}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>—</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>—</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}