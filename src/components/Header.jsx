import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import symbol from '../assets/betrilo_symbol.png';
import { colors } from '../theme';

const mlbNavItems = [
  { to: '/mlb/starting-lineups', label: 'Starting Lineups' },
  { to: '/mlb/pitcher-report', label: 'Pitcher Report' },
  { to: '/mlb/matchups', label: 'Batter vs. Pitcher' },
  { to: '/mlb/batter-splits', label: 'Batter Splits' },
  { to: '/mlb/best-bets', label: 'Best Bets' },
  { to: '/mlb/player-projections', label: 'Player Projections' },
  { to: '/mlb/edge-report', label: 'Edge Report' },
  { to: '/mlb/results', label: 'Results' },
  { to: '/mlb/track-record', label: 'Track Record' },
];

const nflNavItems = [
  { to: '/nfl/matchups', label: 'Matchups' },
  { to: '/nfl/schedule', label: 'Schedule' },
  { to: '/nfl/projections', label: 'Projections' },
  { to: '/nfl/team-rankings', label: 'Team Rankings' },
];

export default function Header() {
  const location = useLocation();
  const isNfl = location.pathname.startsWith('/nfl');
  const activeSport = isNfl ? 'nfl' : 'mlb';
  const navItems = activeSport === 'nfl' ? nflNavItems : mlbNavItems;

  const sportToggleStyle = (sport) => ({
    color: activeSport === sport ? colors.navy : colors.textMuted,
    background: activeSport === sport ? colors.green : 'transparent',
    border: activeSport === sport ? 'none' : `1px solid ${colors.textMuted}`,
    padding: '5px 16px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 700,
    textDecoration: 'none',
    cursor: 'pointer',
    letterSpacing: '0.5px',
  });

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: colors.navy, borderBottom: `3px solid ${colors.green}` }}>
      <div style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none' }}>
          <img src={symbol} alt="Betrilo" style={{ height: '52px', width: 'auto' }} />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ color: '#fff', fontSize: '28px', fontWeight: 800, letterSpacing: '0.5px' }}>Betrilo</span>
            <span style={{ color: colors.green, fontSize: '11px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>Sports Betting Projections</span>
          </div>
        </NavLink>
      </div>

      {/* Sport toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '0 12px 8px' }}>
        <NavLink to="/mlb/starting-lineups" style={sportToggleStyle('mlb')}>MLB</NavLink>
        <NavLink to="/nfl/matchups" style={sportToggleStyle('nfl')}>NFL</NavLink>
      </div>

      {/* Per-sport nav */}
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
