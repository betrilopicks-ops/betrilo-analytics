import React from 'react';
import NflValidationBanner from './NflValidationBanner';
import NflFreshness from './NflFreshness';

/**
 * Layout wrapper for all NFL pages.
 * Provides: max-width container, validation banner (top + bottom),
 * freshness indicator. NO background override — pages use the site's
 * default light background (#f9f9f9 from App.css or white).
 */
export default function NflPageWrapper({ children, generatedAt, freshLabel, maxWidth = '1200px' }) {
  return (
    <div style={{ padding: '24px 16px 60px' }}>
      <div style={{ maxWidth, margin: '0 auto' }}>
        <NflValidationBanner />
        {generatedAt && <NflFreshness generatedAt={generatedAt} label={freshLabel} />}
        {children}
        <div style={{ marginTop: '32px' }}>
          <NflValidationBanner />
        </div>
      </div>
    </div>
  );
}
