/**
 * Utility functions for date formatting.
 */

/**
 * Format a Date or ISO string into a localized readable date string.
 * @param date - Date object or ISO string
 * @param locale - Locale identifier (defaults to 'en-US')
 * @returns Formatted date string (e.g. "Aug 18, 2026")
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  },
  locale: string = 'en-US'
): string {
  const d = typeof date === 'object' ? date : new Date(date);
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }
  return new Intl.DateTimeFormat(locale, options).format(d);
}

/**
 * Returns a human-friendly relative time string (e.g., "5 mins ago", "Just now").
 * @param date - Date object or ISO string/timestamp
 */
export function formatRelativeTime(date: Date | string | number): string {
  const d = typeof date === 'object' ? date : new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 30) {
    return 'Just now';
  }
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  return formatDate(d);
}
