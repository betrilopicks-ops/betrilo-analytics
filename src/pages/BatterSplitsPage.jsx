import React, { useState, useEffect, useMemo } from 'react';
import { colors } from '../theme';

const FRAMES = [
  { key: 'career', label: 'Career (2008+)' },
  { key: 'season', label: '2026 Season' },
];

const CUTS = [
  { key: 'vsL', label: 'vs LHP' },
  { key: 'vsR', label: 'vs RHP' },
  { key: 'home', label: 'Home' },
  { key: 'away', label: 'Away' },
];

function fmtAvg(v) { return v === null || v === undefined ? '—' : v.toFixed(3).replace(/^0/, ''); }
function fmtInt(v) { return v === null || v === undefined ? '—' : String(v); }

export default function BatterSplitsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [frame, setFrame] = useState('career');
  const [search, setSearch] = useState('');
  const [minAb, setMinAb] = useState(0);
  const [sortKey, setSortKey] = useState('vsR.avg');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    fetch('/data/batter_splits_latest.json')
      .then((r) => { if (!r.ok) throw new Error('fetch failed'); return r.json(); })
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  // total AB in the current frame = vsL.ab + vsR.ab (covers all PAs; home/away is the same total split differently)
  const frameTotalAb = (p) => {
    const f = p[frame];
    if (!f) return 0;
    return ((f.vsL && f.vsL.ab) || 0) + ((f.vsR && f.vsR.ab) || 0);
  };

  const getVal = (p, key) => {
    // key like "vsR.avg" or "vsL.ab"
    const [cut, stat] = key.split('.');
    const f = p[frame];
    if (!f || !f[cut]) return null;
    return f[cut][stat];
  };

  const rows = useMemo(() => {
    if (!data) return [];
    let r = data.players.slice();
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      r = r.filter((p) => p.player.toLowerCase().includes(q));
    }
    if (minAb > 0) r = r.filter((p) => frameTotalAb(p) >= minAb);
    r.sort((a, b) => {
      if (sortKey === 'player') {
        return sortDir === 'asc' ? a.player.localeCompare(b.player) : b.player.localeCompare(a.player);
      }
      const av = getVal(a, sortKey), bv = getVal(b, sortKey);
      const an = av === null || av === undefined ? -Infinity : av;
      const bn = bv === null || bv === undefined ? -Infinity : bv;
      return sortDir === 'asc' ? an - bn : bn - an;
    });
    return r;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, search, minAb, sortKey, sortDir, frame]);

  const setSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir(key === 'player' ? 'asc' : 'desc'); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: colors.textMuted }}>Loading batter splits…</div>;
  if (error || !data) return (
    <div style={{ textAlign: 'center', padding: '60px', color: colors.textMuted }}>
      Batter splits unavailable right now. Check back after today's slate posts.
    </div>
  );

  const headerCell = (label, key, align = 'right') => (
    <th onClick={() => setSort(key)}
      style={{ textAlign: align, padding: '8px 10px', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
        color: sortKey === key ? colors.green : '#fff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.3px' }}>
      {label}{sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
    </th>
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px 60px' }}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h1 style={{ color: colors.navy, fontSize: '30px', fontWeight: 800, margin: 0 }}>Batter Splits</h1>
        <p style={{ color: '#5a6b76', fontSize: '14px', margin: '6px 0 0' }}>
          Platoon and home/away splits for today's batters. Career covers 2008–present.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {FRAMES.map((f) => (
            <button key={f.key} onClick={() => setFrame(f.key)}
              style={{ padding: '7px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700,
                background: frame === f.key ? colors.blue : '#e8eef2', color: frame === f.key ? '#fff' : colors.navy }}>
              {f.label}
            </button>
          ))}
        </div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search player"
          style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #cdd8e0', fontSize: '13px', minWidth: '160px' }} />
        <label style={{ fontSize: '13px', color: '#5a6b76', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Min AB ({frame === 'career' ? 'career' : '2026'}):
          <input type="number" min="0" max={frame === 'career' ? 5000 : 700} step={frame === 'career' ? 25 : 5}
            value={minAb} onChange={(e) => setMinAb(Math.max(0, parseInt(e.target.value, 10) || 0))}
            style={{ width: '70px', padding: '5px 8px', borderRadius: '6px', border: '1px solid #cdd8e0', fontSize: '13px', color: colors.navy, fontWeight: 700 }} />
          <input type="range" min="0" max={frame === 'career' ? 2000 : 300} step={frame === 'career' ? 50 : 10}
            value={minAb > (frame === 'career' ? 2000 : 300) ? (frame === 'career' ? 2000 : 300) : minAb}
            onChange={(e) => setMinAb(parseInt(e.target.value, 10))} style={{ accentColor: colors.green }} />
        </label>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', background: '#fff' }}>
          <thead>
            {/* group header row */}
            <tr style={{ background: colors.navy }}>
              <th rowSpan={2} onClick={() => setSort('player')}
                style={{ textAlign: 'left', padding: '8px 12px', cursor: 'pointer', verticalAlign: 'bottom',
                  color: sortKey === 'player' ? colors.green : '#fff', fontSize: '11px', fontWeight: 700 }}>
                Player{sortKey === 'player' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
              </th>
              {CUTS.map((c, i) => (
                <th key={c.key} colSpan={3}
                  style={{ textAlign: 'center', padding: '6px 10px', color: colors.green, fontSize: '11px', fontWeight: 800,
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                    borderLeft: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.12)' }}>
                  {c.label}
                </th>
              ))}
            </tr>
            <tr style={{ background: colors.navy }}>
              {CUTS.map((c, i) => (
                <React.Fragment key={c.key}>
                  {headerCell('AVG', `${c.key}.avg`)}
                  {headerCell('AB', `${c.key}.ab`)}
                  {headerCell('HR', `${c.key}.hr`)}
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p, idx) => {
              const f = p[frame] || {};
              return (
                <tr key={idx} style={{ borderTop: '1px solid #eef2f5', background: idx % 2 ? '#fafcfd' : '#fff' }}>
                  <td style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: colors.navy, whiteSpace: 'nowrap' }}>{p.player}</td>
                  {CUTS.map((c) => {
                    const cut = f[c.key] || {};
                    return (
                      <React.Fragment key={c.key}>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: colors.navy }}>{fmtAvg(cut.avg)}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: '#5a6b76', fontVariantNumeric: 'tabular-nums' }}>{fmtInt(cut.ab)}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: '#5a6b76', fontVariantNumeric: 'tabular-nums' }}>{fmtInt(cut.hr)}</td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <div style={{ padding: '24px', textAlign: 'center', color: colors.textMuted }}>No batters match those filters.</div>}
      </div>
      <p style={{ color: '#8a99a3', fontSize: '12px', marginTop: '10px', textAlign: 'center' }}>
        {rows.length} batters. Splits built on pitcher handedness, so switch-hitter platoon numbers resolve correctly. AVG shown when AB &gt; 0.
      </p>
    </div>
  );
}
