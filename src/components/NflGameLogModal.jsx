import React, { useEffect, useRef } from 'react';
import { dark } from '../theme';

/**
 * Game log modal for NFL player projections.
 *
 * Shows week-by-week results for a single player. Projection-vs-actual
 * columns are captured in the data but hidden behind SHOW_PROJECTED flag
 * until the validation gate opens (3 shadow weeks must pass first).
 *
 * Design: modal (not inline expansion) — phone is the primary NFL surface.
 * A modal preserves table sort and scroll position, and avoids layout issues
 * at 390px with nested tables inside colSpan cells.
 */

const SHOW_PROJECTED = false;

const STAT_LABELS = {
  pass_yds: 'Pass Yds',
  pass_tds: 'Pass TD',
  completions: 'Comp',
  rush_yds: 'Rush Yds',
  rush_tds: 'Rush TD',
  carries: 'Car',
  rec_yds: 'Rec Yds',
  rec_tds: 'Rec TD',
  receptions: 'Rec',
  targets: 'Tgt',
};

function getStatColumns(position) {
  if (position === 'QB') return ['pass_yds', 'pass_tds', 'completions', 'rush_yds'];
  if (position === 'RB') return ['rush_yds', 'carries', 'rush_tds', 'rec_yds', 'receptions'];
  return ['rec_yds', 'receptions', 'targets', 'rec_tds'];
}

export default function NflGameLogModal({ player, onClose }) {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Focus trap: focus modal on mount
  useEffect(() => {
    if (modalRef.current) modalRef.current.focus();
  }, []);

  if (!player) return null;

  const { player_name, team, position, games = [] } = player;
  const statCols = getStatColumns(position);
  const hasGames = games.some(g => !g.is_bye);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-label={`Game log for ${player_name}`}
        style={{
          background: dark.surfaceBg,
          borderRadius: '12px',
          border: `1px solid ${dark.border}`,
          width: '100%',
          maxWidth: '620px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          outline: 'none',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px 12px',
          borderBottom: `1px solid ${dark.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ color: dark.textPrimary, fontSize: '18px', fontWeight: 700 }}>
              {player_name}
            </div>
            <div style={{ color: dark.textSecondary, fontSize: '13px', marginTop: '2px' }}>
              {position} — {team}
              {player.currentOpponent && ` | Next: vs ${player.currentOpponent}`}
              {player.oppDefRank != null && (
                <span style={{ color: dark.textMuted }}>{` | Opp Def #${player.oppDefRank}`}{player.oppDefYds != null && ` · ${Math.round(player.oppDefYds)} yd/g`}</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              color: dark.textSecondary,
              fontSize: '22px',
              cursor: 'pointer',
              padding: '0 4px',
              lineHeight: 1,
            }}
          >×</button>
        </div>

        {/* Body */}
        <div style={{
          overflowY: 'auto',
          overflowX: 'auto',
          padding: '0',
          flexGrow: 1,
        }}>
          {!hasGames ? (
            /* Empty state */
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: dark.textSecondary,
              fontSize: '14px',
              lineHeight: 1.6,
            }}>
              No game logs available yet.
              <br />
              <span style={{ color: dark.textMuted, fontSize: '12px' }}>
                This player has not appeared in a regular-season game this year.
              </span>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Wk</th>
                  <th style={thStyle}>Opp</th>
                  {statCols.map(k => (
                    <th key={k} style={{ ...thStyle, textAlign: 'right' }}>
                      {STAT_LABELS[k]}
                    </th>
                  ))}
                  {SHOW_PROJECTED && statCols.slice(0, 2).map(k => (
                    <th key={`p_${k}`} style={{ ...thStyle, textAlign: 'right', color: dark.textMuted }}>
                      Proj {STAT_LABELS[k]}
                    </th>
                  ))}
                  <th style={{ ...thStyle, textAlign: 'right' }}>Snap%</th>
                </tr>
              </thead>
              <tbody>
                {games.map((g, i) => {
                  if (g.is_bye) {
                    return (
                      <tr key={g.week} style={{ background: i % 2 === 0 ? dark.surfaceBgAlt : dark.surfaceBg }}>
                        <td style={tdStyle}>{g.week}</td>
                        <td colSpan={statCols.length + (SHOW_PROJECTED ? statCols.slice(0, 2).length : 0) + 2}
                          style={{ ...tdStyle, textAlign: 'center', color: dark.textMuted, fontStyle: 'italic' }}>
                          BYE
                        </td>
                      </tr>
                    );
                  }

                  const rowBg = i % 2 === 0 ? dark.surfaceBgAlt : dark.surfaceBg;
                  const oppLabel = g.is_home ? `vs ${g.opponent}` : `@ ${g.opponent}`;

                  return (
                    <tr key={g.week} style={{ background: rowBg }}>
                      <td style={tdStyle}>{g.week}</td>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{oppLabel}</td>
                      {statCols.map(k => (
                        <td key={k} style={{ ...tdStyle, textAlign: 'right' }}>
                          {g.stats?.[k] ?? '—'}
                        </td>
                      ))}
                      {SHOW_PROJECTED && statCols.slice(0, 2).map(k => (
                        <td key={`p_${k}`} style={{ ...tdStyle, textAlign: 'right', color: dark.textMuted }}>
                          {g.projected?.[k]?.projection ?? '—'}
                        </td>
                      ))}
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        {g.snap_pct != null ? `${g.snap_pct}%` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 20px',
          borderTop: `1px solid ${dark.border}`,
          fontSize: '11px',
          color: dark.textMuted,
          flexShrink: 0,
        }}>
          {games.length > 0
            ? `${games.filter(g => !g.is_bye).length} game${games.filter(g => !g.is_bye).length !== 1 ? 's' : ''} played`
            : 'No games'}
          {' | Snap% = offensive snap share'}
        </div>
      </div>
    </div>
  );
}

const thStyle = {
  padding: '8px 10px',
  textAlign: 'left',
  background: dark.surfaceBg,
  color: dark.textPrimary,
  fontWeight: 700,
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  whiteSpace: 'nowrap',
  borderBottom: `2px solid ${dark.borderAccent}`,
  position: 'sticky',
  top: 0,
  zIndex: 1,
};

const tdStyle = {
  padding: '7px 10px',
  color: dark.textPrimary,
  borderBottom: `1px solid ${dark.border}`,
  whiteSpace: 'nowrap',
};
