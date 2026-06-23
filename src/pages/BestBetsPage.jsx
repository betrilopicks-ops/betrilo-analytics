import React, { useState, useEffect } from 'react';
import { colors } from '../theme';

const PROP_LABELS = {
  hits: 'Hits', rbis: 'RBIs', hits_runs_rbis: 'H+R+RBI', walks: 'Walks',
};
const propLabel = (p) => PROP_LABELS[p] || p;

// Odds are indicative (~), captured at generation. Best Bets blocks are hits/H+R+RBI only.
function fmtOdds(o) {
  if (o === null || o === undefined || o === '') return '—';
  const n = typeof o === 'number' ? o : parseInt(o, 10);
  if (Number.isNaN(n)) return '—';
  return `${n > 0 ? '+' : ''}${n}`;
}

function fmtConf(c) {
  if (c === null || c === undefined || c === '') return '—';
  const n = typeof c === 'number' ? c : parseFloat(c);
  return Number.isFinite(n) ? n.toFixed(2) : '—';
}
function DirBadge({ dir }) {
  if (!dir) return null;
  return <span style={{ fontWeight: 700, color: dir === 'OVER' ? colors.green : '#c0392b' }}>{dir}</span>;
}

const thStyle = (align = 'left') => ({
  textAlign: align, padding: '9px 12px', color: '#fff', fontSize: '11px',
  fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap',
});
const tdStyle = (align = 'left', extra = {}) => ({
  padding: '9px 12px', textAlign: align, ...extra,
});

