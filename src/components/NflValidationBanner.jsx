import React from 'react';
import { dark } from '../theme';

/**
 * Persistent validation disclosure for all NFL pages.
 * Visually distinct from the navy page background — slightly lighter
 * surface with amber accent border, not blending into the page.
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
        No Track Record
      </span>
      <span style={{
        color: dark.bannerText,
        fontSize: '13px',
        lineHeight: 1.45,
      }}>
        Not picks — this model has no track record yet. Projections are from an unvalidated
        system in private testing and are not published recommendations.
      </span>
    </div>
  );
}
