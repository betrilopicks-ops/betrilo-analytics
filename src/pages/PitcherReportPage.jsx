import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { colors } from '../theme';

/* ── helpers ─────────────────────────────────────────────────────────────── */

function pct(v) {
  if (v == null) return '—';
  return `${(v * 100).toFixed(1)}%`;
}

function fmt(v, d = 3) {
  if (v == null) return '—';
  return typeof v === 'string' ? v : v.toFixed(d);
}

function gameTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' }) + ' ET';
}

/* ── trend badge ─────────────────────────────────────────────────────────── */

const trendStyles = {
  hot:    { bg: 'rgba(255,90,50,0.18)', color: '#ff7043', border: 'rgba(255,112,67,0.35)', label: 'Hot' },
  cold:   { bg: 'rgba(66,165,245,0.15)', color: '#64b5f6', border: 'rgba(100,181,246,0.30)', label: 'Cold' },
  steady: { bg: 'rgba(255,255,255,0.06)', color: colors.textMuted, border: 'rgba(255,255,255,0.08)', label: 'Steady' },
};

function TrendBadge({ trend }) {
  const s = trendStyles[trend] || trendStyles.steady;
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: '12px', fontSize: '12px',
      fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      letterSpacing: '0.3px', lineHeight: 1.4,
    }}>
      {s.label}
    </span>
  );
}

/* ── vintage label ───────────────────────────────────────────────────────── */

function VintageLabel({ vintage }) {
  if (!vintage || vintage === '2026') return null;
  return (
    <span style={{
      fontSize: '10px', fontWeight: 600, color: '#ffb74d', background: 'rgba(255,183,77,0.12)',
      padding: '2px 6px', borderRadius: '4px', marginLeft: '6px',
    }}>
      {vintage === '2025' ? '2025 data' : 'limited data'}
    </span>
  );
}

/* ── section header ──────────────────────────────────────────────────────── */

function SectionHead({ title, vintage }) {
  return (
    <div style={{ fontSize: '11px', fontWeight: 700, color: colors.green, textTransform: 'uppercase',
                  letterSpacing: '1.5px', marginBottom: '6px', marginTop: '14px', display: 'flex', alignItems: 'center' }}>
      {title}
      <VintageLabel vintage={vintage} />
    </div>
  );
}

/* ── stat pill ───────────────────────────────────────────────────────────── */

function StatPill({ label, value, muted }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '54px' }}>
      <span style={{ fontSize: '10px', color: colors.textMuted, fontWeight: 600, textTransform: 'uppercase',
                     letterSpacing: '0.5px', marginBottom: '2px' }}>{label}</span>
      <span style={{ fontSize: '16px', fontWeight: 700, color: muted ? colors.textMuted : colors.text }}>{value}</span>
    </div>
  );
}

/* ── arsenal bar ─────────────────────────────────────────────────────────── */

