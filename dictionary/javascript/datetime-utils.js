/*
 * Date and time helpers built on the platform Date API: shifting,
 * comparing, formatting, and calendar calculations.
 */

export function toIsoString(date) {
  return date.toISOString();
}

export function daysBetween(first, second) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const a = Date.UTC(first.getFullYear(), first.getMonth(), first.getDate());
  const b = Date.UTC(second.getFullYear(), second.getMonth(), second.getDate());
  return Math.round((b - a) / msPerDay);
}

export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addMonths(date, months) {
  const result = new Date(date);
  const targetDay = result.getDate();
  result.setMonth(result.getMonth() + months);
  if (result.getDate() < targetDay) {
    result.setDate(0);
  }
  return result;
}

export function startOfDay(date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function endOfDay(date) {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function startOfWeek(date, weekStartsOn = 0) {
  const result = startOfDay(date);
  const shift = (result.getDay() - weekStartsOn + 7) % 7;
  result.setDate(result.getDate() - shift);
  return result;
}

export function monthName(monthIndex) {
  const names = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return names[monthIndex] || '';
}

export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function isValidDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return true;
  if (typeof value !== 'string') return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

export function ageFromBirth(birthDate, now = new Date()) {
  let years = now.getFullYear() - birthDate.getFullYear();
  const beforeBirthday =
    now.getMonth() < birthDate.getMonth() ||
    (now.getMonth() === birthDate.getMonth() && now.getDate() < birthDate.getDate());
  if (beforeBirthday) years -= 1;
  return Math.max(0, years);
}

export function timeAgo(date, now = new Date()) {
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + ' minutes ago';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + ' hours ago';
  const days = Math.floor(hours / 24);
  if (days < 30) return days + ' days ago';
  return date.toLocaleDateString();
}

export function quarterOf(date) {
  return Math.floor(date.getMonth() / 3) + 1;
}

export function sameDay(first, second) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) return hours + 'h ' + String(minutes).padStart(2, '0') + 'm';
  if (minutes > 0) return minutes + 'm ' + String(secs).padStart(2, '0') + 's';
  return secs + 's';
}

export function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }
  return date;
}

export function businessDaysBetween(first, second) {
  let count = 0;
  const cursor = startOfDay(first);
  const end = startOfDay(second);
  while (cursor < end) {
    if (!isWeekend(cursor)) count += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

export function lastDayOfMonth(year, month) {
  return new Date(year, month + 1, 0);
}

export function elapsedSeconds(start, end) {
  return Math.max(0, Math.floor((end - start) / 1000));
}

export function toTimestamp(date) {
  return Math.floor(date.getTime() / 1000);
}

export function fromTimestamp(timestamp) {
  return new Date(timestamp * 1000);
}

export function nextWeekday(date, weekday) {
  const result = new Date(date);
  const shift = (weekday - result.getDay() + 7) % 7 || 7;
  result.setDate(result.getDate() + shift);
  return result;
}
