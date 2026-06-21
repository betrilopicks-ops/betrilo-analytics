import React, { useState, useEffect, useMemo } from 'react';
import { colors } from '../theme';

const PROP_LABELS = {
  hits: 'Hits',
  rbis: 'RBIs',
  hits_runs_rbis: 'H+R+RBI',
  walks: 'Walks',
};

const PROP_FILTERS = ['All', 'hits', 'hits_runs_rbis', 'rbis', 'walks'];

function flipName(n) {
  if (typeof n === 'string' && n.includes(', ')) {
    const [last, first] = n.split(', ');
    return `${first} ${last}`;
  }
  return n;
}

// Odds shown with ~ prefix: indicative, captured at generation. Derived = laddered
// from a 1.5 line (elite hitters with no 0.5 market). Suppressed = no usable line.
function fmtOdds(r) {
  if (r.odds === null || r.odds === undefined) return '—';
  return r.odds > 0 ? `+${r.odds}` : `${r.odds}`;
}
function fmtPct(r) {
  // edge/ev only meaningful when odds came from a real market line
  if (r.odds_source === 'derived' || r.odds_source === 'none' || r.edge === null || r.edge === undefined) return '—';
  return `${(r.edge * 100).toFixed(1)}%`;
}
function fmtEv(r) {
  if (r.odds_source === 'derived' || r.odds_source === 'none' || r.ev === null || r.ev === undefined) return '—';
  return r.ev > 0 ? `+${r.ev.toFixed(2)}` : r.ev.toFixed(2);
}
function titleBook(r) {
  if (r.odds_source === 'derived') return 'derived';
  if (!r.book) return '—';
  return r.book.charAt(0).toUpperCase() + r.book.slice(1);
}

// Column definitions: key drives sorting, accessor returns the sort value.
const COLUMNS = [
  { key: 'player',  label: 'Player',   align: 'left',   accessor: (r) => flipName(r.player) },
  { key: 'team',    label: 'Team',     align: 'left',   accessor: (r) => r.team || '' },
  { key: 'opp',     label: 'Opp',      align: 'left',   accessor: (r) => r.opp || '' },
  { key: 'pitcher', label: 'Pitcher',  align: 'left',   accessor: (r) => r.pitcher || '' },
  { key: 'prop',    label: 'Prop',     align: 'left',   accessor: (r) => r.prop || '' },
  { key: 'line',    label: 'Line',     align: 'center', accessor: (r) => (r.line ?? -Infinity) },
  { key: 'dir',     label: 'Pick',     align: 'center', accessor: (r) => r.dir || '' },
  { key: 'book',    label: 'Book',     align: 'left',   accessor: (r) => r.book || '' },
  { key: 'odds',    label: 'Odds (~)', align: 'right',  accessor: (r) => (r.odds ?? -Infinity) },
  { key: 'edge',    label: 'Edge',     align: 'right',  accessor: (r) => (r.edge ?? -Infinity) },
  { key: 'ev',      label: 'EV/Unit',  align: 'right',  accessor: (r) => (r.ev ?? -Infinity) },
];

