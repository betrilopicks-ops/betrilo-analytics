import React from 'react';
import { Link } from 'react-router-dom';
import { colors } from '../theme';

export default function NotFoundPage() {
  return (
    <div style={{ maxWidth: 720, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
      <h1 style={{ color: colors.navy, fontSize: '32px', fontWeight: 800, marginBottom: '10px' }}>404</h1>
      <p style={{ color: colors.textMuted, fontSize: '15px', marginBottom: '20px' }}>That page doesn't exist.</p>
      <Link to="/mlb/matchups" style={{ color: colors.blue, fontWeight: 700, textDecoration: 'none' }}>Back to matchups</Link>
    </div>
  );
}
