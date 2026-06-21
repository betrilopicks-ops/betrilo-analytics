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

  useEffect(() => {
    fetch('/data/track_record_latest.json')
      .then((r) => { if (!r.ok) throw new Error('fetch failed'); return r.json(); })
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const verified = !!(data && data.verified);

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: colors.textMuted }}>Loading track record…</div>;
  if (error || !data) return (
    <div style={{ textAlign: 'center', padding: '60px', color: colors.textMuted }}>
      Track record unavailable right now. Check back shortly.
    </div>
  );

  const o = data.overall || {};
  const w = data.window || {};

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '24px 16px 60px' }}>
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <span style={{ display: 'inline-block', background: verified ? colors.green : colors.navyLight,
          color: verified ? colors.navy : colors.green, fontSize: '11px', fontWeight: 700,
          letterSpacing: '1.5px', textTransform: 'uppercase', padding: '5px 13px', borderRadius: '999px' }}>
          {verified ? 'Verified Track Record' : 'Validation in Progress'}
        </span>
      </div>

      {/* Headline: lifetime overall only */}
      <div style={{ textAlign: 'center', background: colors.navy, borderRadius: '14px', padding: '30px 20px', margin: '14px 0 8px' }}>
        <div style={{ color: colors.green, fontSize: '64px', fontWeight: 800, lineHeight: 1 }}>{pct(o.rate)}</div>
        <div style={{ color: '#fff', fontSize: '15px', fontWeight: 600, marginTop: '8px' }}>
          Overall hit rate
        </div>
        <div style={{ color: colors.textMuted, fontSize: '13px', marginTop: '4px' }}>
          {o.hits?.toLocaleString()} of {o.scored?.toLocaleString()} graded picks · {niceDate(w.start)} – {niceDate(w.end)}
        </div>
      </div>
      <p style={{ textAlign: 'center', color: '#8a99a3', fontSize: '12px', margin: '0 0 28px' }}>
        Every pick is graded against the closing line and counted — wins and losses both. Discontinued prop types are excluded.
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

      {/* Per-prop */}
      <section>
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
    </div>
  );
}