function ArsenalRow({ pitch, usage_pct, velo }) {
  const maxW = 60; // max bar width %
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
      <span style={{ width: '70px', fontSize: '12px', fontWeight: 600, color: colors.text, textAlign: 'right' }}>{pitch}</span>
      <div style={{ flex: 1, height: '14px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
        <div style={{ width: `${Math.min(usage_pct, maxW)}%`, height: '100%', background: `linear-gradient(90deg, ${colors.green}88, ${colors.green}cc)`, borderRadius: '3px' }} />
      </div>
      <span style={{ width: '40px', fontSize: '12px', color: colors.textMuted, textAlign: 'right' }}>{usage_pct}%</span>
      <span style={{ width: '50px', fontSize: '12px', color: colors.textMuted, textAlign: 'right' }}>{velo ? `${velo} mph` : '—'}</span>
    </div>
  );
}

/* ── splits table ────────────────────────────────────────────────────────── */

function SplitsTable({ splits }) {
  if (!splits || (!splits.vs_lhb && !splits.vs_rhb)) {
    return <div style={{ color: colors.textMuted, fontSize: '12px', fontStyle: 'italic' }}>No split data available</div>;
  }
  const cellStyle = { padding: '4px 10px', fontSize: '13px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)' };
  const headStyle = { ...cellStyle, fontWeight: 700, color: colors.textMuted, fontSize: '11px', textTransform: 'uppercase' };
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ ...headStyle, textAlign: 'left' }}>vs</th>
          <th style={headStyle}>K%</th>
          <th style={headStyle}>OPS Against</th>
        </tr>
      </thead>
      <tbody>
        {splits.vs_lhb && (
          <tr>
            <td style={{ ...cellStyle, textAlign: 'left', fontWeight: 600 }}>LHB</td>
            <td style={cellStyle}>{pct(splits.vs_lhb.k_rate)}</td>
            <td style={cellStyle}>{fmt(splits.vs_lhb.ops_against)}</td>
          </tr>
        )}
        {splits.vs_rhb && (
          <tr>
            <td style={{ ...cellStyle, textAlign: 'left', fontWeight: 600 }}>RHB</td>
            <td style={cellStyle}>{pct(splits.vs_rhb.k_rate)}</td>
            <td style={cellStyle}>{fmt(splits.vs_rhb.ops_against)}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

/* ── single pitcher card ─────────────────────────────────────────────────── */

function PitcherCard({ p }) {
  const [open, setOpen] = useState(false);
  const isTbd = p.pitcher_name === 'TBD';
  const isThin = p.sample_flag === 'thin_2026' || (!p.stuff || Object.keys(p.stuff).length === 0);
  const trend = p.recent_form?.trend;
  const season = p.season || {};

  if (isTbd) {
    return (
      <div style={{
        flex: '1 1 0', minWidth: '260px', background: colors.navyLight, borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.06)', padding: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color: colors.textMuted }}>{p.team}</span>
          <span style={{ fontSize: '14px', color: colors.textMuted }}>TBD</span>
        </div>
        <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '8px', fontStyle: 'italic' }}>
          Probable pitcher not yet announced
        </div>
      </div>
    );
  }

  return (
    <div style={{
      flex: '1 1 0', minWidth: '260px', background: colors.navyLight, borderRadius: '10px',
      border: `1px solid ${open ? 'rgba(25,201,62,0.20)' : 'rgba(255,255,255,0.06)'}`,
      transition: 'border-color 0.2s',
    }}>
      {/* ── Collapsed header ──────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px',
          textAlign: 'left', color: colors.text,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '16px', fontWeight: 800 }}>{p.pitcher_name}</span>
            <span style={{ fontSize: '12px', color: colors.textMuted, fontWeight: 600 }}>
              {p.team} · {p.hand || '?'}HP
            </span>
            {trend && <TrendBadge trend={trend} />}
            {p.scratched && (
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#ef5350', background: 'rgba(239,83,80,0.12)',
                             padding: '2px 8px', borderRadius: '4px' }}>SCRATCHED</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '14px', marginTop: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', color: colors.textMuted }}>
              <b style={{ color: colors.text }}>{season.w ?? '—'}-{season.l ?? '—'}</b> · {season.era ?? '—'} ERA · {season.whip ?? '—'} WHIP
            </span>
            {p.stuff?.k_rate != null && (
              <span style={{ fontSize: '13px', color: colors.textMuted }}>
                <b style={{ color: colors.text }}>{pct(p.stuff.k_rate)}</b> K%
              </span>
            )}
          </div>
          {isThin && (
            <div style={{ fontSize: '11px', color: '#ffb74d', marginTop: '4px', fontStyle: 'italic' }}>
              Insufficient 2026 data — limited report
            </div>
          )}
        </div>
        {!isThin && (open ? <ChevronUp size={18} color={colors.textMuted} /> : <ChevronDown size={18} color={colors.textMuted} />)}
      </button>

      {/* ── Expanded detail ───────────────────────────────────────────── */}
      {open && !isThin && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          {/* Stuff Profile */}
          {p.stuff && Object.keys(p.stuff).length > 1 && (
            <>
              <SectionHead title="Stuff Profile" vintage={p.stuff.vintage} />
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <StatPill label="K%" value={pct(p.stuff.k_rate)} />
                <StatPill label="Whiff%" value={pct(p.stuff.whiff_rate)} />
                <StatPill label="BB%" value={pct(p.stuff.bb_rate)} />
                <StatPill label="xwOBA" value={fmt(p.stuff.xwoba_against)} />
              </div>
            </>
          )}

          {/* Arsenal */}
          {p.arsenal && p.arsenal.length > 0 && (
            <>
              <SectionHead title="Pitch Arsenal" />
              {p.arsenal.map((a, i) => (
                <ArsenalRow key={i} pitch={a.pitch} usage_pct={a.usage_pct} velo={a.velo} />
              ))}
            </>
          )}

          {/* Splits */}
          {p.splits && Object.keys(p.splits).length > 0 && (
            <>
              <SectionHead title="Platoon Splits" vintage={p.splits.vintage} />
              <SplitsTable splits={p.splits} />
            </>
          )}

          {/* Recent Form */}
          {p.recent_form && p.recent_form.last5 && (
            <>
              <SectionHead title="Recent Form (L5)" />
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <StatPill label="K%" value={pct(p.recent_form.last5.k_rate)} />
                <StatPill label="Whiff%" value={pct(p.recent_form.last5.whiff_rate)} />
                <StatPill label="xwOBA" value={fmt(p.recent_form.last5.xwoba)} />
              </div>
              {p.recent_form.note && (
                <div style={{ fontSize: '12px', color: colors.textMuted, fontStyle: 'italic' }}>
                  {p.recent_form.note}
                </div>
              )}
            </>
          )}

          {p.sample_flag === '2025_fallback' && (
            <div style={{ fontSize: '11px', color: '#ffb74d', marginTop: '10px', fontStyle: 'italic' }}>
              Some stats sourced from 2025 season (small 2026 sample)
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── game matchup row ────────────────────────────────────────────────────── */

function GameMatchup({ game }) {
  const awayP = game.pitchers.find(p => p.side === 'away') || game.pitchers[0];
  const homeP = game.pitchers.find(p => p.side === 'home') || game.pitchers[1];
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 4px', marginBottom: '8px',
      }}>
        <span style={{ fontSize: '14px', fontWeight: 700, color: colors.text }}>
          {game.away_team} @ {game.home_team}
        </span>
        <span style={{ fontSize: '12px', color: colors.textMuted }}>{gameTime(game.start_time)}</span>
      </div>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {awayP && <PitcherCard p={awayP} />}
        {homeP && <PitcherCard p={homeP} />}
      </div>
    </div>
  );
}

/* ── page ─────────────────────────────────────────────────────────────────── */

export default function PitcherReportPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/data/pitcher_report_latest.json')
      .then(res => { if (!res.ok) throw new Error('fetch failed'); return res.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 16px' }}>
      <Helmet>
        <title>Pitcher Report Card | @betrilopicks</title>
        <meta name="description" content="Starting pitcher report cards for today's MLB games — stuff profile, pitch arsenal, platoon splits, and recent form." />
        <link rel="canonical" href="https://betrilopicks.com/mlb/pitcher-report" />
      </Helmet>

      <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
        Pitcher Report Card
      </h1>

      {data && (
        <div style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '20px' }}>
          {data.slate_date} · {data.games} games · {data.pitchers} pitchers
          {data.last_refreshed && (
            <span> · Updated {new Date(data.last_refreshed).toLocaleTimeString('en-US', {
              hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York',
            })} ET</span>
          )}
        </div>
      )}

      {loading && (
        <div style={{ color: colors.textMuted, textAlign: 'center', padding: '48px 0' }}>
          Loading pitcher reports...
        </div>
      )}

      {error && !loading && (
        <div style={{ color: colors.textMuted, textAlign: 'center', padding: '48px 0' }}>
          Could not load pitcher reports. Check back closer to game time.
        </div>
      )}

      {!loading && !error && data && data.matchups && data.matchups.length === 0 && (
        <div style={{ color: colors.textMuted, textAlign: 'center', padding: '48px 0' }}>
          No games scheduled for today.
        </div>
      )}

      {!loading && !error && data && data.matchups && data.matchups.map(game => (
        <GameMatchup key={game.game_pk} game={game} />
      ))}
    </div>
  );
}
