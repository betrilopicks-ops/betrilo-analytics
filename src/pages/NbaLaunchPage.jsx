import React from 'react';
import { Helmet } from 'react-helmet-async';
import { dark } from '../theme';

/**
 * /nba launch page — projections-only posture (v1.2).
 * No pick links, no track-record banner, no MLB cross-link.
 * Thursday's build adds the projections page and links to it from here.
 */
export default function NbaLaunchPage() {
  const title = 'NBA Player Projections — Betrilo';
  const desc = 'Model-driven NBA player projections for every game, starting opening night October 20, 2026.';

  return (
    <div style={{ background: dark.pageBg, minHeight: '100vh', padding: '60px 16px 80px' }}>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content="https://betrilo.com/nba" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://betrilo.com/nba" />
      </Helmet>

      <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
        {/* Launch headline */}
        <h1 style={{
          color: dark.textPrimary,
          fontSize: 'clamp(28px, 5vw, 42px)',
          fontWeight: 800,
          lineHeight: 1.15,
          marginBottom: '24px',
          letterSpacing: '-0.5px',
        }}>
          NBA on Betrilo launches Tuesday, October 20
        </h1>

        {/* Body copy */}
        <p style={{
          color: dark.textSecondary,
          fontSize: '17px',
          lineHeight: 1.6,
          marginBottom: '32px',
        }}>
          Model-driven player projections for every NBA game, starting
          opening night.
        </p>

        {/* Green accent divider */}
        <div style={{
          width: '48px',
          height: '3px',
          background: dark.accentBg,
          margin: '0 auto 24px',
          borderRadius: '2px',
        }} />

        <p style={{
          color: dark.textMuted,
          fontSize: '14px',
          lineHeight: 1.55,
        }}>
          Picks come later: we grade them privately first and publish them
          only once they've beaten the market over a real sample.
        </p>
      </div>
    </div>
  );
}
