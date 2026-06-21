import { Analytics } from '@vercel/analytics/react';
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import PicksCTA from './components/PicksCTA';
import MatchupsPage from './pages/MatchupsPage';
import TrackRecordPage from './pages/TrackRecordPage';
import EdgeReportPage from './pages/EdgeReportPage';
import BestBetsPage from './pages/BestBetsPage';
import LeaderboardsPage from './pages/LeaderboardsPage';
import PlayerProjectionsPage from './pages/PlayerProjectionsPage';
import BatterSplitsPage from './pages/BatterSplitsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <PicksCTA />
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/mlb/matchups" replace />} />
            <Route path="/mlb/matchups" element={<MatchupsPage />} />
            <Route path="/mlb/player-projections" element={<PlayerProjectionsPage />} />
            <Route path="/mlb/batter-splits" element={<BatterSplitsPage />} />
            <Route path="/mlb/track-record" element={<TrackRecordPage />} />
            <Route path="/mlb/edge-report" element={<EdgeReportPage />} />
            <Route path="/mlb/best-bets" element={<BestBetsPage />} />
            <Route path="/mlb/leaderboards/:board" element={<LeaderboardsPage />} />
            <Route path="/mlb/leaderboards" element={<Navigate to="/mlb/leaderboards/streaks" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <Analytics />
      </div>
    </BrowserRouter>
  );
}

export default App;
