import React from 'react';
import { Instagram } from 'lucide-react';
import { colors } from '../theme';

export default function PicksCTA() {
  return (
    <div
      style={{
        background: `linear-gradient(90deg, ${colors.blue} 0%, ${colors.green} 100%)`,
        borderRadius: '10px',
        padding: '16px 20px',
        margin: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      <div style={{ color: '#fff' }}>
        <div style={{ fontSize: '17px', fontWeight: 'bold', marginBottom: '2px' }}>
          Want today's picks?
        </div>
        <div style={{ fontSize: '14px', opacity: 0.95 }}>
          We post daily MLB betting picks with verified accuracy on Instagram &amp; Threads.
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        
          href="https://www.instagram.com/betrilopicks/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: '#fff',
            color: colors.navy,
            padding: '10px 18px',
            borderRadius: '6px',
            fontWeight: 'bold',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            fontSize: '14px',
          }}
        >
          <Instagram size={18} /> Instagram
        </a>
        
          href="https://www.threads.com/@betrilopicks"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: 'rgba(255,255,255,0.15)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.6)',
            padding: '10px 18px',
            borderRadius: '6px',
            fontWeight: 'bold',
            textDecoration: 'none',
            fontSize: '14px',
          }}
        >
          Threads
        </a>
      </div>
    </div>
  );
}