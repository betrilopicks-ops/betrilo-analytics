import React, { useState, useMemo } from 'react';

export default function MatchupsPage() {
  // Date state (default to today)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Position filter
  const [selectedPosition, setSelectedPosition] = useState('All');

  // Search
  const [searchText, setSearchText] = useState('');

  // Sort state
  const [sortBy, setSortBy] = useState('pitcher_name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Placeholder matchup data (replace with API call)
  const allMatchups = [
    {
      pitcher_name: 'Cole, Gerrit',
      pitcher_id: 1,
      batter_name: 'Judge, Aaron',
      batter_id: 1,
      batter_pos: 'OF',
      pa: 25,
      ab: 22,
      h: 8,
      b1: 5,
      b2: 2,
      b3: 0,
      hr: 1,
      bb: 2,
      so: 5,
      avg: 0.364,
      obp: 0.440,
      slg: 0.545
    },
    {
      pitcher_name: 'Severino, Luis',
      pitcher_id: 2,
      batter_name: 'Soto, Juan',
      batter_id: 2,
      batter_pos: 'OF',
      pa: 18,
      ab: 16,
      h: 5,
      b1: 3,
      b2: 1,
      b3: 0,
      hr: 1,
      bb: 2,
      so: 3,
      avg: 0.313,
      obp: 0.444,
      slg: 0.563
    },
    {
      pitcher_name: 'Rodon, Carlos',
      pitcher_id: 3,
      batter_name: 'Turner, Trea',
      batter_id: 3,
      batter_pos: 'SS',
      pa: 12,
      ab: 11,
      h: 4,
      b1: 3,
      b2: 1,
      b3: 0,
      hr: 0,
      bb: 1,
      so: 2,
      avg: 0.364,
      obp: 0.417,
      slg: 0.455
    },
    {
      pitcher_name: 'Verlander, Justin',
      pitcher_id: 4,
      batter_name: 'Arenado, Nolan',
      batter_id: 4,
      batter_pos: '3B',
      pa: 20,
      ab: 18,
      h: 6,
      b1: 4,
      b2: 2,
      b3: 0,
      hr: 0,
      bb: 2,
      so: 4,
      avg: 0.333,
      obp: 0.400,
      slg: 0.444
    }
  ];

  // Filter and search
  const filteredMatchups = useMemo(() => {
    let filtered = allMatchups;

    // Position filter
    if (selectedPosition !== 'All') {
      filtered = filtered.filter(m => m.batter_pos === selectedPosition);
    }

    // Search filter
    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        m =>
          m.pitcher_name.toLowerCase().includes(search) ||
          m.batter_name.toLowerCase().includes(search)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [selectedPosition, searchText, sortBy, sortOrder]);

  // Handle column click to sort
  const handleColumnClick = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const positions = ['All', 'C', '1B', '2B', '3B', 'SS', 'OF'];

  return (
    <div style={{ padding: '20px' }}>
      {/* Date Selector */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>
          Date:
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ padding: '8px', fontSize: '16px' }}
        />
      </div>

      {/* Position Tabs */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        {positions.map((pos) => (
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

      {/* Search Box */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search pitcher or batter name..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            width: '300px',
            padding: '10px',
            fontSize: '16px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        />
      </div>

      {/* Results Count */}
      <div style={{ marginBottom: '10px', color: '#666' }}>
        {filteredMatchups.length} matchups found
      </div>

      {/* Table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px'
        }}
      >
        <thead>
          <tr style={{ background: '#f0f0f0', borderBottom: '2px solid #333' }}>
            {[
              { key: 'pitcher_name', label: 'Pitcher' },
              { key: 'batter_name', label: 'Batter' },
              { key: 'pa', label: 'PA' },
              { key: 'ab', label: 'AB' },
              { key: 'h', label: 'H' },
              { key: 'b1', label: '1B' },
              { key: 'b2', label: '2B' },
              { key: 'b3', label: '3B' },
              { key: 'hr', label: 'HR' },
              { key: 'bb', label: 'BB' },
              { key: 'so', label: 'SO' },
              { key: 'avg', label: 'AVG' },
              { key: 'obp', label: 'OBP' },
              { key: 'slg', label: 'SLG' }
            ].map((col) => (
              <th
                key={col.key}
                onClick={() => handleColumnClick(col.key)}
                style={{
                  padding: '12px',
                  textAlign: col.key === 'pitcher_name' || col.key === 'batter_name' ? 'left' : 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                  fontWeight: sortBy === col.key ? 'bold' : 'normal',
                  background: sortBy === col.key ? '#e0e0e0' : '#f0f0f0'
                }}
              >
                {col.label} {sortBy === col.key && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredMatchups.map((m, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>{m.pitcher_name}</td>
              <td style={{ padding: '10px' }}>{m.batter_name}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>{m.pa}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>{m.ab}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>{m.h}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>{m.b1}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>{m.b2}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>{m.b3}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>{m.hr}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>{m.bb}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>{m.so}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                {m.avg.toFixed(3)}
              </td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                {m.obp.toFixed(3)}
              </td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                {m.slg.toFixed(3)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredMatchups.length === 0 && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          No matchups found
        </div>
      )}
    </div>
  );
}