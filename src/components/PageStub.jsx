import React from 'react';
import { colors } from '../theme';

export default function PageStub({ title, blurb }) {
  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: '0 20px', textAlign: 'center' }}>
      <h1 style={{ color: colors.navy, fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>{title}</h1>
      <div style={{ display: 'inline-block', background: colors.navyLight, color: colors.green, fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '6px 14px', borderRadius: '999px', marginBottom: '18px' }}>
        Coming Soon
      </div>
      <p style={{ color: colors.textMuted, fontSize: '15px', lineHeight: 1.6 }}>{blurb}</p>
    </div>
  );
}
