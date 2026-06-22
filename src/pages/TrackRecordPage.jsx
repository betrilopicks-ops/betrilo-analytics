import React, { useState, useEffect } from 'react';
import { colors } from '../theme';

function pct(x) { return x === null || x === undefined ? '—' : `${(x * 100).toFixed(1)}%`; }
function niceDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s || '')) return s || '';
  return new Date(s + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function TrendChart({ daily, baselineDate }) {
  // Simple responsive SVG line of daily rate over time, with a baseline at 50%.
  const W = 720, H = 200, pad = { l: 36, r: 12, t: 14, b: 22 };
  const pts = daily.filter((d) => d.scored > 0);
  if (pts.length < 2) return null;
  const xs = (i) => pad.l + (i / (pts.length - 1)) * (W - pad.l - pad.r);
  const lo = 0.3, hi = 0.85; // fixed y window so the slow start is visible without flattening
  const ys = (r) => pad.t + (1 - (r - lo) / (hi - lo)) * (H - pad.t - pad.b);
  const path = pts.map((d, i) => `${i === 0 ? 'M' : 'L'}${xs(i).toFixed(1)},${ys(d.rate).toFixed(1)}`).join(' ');
  const gline = (r) => ys(r);

  // Subtle model-baseline marker: vertical line at the first point on/after the baseline date.
  let markerX = null;
  if (baselineDate) {
    const idx = pts.findIndex((d) => d.date >= baselineDate);
    // Only draw if the baseline falls within the plotted range (i.e. there are points at/after it).
    if (idx > 0) markerX = xs(idx);
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} role="img" aria-label="Daily hit rate over time">
      {[0.4, 0.5, 0.6, 0.7, 0.8].map((r) => (
        <g key={r}>
          <line x1={pad.l} y1={gline(r)} x2={W - pad.r} y2={gline(r)} stroke={r === 0.5 ? '#cbd5dd' : '#eef2f5'} strokeWidth={r === 0.5 ? 1.5 : 1} strokeDasharray={r === 0.5 ? '4 3' : ''} />
          <text x={pad.l - 6} y={gline(r) + 3} textAnchor="end" fontSize="10" fill="#9fb3c0">{Math.round(r * 100)}%</text>
        </g>
      ))}
      {markerX !== null && (
        <g>
          <line x1={markerX} y1={pad.t} x2={markerX} y2={H - pad.b} stroke={colors.navy} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
          <text x={markerX} y={pad.t - 3} textAnchor="middle" fontSize="9" fill={colors.navy} opacity="0.7">model update</text>
        </g>
      )}
      <path d={path} fill="none" stroke={colors.green} strokeWidth="2" strokeLinejoin="round" />
      <text x={pad.l} y={H - 6} fontSize="10" fill="#9fb3c0">{niceDate(pts[0].date)}</text>
      <text x={W - pad.r} y={H - 6} textAnchor="end" fontSize="10" fill="#9fb3c0">{niceDate(pts[pts.length - 1].date)}</text>
    </svg>
  );
}

