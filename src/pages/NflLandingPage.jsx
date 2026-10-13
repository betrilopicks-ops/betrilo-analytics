import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { colors } from '../theme';

const NAVY = '#0B2331';
const GREEN = '#19C93E';
const HOVER_CYAN = '#C5F2F0';

const NFL_CARDS = [
  { name: 'Matchups', desc: 'Player vs defense matchup data with DvP rankings and history.', to: '/nfl/matchups' },
  { name: 'Schedule', desc: 'Weekly games with snap leaders, injuries, and game lines.', to: '/nfl/schedule' },
  { name: 'Player Projections', desc: 'Per-player stat projections for passing, rushing, and receiving.', to: '/nfl/projections' },
  { name: 'Team Rankings', desc: 'Defense vs Position (DvP) — find the easiest and toughest matchups.', to: '/nfl/team-rankings' },
];

function Card({ name, desc, to }) {
  const [hover, setHover] = React.useState(false);

  return (
    <Link to={to} style={{ textDecoration: 'none', display: 'block', height: '100%' }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div style={{
        background: hover ? '#122d3f' : NAVY,
        border: `1px solid ${hover ? GREEN : '#1a3a4d'}`,
        borderRadius: '10px',
        padding: '22px 20px',
        transition: 'border-color 0.15s, background 0.15s',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ color: '#fff', fontSize: '17px', fontWeight: 800, textAlign: 'center' }}>{name}</span>
        </div>
        <div style={{ color: '#9fb3c0', fontSize: '14px', lineHeight: 1.45, flex: 1 }}>
          {desc}
        </div>
        <div style={{ paddingTop: '14px' }}>
          <span style={{ color: hover ? HOVER_CYAN : GREEN, fontSize: '13px', fontWeight: 700 }}>
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function NflLandingPage() {
  const title = 'NFL Projections & Matchups — Betrilo';
  const desc = 'Model-driven NFL projections, DvP matchup rankings, and weekly schedule analysis.';
  const url = 'https://betrilo.com/nfl';

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

      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 800, margin: '0 0 4px' }}>NFL</h2>
        <p style={{ color: colors.subtitleOnWhite, fontSize: '14px', marginBottom: '16px' }}>Weekly projections, DvP matchup rankings, and schedule analysis</p>

        {/* Validation banner */}
        <div style={{
          background: NAVY,
          borderTop: `3px solid ${GREEN}`,
          borderBottom: `3px solid ${GREEN}`,
          borderRadius: '12px',
          padding: '20px 28px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          <div style={{ textAlign: 'left' }}>
            <span style={{
              display: 'inline-block',
              background: colors.navyLight,
              color: '#e8a838',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              padding: '4px 12px',
              borderRadius: '999px',
              marginBottom: '8px',
            }}>
              In Validation
            </span>
            <p style={{ color: '#9fb3c0', fontSize: '14px', margin: '6px 0 0' }}>
              NFL model accuracy is being validated privately. Pick surfaces will launch after three graded shadow weeks.
            </p>
          </div>
          <Link to="/nfl/team-rankings" style={{
            display: 'inline-block', background: GREEN, color: NAVY,
            fontWeight: 800, fontSize: '14px', padding: '10px 20px',
            borderRadius: '8px', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            Explore NFL tools
          </Link>
        </div>

        {/* Cards grid */}
        <div className="landing-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '14px',
        }}>
          {NFL_CARDS.map((card) => (
            <Card key={card.to} {...card} />
          ))}
        </div>
      </div>

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
