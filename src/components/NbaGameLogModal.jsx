import React, { useEffect, useRef } from 'react';
import { dark } from '../theme';

/**
 * Game log modal for NBA player projections.
 *
 * Shows last-10 game results for a single player. Mirrors the NFL modal
 * pattern: modal (not inline expansion) to preserve table sort/scroll
 * position on mobile and avoid layout issues at narrow widths.
 *
 * Data contract (from export_site_json._build_game_logs):
 *   game_log[]: date, opp, home, min, pts, reb, ast, tpm, pra, season, dnp, team
 *   l10_summary: avg_min/pts/reb/ast/3pm/pra, games, current_season_games, label
 */

export default function NbaGameLogModal({ player, loading, error, onClose }) {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    if (modalRef.current) modalRef.current.focus();
  }, []);

  if (!player) return null;

  const { game_log = [], l10_summary, proj_pts, proj_reb, proj_ast, proj_3pm, proj_pra } = player;
  const played = game_log.filter(g => !g.dnp);

  // Loading state: game logs file still fetching
  if (loading) {
    return (
      <ModalShell overlayRef={overlayRef} modalRef={modalRef} player={player} onClose={onClose}>
        <div style={{ padding: '40px 20px', textAlign: 'center', color: dark.textSecondary, fontSize: '14px' }}>
          Loading game log...
        </div>
      </ModalShell>
    );
  }

  // Error state: fetch failed
  if (error) {
    return (
      <ModalShell overlayRef={overlayRef} modalRef={modalRef} player={player} onClose={onClose}>
        <div style={{ padding: '40px 20px', textAlign: 'center', color: dark.textSecondary, fontSize: '14px' }}>
          Game log unavailable
        </div>
      </ModalShell>
    );
  }

  if (game_log.length === 0) {
    return (
      <ModalShell overlayRef={overlayRef} modalRef={modalRef} player={player} onClose={onClose}>
        <div style={{ padding: '40px 20px', textAlign: 'center', color: dark.textSecondary, fontSize: '14px' }}>
          No recent games
        </div>
      </ModalShell>
    );
  }

  // Detect where last-season rows begin for the divider
  const currentSeason = '2026-27';
  let lastSeasonDividerIdx = -1;
  for (let i = 0; i < game_log.length; i++) {
    if (game_log[i].season !== currentSeason && (i === 0 || game_log[i - 1].season === currentSeason)) {
      lastSeasonDividerIdx = i;
      break;
    }
  }

  return (
    <ModalShell overlayRef={overlayRef} modalRef={modalRef} player={player} onClose={onClose}>
      {/* Summary row */}
      {l10_summary && (
        <div style={{
          padding: '10px 16px',
          background: dark.surfaceBgAlt,
          borderBottom: `1px solid ${dark.border}`,
          fontSize: '12px',
          lineHeight: 1.8,
        }}>
          <div style={{ color: dark.textSecondary, marginBottom: '2px' }}>
            <strong style={{ color: dark.textPrimary }}>L{l10_summary.games} Averages</strong>
            {' \u00B7 '}{l10_summary.label}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <StatCompare label="PTS" avg={l10_summary.avg_pts} proj={proj_pts} />
            <StatCompare label="REB" avg={l10_summary.avg_reb} proj={proj_reb} />
            <StatCompare label="AST" avg={l10_summary.avg_ast} proj={proj_ast} />
            <StatCompare label="3PM" avg={l10_summary.avg_3pm} proj={proj_3pm} />
            <StatCompare label="PRA" avg={l10_summary.avg_pra} proj={proj_pra} />
            <span style={{ color: dark.textMuted }}>MIN {l10_summary.avg_min}</span>
          </div>
        </div>
      )}

      {/* Game log table */}
      <div style={{ overflowY: 'auto', overflowX: 'auto', flexGrow: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '420px' }}>
          <thead>
            <tr>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Opp</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>MIN</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>PTS</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>REB</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>AST</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>3PM</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>PRA</th>
            </tr>
          </thead>
          <tbody>
            {game_log.map((g, i) => {
              const isLastSeason = g.season !== currentSeason;
              const showDivider = i === lastSeasonDividerIdx;

              return (
                <React.Fragment key={`${g.date}-${i}`}>
                  {showDivider && (
                    <tr>
                      <td colSpan={8} style={{
                        padding: '6px 10px',
                        background: dark.surfaceBg,
                        color: dark.textMuted,
                        fontSize: '11px',
                        fontStyle: 'italic',
                        borderBottom: `1px solid ${dark.border}`,
                        textAlign: 'center',
                      }}>
                        {g.season} season
                      </td>
                    </tr>
                  )}
                  <tr style={{ background: i % 2 === 0 ? dark.surfaceBgAlt : dark.surfaceBg }}>
                    <td style={{ ...tdStyle, color: isLastSeason ? dark.textMuted : dark.textPrimary }}>
                      {fmtDate(g.date)}
                    </td>
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap', color: isLastSeason ? dark.textMuted : dark.textPrimary }}>
                      {g.home ? `vs ${g.opp}` : `@ ${g.opp}`}
                    </td>
                    {g.dnp ? (
                      <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: dark.textMuted, fontStyle: 'italic' }}>
                        DNP
                      </td>
                    ) : (
                      <>
                        <td style={{ ...tdStyle, textAlign: 'right', color: isLastSeason ? dark.textMuted : dark.textPrimary }}>{g.min}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', color: isLastSeason ? dark.textMuted : dark.textPrimary }}>{g.pts}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', color: isLastSeason ? dark.textMuted : dark.textPrimary }}>{g.reb}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', color: isLastSeason ? dark.textMuted : dark.textPrimary }}>{g.ast}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', color: isLastSeason ? dark.textMuted : dark.textPrimary }}>{g.tpm}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', color: isLastSeason ? dark.textMuted : dark.textPrimary }}>{g.pra}</td>
                      </>
                    )}
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{
        padding: '10px 20px',
        borderTop: `1px solid ${dark.border}`,
        fontSize: '11px',
        color: dark.textMuted,
        flexShrink: 0,
      }}>
        {played.length > 0
          ? `${played.length} game${played.length !== 1 ? 's' : ''} played`
          : 'No games'}
        {game_log.some(g => g.dnp) && ' | DNP = Did Not Play'}
      </div>
    </ModalShell>
  );
}

