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
  {
    name: 'Leaderboards',
    desc: 'Hit streaks and home run leaders across the league.',
    to: '/mlb/leaderboards/streaks',
    comingSoon: true,
  },
];

function Card({ name, desc, to, comingSoon }) {
  const [hover, setHover] = React.useState(false);

  const inner = (
    <div style={{
      background: hover && !comingSoon ? '#122d3f' : NAVY,
      border: `1px solid ${hover && !comingSoon ? GREEN : '#1a3a4d'}`,
      borderRadius: '10px',
      padding: '22px 20px',
      transition: 'border-color 0.15s, background 0.15s',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      boxSizing: 'border-box',
      opacity: comingSoon ? 0.6 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
        <span style={{ color: '#fff', fontSize: '17px', fontWeight: 800, textAlign: 'center' }}>{name}</span>
        {comingSoon && (
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#8a99a3', background: '#1a3a4d',
            padding: '2px 7px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Coming Soon
          </span>
        )}
      </div>
      <div style={{ color: '#9fb3c0', fontSize: '14px', lineHeight: 1.45, flex: 1 }}>
        {desc}
      </div>
      <div style={{ paddingTop: '14px' }}>
        <span style={{ color: comingSoon ? '#4a6070' : (hover ? HOVER_CYAN : GREEN),
          fontSize: '13px', fontWeight: 700 }}>
          {comingSoon ? 'Coming soon' : 'View →'}
        </span>
      </div>
    </div>
  );

  if (comingSoon) {
    return (
      <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{ height: '100%' }}>
        {inner}
      </div>
    );
  }

  return (
    <Link to={to} style={{ textDecoration: 'none', display: 'block', height: '100%' }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {inner}
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

      {/* Card grid — 4 columns × 2 rows, equal height */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '14px',
      }}>
        {CARDS.map((card) => (
          <Card key={card.to} {...card} />
        ))}
      </div>

      {/* Responsive: 2-col on tablet, 1-col on phone */}
      <style>{`
        @media (max-width: 800px) {
          div[style*="grid-template-columns: repeat(4"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          div[style*="grid-template-columns: repeat(4"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
