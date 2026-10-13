import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { dark } from '../theme';

/**
 * Pre-launch /nba page — "NBA on Betrilo launches October 20."
 * After launch, this file becomes NbaHubPage.jsx (today's slate + links).
 * Built to swap cleanly: same route, same wrapper, same theme.
 */
export default function NbaLaunchPage() {
  const title = 'NBA Projections & Best Bets — Betrilo';
  const desc = 'Model-driven NBA player projections and best bets launching October 20, 2026. Every pick tracked and graded in public.';

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
          Model-driven player projections and best bets for every NBA slate,
          starting opening night. Every pick is tracked and graded in
          public — wins and losses.
        </p>

        {/* Track record CTA */}
        <div style={{
          background: dark.surfaceBg,
          border: `1px solid ${dark.border}`,
          borderRadius: '10px',
          padding: '24px 28px',
          marginBottom: '40px',
          textAlign: 'left',
        }}>
          <p style={{
            color: dark.textSecondary,
            fontSize: '15px',
            lineHeight: 1.55,
            margin: '0 0 16px',
          }}>
            See how we track every pick on the MLB side — same transparency,
            same accountability, coming to NBA.
          </p>
          <Link
            to="/mlb/track-record"
            style={{
              display: 'inline-block',
              background: dark.accentBg,
              color: dark.accentText,
              fontWeight: 800,
              fontSize: '14px',
              padding: '10px 22px',
              borderRadius: '8px',
              textDecoration: 'none',
            }}
          >
            See MLB track record →
          </Link>
        </div>

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
          fontSize: '13px',
          lineHeight: 1.5,
        }}>
          Projections, best bets, results, and a full track record — all
          live on opening night.
        </p>
      </div>
    </div>
  );
}