export default function TrackRecordPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showReveal, setShowReveal] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem('betrilo_rebase_reveal_dismissed_v1') !== '1';
      }
    } catch (_) { /* storage unavailable — default to showing */ }
    return true;
  });

  const dismissReveal = () => {
    setShowReveal(false);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('betrilo_rebase_reveal_dismissed_v1', '1');
      }
    } catch (_) { /* storage unavailable — dismiss for this session only */ }
  };

  useEffect(() => {
    fetch('/data/track_record_latest.json')
      .then((r) => { if (!r.ok) throw new Error('fetch failed'); return r.json(); })
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const verified = !!(data && data.verified);

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: colors.textMuted }}>Loading track record...</div>;
  if (error || !data) return (
    <div style={{ textAlign: 'center', padding: '60px', color: colors.textMuted }}>
      Track record unavailable right now. Check back shortly.
    </div>
  );

  const o = data.overall || {};
  const w = data.window || {};

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '24px 16px 60px' }}>
      {/* Rebase-reveal banner (Edit 6) */}
      {showReveal && (
        <div style={{ background: '#f0f6fa', border: '1px solid #d4e1ea', borderRadius: '10px',
          padding: '14px 16px', margin: '0 0 16px', position: 'relative', fontSize: '13px',
          color: '#3a5060', lineHeight: 1.55 }}>
          <button onClick={dismissReveal} style={{ position: 'absolute', top: '8px',
            right: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px',
            color: '#8a99a3', lineHeight: 1 }} aria-label="Dismiss">x</button>
          <strong>Source correction (June 2026):</strong> We updated our Track Record to count
          only the picks we actually publish — the cards you see on Instagram every day.
          Previously the record included our full internal edge list, which contains picks in
          directions and at volumes that never made it onto a card. The correction raised the
          headline from ~64% to ~67% because published cards are a curated subset. This is a
          measurement change, not a model improvement.
        </div>
      )}

      {/* Badge (Edit 1) */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <span style={{ display: 'inline-block', background: verified ? colors.green : colors.navyLight,
          color: verified ? colors.navy : colors.green, fontSize: '11px', fontWeight: 700,
          letterSpacing: '1.5px', textTransform: 'uppercase', padding: '5px 13px', borderRadius: '999px' }}>
          {verified ? 'Publicly Tracked Record' : 'Validation in Progress'}
        </span>
      </div>

      {/* Headline: lifetime overall only */}
      <div style={{ textAlign: 'center', background: colors.navy, borderRadius: '14px', padding: '30px 20px', margin: '14px 0 8px' }}>
        <div style={{ color: colors.green, fontSize: '64px', fontWeight: 800, lineHeight: 1 }}>{pct(o.rate)}</div>
        <div style={{ color: '#fff', fontSize: '15px', fontWeight: 600, marginTop: '8px' }}>
          Overall hit rate
        </div>
        {/* Date line (Edit 3) */}
        <div style={{ color: colors.textMuted, fontSize: '13px', marginTop: '4px' }}>
          {o.hits?.toLocaleString()} of {o.scored?.toLocaleString()} graded picks · {niceDate(w.start)} – {niceDate(w.end)} · updated daily
        </div>
      </div>
      {/* Hero disclaimer (Edit 2) */}
      <p style={{ textAlign: 'center', color: '#8a99a3', fontSize: '12px', margin: '0 0 28px' }}>
        Hit rate on the picks we actually post — not profit. Five categories tracked; <a href="#methodology" style={{ color: '#8a99a3' }}>full breakdown below</a>.
      </p>

      {/* Trend */}
      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: colors.navy, fontSize: '18px', fontWeight: 800, margin: '0 0 10px' }}>Daily hit rate over time</h2>
        <div style={{ background: '#fff', borderRadius: '10px', padding: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <TrendChart daily={data.daily || []} baselineDate={data.model_baseline?.date} />
        </div>
        <p style={{ color: '#8a99a3', fontSize: '12px', margin: '8px 0 0' }}>
          Each point is one day's hit rate. The dashed line marks 50% (coin-flip). The early-season climb reflects the model calibrating over its first weeks.
          {data.model_baseline?.note && <><br />{data.model_baseline.note}</>}
        </p>
      </section>

      {/* Per-prop (Edit 5 — table handles N rows natively via .map()) */}
      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: colors.navy, fontSize: '18px', fontWeight: 800, margin: '0 0 10px' }}>By prop type</h2>
        <div style={{ overflowX: 'auto', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', background: '#fff' }}>
            <thead style={{ background: colors.navy }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: '#fff', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Prop</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', color: '#fff', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hits</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', color: '#fff', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Scored</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', color: '#fff', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hit Rate</th>
              </tr>
            </thead>
            <tbody>
              {(data.by_prop || []).map((p, i) => (
                <tr key={p.prop} style={{ borderTop: '1px solid #eef2f5', background: i % 2 ? '#fafcfd' : '#fff' }}>
                  <td style={{ padding: '9px 12px', fontWeight: 600, color: colors.navy }}>{p.prop}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', color: '#5a6b76', fontVariantNumeric: 'tabular-nums' }}>{p.hits.toLocaleString()}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', color: '#5a6b76', fontVariantNumeric: 'tabular-nums' }}>{p.scored.toLocaleString()}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: p.rate >= 0.5 ? colors.navy : '#c0392b' }}>{pct(p.rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Methodology (Edit 4) */}
      <section id="methodology">
        <h2 style={{ color: colors.navy, fontSize: '18px', fontWeight: 800, margin: '0 0 10px' }}>Methodology</h2>
        <div style={{ background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', fontSize: '14px', color: '#3a5060', lineHeight: 1.65 }}>
          <h3 style={{ color: colors.navy, fontSize: '15px', fontWeight: 700, margin: '0 0 6px' }}>How picks are graded</h3>
          <p style={{ margin: '0 0 14px' }}>
            Every pick is graded against its published line and direction — a "hit" means the actual
            stat beat the line in the called direction. Pushes (actual equals the line) and DNPs
            (player did not play) are excluded from the count.
          </p>
          <p style={{ margin: '0 0 18px' }}>
            Hit rate measures directional accuracy only. It does not reflect betting profit or ROI,
            which depend on odds and stake sizing.
          </p>
          <h3 style={{ color: colors.navy, fontSize: '15px', fontWeight: 700, margin: '0 0 6px' }}>What's counted</h3>
          <p style={{ margin: '0 0 18px' }}>
            Five published pick categories are tracked: Hits, H+R+RBI, Walks, Team Hits, and Parlays.
            Every pick in these categories is counted — wins and losses both.
          </p>
          <h3 style={{ color: colors.navy, fontSize: '15px', fontWeight: 700, margin: '0 0 6px' }}>What's excluded</h3>
          <ul style={{ margin: '0', paddingLeft: '20px' }}>
            <li style={{ marginBottom: '6px' }}><strong>Strikeouts</strong> — watch-list only, never scored.</li>
            <li style={{ marginBottom: '6px' }}><strong>Home Runs (HR Watch)</strong> — still published, but not part of the graded record (entertainment/watch feature, not a scored pick).</li>
            <li><strong>Game Lines (ML / O-U)</strong> — retired; no longer published.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
