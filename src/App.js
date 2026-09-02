import { Analytics } from '@vercel/analytics/react';
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
import PlayerProjectionsPage from './pages/PlayerProjectionsPage';
import BatterSplitsPage from './pages/BatterSplitsPage';
import ResultsPage from './pages/ResultsPage';
import StartingLineupsPage from './pages/StartingLineupsPage';
import NotFoundPage from './pages/NotFoundPage';
import PitcherReportPage from './pages/PitcherReportPage';
import StatusPage from './pages/StatusPage';
import NflMatchupsPage from './pages/NflMatchupsPage';
import NflTeamRankingsPage from './pages/NflTeamRankingsPage';
import NflSchedulePage from './pages/NflSchedulePage';
import NflProjectionsPage from './pages/NflProjectionsPage';

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
          {/* MLB routes */}
          <Route path="/mlb/matchups" element={<MatchupsPage />} />
          <Route path="/mlb/starting-lineups" element={<StartingLineupsPage />} />
          <Route path="/mlb/player-projections" element={<PlayerProjectionsPage />} />
          <Route path="/mlb/batter-splits" element={<BatterSplitsPage />} />
          <Route path="/mlb/track-record" element={<TrackRecordPage />} />
          <Route path="/mlb/results" element={<ResultsPage />} />
          <Route path="/mlb/edge-report" element={<EdgeReportPage />} />
          <Route path="/mlb/best-bets" element={<BestBetsPage />} />
          <Route path="/mlb/pitcher-report" element={<PitcherReportPage />} />
          {/* NFL routes */}
          <Route path="/nfl/matchups" element={<NflMatchupsPage />} />
          <Route path="/nfl/team-rankings" element={<NflTeamRankingsPage />} />
          <Route path="/nfl/schedule" element={<NflSchedulePage />} />
          <Route path="/nfl/projections" element={<NflProjectionsPage />} />
          {/* System */}
          <Route path="/status" element={<StatusPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <Analytics />
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
