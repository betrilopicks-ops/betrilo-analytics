import React from 'react';
import './App.css';
import MatchupsPage from './pages/MatchupsPage';

function App() {
  return (
    <div className="App">
      <header style={{ padding: '20px', background: '#333', color: '#fff' }}>
        <h1>⚾ Betrilo Analytics</h1>
        <p>MLB Batter vs Pitcher Matchups</p>
      </header>
      <main style={{ padding: '20px' }}>
        <MatchupsPage />
      </main>
    </div>
  );
}

export default App;