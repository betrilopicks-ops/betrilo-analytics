import React from 'react';
import symbol from '../assets/betrilo_symbol.png';
import { colors } from '../theme';

export default function Header() {
  return (
    <header style={{ background: colors.navy, padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', borderBottom: `3px solid ${colors.green}` }}>
      <img src={symbol} alt="Betrilo" style={{ height: '52px', width: 'auto' }} />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span style={{ color: '#fff', fontSize: '28px', fontWeight: 800, letterSpacing: '0.5px' }}>Betrilo</span>
        <span style={{ color: colors.green, fontSize: '11px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>Sports Betting Projections</span>
      </div>
    </header>
  );
}
