import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/betrilo_logo.png';

const NAVY = '#0B2331';
const GREEN = '#19C93E';
const HOVER_CYAN = '#C5F2F0';

const CARDS = [
  {
    name: 'Track Record',
    desc: 'Our publicly tracked pick accuracy — every win and loss counted.',
    to: '/mlb/track-record',
  },
  {
    name: 'Batter vs Pitcher',
    desc: 'Career batting stats for every matchup on today\'s slate.',
    to: '/mlb/matchups',
  },
  {
    name: 'Edge Report',
    desc: 'Model-identified edges with EV and direction on every prop.',
    to: '/mlb/edge-report',
  },
  {
    name: 'Best Bets',
    desc: 'Today\'s highest-confidence picks ranked by the model.',
    to: '/mlb/best-bets',
  },
  {
    name: 'Player Projections',
    desc: 'Per-player stat projections for hits, total bases, HR, and walks.',
    to: '/mlb/player-projections',
  },
  {
    name: 'Batter Splits',
    desc: 'Platoon splits and vs-pitcher performance for every batter.',
    to: '/mlb/batter-splits',
  },
  {
    name: 'Results',
    desc: 'Day-by-day pick results — every pick graded against actuals.',
    to: '/mlb/results',
  },
];

function Card({ name, desc, to }) {
  const [hover, setHover] = React.useState(false);
  return (
    <Link to={to} style={{ textDecoration: 'none' }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div style={{
        background: hover ? '#122d3f' : NAVY,
        border: `1px solid ${hover ? GREEN : '#1a3a4d'}`,
        borderRadius: '10px',
        padding: '22px 20px',
        transition: 'border-color 0.15s, background 0.15s',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ color: '#fff', fontSize: '17px', fontWeight: 800, marginBottom: '6px' }}>
          {name}
        </div>
        <div style={{ color: '#9fb3c0', fontSize: '14px', lineHeight: 1.45 }}>
          {desc}
        </div>
        <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
          <span style={{ color: hover ? HOVER_CYAN : GREEN, fontSize: '13px', fontWeight: 700 }}>
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function LandingPage() {
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 16px 60px' }}>
      {/* Logo + tagline */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <img src={logo} alt="Betrilo" style={{ width: 'clamp(160px, 40vw, 280px)', height: 'auto', marginBottom: '14px' }} />
        <p style={{ color: '#8a99a3', fontSize: '16px', margin: 0, lineHeight: 1.5 }}>
          Data-driven MLB picks with a publicly tracked record.
        </p>
      </div>

      {/* Card grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '14px',
      }}>
        {CARDS.map((card) => (
          <Card key={card.to} {...card} />
        ))}
      </div>
    </div>
  );
}
