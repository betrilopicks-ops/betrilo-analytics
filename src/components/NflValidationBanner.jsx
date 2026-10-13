import React from 'react';
import { dark } from '../theme';

/**
 * Accuracy disclosure banner for all NFL pages.
 * Replaces the former "NO TRACK RECORD" banner with a measured accuracy statement.
 * Amber treatment kept as a note, not marketing.
 */
export default function NflValidationBanner() {
  return (
    <div style={{
      background: dark.bannerBg,
      border: `1px solid ${dark.bannerBorder}`,
      borderLeft: `4px solid ${dark.bannerBorder}`,
      borderRadius: '8px',
      padding: '12px 18px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
    }}>
      <span style={{
        background: dark.bannerBadgeBg,
        color: dark.bannerBadgeText,
        fontSize: '10px',
        fontWeight: 800,
        padding: '3px 8px',
        borderRadius: '4px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        whiteSpace: 'nowrap',
        marginTop: '1px',
      }}>
        Accuracy Note
      </span>
      <span style={{
        color: dark.bannerText,
        fontSize: '13px',
        lineHeight: 1.45,
      }}>
        These are model projections measured weekly against market consensus lines.
        The model is more accurate than the line on some markets and less accurate on others
        — accuracy figures are published below. These are projections, not betting
        recommendations. 21+ only. If you or someone you know has a gambling problem,
        call 1-800-GAMBLER.
      </span>
    </div>
  );
}
