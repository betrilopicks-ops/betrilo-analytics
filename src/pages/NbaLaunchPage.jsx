import React from 'react';
import { Helmet } from 'react-helmet-async';
import { colors } from '../theme';

const NAVY = '#0B2331';
const GREEN = '#19C93E';

/**
 * /nba launch page — projections-only posture (v1.2).
 * Same landing layout as /mlb and /nfl: white page, subtitle, navy hero card.
 * No buttons or links until Thursday's projections page ships.
 */
export default function NbaLaunchPage() {
  const title = 'NBA Player Projections — Betrilo';
  const ogTitle = 'NBA on Betrilo launches Tuesday, October 20';
  const desc = 'Model-driven NBA player projections for every game, starting opening night October 20, 2026.';
  const url = 'https://betrilo.com/nba';

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 16px 60px' }}>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={url} />
      </Helmet>

      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 800, margin: '0 0 4px' }}>NBA</h2>
        <p style={{ color: colors.subtitleOnWhite, fontSize: '14px', marginBottom: '16px' }}>
          Daily player projections for every game
        </p>

        {/* Hero card */}
        <div style={{
          background: NAVY,
          borderTop: `3px solid ${GREEN}`,
          borderBottom: `3px solid ${GREEN}`,
          borderRadius: '12px',
          padding: '20px 28px',
          textAlign: 'left',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{
              display: 'inline-block',
              background: colors.navyLight,
              color: GREEN,
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              padding: '4px 12px',
              borderRadius: '999px',
              alignSelf: 'flex-start',
            }}>
              Launches Oct 20
            </span>
            <p style={{ color: '#9fb3c0', fontSize: '14px', margin: '6px 0 0', lineHeight: 1.55 }}>
              Model-driven player projections for every NBA game, starting
              opening night. Picks come later: we grade them privately first and
              publish them only once they've beaten the market over a real sample.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
