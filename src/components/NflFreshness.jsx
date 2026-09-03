import React from 'react';
import { dark } from '../theme';

/**
 * Displays last-refreshed timestamp with staleness detection.
 * NFL weekly cadence: data older than 3 days gets a stale warning.
 */
export default function NflFreshness({ generatedAt, label }) {
  if (!generatedAt) return null;

  let dateObj;
  try {
    dateObj = new Date(generatedAt);
    if (isNaN(dateObj.getTime())) return null;
  } catch {
    return null;
  }

  const now = new Date();
  const ageHours = (now - dateObj) / (1000 * 60 * 60);
  const ageDays = Math.floor(ageHours / 24);
  const isStale = ageHours > 72;

  const formatted = dateObj.toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  });

  const relativeText = ageDays === 0
    ? `${Math.floor(ageHours)} hours ago`
    : ageDays === 1 ? 'Yesterday' : `${ageDays} days ago`;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      fontSize: '12px',
      color: isStale ? dark.statusAmber : dark.textSecondary,
      marginBottom: '12px',
    }}>
      <span style={{
        width: '8px', height: '8px', borderRadius: '50%',
        background: isStale ? dark.statusAmber : dark.statusGreen,
        flexShrink: 0,
      }} />
      <span>
        Updated {formatted} ({relativeText})
        {label && ` — ${label}`}
        {isStale && ' — Data may be stale, next refresh expected soon'}
      </span>
    </div>
  );
}