/** Modal shell — shared between empty and populated states */
function ModalShell({ overlayRef, modalRef, player, onClose, children }) {
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-label={`Game log for ${player.player}`}
        style={{
          background: dark.surfaceBg,
          borderRadius: '12px',
          border: `1px solid ${dark.border}`,
          width: '100%', maxWidth: '620px', maxHeight: '80vh',
          display: 'flex', flexDirection: 'column',
          outline: 'none',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px 12px',
          borderBottom: `1px solid ${dark.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ color: dark.textPrimary, fontSize: '18px', fontWeight: 700 }}>
              {player.player}
            </div>
            <div style={{ color: dark.textSecondary, fontSize: '13px', marginTop: '2px' }}>
              {player.position} — {player.team}
              {player.opp && ` | Today: vs ${player.opp}`}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none', border: 'none',
              color: dark.textSecondary, fontSize: '22px',
              cursor: 'pointer', padding: '0 4px', lineHeight: 1,
            }}
          >×</button>
        </div>

        {children}
      </div>
    </div>
  );
}

/** Projection vs L10 average comparison */
function StatCompare({ label, avg, proj }) {
  if (avg == null) return null;
  const hasProj = proj != null && proj !== 0;
  return (
    <span style={{ color: dark.textPrimary, fontSize: '12px' }}>
      <strong>{label}</strong>{' '}
      <span style={{ color: dark.textSecondary }}>avg {avg}</span>
      {hasProj && (
        <span style={{ color: dark.textMuted }}>{' \u00B7 Proj '}{proj}</span>
      )}
    </span>
  );
}

/** Format YYYY-MM-DD as compact date */
function fmtDate(iso) {
  if (!iso) return '—';
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  return `${parseInt(parts[1])}/${parseInt(parts[2])}`;
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
