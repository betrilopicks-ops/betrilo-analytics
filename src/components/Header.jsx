import React from 'react';
import logo from '../assets/betrilo_logo.png';
import { colors } from '../theme';

export default function Header() {
  return (
    <header style={{
      background: colors.navy,
      padding: '14px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderBottom: `3px solid ${colors.green}`,
    }}>
      <img
        src={logo}
        alt="Betrilo — Sports Betting Projections"
        style={{ height: '72px', width: 'auto' }}
      />
    </header>
  );
}