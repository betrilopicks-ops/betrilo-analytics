import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { colors } from '../theme';

const NAVY = '#0B2331';
const GREEN = '#19C93E';
const HOVER_CYAN = '#C5F2F0';

const MLB_CARDS = [
  { name: 'Starting Lineups', desc: 'Confirmed batting orders and probable pitchers for every game today.', to: '/mlb/starting-lineups' },
  { name: 'Pitcher Report', desc: "Today's starting pitchers — performance, splits, and recent form.", to: '/mlb/pitcher-report' },
  { name: 'Batter vs Pitcher', desc: 'Career batting stats for every matchup on today\'s slate.', to: '/mlb/matchups' },
  { name: 'Batter Splits', desc: 'Platoon splits and vs-pitcher performance for every batter.', to: '/mlb/batter-splits' },
  { name: 'Best Bets', desc: 'Today\'s highest-confidence picks ranked by the model.', to: '/mlb/best-bets' },
  { name: 'Player Projections', desc: 'Per-player stat projections for hits, total bases, HR, and walks.', to: '/mlb/player-projections' },
  { name: 'Edge Report', desc: 'Model-identified edges with EV and direction on every prop.', to: '/mlb/edge-report' },
  { name: 'Results', desc: 'Day-by-day pick results — every pick graded against actuals.', to: '/mlb/results' },
];

function Card({ name, desc, to, comingSoon }) {
  const [hover, setHover] = React.useState(false);

  const inner = (
    <div style={{
      background: hover && !comingSoon ? '#122d3f' : NAVY,
      border: `1px solid ${hover && !comingSoon ? GREEN : '#1a3a4d'}`,
      borderRadius: '10px',
      padding: '22px 20px',
      transition: 'border-color 0.15s, background 0.15s',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      boxSizing: 'border-box',
      opacity: comingSoon ? 0.6 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
        <span style={{ color: '#fff', fontSize: '17px', fontWeight: 800, textAlign: 'center' }}>{name}</span>
        {comingSoon && (
          <span style={{ fontSize: '10px', fontWeight: 700, color: colors.subtitleOnWhite, background: '#1a3a4d',
            padding: '2px 7px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Coming Soon
          </span>
        )}
      </div>
      <div style={{ color: '#9fb3c0', fontSize: '14px', lineHeight: 1.45, flex: 1 }}>
        {desc}
      </div>
      <div style={{ paddingTop: '14px' }}>
        <span style={{ color: comingSoon ? '#4a6070' : (hover ? HOVER_CYAN : GREEN),
          fontSize: '13px', fontWeight: 700 }}>
          {comingSoon ? 'Coming soon' : 'View →'}
        </span>
      </div>
    </div>
  );

  if (comingSoon) {
    return (
      <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{ height: '100%' }}>
        {inner}
      </div>
    );
  }

  return (
    <Link to={to} style={{ textDecoration: 'none', display: 'block', height: '100%' }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {inner}
    </Link>
  );
}

// Hero banner: fetches the same track_record_latest.json as TrackRecordPage.
// verified boolean uses identical logic: !!(data && data.verified)
// Graceful fallback: if fetch fails or overall.rate is missing, renders without the number.
function TrackRecordBanner() {
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/data/track_record_latest.json')
      .then((r) => { if (!r.ok) throw new Error('fetch failed'); return r.json(); })
      .then((d) => { setData(d); setLoaded(true); })
      .catch(() => { setLoaded(true); }); // fail gracefully — banner still renders
  }, []);

  // Same boolean logic as TrackRecordPage line 193: const verified = !!(data && data.verified);
  const verified = !!(data && data.verified);
  const framingLabel = verified ? 'Verified Track Record' : 'Publicly Tracked Record';

  // overall.rate is 0–1 in the JSON (e.g. 0.668). Format as percentage string.
  const rawRate = data && data.overall && data.overall.rate;
  const rateDisplay = (rawRate !== null && rawRate !== undefined && !isNaN(rawRate))
    ? `${(rawRate * 100).toFixed(1)}% hit rate`
    : null;

  return (
    <div style={{
      background: NAVY,
      borderTop: `3px solid ${GREEN}`,
      borderBottom: `3px solid ${GREEN}`,
      borderRadius: '12px',
      padding: '28px 32px',
      marginBottom: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '20px',
      flexWrap: 'wrap',
    }}>
      {/* Left: label + rate */}
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
          {loaded ? framingLabel : 'Track Record'}
        </span>
        {rateDisplay && (
          <span style={{
            color: GREEN,
            fontSize: '42px',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.5px',
          }}>
            {rateDisplay}
          </span>
        )}
        <span style={{ color: '#9fb3c0', fontSize: '14px', lineHeight: 1.4 }}>
          On published MLB picks — every win and loss counted.
        </span>
      </div>

      {/* Right: CTA */}
      <Link
        to="/mlb/track-record"
        style={{
          display: 'inline-block',
          background: GREEN,
          color: NAVY,
          fontWeight: 800,
          fontSize: '15px',
          padding: '12px 24px',
          borderRadius: '8px',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        See our track record →
      </Link>
    </div>
  );
}

function SportSection({ title, subtitle, cards, children }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 800, margin: '0 0 4px' }}>{title}</h2>
      {subtitle && <p style={{ color: colors.subtitleOnWhite, fontSize: '14px', marginBottom: '16px' }}>{subtitle}</p>}
      {children}
      <div className="landing-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '14px',
      }}>
        {cards.map((card) => (
          <Card key={card.to} {...card} />
        ))}
      </div>
    </div>
  );
}

export default function MlbLandingPage() {
  const title = 'MLB Projections & Picks — Betrilo';
  const desc = 'Model-driven MLB projections, daily picks, and a publicly tracked record. Starting lineups, pitcher reports, BvP, and edge analysis.';
  const url = 'https://betrilo.com/mlb';
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 16px 60px' }}>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={url} />
      </Helmet>

      {/* MLB section with track record banner */}
      <SportSection title="MLB" subtitle="162-game season — daily projections, picks, and results" cards={MLB_CARDS}>
        <TrackRecordBanner />
      </SportSection>

      <style>{`
        @media (max-width: 800px) {
          .landing-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .landing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
