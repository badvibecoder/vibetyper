/*
 * Formatting helpers: numbers, currency, bytes, dates, and text layout
 * for reports and user-facing output.
 */

export function formatNumber(value) {
  return value.toLocaleString('en-US');
}

export function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatPercent(value, decimals = 1) {
  return value.toFixed(decimals) + '%';
}

export function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  const digits = unitIndex === 0 ? 0 : 1;
  return value.toFixed(digits) + ' ' + units[unitIndex];
}

export function formatMillis(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return String(hours).padStart(2, '0') + ':' +
    String(minutes).padStart(2, '0') + ':' +
    String(secs).padStart(2, '0');
}

export function pluralize(count, singular, plural) {
  if (count === 1) return singular;
  return plural || singular + 's';
}

export function ordinal(number) {
  const remainder = number % 100;
  if (remainder >= 11 && remainder <= 13) return number + 'th';
  const suffix = { 1: 'st', 2: 'nd', 3: 'rd' }[number % 10] || 'th';
  return number + suffix;
}

export function formatPhone(digits) {
  const cleaned = digits.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return '(' + cleaned.slice(0, 3) + ') ' + cleaned.slice(3, 6) + '-' + cleaned.slice(6);
  }
  return cleaned;
}

export function formatDateShort(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

export function formatDateTime(date) {
  return formatDateShort(date) + ' ' +
    String(date.getHours()).padStart(2, '0') + ':' +
    String(date.getMinutes()).padStart(2, '0');
}

export function truncateMiddle(text, maxLength) {
  if (text.length <= maxLength) return text;
  const keep = Math.floor((maxLength - 3) / 2);
  return text.slice(0, keep) + '...' + text.slice(-keep);
}

export function formatList(items, conjunction = 'and') {
  if (items.length === 0) return '';
  if (items.length === 1) return String(items[0]);
  if (items.length === 2) return items[0] + ' ' + conjunction + ' ' + items[1];
  return items.slice(0, -1).join(', ') + ', ' + conjunction + ' ' + items[items.length - 1];
}

export function indent(text, spaces = 4) {
  const prefix = ' '.repeat(spaces);
  return text.split('\n').map((line) => prefix + line).join('\n');
}

export function formatLargeNumber(value) {
  if (Math.abs(value) < 1000) return String(value);
  const units = ['K', 'M', 'B', 'T'];
  let scaled = value;
  let unitIndex = -1;
  while (Math.abs(scaled) >= 1000 && unitIndex < units.length - 1) {
    scaled /= 1000;
    unitIndex += 1;
  }
  return scaled.toFixed(1).replace(/\.0$/, '') + units[unitIndex];
}

export function percentChange(before, after) {
  if (before === 0) return 'n/a';
  const change = ((after - before) / Math.abs(before)) * 100;
  return (change >= 0 ? '+' : '') + change.toFixed(1) + '%';
}

export function titleCase(text) {
  return text
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function formatRating(value, max = 5) {
  const clamped = Math.max(0, Math.min(value, max));
  const full = '★'.repeat(Math.round(clamped));
  const empty = '☆'.repeat(max - Math.round(clamped));
  return full + empty + ' ' + clamped.toFixed(1);
}

export function formatThroughput(bytes, seconds) {
  if (seconds <= 0) return '0 B/s';
  return formatBytes(bytes / seconds) + '/s';
}

export function formatHex(value, width = 2) {
  return value.toString(16).toUpperCase().padStart(width, '0');
}

export function formatCoordinates(latitude, longitude) {
  const latDirection = latitude >= 0 ? 'N' : 'S';
  const lonDirection = longitude >= 0 ? 'E' : 'W';
  return Math.abs(latitude).toFixed(4) + '°' + latDirection + ', ' +
    Math.abs(longitude).toFixed(4) + '°' + lonDirection;
}

export function formatDurationShort(seconds) {
  if (seconds < 60) return seconds + 's';
  if (seconds < 3600) return Math.round(seconds / 60) + 'm';
  return Math.round(seconds / 3600) + 'h';
}

export function formatPercentile(label, value) {
  return label + ': ' + value.toFixed(1) + 'ms';
}

export function formatScore(value, max) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return value + '/' + max + ' (' + percentage.toFixed(0) + '%)';
}
