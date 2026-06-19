import React from 'react';
import { colors } from '../theme';

export default function Footer() {
  const linkStyle = { color: colors.textMuted, textDecoration: 'none' };
  return (
    <footer style={{ background: colors.navy, color: colors.textMuted, padding: '24px', marginTop: '40px', textAlign: 'center', fontSize: '14px' }}>
      <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
        <a href="https://www.instagram.com/betrilopicks/" target="_blank" rel="noopener noreferrer" style={linkStyle}>Instagram: @betrilopicks</a>
        <a href="https://www.threads.com/@betrilopicks" target="_blank" rel="noopener noreferrer" style={linkStyle}>Threads: @betrilopicks</a>
      </div>
      <div style={{ color: '#5a7184' }}>(c) 2026 Betrilo - Sports Betting Projections</div>
    </footer>
  );
}
