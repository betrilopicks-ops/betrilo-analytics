import React from 'react';
import { NavLink } from 'react-router-dom';
import symbol from '../assets/betrilo_symbol.png';
import { colors } from '../theme';

const navItems = [
  { to: '/mlb/matchups', label: 'Batter vs. Pitcher' },
  { to: '/mlb/player-projections', label: 'Player Projections' },
  { to: '/mlb/batter-splits', label: 'Batter Splits' },
  { to: '/mlb/best-bets', label: 'Best Bets' },
  { to: '/mlb/edge-report', label: 'Edge Report' },
  { to: '/mlb/track-record', label: 'Track Record' },
  { to: '/mlb/leaderboards/streaks', label: 'Leaderboards' },
];

export default function Header() {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: colors.navy, borderBottom: `3px solid ${colors.green}` }}>
      <div style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
        <NavLink to="/mlb/matchups" style={{ display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none' }}>
          <img src={symbol} alt="Betrilo" style={{ height: '52px', width: 'auto' }} />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ color: '#fff', fontSize: '28px', fontWeight: 800, letterSpacing: '0.5px' }}>Betrilo</span>
            <span style={{ color: colors.green, fontSize: '11px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>Sports Betting Projections</span>
          </div>
        </NavLink>
      </div>
      <nav style={{ display: 'flex', justifyContent: 'center', gap: '4px', flexWrap: 'wrap', padding: '0 12px 10px' }}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              color: isActive ? colors.navy : colors.text,
              background: isActive ? colors.green : 'transparent',
              padding: '7px 14px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'background 0.15s, color 0.15s',
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
