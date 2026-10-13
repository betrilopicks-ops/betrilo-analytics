import { Analytics } from '@vercel/analytics/react';
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import PicksCTA from './components/PicksCTA';
import PageErrorBoundary from './components/PageErrorBoundary';
import MainPage from './pages/MainPage';
import MlbLandingPage from './pages/MlbLandingPage';
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
import NflLandingPage from './pages/NflLandingPage';
import NbaLaunchPage from './pages/NbaLaunchPage';

/** Wrap a page component in an error boundary */
const P = (Component) => <PageErrorBoundary><Component /></PageErrorBoundary>;

function AppContent() {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isMlbLanding = location.pathname === '/mlb';
  const isNfl = location.pathname.startsWith('/nfl');
  const isNba = location.pathname.startsWith('/nba');

  return (
    <div className="App">
      <Header />
      {!isLanding && !isMlbLanding && !isNfl && !isNba && <PicksCTA />}
      <main>
        <Routes>
          <Route path="/" element={P(MainPage)} />
          <Route path="/mlb" element={P(MlbLandingPage)} />
          {/* MLB routes */}
          <Route path="/mlb/matchups" element={P(MatchupsPage)} />
          <Route path="/mlb/starting-lineups" element={P(StartingLineupsPage)} />
          <Route path="/mlb/player-projections" element={P(PlayerProjectionsPage)} />
          <Route path="/mlb/batter-splits" element={P(BatterSplitsPage)} />
          <Route path="/mlb/track-record" element={P(TrackRecordPage)} />
          <Route path="/mlb/results" element={P(ResultsPage)} />
          <Route path="/mlb/edge-report" element={P(EdgeReportPage)} />
          <Route path="/mlb/best-bets" element={P(BestBetsPage)} />
          <Route path="/mlb/pitcher-report" element={P(PitcherReportPage)} />
          {/* NFL routes */}
          <Route path="/nfl" element={P(NflLandingPage)} />
          <Route path="/nfl/matchups" element={P(NflMatchupsPage)} />
          <Route path="/nfl/team-rankings" element={P(NflTeamRankingsPage)} />
          <Route path="/nfl/schedule" element={P(NflSchedulePage)} />
          <Route path="/nfl/projections" element={P(NflProjectionsPage)} />
          {/* NBA routes */}
          <Route path="/nba" element={P(NbaLaunchPage)} />
          {/* Case-insensitive redirects */}
          <Route path="/MLB" element={<Navigate to="/mlb" replace />} />
          <Route path="/NFL" element={<Navigate to="/nfl" replace />} />
          <Route path="/NBA" element={<Navigate to="/nba" replace />} />
          {/* System */}
          <Route path="/status" element={P(StatusPage)} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <Analytics />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
