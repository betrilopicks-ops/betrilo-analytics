import React from 'react';

/**
 * Persistent validation disclosure for all NFL pages.
 * Shows at the top of every NFL route until shadow validation gate is met.
 *
 * One component, one treatment — used identically on all NFL pages.
 */
export default function NflValidationBanner() {
  return (
    <div style={{
      background: '#1a2d3d',
      border: '1px solid #e8a838',
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
        No Track Record
      </span>
      <span style={{
        color: '#e8eef2',
        fontSize: '13px',
        lineHeight: 1.45,
      }}>
        Not picks — this model has no track record yet. Projections are from an unvalidated
        system in private testing and are not published recommendations.
      </span>
    </div>
  );
}
