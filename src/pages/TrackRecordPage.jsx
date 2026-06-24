import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { colors } from '../theme';

function pct(x) { return x === null || x === undefined ? '—' : `${(x * 100).toFixed(1)}%`; }
function niceDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s || '')) return s || '';
  return new Date(s + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// Color for a day cell based on rate (0–1). Green for high, muted for low, navy base.
function cellColor(rate) {
  if (rate >= 0.75) return { bg: colors.green, text: colors.navy };
  if (rate >= 0.65) return { bg: '#1a8a3a', text: '#fff' };
  if (rate >= 0.55) return { bg: colors.navyLight, text: colors.green };
  if (rate >= 0.45) return { bg: colors.navyLight, text: '#9fb3c0' };
  return { bg: '#1a2a38', text: '#c0392b' };
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS = ['S','M','T','W','T','F','S'];

function CalendarHeatGrid({ daily }) {
  const byDate = useMemo(() => {
    const m = {};
    for (const d of daily) m[d.date] = d;
    return m;
  }, [daily]);

  // Determine available month range
  const dates = daily.map(d => d.date).sort();
  const firstDate = dates[0] ? new Date(dates[0] + 'T12:00:00') : new Date();
  const lastDate = dates.length ? new Date(dates[dates.length - 1] + 'T12:00:00') : new Date();
  const firstIso = dates[0] || '';
  const lastIso = dates[dates.length - 1] || '';
  const minMonth = firstDate.getFullYear() * 12 + firstDate.getMonth();
  const maxMonth = lastDate.getFullYear() * 12 + lastDate.getMonth();

  // 2026 All-Star break: confirmed dates with specific labels.
  // Jul 16 (NYY @ PHI) is a real one-game day — NOT a break day.
  const ASB_LABELS = {
    '2026-07-13': ['Home Run', 'Derby'],
    '2026-07-14': ['All-Star', 'Game'],
    '2026-07-15': ['All-Star', 'Break'],
  };

  const [viewMonth, setViewMonth] = useState(maxMonth);
  const year = Math.floor(viewMonth / 12);
  const month = viewMonth % 12;

  // Build the grid: first day of month, pad to Sunday start
  const firstOfMonth = new Date(year, month, 1);
  const startDow = firstOfMonth.getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  // Leading blanks
  for (let i = 0; i < startDow; i++) cells.push(null);
  // Days
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayData = byDate[iso] || null;
    cells.push({ day: d, iso, data: dayData });
  }

  return (
    <div>
      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <button onClick={() => setViewMonth(Math.max(minMonth, viewMonth - 1))} disabled={viewMonth <= minMonth}
          style={{ background: viewMonth > minMonth ? colors.navy : '#d4e1ea', color: viewMonth > minMonth ? '#fff' : colors.subtitleOnWhite,
            border: 'none', borderRadius: '6px', padding: '6px 12px', fontWeight: 700, fontSize: '13px',
            cursor: viewMonth > minMonth ? 'pointer' : 'default' }}>
          Prev
        </button>
        <span style={{ color: colors.navy, fontSize: '16px', fontWeight: 800 }}>
          {MONTH_NAMES[month]} {year}
        </span>
        <button onClick={() => setViewMonth(Math.min(maxMonth, viewMonth + 1))} disabled={viewMonth >= maxMonth}
          style={{ background: viewMonth < maxMonth ? colors.navy : '#d4e1ea', color: viewMonth < maxMonth ? '#fff' : colors.subtitleOnWhite,
            border: 'none', borderRadius: '6px', padding: '6px 12px', fontWeight: 700, fontSize: '13px',
            cursor: viewMonth < maxMonth ? 'pointer' : 'default' }}>
          Next
        </button>
      </div>

      {/* Day-of-week headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', marginBottom: '3px' }}>
        {DAY_LABELS.map((l, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: colors.subtitleOnWhite, padding: '4px 0' }}>
            {l}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
        {cells.map((cell, i) => {
          if (!cell) return <div key={`blank-${i}`} />;
          const { day, iso, data } = cell;
          const hasData = data && data.scored > 0;
          const isPast = iso <= lastIso;
          const inWindow = iso >= firstIso && isPast;
          const asbLabel = ASB_LABELS[iso] || null;
          const isGap = inWindow && !hasData && !asbLabel; // single-day gap like 4/2

          const cellBase = { borderRadius: '6px', padding: '8px 2px',
            textAlign: 'center', aspectRatio: '1', display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center', minHeight: '0' };

          // State 1: Data day — colored, clickable
          if (hasData) {
            const rate = data.rate;
            const c = cellColor(rate);
            return (
              <Link key={iso} to={`/mlb/results?date=${iso}`} style={{ textDecoration: 'none' }}
                aria-label={`${MONTH_NAMES[month]} ${day}: ${pct(rate)} hit rate`}>
                <div style={{ ...cellBase, background: c.bg, cursor: 'pointer' }} aria-hidden="true">
                  <span style={{ fontSize: 'clamp(9px, 2vw, 11px)', color: c.text, opacity: 0.7, lineHeight: 1 }}>{day}</span>
                  <span style={{ fontSize: 'clamp(10px, 2.5vw, 14px)', color: c.text, fontWeight: 800, lineHeight: 1.3, whiteSpace: 'nowrap' }}>
                    {pct(rate)}
                  </span>
                </div>
              </Link>
            );
          }

          // State 4: All-Star break event — specific label, non-clickable
          if (asbLabel && !hasData) {
            return (
              <div key={iso} style={{ ...cellBase, background: '#e4edf4', border: `1px solid ${colors.navyLight}` }}
                title={asbLabel.join(' ') + ' — no regular-season games'}>
                <span style={{ fontSize: 'clamp(9px, 2vw, 11px)', color: colors.subtitleOnWhite, lineHeight: 1 }}>{day}</span>
                <span style={{ fontSize: 'clamp(8px, 1.8vw, 10px)', color: colors.navy, fontWeight: 700,
                  lineHeight: 1.15, textAlign: 'center', whiteSpace: 'nowrap' }}>
                  {asbLabel[0]}<br />{asbLabel[1]}
                </span>
              </div>
            );
          }

          // State 3: Past gap (e.g. 4/2) — light with dash marker, non-clickable
          if (isGap) {
            return (
              <div key={iso} style={{ ...cellBase, background: '#eef2f5', border: '1px solid #d4e1ea' }}>
                <span style={{ fontSize: 'clamp(10px, 2.5vw, 13px)', color: colors.subtitleOnWhite, fontWeight: 600 }}>{day}</span>
                <span style={{ fontSize: 'clamp(9px, 2vw, 11px)', color: '#b0bec5' }}>—</span>
              </div>
            );
          }

          // State 2: Future / outside window — light neutral, non-clickable
          return (
            <div key={iso} style={{ ...cellBase, background: '#f5f7f9', border: '1px solid #e8eef2' }}>
              <span style={{ fontSize: 'clamp(10px, 2.5vw, 13px)', color: '#c0cdd6', fontWeight: 600 }}>{day}</span>
            </div>
          );
        })}
      </div>
    </div>
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
      <h1 style={{ color: colors.navy, fontSize: '30px', fontWeight: 800, margin: '0 0 4px', textAlign: 'center' }}>Track Record</h1>
      {/* Rebase-reveal banner (Edit 6) */}
      {showReveal && (
        <div style={{ background: '#f0f6fa', border: '1px solid #d4e1ea', borderRadius: '10px',
          padding: '14px 16px', margin: '0 0 16px', position: 'relative', fontSize: '13px',
          color: '#3a5060', lineHeight: 1.55 }}>
          <button onClick={dismissReveal} style={{ position: 'absolute', top: '8px',
            right: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px',
            color: colors.subtitleOnWhite, lineHeight: 1 }} aria-label="Dismiss">x</button>
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
      <p style={{ textAlign: 'center', color: colors.subtitleOnWhite, fontSize: '12px', margin: '0 0 28px' }}>
        Hit rate on the picks we actually post — not profit. Four categories tracked; <a href="#methodology" style={{ color: colors.subtitleOnWhite }}>full breakdown below</a>.
      </p>

      {/* Calendar heat grid — replaces TrendChart */}
      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: colors.navy, fontSize: '18px', fontWeight: 800, margin: '0 0 10px' }}>Daily results</h2>
        <div style={{ background: '#fff', borderRadius: '10px', padding: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <CalendarHeatGrid daily={data.daily || []} />
        </div>
        <p style={{ color: colors.subtitleOnWhite, fontSize: '12px', margin: '8px 0 0' }}>
          Click any day to see that date's full pick-by-pick results. Brighter green = higher hit rate.
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
                <th scope="col" style={{ textAlign: 'left', padding: '10px 12px', color: '#fff', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Prop</th>
                <th scope="col" style={{ textAlign: 'right', padding: '10px 12px', color: '#fff', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hits</th>
                <th scope="col" style={{ textAlign: 'right', padding: '10px 12px', color: '#fff', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Scored</th>
                <th scope="col" style={{ textAlign: 'right', padding: '10px 12px', color: '#fff', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hit Rate</th>
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
            Four published pick categories are tracked: Hits, H+R+RBI, Walks, and Team Hits.
            Every pick in these categories is counted — wins and losses both.
          </p>
          <h3 style={{ color: colors.navy, fontSize: '15px', fontWeight: 700, margin: '0 0 6px' }}>What's excluded</h3>
          <ul style={{ margin: '0', paddingLeft: '20px' }}>
            <li style={{ marginBottom: '6px' }}><strong>Strikeouts</strong> — watch-list only, never scored.</li>
            <li style={{ marginBottom: '6px' }}><strong>Home Runs (HR Watch)</strong> — still published, but not part of the graded record (entertainment/watch feature, not a scored pick).</li>
            <li style={{ marginBottom: '6px' }}><strong>Game Lines (ML / O-U)</strong> — retired; no longer published.</li>
            <li><strong>Parlay Builder</strong> — a menu card whose picks duplicate the individual categories above; excluded to avoid double-counting.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
