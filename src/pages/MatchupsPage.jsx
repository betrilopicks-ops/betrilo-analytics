import React, { useState } from 'react';
import axios from 'axios';

export default function MatchupsPage() {
  const [pitcher, setPitcher] = useState('');
  const [batter, setBatter] = useState('');
  const [matchups, setMatchups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMatchups([]);

    try {
      // API call to Flask backend
      const response = await axios.get(
        'https://betrilopicks.pythonanywhere.com/api/health'
      );
      
      // For now, just show a placeholder
      setMatchups([
        {
          pitcher_name: pitcher || 'Pitcher',
          batter_name: batter || 'Batter',
          pa: '100',
          h: '30',
          avg: '.300',
          obp: '.350',
          slg: '.450'
        }
      ]);
    } catch (err) {
      setError('Failed to fetch matchups. API may be loading.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Batter vs Pitcher Matchups</h2>
      
      {/* Search Form */}
      <form onSubmit={handleSearch} style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Pitcher name"
            value={pitcher}
            onChange={(e) => setPitcher(e.target.value)}
            style={{ flex: 1, padding: '10px', fontSize: '16px' }}
          />
          <input
            type="text"
            placeholder="Batter name"
            value={batter}
            onChange={(e) => setBatter(e.target.value)}
            style={{ flex: 1, padding: '10px', fontSize: '16px' }}
          />
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Search
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

      {/* Loading */}
      {loading && <div>Loading...</div>}

      {/* Results Table */}
      {matchups.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0f0f0', borderBottom: '2px solid #333' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Pitcher</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Batter</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>PA</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>H</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>AVG</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>OBP</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>SLG</th>
            </tr>
          </thead>
          <tbody>
            {matchups.map((m, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{m.pitcher_name}</td>
                <td style={{ padding: '10px' }}>{m.batter_name}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>{m.pa}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>{m.h}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>{m.avg}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>{m.obp}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>{m.slg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && matchups.length === 0 && !error && (
        <div style={{ color: '#666' }}>Enter pitcher and batter names to search.</div>
      )}
    </div>
  );
}