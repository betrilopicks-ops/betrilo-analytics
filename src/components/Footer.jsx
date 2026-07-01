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
      <div style={{ marginTop: '10px', fontSize: '13px', color: colors.text }}>
        Questions or feedback? Email <a href="mailto:support@betrilo.com" style={{ color: colors.green, textDecoration: 'none' }}>support@betrilo.com</a>
      </div>
      <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.1)',
        fontSize: '11px', lineHeight: 1.6, color: colors.textMuted, maxWidth: '640px', margin: '16px auto 0' }}>
        DISCLAIMER: This site is for entertainment purposes only and does not accept wagers or
        involve real-money gambling. If you or someone you know has a gambling problem, help is
        available — call 1-800-GAMBLER. Availability varies by state or jurisdiction.
      </div>
    </footer>
  );
}
