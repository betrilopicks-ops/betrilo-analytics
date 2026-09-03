import React from 'react';
import { dark } from '../theme';
import NflValidationBanner from './NflValidationBanner';
import NflFreshness from './NflFreshness';

/**
 * Layout wrapper for all NFL pages.
 * Provides: dark navy page background, max-width container, validation
 * banner (top + bottom), freshness indicator.
 */
export default function NflPageWrapper({ children, generatedAt, freshLabel, maxWidth = '1200px' }) {
  return (
    <div style={{
      background: dark.pageBg,
      minHeight: '100vh',
      padding: '24px 16px 60px',
    }}>
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
