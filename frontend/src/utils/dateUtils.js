/**
 * Parse API datetime string as UTC when it has no timezone (e.g. "2024-01-30T14:30:00").
 * Backend may return naive datetime in production (no "Z"), which JS would parse as local time.
 * Treating as UTC fixes calendar/time display on Vercel/Railway.
 */
export function parseUtcDate(value) {
  if (value == null) return null;
  if (typeof value !== 'string') return value;
  const s = value.trim();
  // ISO-like datetime without timezone (no Z, no +00:00 / -05:00)
  if (s.includes('T') && !s.endsWith('Z') && !/[-+]\d{2}:?\d{2}$/.test(s)) {
    return new Date(s + 'Z');
  }
  return new Date(s);
}