export default function EdgeReportPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [propFilter, setPropFilter] = useState('All');
  const [dirFilter, setDirFilter] = useState('All');
  const [teamFilter, setTeamFilter] = useState('All');
  const [sortKey, setSortKey] = useState('edge');
  const [sortDir, setSortDir] = useState('desc');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/data/edge_report_latest.json')
      .then((r) => { if (!r.ok) throw new Error('fetch failed'); return r.json(); })
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const colByKey = useMemo(() => Object.fromEntries(COLUMNS.map((c) => [c.key, c])), []);
  const teams = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.picks.map((p) => p.team).filter(Boolean))).sort();
  }, [data]);

  const rows = useMemo(() => {
    if (!data) return [];
    let r = data.picks.slice();
    if (propFilter !== 'All') r = r.filter((x) => x.prop === propFilter);
    if (teamFilter !== 'All') r = r.filter((x) => x.team === teamFilter);
    if (dirFilter !== 'All') r = r.filter((x) => x.dir === dirFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      r = r.filter((x) =>
        flipName(x.player).toLowerCase().includes(q) ||
        (x.team || '').toLowerCase().includes(q) ||
        (x.opp || '').toLowerCase().includes(q));
    }
    const acc = colByKey[sortKey].accessor;
    r.sort((a, b) => {
      const an = acc(a), bn = acc(b);
      if (typeof an === 'string' || typeof bn === 'string') {
        return sortDir === 'asc' ? String(an).localeCompare(String(bn)) : String(bn).localeCompare(String(an));
      }
      return sortDir === 'asc' ? an - bn : bn - an;
    });
    return r;
  }, [data, propFilter, dirFilter, teamFilter, search, sortKey, sortDir, colByKey]);

  const setSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir(['player', 'team', 'opp', 'pitcher', 'prop', 'book'].includes(key) ? 'asc' : 'desc'); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: colors.textMuted }}>Loading edge report…</div>;
  if (error || !data) return (
    <div style={{ textAlign: 'center', padding: '60px', color: colors.textMuted }}>
      Edge report unavailable right now. Check back after today's slate posts.
    </div>
  );

  const niceDate = data.slate_date
    ? new Date(data.slate_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div style={{ maxWidth: 1500, margin: '0 auto', padding: '24px 16px 60px' }}>
      <div style={{ textAlign: 'center', marginBottom: '6px' }}>
        <h1 style={{ color: colors.navy, fontSize: '30px', fontWeight: 800, margin: 0 }}>Edge Report</h1>
        <p style={{ color: '#5a6b76', fontSize: '14px', margin: '6px 0 2px' }}>
          Today's model picks by prop. {niceDate && `Slate: ${niceDate}.`}
        </p>
        <p style={{ color: '#8a99a3', fontSize: '12px', margin: 0 }}>
          {data.count} props. Odds (~) are indicative, captured when the slate was generated — lines move by game time. Edge/EV shown only where a real market line exists.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', margin: '18px 0' }}>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {PROP_FILTERS.map((p) => (
            <button key={p} onClick={() => setPropFilter(p)}
              style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                background: propFilter === p ? colors.blue : '#e8eef2', color: propFilter === p ? '#fff' : colors.navy }}>
              {p === 'All' ? 'All Props' : PROP_LABELS[p]}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {['All', 'OVER', 'UNDER'].map((d) => (
            <button key={d} onClick={() => setDirFilter(d)}
              style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                background: dirFilter === d ? colors.blue : '#e8eef2', color: dirFilter === d ? '#fff' : colors.navy }}>
              {d === 'All' ? 'O/U' : d}
            </button>
          ))}
        </div>
        <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}
          style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cdd8e0', fontSize: '13px', color: colors.navy, background: '#fff', cursor: 'pointer' }}>
          <option value="All">All Teams</option>
          {teams.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search player or team"
          style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #cdd8e0', fontSize: '13px', minWidth: '180px' }} />
      </div>

      <div style={{ overflowX: 'auto', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', background: '#fff' }}>
          <thead style={{ background: colors.navy }}>
            <tr>
              {COLUMNS.map((c) => (
                <th key={c.key} onClick={() => setSort(c.key)}
                  style={{ textAlign: c.align, padding: '10px 12px', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
                    color: sortKey === c.key ? colors.green : '#fff', fontSize: '12px', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                    ...(c.key === 'player' ? { position: 'sticky', left: 0, zIndex: 3, background: colors.navy } : {}) }}>
                  {c.label}{sortKey === c.key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const strong = (r.label || '').startsWith('STRONG');
              const rowBg = i % 2 ? '#fafcfd' : '#fff';
              return (
                <tr key={i} style={{ borderTop: '1px solid #eef2f5', background: rowBg }}>
                  <td style={{ padding: '9px 12px', textAlign: 'left', fontWeight: 600, color: colors.navy, whiteSpace: 'nowrap', position: 'sticky', left: 0, zIndex: 1, background: rowBg, borderRight: '2px solid #e3e9ed' }}>{flipName(r.player)}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'left', color: '#5a6b76' }}>{r.team || '—'}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'left', color: '#5a6b76' }}>{r.opp}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'left', color: '#5a6b76', whiteSpace: 'nowrap' }}>{r.pitcher}{r.hand ? ` (${r.hand})` : ''}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'left', color: '#5a6b76' }}>{PROP_LABELS[r.prop] || r.prop}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'center' }}>{r.line ?? '—'}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <span style={{ fontWeight: 700, color: r.dir === 'OVER' ? colors.green : '#c0392b' }}>{r.dir}</span>
                    {strong && <span style={{ marginLeft: '5px', fontSize: '10px', fontWeight: 700, color: colors.navy, background: colors.green, padding: '1px 5px', borderRadius: '3px' }}>STRONG</span>}
                  </td>
                  <td style={{ padding: '9px 12px', textAlign: 'left', color: r.odds_source === 'derived' ? '#8a99a3' : '#5a6b76', fontStyle: r.odds_source === 'derived' ? 'italic' : 'normal' }}>{titleBook(r)}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmtOdds(r)}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: (r.edge > 0 && r.odds_source === 'book') ? colors.green : '#5a6b76' }}>{fmtPct(r)}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: (r.ev > 0 && r.odds_source === 'book') ? colors.navy : '#5a6b76' }}>{fmtEv(r)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <p style={{ textAlign: 'center', color: colors.textMuted, marginTop: '24px' }}>No props match those filters.</p>}
      <div style={{ marginTop: '16px', padding: '12px 14px', background: '#f4f7f9', borderRadius: '8px', fontSize: '12px', color: '#5a6b76', lineHeight: 1.6 }}>
        <strong style={{ color: colors.navy }}>Key:</strong> <strong>Line</strong> — the prop threshold (e.g. 0.5 = "to record a hit"). <strong>Pick</strong> — model's side (Over/Under); STRONG = highest conviction. <strong>Book</strong> — sportsbook offering the odds; "derived" = laddered from the 1.5 line for elite hitters with no 0.5 market. <strong>Odds</strong> — American odds, ~ indicates indicative (captured at generation). <strong>Edge</strong> — model probability minus the market's. <strong>EV/Unit</strong> — expected return per unit staked. Edge/EV show "—" for derived odds since they aren't a true market line.
      </div>
    </div>
  );
}
