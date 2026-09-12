/**
 * Format gameday + gametime into a human-readable ET label.
 * Shared by NflMatchupsPage and NflProjectionsPage.
 *
 * @param {string} gameday  "YYYY-MM-DD"
 * @param {string} gametime "HH:MM" (24h, ET)
 * @returns {string} e.g. "Sun 1:00 PM"
 */
export default function fmtTime(gameday, gametime) {
  if (!gameday || !gametime) return 'TBD';
  try {
    const dt = new Date(`${gameday}T${gametime}:00-04:00`);
    const day = dt.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'America/New_York' });
    const time = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' });
    return `${day} ${time}`;
  } catch { return gametime; }
}
