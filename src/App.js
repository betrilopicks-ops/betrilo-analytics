import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import React from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import PicksCTA from './components/PicksCTA';
import MatchupsPage from './pages/MatchupsPage';

function App() {
  return (
    <div className="App">
      <Header />
      <PicksCTA />
      <main>
        <MatchupsPage />
      </main>
      <Footer />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

export default App;