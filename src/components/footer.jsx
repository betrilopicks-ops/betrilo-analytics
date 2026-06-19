import React from 'react';
import { Instagram } from 'lucide-react';
import { colors } from '../theme';

export default function Footer() {
  const linkStyle = {
    color: colors.textMuted,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    textDecoration: 'none',
  };

  return (
    <footer style={{
      background: colors.navy,
      color: colors.textMuted,
      padding: '24px',
      marginTop: '40px',
      textAlign: 'center',
      fontSize: '14px',
    }}>
      <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
        <a href="https://www.instagram.com/betrilopicks/" target="_blank" rel="noopener noreferrer" style={linkStyle}>
          <Instagram size={18} /> @betrilopicks
        </a>
        <a href="https://www.threads.com/@betrilopicks" target="_blank" rel="noopener noreferrer" style={linkStyle}>
          @betrilopicks on Threads
        </a>
      </div>
      <div style={{ color: '#5a7184' }}>
        © {new Date().getFullYear()} Betrilo · Sports Betting Projections
      </div>
    </footer>
  );
}