import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { colors } from '../theme';

/* ── Helpers ───────────────────────────────────────────────────────────────── */

const fmtDate = (d) => {
  if (!d) return '—';
  const p = d.split('-');
  return p.length === 3 ? `${parseInt(p[1])}/${parseInt(p[2])}` : d;
};
const fmt1 = (v) => (v != null ? Number(v).toFixed(1) : '—');
const fmt3 = (v) => (v != null ? Number(v).toFixed(3).replace(/^0/, '') : '—');
const fmtPct = (v) => (v != null ? `${(Number(v) * 100).toFixed(0)}%` : '—');

const TEAMS = [
  'ARI','ATL','BAL','BOS','CHC','CWS','CIN','CLE','COL','DET','HOU','KC','LAA','LAD',
  'MIA','MIL','MIN','NYM','NYY','OAK','PHI','PIT','SD','SF','SEA','STL','TB','TEX','TOR','WSH','AZ'
];

/* ── Sticky cell helper ────────────────────────────────────────────────────── */

const stickyStyle = (left, bg, extra = {}) => ({
  position: 'sticky', left, zIndex: 2, background: bg, whiteSpace: 'nowrap', ...extra,
});

/* ── View count options ────────────────────────────────────────────────────── */
const VIEW_OPTIONS = [
  { label: 'Recent 10', value: 10 },
  { label: 'Last 25', value: 25 },
  { label: 'Full Season', value: Infinity },
];

/* ══════════════════════════════════════════════════════════════════════════════
   BATTER VIEW
   ══════════════════════════════════════════════════════════════════════════════ */

