/*
 * String manipulation helpers: casing, trimming, matching, and text
 * utilities shared across the application.
 */

export function truncate(text, maxLength, suffix = '…') {
  if (text.length <= maxLength) return text;
  const keep = Math.max(0, maxLength - suffix.length);
  return text.slice(0, keep) + suffix;
}

export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function capitalize(text) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function camelCase(text) {
  const words = text.split(/[\s_-]+/).filter(Boolean);
  const first = words.shift() || '';
  return first.toLowerCase() + words.map(capitalize).join('');
}

export function kebabCase(text) {
  return text
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export function snakeCase(text) {
  return text
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

export function padNumber(value, width) {
  return String(value).padStart(width, '0');
}

export function reverseWords(text) {
  return text.trim().split(/\s+/).reverse().join(' ');
}

export function countOccurrences(text, needle) {
  if (!needle) return 0;
  let count = 0;
  let index = text.indexOf(needle);
  while (index !== -1) {
    count += 1;
    index = text.indexOf(needle, index + needle.length);
  }
  return count;
}

export function stripHtml(html) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeSpaces(text) {
  return text.replace(/\s+/g, ' ').trim();
}

export function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 3);
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export function maskEmail(email) {
  const [user, domain] = email.split('@');
  if (!domain) return email;
  const visible = user.slice(0, 2);
  return visible + '***@' + domain;
}

export function stripDiacritics(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function splitLines(text) {
  return text.split(/\r\n|\r|\n/);
}

export function wordFrequency(text) {
  const counts = {};
  const words = text.toLowerCase().match(/[a-z0-9']+/g) || [];
  for (const word of words) {
    counts[word] = (counts[word] || 0) + 1;
  }
  return counts;
}

export function indentLines(text, spaces) {
  const prefix = ' '.repeat(spaces);
  return text.split('\n').map((line) => prefix + line).join('\n');
}

export function escapeRegExp(text) {
  return text.replace(/[.*+?^$(){}|[\]\\]/g, '\\$&');
}

export function firstParagraph(text) {
  const trimmed = text.trim();
  const match = trimmed.match(/^[^\n]+/);
  return match ? match[0].trim() : '';
}

export function toAcronym(text) {
  return text
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

export function isPalindromeWord(text) {
  const cleaned = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}

export function formatList(items, conjunction = 'and') {
  if (items.length === 0) return '';
  if (items.length === 1) return String(items[0]);
  if (items.length === 2) return items[0] + ' ' + conjunction + ' ' + items[1];
  const head = items.slice(0, -1).join(', ');
  return head + ', ' + conjunction + ' ' + items[items.length - 1];
}
