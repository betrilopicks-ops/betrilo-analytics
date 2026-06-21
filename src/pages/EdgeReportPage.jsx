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

// Column definitions: key drives sorting, accessor returns the sort value.
const COLUMNS = [
  { key: 'player',  label: 'Player',   align: 'left',   accessor: (r) => flipName(r.player) },
  { key: 'team',    label: 'Team',     align: 'left',   accessor: (r) => r.team || '' },
  { key: 'opp',     label: 'Opp',      align: 'left',   accessor: (r) => r.opp || '' },
  { key: 'pitcher', label: 'Pitcher',  align: 'left',   accessor: (r) => r.pitcher || '' },
  { key: 'prop',    label: 'Prop',     align: 'left',   accessor: (r) => r.prop || '' },
  { key: 'line',    label: 'Line',     align: 'center', accessor: (r) => (r.line ?? -Infinity) },
  { key: 'dir',     label: 'Pick',     align: 'center', accessor: (r) => r.dir || '' },
];

export default function EdgeReportPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [propFilter, setPropFilter] = useState('All');
  const [dirFilter, setDirFilter] = useState('All');
  const [sortKey, setSortKey] = useState('player');
  const [sortDir, setSortDir] = useState('asc');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/data/edge_report_latest.json')
      .then((r) => { if (!r.ok) throw new Error('fetch failed'); return r.json(); })
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const colByKey = useMemo(() => Object.fromEntries(COLUMNS.map((c) => [c.key, c])), []);

  const rows = useMemo(() => {
    if (!data) return [];
    let r = data.picks.slice();
    if (propFilter !== 'All') r = r.filter((x) => x.prop === propFilter);
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
  }, [data, propFilter, dirFilter, search, sortKey, sortDir, colByKey]);

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
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px 60px' }}>
      <div style={{ textAlign: 'center', marginBottom: '6px' }}>
        <h1 style={{ color: colors.navy, fontSize: '30px', fontWeight: 800, margin: 0 }}>Edge Report</h1>
        <p style={{ color: '#5a6b76', fontSize: '14px', margin: '6px 0 2px' }}>
          Today's model picks by prop. {niceDate && `Slate: ${niceDate}.`}
        </p>
        <p style={{ color: '#8a99a3', fontSize: '12px', margin: 0 }}>
          {data.count} props. Odds, edge, and EV are temporarily hidden while we upgrade our odds source.
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
                    textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {c.label}{sortKey === c.key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const strong = (r.label || '').startsWith('STRONG');
              return (
                <tr key={i} style={{ borderTop: '1px solid #eef2f5', background: i % 2 ? '#fafcfd' : '#fff' }}>
                  <td style={{ padding: '9px 12px', textAlign: 'left', fontWeight: 600, color: colors.navy, whiteSpace: 'nowrap' }}>{flipName(r.player)}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'left', color: '#5a6b76' }}>{r.team || '—'}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'left', color: '#5a6b76' }}>{r.opp}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'left', color: '#5a6b76', whiteSpace: 'nowrap' }}>{r.pitcher}{r.hand ? ` (${r.hand})` : ''}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'left', color: '#5a6b76' }}>{PROP_LABELS[r.prop] || r.prop}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'center' }}>{r.line ?? '—'}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <span style={{ fontWeight: 700, color: r.dir === 'OVER' ? colors.green : '#c0392b' }}>{r.dir}</span>
                    {strong && <span style={{ marginLeft: '5px', fontSize: '10px', fontWeight: 700, color: colors.navy, background: colors.green, padding: '1px 5px', borderRadius: '3px' }}>STRONG</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <p style={{ textAlign: 'center', color: colors.textMuted, marginTop: '24px' }}>No props match those filters.</p>}
    </div>
  );
}