function SectionTable({ title, blurb, columns, rows, emptyMsg }) {
  return (
    <section style={{ marginBottom: '40px' }}>
      <h2 style={{ color: colors.navy, fontSize: '20px', fontWeight: 800, margin: '0 0 2px' }}>{title}</h2>
      {blurb && <p style={{ color: '#8a99a3', fontSize: '13px', margin: '0 0 12px' }}>{blurb}</p>}
      {(!rows || rows.length === 0) ? (
        <p style={{ color: colors.textMuted, fontSize: '14px' }}>{emptyMsg || 'No picks today.'}</p>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', background: '#fff' }}>
            <thead style={{ background: colors.navy }}>
              <tr>{columns.map((c, i) => <th key={i} style={thStyle(c.align)}>{c.label}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} style={{ borderTop: '1px solid #eef2f5', background: i % 2 ? '#fafcfd' : '#fff' }}>
                  {columns.map((c, j) => <td key={j} style={tdStyle(c.align, c.cellStyle)}>{c.render(r)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function BestBetsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/data/best_bets_latest.json')
      .then((r) => { if (!r.ok) throw new Error('fetch failed'); return r.json(); })
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: colors.textMuted }}>Loading best bets…</div>;
  if (error || !data) return (
    <div style={{ textAlign: 'center', padding: '60px', color: colors.textMuted }}>
      Best bets unavailable right now. Check back after today's slate posts.
    </div>
  );

  const blocks = data.blocks || {};
  const niceDate = (() => {
    const s = data.slate_date || '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      return new Date(s + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
    return s;
  })();

  const navyBold = { fontWeight: 600, color: colors.navy, whiteSpace: 'nowrap' };
  const muted = { color: '#5a6b76' };

  const top8Cols = [
    { label: 'Player', align: 'left', cellStyle: navyBold, render: (r) => r.player },
    { label: 'Team', align: 'left', cellStyle: muted, render: (r) => r.team || '—' },
    { label: 'Matchup', align: 'left', cellStyle: muted, render: (r) => r.matchup || '—' },
    { label: 'Prop', align: 'left', cellStyle: muted, render: (r) => propLabel(r.prop) },
    { label: 'Proj', align: 'center', render: (r) => (r.proj ?? '—') },
    { label: 'Line', align: 'center', render: (r) => (r.line ?? '—') },
    { label: 'Pick', align: 'center', render: (r) => <DirBadge dir={r.dir} /> },
    { label: 'Conf', align: 'right', cellStyle: { fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: colors.navy }, render: (r) => fmtConf(r.conf) },
    { label: 'L10', align: 'right', cellStyle: muted, render: (r) => r.l10 || '—' },
    { label: 'Odds (~)', align: 'right', cellStyle: { ...muted, fontVariantNumeric: 'tabular-nums' }, render: (r) => fmtOdds(r.odds) },
  ];

  const perGameCols = [
    { label: 'Game', align: 'left', cellStyle: navyBold, render: (r) => r.game },
    { label: 'Time', align: 'left', cellStyle: muted, render: (r) => r.time || '—' },
    { label: 'Player', align: 'left', cellStyle: { fontWeight: 600, color: colors.navy }, render: (r) => r.player },
    { label: 'Prop', align: 'left', cellStyle: muted, render: (r) => propLabel(r.prop) },
    { label: 'Line', align: 'center', render: (r) => (r.line ?? '—') },
    { label: 'Pick', align: 'center', render: (r) => <DirBadge dir={r.dir} /> },
    { label: 'Conf', align: 'right', cellStyle: { fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: colors.navy }, render: (r) => fmtConf(r.conf) },
    { label: 'Odds (~)', align: 'right', cellStyle: { ...muted, fontVariantNumeric: 'tabular-nums' }, render: (r) => fmtOdds(r.odds) },
  ];

  const topHitCols = [
    { label: 'Game', align: 'left', cellStyle: navyBold, render: (r) => r.game },
    { label: 'Time', align: 'left', cellStyle: muted, render: (r) => r.time || '—' },
    { label: 'Player', align: 'left', cellStyle: { fontWeight: 600, color: colors.navy }, render: (r) => r.player },
    { label: 'Team', align: 'left', cellStyle: muted, render: (r) => r.team || '—' },
    { label: 'Proj Hits', align: 'center', render: (r) => (r.proj_hits ?? '—') },
    { label: 'Conf', align: 'right', cellStyle: { fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: colors.navy }, render: (r) => fmtConf(r.conf) },
    { label: 'L10', align: 'right', cellStyle: muted, render: (r) => r.l10 || '—' },
    { label: 'Streak', align: 'right', cellStyle: muted, render: (r) => (r.streak ?? '—') },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px 60px' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h1 style={{ color: colors.navy, fontSize: '30px', fontWeight: 800, margin: 0 }}>Best Bets</h1>
        <p style={{ color: '#5a6b76', fontSize: '14px', margin: '6px 0 0' }}>
          Today's sharpest Hits and H+R+RBI picks, ranked by model confidence. {niceDate && `Slate: ${niceDate}.`}
        </p>
      </div>

      <SectionTable
        title="Best Bets of the Day"
        blurb="Top 8 picks across the slate by confidence."
        columns={top8Cols}
        rows={blocks.top8}
      />
      <SectionTable
        title="Best Bet Per Game"
        blurb="The single highest-confidence pick in each game."
        columns={perGameCols}
        rows={blocks.per_game}
      />
      <SectionTable
        title="Top Hit Pick Per Game"
        blurb="Most likely batter to record a hit in each game — the 1-hit angle."
        columns={topHitCols}
        rows={blocks.top_hit}
      />
      <div style={{ marginTop: '8px', padding: '12px 14px', background: '#f4f7f9', borderRadius: '8px', fontSize: '12px', color: '#5a6b76', lineHeight: 1.6 }}>
        <strong style={{ color: colors.navy }}>Key:</strong> <strong>Proj</strong> — model's projected stat value. <strong>Line</strong> — the betting threshold. <strong>Pick</strong> — model's side (Over/Under). <strong>Conf</strong> — confidence score (5.0–9.85). <strong>L10</strong> — hit rate over the player's last 10 games. <strong>Streak</strong> — current games with a hit. <strong>Odds</strong> — American odds; ~ means indicative, captured at generation (lines move by game time). Best Bets show only Hits and H+R+RBI props.
      </div>
    </div>
  );
}
