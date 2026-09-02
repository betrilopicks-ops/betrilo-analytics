import React from 'react';
import { colors } from '../theme';

/**
 * Persistent validation disclosure for all NFL pages.
 * Shown on every NFL route until the shadow validation gate is passed.
 *
 * Solid background, full-contrast text — never invisible against dark backgrounds.
 * Follows the projected-lineups note pattern from StartingLineupsPage.
 */
export default function NflValidationBanner() {
  return (
    <div style={{
      background: '#1a2d3d',
      border: `1px solid #e8a838`,
      borderRadius: '8px',
      padding: '12px 18px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
    }}>
      <span style={{
        background: '#e8a838',
        color: '#1a2d3d',
        fontSize: '10px',
        fontWeight: 800,
        padding: '3px 8px',
        borderRadius: '4px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        whiteSpace: 'nowrap',
        marginTop: '1px',
      }}>
        In Validation
      </span>
      <span style={{
        color: colors.text,
        fontSize: '13px',
        lineHeight: 1.45,
      }}>
        These projections come from a model with no graded track record. The NFL system is
        in private validation — results are being tracked but not yet published. This is not
        a picks surface.
      </span>
    </div>
  );
}
