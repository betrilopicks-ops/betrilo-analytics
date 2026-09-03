import React from 'react';
import NflValidationBanner from './NflValidationBanner';
import NflFreshness from './NflFreshness';

/**
 * Consistent wrapper for all NFL pages.
 * Provides: dark background, validation banner, freshness indicator,
 * and h1 styling that matches MLB (dark text on dark bg).
 *
 * Also renders a bottom validation reminder on long pages.
 */
export default function NflPageWrapper({ children, generatedAt, freshLabel, maxWidth = '1200px' }) {
  return (
    <div style={{
      background: '#0B2331',
      minHeight: '100vh',
      padding: '24px 16px 60px',
    }}>
      <div style={{ maxWidth, margin: '0 auto' }}>
        <NflValidationBanner />
        {generatedAt && <NflFreshness generatedAt={generatedAt} label={freshLabel} />}
        {children}
        {/* Bottom reminder for long pages */}
        <div style={{ marginTop: '32px' }}>
          <NflValidationBanner />
        </div>
      </div>
    </div>
  );
}
