/**
 * Format gameday + gametime into a human-readable ET label.
 * Shared by NflMatchupsPage and NflProjectionsPage.
 *
 * Input times are already in ET (from the API). We format directly from
 * the 24h string to avoid hardcoded UTC offsets that break across DST.
 *
 * @param {string} gameday  "YYYY-MM-DD"
 * @param {string} gametime "HH:MM" (24h, ET)
 * @returns {string} e.g. "Sun 1:00 PM ET"
 */
export default function fmtTime(gameday, gametime) {
  if (!gameday || !gametime) return 'TBD';
  try {
    const [h, m] = gametime.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const h12 = h > 12 ? h - 12 : (h === 0 ? 12 : h);
    // Parse date at noon UTC just for the weekday name (avoids DST edge)
    const day = new Date(gameday + 'T12:00:00Z')
      .toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
    return `${day} ${h12}:${String(m).padStart(2, '0')} ${suffix} ET`;
  } catch { return gametime; }
}
