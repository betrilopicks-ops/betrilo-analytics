import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { colors } from '../theme';
import logo from '../assets/betrilo_logo.png';

const NAVY = '#0B2331';
const GREEN = '#19C93E';
const HOVER_CYAN = '#C5F2F0';

const SPORTS = [
  {
    title: 'MLB',
    subtitle: 'Daily projections, picks, and results',
    to: '/mlb',
    badge: null,
  },
  {
    title: 'NFL',
    subtitle: 'Weekly projections and matchups',
    to: '/nfl',
    badge: 'In Validation',
  },
  {
    title: 'NBA',
    subtitle: 'Launches Tuesday, October 20 · Projections',
    to: '/nba',
    badge: null,
  },
];

function SportCard({ title, subtitle, to, badge }) {
  const [hover, setHover] = React.useState(false);

  return (
    <Link
      to={to}
      style={{ textDecoration: 'none', display: 'block', height: '100%' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{
        background: hover ? '#122d3f' : NAVY,
        border: `1px solid ${hover ? GREEN : '#1a3a4d'}`,
        borderRadius: '10px',
        padding: '32px 24px',
        transition: 'border-color 0.15s, background 0.15s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        height: '100%',
        boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <span style={{ color: '#fff', fontSize: '28px', fontWeight: 800 }}>{title}</span>
          {badge && (
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#e8a838',
              background: colors.navyLight,
              padding: '3px 9px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              {badge}
            </span>
          )}
        </div>
        <div style={{ color: '#9fb3c0', fontSize: '15px', lineHeight: 1.45, flex: 1, marginBottom: '14px' }}>
          {subtitle}
        </div>
        <span style={{ color: hover ? HOVER_CYAN : GREEN, fontSize: '14px', fontWeight: 700 }}>
          View →
        </span>
      </div>
    </Link>
  );
}

export default function MainPage() {
  const title = 'Betrilo: Sports Betting Projections';
  const desc = 'Model-driven projections for MLB, NFL and NBA. We give the data, you make the call.';
  const url = 'https://betrilo.com/';

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 16px 60px' }}>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={url} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebSite',
              'name': 'Betrilo',
              'url': 'https://betrilo.com',
              'description': 'Model-driven projections for MLB, NFL and NBA. We give the data, you make the call.'
            },
            {
              '@type': 'Organization',
              'name': 'Betrilo',
              'url': 'https://betrilo.com',
              'sameAs': []
            }
          ]
        })}</script>
      </Helmet>

      {/* Logo + tagline */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <img src={logo} alt="Betrilo" style={{ width: 'clamp(160px, 40vw, 280px)', height: 'auto', marginBottom: '14px' }} />
        <p style={{ color: colors.subtitleOnWhite, fontSize: '16px', margin: 0, lineHeight: 1.5 }}>
          Model-driven projections for MLB, NFL and NBA. We give the data, you make the call.
        </p>
      </div>

      {/* Sport cards */}
      <div className="main-sport-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
      }}>
        {SPORTS.map((sport) => (
          <SportCard key={sport.to} {...sport} />
        ))}
      </div>

      <style>{`
        @media (max-width: 700px) {
          .main-sport-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
