import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { colors } from '../theme';

function pct(x) { return x === null || x === undefined ? '—' : `${(x * 100).toFixed(1)}%`; }
function niceDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s || '')) return s || '';
  return new Date(s + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
function fmtNum(x) {
  if (x === null || x === undefined) return '—';
  return Number.isInteger(x) ? String(x) : x.toFixed(2);
}

const resultBadge = (result) => {
  const base = { display: 'inline-block', padding: '3px 10px', borderRadius: '4px',
    fontSize: '11px', letterSpacing: '0.5px', minWidth: '42px', fontWeight: 700, textAlign: 'center' };
  switch (result) {
    case 'HIT':  return { ...base, color: '#fff', background: colors.green };
    case 'MISS': return { ...base, color: '#fff', background: '#c0392b' };
    case 'PUSH': return { ...base, color: colors.navy, background: '#d4e1ea', fontWeight: 600 };
    default:     return { ...base, color: '#8a99a3', background: '#eef2f5', fontWeight: 600 };
  }
};

// Block display labels
const BLOCK_LABELS = {
  "hit_proj": "Hits",
  "walk_props": "Walks",
  "combo": "H+R+RBI",
  "team_hits": "Hit Leaders by Team",
};

const thStyle = {
  padding: '10px 10px', color: '#fff', fontSize: '12px',
  fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
};

export default function ResultsPage() {
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetch('/data/results_by_date.json')
      .then((r) => { if (!r.ok) throw new Error('fetch failed'); return r.json(); })
      .then((d) => {
        setData(d);
        if (dateParam && d.available_dates.includes(dateParam)) {
          setSelectedDate(dateParam);
        } else if (d.available_dates && d.available_dates.length > 0) {
          setSelectedDate(d.available_dates[d.available_dates.length - 1]);
        }
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, [dateParam]);

  const daysByDate = useMemo(() => {
    if (!data) return {};
    const m = {};
    for (const d of data.days) m[d.date] = d;
    return m;
  }, [data]);

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: colors.textMuted }}>Loading results...</div>;
  if (error || !data) return (
    <div style={{ textAlign: 'center', padding: '60px', color: colors.textMuted }}>
      Results unavailable right now. Check back shortly.
    </div>
  );

  const dates = data.available_dates || [];
  const idx = dates.indexOf(selectedDate);
  const prevDate = idx > 0 ? dates[idx - 1] : null;
  const nextDate = idx < dates.length - 1 ? dates[idx + 1] : null;
  const day = daysByDate[selectedDate];

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '24px 16px 60px' }}>
      <h1 style={{ color: colors.navy, fontSize: '22px', fontWeight: 800, margin: '0 0 16px', textAlign: 'center' }}>
        Daily Results
      </h1>

      {/* Date navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => prevDate && setSelectedDate(prevDate)} disabled={!prevDate}
          style={{ background: prevDate ? colors.navy : '#d4e1ea', color: prevDate ? '#fff' : '#8a99a3',
            border: 'none', borderRadius: '6px', padding: '8px 14px', fontWeight: 700, fontSize: '13px',
            cursor: prevDate ? 'pointer' : 'default' }}>
          Prev
        </button>
        <select value={selectedDate || ''} onChange={(e) => setSelectedDate(e.target.value)}
          style={{ background: '#fff', color: colors.navy, border: `2px solid ${colors.navy}`,
            borderRadius: '6px', padding: '8px 12px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
          {dates.map((d) => (
            <option key={d} value={d}>{niceDate(d)}</option>
          ))}
        </select>
        <button onClick={() => nextDate && setSelectedDate(nextDate)} disabled={!nextDate}
          style={{ background: nextDate ? colors.navy : '#d4e1ea', color: nextDate ? '#fff' : '#8a99a3',
            border: 'none', borderRadius: '6px', padding: '8px 14px', fontWeight: 700, fontSize: '13px',
            cursor: nextDate ? 'pointer' : 'default' }}>
          Next
        </button>
      </div>

      {/* Day content */}
      {!day ? (
        <div style={{ textAlign: 'center', background: '#f0f6fa', borderRadius: '10px', padding: '40px 20px',
          color: '#5a6b76', fontSize: '15px' }}>
          No published picks this date.
        </div>
      ) : (
        <>
          {/* Day record header */}
          <div style={{ textAlign: 'center', background: colors.navy, borderRadius: '14px', padding: '20px', marginBottom: '12px' }}>
            <div style={{ color: colors.green, fontSize: '42px', fontWeight: 800, lineHeight: 1 }}>{pct(day.rate)}</div>
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600, marginTop: '6px' }}>
              {day.hits} hits, {day.scored - day.hits} misses ({day.scored} graded)
            </div>
            <div style={{ color: colors.textMuted, fontSize: '12px', marginTop: '2px' }}>
              {day.not_counted > 0 && `${day.not_counted} DNP/PUSH not counted · `}
              {niceDate(day.date)}
            </div>
          </div>

          {/* Jump buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {(day.blocks || []).map((block) => (
              <a key={block.card_type} href={`#block-${block.card_type}`}
                style={{ background: '#f0f6fa', border: '1px solid #d4e1ea', borderRadius: '6px',
                  padding: '6px 12px', fontSize: '12px', fontWeight: 600, color: colors.navy,
                  textDecoration: 'none', whiteSpace: 'nowrap' }}>
                {BLOCK_LABELS[block.card_type] || block.type} {block.hits}/{block.scored} · {pct(block.rate)}
              </a>
            ))}
          </div>

          {/* Per-type blocks */}
          {(day.blocks || []).map((block) => (
            <section key={block.card_type} id={`block-${block.card_type}`} style={{ marginBottom: '20px' }}>
              {/* Block header */}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                padding: '10px 12px', background: colors.navyLight, borderRadius: '10px 10px 0 0' }}>
                <div>
                  <span style={{ color: '#fff', fontSize: '15px', fontWeight: 700 }}>
                    {BLOCK_LABELS[block.card_type] || block.type}
                  </span>
                  {block.direction && (
                    <span style={{ color: colors.textMuted, fontSize: '12px', marginLeft: '8px' }}>
                      {block.direction}
                    </span>
                  )}
                </div>
                <span style={{ color: colors.textMuted, fontSize: '13px' }}>
                  {block.hits}/{block.scored} · {pct(block.rate)}
                  {block.not_counted > 0 && <span style={{ opacity: 0.7 }}> ({block.not_counted} not counted)</span>}
                </span>
              </div>

              {/* Block picks table */}
              <div style={{ overflowX: 'auto', borderRadius: '0 0 10px 10px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', background: '#fff' }}>
                  <thead style={{ background: colors.navy }}>
                    <tr>
                      <th style={{ ...thStyle, textAlign: 'left' }}>Player</th>
                      <th style={{ ...thStyle, textAlign: 'left' }}>Matchup</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Projected</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Actual</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {block.picks.map((p, i) => (
                      <tr key={i} style={{ borderTop: '1px solid #eef2f5', background: i % 2 ? '#fafcfd' : '#fff',
                        opacity: p.scored ? 1 : 0.55 }}>
                        <td style={{ padding: '8px 10px', fontWeight: 600, color: colors.navy, fontSize: '13px' }}>
                          {p.player}
                        </td>
                        <td style={{ padding: '8px 10px', fontSize: '12px', color: '#5a6b76', textAlign: 'left' }}>
                          {p.matchup}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: '#5a6b76', fontVariantNumeric: 'tabular-nums', fontSize: '13px' }}>
                          {fmtNum(p.projected)}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums', fontSize: '13px', color: colors.navy }}>
                          {p.actual != null ? p.actual : '—'}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                          <span style={resultBadge(p.result)}>{p.result}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}

          {/* Exclusions note */}
          <p style={{ textAlign: 'center', color: '#8a99a3', fontSize: '12px', margin: '8px 0 0' }}>
            Strikeouts, Home Runs (HR Watch), Game Lines, and the Parlay Builder are not part of the graded record.{' '}
            <Link to="/mlb/track-record#methodology" style={{ color: '#8a99a3' }}>See methodology</Link>.
          </p>
        </>
      )}
    </div>
  );
}
