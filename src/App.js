import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import PicksCTA from './components/PicksCTA';
import LandingPage from './pages/LandingPage';
import MatchupsPage from './pages/MatchupsPage';
import TrackRecordPage from './pages/TrackRecordPage';
import EdgeReportPage from './pages/EdgeReportPage';
import BestBetsPage from './pages/BestBetsPage';
import LeaderboardsPage from './pages/LeaderboardsPage';
import PlayerProjectionsPage from './pages/PlayerProjectionsPage';
import BatterSplitsPage from './pages/BatterSplitsPage';
import ResultsPage from './pages/ResultsPage';
import NotFoundPage from './pages/NotFoundPage';

function AppContent() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div className="App">
      <Header />
      {!isLanding && <PicksCTA />}
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/mlb/matchups" element={<MatchupsPage />} />
          <Route path="/mlb/player-projections" element={<PlayerProjectionsPage />} />
          <Route path="/mlb/batter-splits" element={<BatterSplitsPage />} />
          <Route path="/mlb/track-record" element={<TrackRecordPage />} />
          <Route path="/mlb/results" element={<ResultsPage />} />
          <Route path="/mlb/edge-report" element={<EdgeReportPage />} />
          <Route path="/mlb/best-bets" element={<BestBetsPage />} />
          <Route path="/mlb/leaderboards/:board" element={<LeaderboardsPage />} />
          <Route path="/mlb/leaderboards" element={<LeaderboardsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