function BatterView({ data }) {
  const [search, setSearch] = useState('');
  const [team, setTeam] = useState('');
  const [opp, setOpp] = useState('');
  const [ha, setHa] = useState('');
  const [vsHand, setVsHand] = useState('');
  const [batSide, setBatSide] = useState('');
  const [preset, setPreset] = useState('');
  const [viewCount, setViewCount] = useState(10);
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const clearFilters = () => {
    setSearch(''); setTeam(''); setOpp(''); setHa(''); setVsHand('');
    setBatSide(''); setPreset('');
  };

  const filtered = useMemo(() => {
    let rows = data;
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter(r => r.name.toLowerCase().includes(s));
    }
    if (team) rows = rows.filter(r => r.tm === team);
    if (opp) rows = rows.filter(r => r.opp === opp);
    if (ha) rows = rows.filter(r => r.ha === ha);
    if (vsHand) rows = rows.filter(r => r.vsh === vsHand);
    if (batSide) rows = rows.filter(r => r.bat === batSide);
    if (preset === '2h') rows = rows.filter(r => r.h >= 2);
    if (preset === 'hr') rows = rows.filter(r => r.hr >= 1);
    if (preset === '3k') rows = rows.filter(r => r.k >= 3);
    if (preset === '0fer') rows = rows.filter(r => r.ab > 0 && r.h === 0);

    const textKeys = ['name', 'tm', 'opp', 'date', 'ha', 'bat', 'vsh'];
    const isText = textKeys.includes(sortBy);
    rows = [...rows].sort((a, b) => {
      let av = a[sortBy], bv = b[sortBy];
      if (isText) {
        av = String(av || '').toLowerCase();
        bv = String(bv || '').toLowerCase();
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      av = typeof av === 'number' ? av : -Infinity;
      bv = typeof bv === 'number' ? bv : -Infinity;
      return sortDir === 'asc' ? av - bv : bv - av;
    });

    if (viewCount !== Infinity) rows = rows.slice(0, viewCount);
    return rows;
  }, [data, search, team, opp, ha, vsHand, batSide, preset, viewCount, sortBy, sortDir]);

  const handleSort = (key) => {
    if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortDir(key === 'name' ? 'asc' : 'desc'); }
  };

  const cols = [
    { key: 'date', label: 'Date', w: 50 },
    { key: 'name', label: 'Player', w: 130 },
    { key: 'tm', label: 'Team', w: 40 },
    { key: 'opp', label: 'Opp', w: 40 },
    { key: 'ha', label: 'H/A', w: 36 },
    { key: 'ab', label: 'AB' }, { key: 'h', label: 'H' }, { key: 'r', label: 'R' },
    { key: 'rbi', label: 'RBI' }, { key: 'hr', label: 'HR' }, { key: 'k', label: 'K' },
    { key: 'bb', label: 'BB' }, { key: 'tb', label: 'TB' }, { key: 'sb', label: 'SB' },
    { key: 'vsh', label: 'vs Hand' },
  ];

  const anyFilter = search || team || opp || ha || vsHand || batSide || preset;
  const rowBg = (i) => i % 2 ? '#fafcfd' : '#fff';

  return (
    <>
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search player"
          style={{ padding: '6px 10px', fontSize: '13px', borderRadius: '5px', border: '1px solid #cdd8e0', minWidth: '150px' }} />
        <select value={team} onChange={e => setTeam(e.target.value)} style={selStyle}>
          <option value="">All Teams</option>
          {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={opp} onChange={e => setOpp(e.target.value)} style={selStyle}>
          <option value="">All Opponents</option>
          {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={ha} onChange={e => setHa(e.target.value)} style={selStyle}>
          <option value="">H/A</option>
          <option value="Home">Home</option>
          <option value="Away">Away</option>
        </select>
        <select value={vsHand} onChange={e => setVsHand(e.target.value)} style={selStyle}>
          <option value="">vs Hand</option>
          <option value="R">vs RHP</option>
          <option value="L">vs LHP</option>
        </select>
        <select value={batSide} onChange={e => setBatSide(e.target.value)} style={selStyle}>
          <option value="">Bat Side</option>
          <option value="R">R</option>
          <option value="L">L</option>
          <option value="S">S</option>
        </select>
        <select value={preset} onChange={e => setPreset(e.target.value)} style={selStyle}>
          <option value="">Presets</option>
          <option value="2h">Multi-Hit (2+ H)</option>
          <option value="hr">Home Run</option>
          <option value="3k">3+ K</option>
          <option value="0fer">0-for</option>
        </select>
        {anyFilter && <button onClick={clearFilters} style={clearBtnStyle}>Clear</button>}
      </div>

      {/* View count + result count */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px', fontSize: '13px', color: '#5a6b76' }}>
        {VIEW_OPTIONS.map(o => (
          <button key={o.value} onClick={() => setViewCount(o.value)}
            style={{ ...viewBtnStyle, ...(viewCount === o.value ? viewBtnActive : {}) }}>
            {o.label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontWeight: 600 }}>{filtered.length.toLocaleString()} games</span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', background: '#fff', minWidth: '700px' }}>
          <thead style={{ background: colors.navy }}>
            <tr>
              {cols.map(col => (
                <th key={col.key} onClick={() => handleSort(col.key)} style={{
                  padding: '8px 6px', textAlign: 'center', cursor: 'pointer', userSelect: 'none',
                  color: sortBy === col.key ? colors.green : '#fff', fontSize: '10px', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.3px', whiteSpace: 'nowrap',
                  ...(col.key === 'date' ? stickyStyle(0, colors.navy) : {}),
                  ...(col.key === 'name' ? stickyStyle(50, colors.navy, { textAlign: 'left', borderRight: '2px solid rgba(255,255,255,0.1)' }) : {}),
                }}>
                  {col.label}{sortBy === col.key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const bg = rowBg(i);
              return (
                <tr key={i} style={{ borderBottom: '1px solid #eef2f5' }}>
                  <td style={{ padding: '5px 6px', textAlign: 'center', color: '#5a6b76', ...stickyStyle(0, bg) }}>{fmtDate(r.date)}</td>
                  <td style={{ padding: '5px 6px', textAlign: 'left', fontWeight: 600, color: colors.navy, ...stickyStyle(50, bg, { borderRight: '2px solid #e3e9ed' }) }}>{r.name}</td>
                  <td style={cellStyle}>{r.tm}</td>
                  <td style={cellStyle}>{r.opp}</td>
                  <td style={cellStyle}>{r.ha === 'Home' ? 'H' : 'A'}</td>
                  <td style={cellStyle}>{r.ab}</td>
                  <td style={{ ...cellStyle, fontWeight: r.h > 0 ? 700 : 400, color: r.h > 0 ? colors.navy : '#5a6b76' }}>{r.h}</td>
                  <td style={cellStyle}>{r.r}</td>
                  <td style={cellStyle}>{r.rbi}</td>
                  <td style={{ ...cellStyle, fontWeight: r.hr > 0 ? 700 : 400, color: r.hr > 0 ? colors.navy : '#5a6b76' }}>{r.hr}</td>
                  <td style={cellStyle}>{r.k}</td>
                  <td style={cellStyle}>{r.bb}</td>
                  <td style={{ ...cellStyle, fontWeight: r.tb >= 3 ? 700 : 400, color: r.tb >= 3 ? colors.navy : '#5a6b76' }}>{r.tb}</td>
                  <td style={cellStyle}>{r.sb}</td>
                  <td style={cellStyle}>{r.vsh || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: '30px', textAlign: 'center', color: '#8a9ba8', fontSize: '14px' }}>
            No games match those filters.
          </div>
        )}
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   PITCHER VIEW
   ══════════════════════════════════════════════════════════════════════════════ */

function PitcherView({ data }) {
  const [search, setSearch] = useState('');
  const [team, setTeam] = useState('');
  const [opp, setOpp] = useState('');
  const [ha, setHa] = useState('');
  const [hand, setHand] = useState('');
  const [role, setRole] = useState('');
  const [preset, setPreset] = useState('');
  const [viewCount, setViewCount] = useState(10);
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const clearFilters = () => {
    setSearch(''); setTeam(''); setOpp(''); setHa(''); setHand('');
    setRole(''); setPreset('');
  };

  const filtered = useMemo(() => {
    let rows = data;
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter(r => r.name.toLowerCase().includes(s));
    }
    if (team) rows = rows.filter(r => r.tm === team);
    if (opp) rows = rows.filter(r => r.opp === opp);
    if (ha) rows = rows.filter(r => r.ha === ha);
    if (hand) rows = rows.filter(r => r.hand === hand);
    if (role === 'starter') rows = rows.filter(r => r.gs === 1);
    if (role === 'reliever') rows = rows.filter(r => r.gs === 0);
    if (preset === 'qs') rows = rows.filter(r => r.ip >= 6 && r.er <= 3);
    if (preset === '10k') rows = rows.filter(r => r.k >= 10);
    if (preset === 'cgso') rows = rows.filter(r => r.ip >= 9 && r.er === 0);

    const textKeys = ['name', 'tm', 'opp', 'date', 'ha', 'hand'];
    const isText = textKeys.includes(sortBy);
    rows = [...rows].sort((a, b) => {
      let av = a[sortBy], bv = b[sortBy];
      if (isText) {
        av = String(av || '').toLowerCase();
        bv = String(bv || '').toLowerCase();
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      av = typeof av === 'number' ? av : -Infinity;
      bv = typeof bv === 'number' ? bv : -Infinity;
      return sortDir === 'asc' ? av - bv : bv - av;
    });

    if (viewCount !== Infinity) rows = rows.slice(0, viewCount);
    return rows;
  }, [data, search, team, opp, ha, hand, role, preset, viewCount, sortBy, sortDir]);

  const handleSort = (key) => {
    if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortDir(key === 'name' ? 'asc' : 'desc'); }
  };

  const cols = [
    { key: 'date', label: 'Date', w: 50 },
    { key: 'name', label: 'Pitcher', w: 130 },
    { key: 'tm', label: 'Team' }, { key: 'opp', label: 'Opp' },
    { key: 'ha', label: 'H/A' },
    { key: 'ip', label: 'IP' }, { key: 'k', label: 'K' }, { key: 'bb', label: 'BB' },
    { key: 'h', label: 'H' }, { key: 'er', label: 'ER' }, { key: 'hr', label: 'HR' },
    { key: 'np', label: 'NP' },
    { key: 'whiff', label: 'Whiff%' }, { key: 'kpct', label: 'K%' },
    { key: 'xwoba', label: 'xwOBA' }, { key: 'velo', label: 'Velo' },
  ];

  const anyFilter = search || team || opp || ha || hand || role || preset;
  const rowBg = (i) => i % 2 ? '#fafcfd' : '#fff';

  return (
    <>
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pitcher"
          style={{ padding: '6px 10px', fontSize: '13px', borderRadius: '5px', border: '1px solid #cdd8e0', minWidth: '150px' }} />
        <select value={team} onChange={e => setTeam(e.target.value)} style={selStyle}>
          <option value="">All Teams</option>
          {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={opp} onChange={e => setOpp(e.target.value)} style={selStyle}>
          <option value="">All Opponents</option>
          {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={ha} onChange={e => setHa(e.target.value)} style={selStyle}>
          <option value="">H/A</option>
          <option value="Home">Home</option>
          <option value="Away">Away</option>
        </select>
        <select value={hand} onChange={e => setHand(e.target.value)} style={selStyle}>
          <option value="">Hand</option>
          <option value="R">RHP</option>
          <option value="L">LHP</option>
        </select>
        <select value={role} onChange={e => setRole(e.target.value)} style={selStyle}>
          <option value="">Role</option>
          <option value="starter">Starter</option>
          <option value="reliever">Reliever</option>
        </select>
        <select value={preset} onChange={e => setPreset(e.target.value)} style={selStyle}>
          <option value="">Presets</option>
          <option value="qs">Quality Start</option>
          <option value="10k">10+ K</option>
          <option value="cgso">CGSO</option>
        </select>
        {anyFilter && <button onClick={clearFilters} style={clearBtnStyle}>Clear</button>}
      </div>

      {/* View count + result count */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px', fontSize: '13px', color: '#5a6b76' }}>
        {VIEW_OPTIONS.map(o => (
          <button key={o.value} onClick={() => setViewCount(o.value)}
            style={{ ...viewBtnStyle, ...(viewCount === o.value ? viewBtnActive : {}) }}>
            {o.label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontWeight: 600 }}>{filtered.length.toLocaleString()} games</span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', background: '#fff', minWidth: '820px' }}>
          <thead style={{ background: colors.navy }}>
            <tr>
              {cols.map(col => (
                <th key={col.key} onClick={() => handleSort(col.key)} style={{
                  padding: '8px 6px', textAlign: 'center', cursor: 'pointer', userSelect: 'none',
                  color: sortBy === col.key ? colors.green : '#fff', fontSize: '10px', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.3px', whiteSpace: 'nowrap',
                  ...(col.key === 'date' ? stickyStyle(0, colors.navy) : {}),
                  ...(col.key === 'name' ? stickyStyle(50, colors.navy, { textAlign: 'left', borderRight: '2px solid rgba(255,255,255,0.1)' }) : {}),
                }}>
                  {col.label}{sortBy === col.key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const bg = rowBg(i);
              return (
                <tr key={i} style={{ borderBottom: '1px solid #eef2f5' }}>
                  <td style={{ padding: '5px 6px', textAlign: 'center', color: '#5a6b76', ...stickyStyle(0, bg) }}>{fmtDate(r.date)}</td>
                  <td style={{ padding: '5px 6px', textAlign: 'left', fontWeight: 600, color: colors.navy, ...stickyStyle(50, bg, { borderRight: '2px solid #e3e9ed' }) }}>{r.name}</td>
                  <td style={cellStyle}>{r.tm}</td>
                  <td style={cellStyle}>{r.opp}</td>
                  <td style={cellStyle}>{r.ha === 'Home' ? 'H' : 'A'}</td>
                  <td style={{ ...cellStyle, color: colors.navy }}>{fmt1(r.ip)}</td>
                  <td style={{ ...cellStyle, fontWeight: r.k >= 10 ? 700 : 400, color: r.k >= 10 ? colors.navy : '#5a6b76' }}>{r.k}</td>
                  <td style={cellStyle}>{r.bb}</td>
                  <td style={cellStyle}>{r.h}</td>
                  <td style={{ ...cellStyle, color: r.er === 0 ? colors.green : '#5a6b76' }}>{r.er}</td>
                  <td style={cellStyle}>{r.hr}</td>
                  <td style={cellStyle}>{r.np || '—'}</td>
                  <td style={cellStyle}>{fmtPct(r.whiff)}</td>
                  <td style={cellStyle}>{fmtPct(r.kpct)}</td>
                  <td style={cellStyle}>{r.xwoba != null ? fmt3(r.xwoba) : '—'}</td>
                  <td style={cellStyle}>{r.velo != null ? fmt1(r.velo) : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: '30px', textAlign: 'center', color: '#8a9ba8', fontSize: '14px' }}>
            No games match those filters.
          </div>
        )}
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════════════════════ */

export default function GameLogsPage() {
  const [tab, setTab] = useState('batters');
  const [batterData, setBatterData] = useState(null);
  const [pitcherData, setPitcherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pitcherLoading, setPitcherLoading] = useState(false);
  const pitcherFetched = useRef(false);

  // Load batter data on mount
  useEffect(() => {
    fetch('/data/batter_game_logs_latest.json')
      .then(r => { if (!r.ok) throw new Error('fetch failed'); return r.json(); })
      .then(d => { setBatterData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  // Fetch pitcher data on first toggle
  useEffect(() => {
    if (tab === 'pitchers' && !pitcherFetched.current) {
      pitcherFetched.current = true;
      setPitcherLoading(true);
      fetch('/data/pitcher_game_logs_latest.json')
        .then(r => { if (!r.ok) throw new Error('fetch failed'); return r.json(); })
        .then(d => { setPitcherData(d); setPitcherLoading(false); })
        .catch(() => { setPitcherLoading(false); });
    }
  }, [tab]);

  const title = 'MLB Game Logs — Batters & Pitchers | Betrilo';
  const desc = 'Full-season MLB game logs with advanced filtering — batter and pitcher stats, Statcast data, matchup splits.';
  const url = 'https://betrilo.com/mlb/game-logs';

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: colors.textMuted }}>Loading game logs...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '60px', color: colors.textMuted }}>Game logs unavailable. Check back later.</div>;

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto', padding: '24px 16px 60px' }}>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={url} />
        <link rel="canonical" href={url} />
      </Helmet>

      <div style={{ textAlign: 'center', marginBottom: '18px' }}>
        <h1 style={{ color: colors.navy, fontSize: '28px', fontWeight: 800, margin: 0 }}>Game Logs</h1>
        <p style={{ color: '#5a6b76', fontSize: '13px', margin: '6px 0 0' }}>
          Full 2026 season game-by-game stats. Filter by player, team, opponent, splits, and stat thresholds.
        </p>
      </div>

      {/* Toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0', marginBottom: '18px' }}>
        <button onClick={() => setTab('batters')} style={{
          padding: '10px 28px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
          border: '2px solid ' + colors.navy, borderRadius: '6px 0 0 6px',
          background: tab === 'batters' ? colors.navy : '#fff',
          color: tab === 'batters' ? '#fff' : colors.navy,
          transition: 'background 0.15s, color 0.15s',
        }}>Batters</button>
        <button onClick={() => setTab('pitchers')} style={{
          padding: '10px 28px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
          border: '2px solid ' + colors.navy, borderLeft: 'none', borderRadius: '0 6px 6px 0',
          background: tab === 'pitchers' ? colors.navy : '#fff',
          color: tab === 'pitchers' ? '#fff' : colors.navy,
          transition: 'background 0.15s, color 0.15s',
        }}>Pitchers</button>
      </div>

      {/* Content */}
      {tab === 'batters' && batterData && <BatterView data={batterData} />}
      {tab === 'pitchers' && pitcherLoading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#8a9ba8' }}>Loading pitcher data...</div>
      )}
      {tab === 'pitchers' && pitcherData && <PitcherView data={pitcherData} />}
      {tab === 'pitchers' && !pitcherLoading && !pitcherData && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#8a9ba8' }}>Pitcher game logs unavailable.</div>
      )}
    </div>
  );
}

/* ── Shared inline styles ──────────────────────────────────────────────────── */

const selStyle = {
  padding: '6px 8px', fontSize: '12px', borderRadius: '5px', border: '1px solid #cdd8e0',
};

const cellStyle = {
  padding: '5px 6px', textAlign: 'center', color: '#5a6b76',
};

const clearBtnStyle = {
  padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
  background: '#fff', border: '1px solid #cdd8e0', borderRadius: '5px', color: '#5a6b76',
};

const viewBtnStyle = {
  padding: '4px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
  background: '#fff', border: '1px solid #cdd8e0', borderRadius: '4px', color: '#5a6b76',
};

const viewBtnActive = {
  background: colors.navy, color: '#fff', borderColor: colors.navy,
};
