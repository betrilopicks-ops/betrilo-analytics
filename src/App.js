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
    </div>
  );
}

export default App;