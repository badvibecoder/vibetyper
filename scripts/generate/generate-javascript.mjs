// generate-javascript.mjs
// Expands the JavaScript dictionary with new hand-authored code blocks.
// Writes only NEW files under dictionary/javascript/ — the `setup` metadata
// file is never touched.
//
// Block format (blockmode = "braces"): each top-level function / arrow /
// class / exported unit with balanced braces is one complete block.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = path.join(ROOT, 'dictionary', 'javascript');

const files = [
  // ---------------------------------------------------------------------------
  // string-utils.js
  // ---------------------------------------------------------------------------
  {
    name: 'string-utils.js',
    blocks: [
`/*
 * String manipulation helpers: casing, trimming, matching, and text
 * utilities shared across the application.
 */`,

`export function truncate(text, maxLength, suffix = '…') {
  if (text.length <= maxLength) return text;
  const keep = Math.max(0, maxLength - suffix.length);
  return text.slice(0, keep) + suffix;
}`,

`export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}`,

`export function capitalize(text) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}`,

`export function camelCase(text) {
  const words = text.split(/[\\s_-]+/).filter(Boolean);
  const first = words.shift() || '';
  return first.toLowerCase() + words.map(capitalize).join('');
}`,

`export function kebabCase(text) {
  return text
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\\s_]+/g, '-')
    .toLowerCase();
}`,

`export function snakeCase(text) {
  return text
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\\s-]+/g, '_')
    .toLowerCase();
}`,

`export function padNumber(value, width) {
  return String(value).padStart(width, '0');
}`,

`export function reverseWords(text) {
  return text.trim().split(/\\s+/).reverse().join(' ');
}`,

`export function countOccurrences(text, needle) {
  if (!needle) return 0;
  let count = 0;
  let index = text.indexOf(needle);
  while (index !== -1) {
    count += 1;
    index = text.indexOf(needle, index + needle.length);
  }
  return count;
}`,

`export function stripHtml(html) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\\s+/g, ' ')
    .trim();
}`,

`export function normalizeSpaces(text) {
  return text.replace(/\\s+/g, ' ').trim();
}`,

`export function initials(name) {
  return name
    .split(/\\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 3);
}`,

`export function isValidEmail(value) {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(value);
}`,

`export function maskEmail(email) {
  const [user, domain] = email.split('@');
  if (!domain) return email;
  const visible = user.slice(0, 2);
  return visible + '***@' + domain;
}`,

`export function stripDiacritics(text) {
  return text.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');
}`,

`export function splitLines(text) {
  return text.split(/\\r\\n|\\r|\\n/);
}`,

`export function wordFrequency(text) {
  const counts = {};
  const words = text.toLowerCase().match(/[a-z0-9']+/g) || [];
  for (const word of words) {
    counts[word] = (counts[word] || 0) + 1;
  }
  return counts;
}`,

`export function indentLines(text, spaces) {
  const prefix = ' '.repeat(spaces);
  return text.split('\\n').map((line) => prefix + line).join('\\n');
}`,

`export function escapeRegExp(text) {
  return text.replace(/[.*+?^$(){}|[\\]\\\\]/g, '\\\\$&');
}`,

`export function firstParagraph(text) {
  const trimmed = text.trim();
  const match = trimmed.match(/^[^\\n]+/);
  return match ? match[0].trim() : '';
}`,

`export function toAcronym(text) {
  return text
    .split(/[\\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}`,

`export function isPalindromeWord(text) {
  const cleaned = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}`,

`export function formatList(items, conjunction = 'and') {
  if (items.length === 0) return '';
  if (items.length === 1) return String(items[0]);
  if (items.length === 2) return items[0] + ' ' + conjunction + ' ' + items[1];
  const head = items.slice(0, -1).join(', ');
  return head + ', ' + conjunction + ' ' + items[items.length - 1];
}`,
    ],
  },

  // ---------------------------------------------------------------------------
  // array-utils.js
  // ---------------------------------------------------------------------------
  {
    name: 'array-utils.js',
    blocks: [
`/*
 * Array utilities: partitioning, sampling, grouping, and common
 * transformations used throughout the data layer.
 */`,

`export function chunk(array, size) {
  if (size <= 0) throw new Error('chunk size must be positive');
  const result = [];
  for (let index = 0; index < array.length; index += size) {
    result.push(array.slice(index, index + size));
  }
  return result;
}`,

`export function flattenDeep(array) {
  const result = [];
  for (const item of array) {
    if (Array.isArray(item)) {
      result.push(...flattenDeep(item));
    } else {
      result.push(item);
    }
  }
  return result;
}`,

`export function unique(array) {
  return [...new Set(array)];
}`,

`export function groupBy(items, keyFn) {
  const groups = {};
  for (const item of items) {
    const key = keyFn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
}`,

`export function partition(items, predicate) {
  const matches = [];
  const rest = [];
  for (const item of items) {
    if (predicate(item)) matches.push(item);
    else rest.push(item);
  }
  return [matches, rest];
}`,

`export function shuffle(array) {
  const result = [...array];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}`,

`export function sample(array, count = 1) {
  if (count >= array.length) return shuffle(array);
  const pool = [...array];
  const picked = [];
  while (picked.length < count) {
    const index = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(index, 1)[0]);
  }
  return picked;
}`,

`export function intersection(first, second) {
  const secondSet = new Set(second);
  return [...new Set(first)].filter((item) => secondSet.has(item));
}`,

`export function difference(first, second) {
  const secondSet = new Set(second);
  return first.filter((item) => !secondSet.has(item));
}`,

`export function sumBy(items, keyFn) {
  return items.reduce((total, item) => total + keyFn(item), 0);
}`,

`export function maxBy(items, keyFn) {
  let best = null;
  let bestKey = null;
  for (const item of items) {
    const key = keyFn(item);
    if (best === null || key > bestKey) {
      best = item;
      bestKey = key;
    }
  }
  return best;
}`,

`export function minBy(items, keyFn) {
  let best = null;
  let bestKey = null;
  for (const item of items) {
    const key = keyFn(item);
    if (best === null || key < bestKey) {
      best = item;
      bestKey = key;
    }
  }
  return best;
}`,

`export function sortBy(items, keyFn, descending = false) {
  const factor = descending ? -1 : 1;
  return [...items].sort((a, b) => {
    const keyA = keyFn(a);
    const keyB = keyFn(b);
    if (keyA < keyB) return -1 * factor;
    if (keyA > keyB) return 1 * factor;
    return 0;
  });
}`,

`export function zip(...arrays) {
  const length = Math.min(...arrays.map((array) => array.length));
  const result = [];
  for (let index = 0; index < length; index += 1) {
    result.push(arrays.map((array) => array[index]));
  }
  return result;
}`,

`export function range(start, end, step = 1) {
  const result = [];
  if (step === 0) throw new Error('step cannot be zero');
  if (step > 0) {
    for (let value = start; value <= end; value += step) result.push(value);
  } else {
    for (let value = start; value >= end; value += step) result.push(value);
  }
  return result;
}`,

`export function movingWindow(array, size) {
  const windows = [];
  for (let index = 0; index + size <= array.length; index += 1) {
    windows.push(array.slice(index, index + size));
  }
  return windows;
}`,

`export function countBy(items, keyFn) {
  const counts = {};
  for (const item of items) {
    const key = keyFn(item);
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}`,

`export function rotate(array, steps) {
  if (array.length === 0) return [];
  const shift = ((steps % array.length) + array.length) % array.length;
  return array.slice(shift).concat(array.slice(0, shift));
}`,

`export function firstWhere(items, predicate) {
  for (const item of items) {
    if (predicate(item)) return item;
  }
  return undefined;
}`,

`export function takeWhile(items, predicate) {
  const result = [];
  for (const item of items) {
    if (!predicate(item)) break;
    result.push(item);
  }
  return result;
}`,

`export function medianOf(array) {
  if (array.length === 0) throw new Error('cannot take median of empty array');
  const ordered = [...array].sort((a, b) => a - b);
  const middle = Math.floor(ordered.length / 2);
  if (ordered.length % 2 === 1) return ordered[middle];
  return (ordered[middle - 1] + ordered[middle]) / 2;
}`,

`export function pairs(array) {
  const result = [];
  for (let index = 0; index + 1 < array.length; index += 2) {
    result.push([array[index], array[index + 1]]);
  }
  return result;
}`,

`export function compact(array) {
  return array.filter((item) => item !== null && item !== undefined && item !== '');
}`,
    ],
  },

  // ---------------------------------------------------------------------------
  // math-utils.js
  // ---------------------------------------------------------------------------
  {
    name: 'math-utils.js',
    blocks: [
`/*
 * Numeric helpers: rounding, sequences, number theory, and small
 * statistical primitives used by the analytics modules.
 */`,

`export function clamp(value, low, high) {
  return Math.max(low, Math.min(value, high));
}`,

`export function lerp(start, end, amount) {
  return start + (end - start) * amount;
}`,

`export function roundTo(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}`,

`export function sum(array) {
  return array.reduce((total, value) => total + value, 0);
}`,

`export function product(array) {
  return array.reduce((total, value) => total * value, 1);
}`,

`export function average(array) {
  if (array.length === 0) return NaN;
  return sum(array) / array.length;
}`,

`export function median(array) {
  if (array.length === 0) return NaN;
  const ordered = [...array].sort((a, b) => a - b);
  const middle = Math.floor(ordered.length / 2);
  if (ordered.length % 2 === 1) return ordered[middle];
  return (ordered[middle - 1] + ordered[middle]) / 2;
}`,

`export function variance(array, sample = true) {
  if (array.length < 2) return 0;
  const avg = average(array);
  const squared = array.reduce((total, value) => total + (value - avg) ** 2, 0);
  return squared / (array.length - (sample ? 1 : 0));
}`,

`export function stddev(array, sample = true) {
  return Math.sqrt(variance(array, sample));
}`,

`export function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}`,

`export function lcm(a, b) {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}`,

`export function isPrime(value) {
  if (value < 2) return false;
  if (value < 4) return true;
  if (value % 2 === 0 || value % 3 === 0) return false;
  for (let divisor = 5; divisor * divisor <= value; divisor += 6) {
    if (value % divisor === 0 || value % (divisor + 2) === 0) return false;
  }
  return true;
}`,

`export function primesUpTo(limit) {
  const sieve = new Uint8Array(limit + 1);
  sieve.fill(1);
  if (limit >= 0) sieve[0] = 0;
  if (limit >= 1) sieve[1] = 0;
  for (let prime = 2; prime * prime <= limit; prime += 1) {
    if (sieve[prime]) {
      for (let multiple = prime * prime; multiple <= limit; multiple += prime) {
        sieve[multiple] = 0;
      }
    }
  }
  const primes = [];
  for (let value = 2; value <= limit; value += 1) {
    if (sieve[value]) primes.push(value);
  }
  return primes;
}`,

`export function factorial(value) {
  if (value < 0) throw new Error('factorial of a negative number is undefined');
  let result = 1;
  for (let factor = 2; factor <= value; factor += 1) {
    result *= factor;
  }
  return result;
}`,

`export function fibonacci(index) {
  if (index < 0) throw new Error('index must be non-negative');
  let previous = 0;
  let current = 1;
  for (let step = 0; step < index; step += 1) {
    [previous, current] = [current, previous + current];
  }
  return previous;
}`,

`export function binomial(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let result = 1;
  for (let index = 1; index <= k; index += 1) {
    result = (result * (n - k + index)) / index;
  }
  return Math.round(result);
}`,

`export function percentile(array, rank) {
  if (array.length === 0) throw new Error('empty array');
  if (rank < 0 || rank > 100) throw new Error('rank must be between 0 and 100');
  const ordered = [...array].sort((a, b) => a - b);
  const position = Math.ceil((rank / 100) * ordered.length) - 1;
  return ordered[Math.max(0, position)];
}`,

`export function normalize(array) {
  if (array.length === 0) return [];
  const low = Math.min(...array);
  const high = Math.max(...array);
  if (high === low) return array.map(() => 0);
  return array.map((value) => (value - low) / (high - low));
}`,

`export function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}`,

`export function toDegrees(radians) {
  return (radians * 180) / Math.PI;
}`,

`export function isPowerOfTwo(value) {
  return Number.isInteger(value) && value > 0 && (value & (value - 1)) === 0;
}`,

`export function digitSum(value) {
  return Math.abs(value)
    .toString()
    .split('')
    .reduce((total, digit) => total + Number(digit), 0);
}`,

`export function randomInt(low, high) {
  return low + Math.floor(Math.random() * (high - low + 1));
}`,
    ],
  },

  // ---------------------------------------------------------------------------
  // datetime-utils.js
  // ---------------------------------------------------------------------------
  {
    name: 'datetime-utils.js',
    blocks: [
`/*
 * Date and time helpers built on the platform Date API: shifting,
 * comparing, formatting, and calendar calculations.
 */`,

`export function toIsoString(date) {
  return date.toISOString();
}`,

`export function daysBetween(first, second) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const a = Date.UTC(first.getFullYear(), first.getMonth(), first.getDate());
  const b = Date.UTC(second.getFullYear(), second.getMonth(), second.getDate());
  return Math.round((b - a) / msPerDay);
}`,

`export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}`,

`export function addMonths(date, months) {
  const result = new Date(date);
  const targetDay = result.getDate();
  result.setMonth(result.getMonth() + months);
  if (result.getDate() < targetDay) {
    result.setDate(0);
  }
  return result;
}`,

`export function startOfDay(date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}`,

`export function endOfDay(date) {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}`,

`export function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}`,

`export function startOfWeek(date, weekStartsOn = 0) {
  const result = startOfDay(date);
  const shift = (result.getDay() - weekStartsOn + 7) % 7;
  result.setDate(result.getDate() - shift);
  return result;
}`,

`export function monthName(monthIndex) {
  const names = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return names[monthIndex] || '';
}`,

`export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}`,

`export function isValidDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return true;
  if (typeof value !== 'string') return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}`,

`export function ageFromBirth(birthDate, now = new Date()) {
  let years = now.getFullYear() - birthDate.getFullYear();
  const beforeBirthday =
    now.getMonth() < birthDate.getMonth() ||
    (now.getMonth() === birthDate.getMonth() && now.getDate() < birthDate.getDate());
  if (beforeBirthday) years -= 1;
  return Math.max(0, years);
}`,

`export function timeAgo(date, now = new Date()) {
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + ' minutes ago';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + ' hours ago';
  const days = Math.floor(hours / 24);
  if (days < 30) return days + ' days ago';
  return date.toLocaleDateString();
}`,

`export function quarterOf(date) {
  return Math.floor(date.getMonth() / 3) + 1;
}`,

`export function sameDay(first, second) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}`,

`export function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) return hours + 'h ' + String(minutes).padStart(2, '0') + 'm';
  if (minutes > 0) return minutes + 'm ' + String(secs).padStart(2, '0') + 's';
  return secs + 's';
}`,

`export function parseIsoDate(value) {
  const match = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }
  return date;
}`,

`export function businessDaysBetween(first, second) {
  let count = 0;
  const cursor = startOfDay(first);
  const end = startOfDay(second);
  while (cursor < end) {
    if (!isWeekend(cursor)) count += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}`,

`export function lastDayOfMonth(year, month) {
  return new Date(year, month + 1, 0);
}`,

`export function elapsedSeconds(start, end) {
  return Math.max(0, Math.floor((end - start) / 1000));
}`,

`export function toTimestamp(date) {
  return Math.floor(date.getTime() / 1000);
}`,

`export function fromTimestamp(timestamp) {
  return new Date(timestamp * 1000);
}`,

`export function nextWeekday(date, weekday) {
  const result = new Date(date);
  const shift = (weekday - result.getDay() + 7) % 7 || 7;
  result.setDate(result.getDate() + shift);
  return result;
}`,
    ],
  },
  // ---------------------------------------------------------------------------
  // object-utils.js
  // ---------------------------------------------------------------------------
  {
    name: 'object-utils.js',
    blocks: [
`/*
 * Object utilities: deep operations, path access, and key/value
 * transforms used by the configuration and state layers.
 */`,

`export function deepClone(value) {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(deepClone);
  const clone = {};
  for (const key of Object.keys(value)) {
    clone[key] = deepClone(value[key]);
  }
  return clone;
}`,

`export function deepEqual(first, second) {
  if (first === second) return true;
  if (
    typeof first !== 'object' || typeof second !== 'object' ||
    first === null || second === null
  ) {
    return false;
  }
  const firstKeys = Object.keys(first);
  const secondKeys = Object.keys(second);
  if (firstKeys.length !== secondKeys.length) return false;
  return firstKeys.every(
    (key) => secondKeys.includes(key) && deepEqual(first[key], second[key])
  );
}`,

`export function pick(object, keys) {
  const result = {};
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      result[key] = object[key];
    }
  }
  return result;
}`,

`export function omit(object, keys) {
  const excluded = new Set(keys);
  const result = {};
  for (const key of Object.keys(object)) {
    if (!excluded.has(key)) result[key] = object[key];
  }
  return result;
}`,

`export function getPath(object, path, defaultValue) {
  let current = object;
  for (const part of path.split('.')) {
    if (current === null || typeof current !== 'object' || !(part in current)) {
      return defaultValue;
    }
    current = current[part];
  }
  return current;
}`,

`export function setPath(object, path, value) {
  const parts = path.split('.');
  let current = object;
  for (const part of parts.slice(0, -1)) {
    if (typeof current[part] !== 'object' || current[part] === null) {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}`,

`export function flatten(object, prefix = '') {
  const result = {};
  for (const key of Object.keys(object)) {
    const fullKey = prefix ? prefix + '.' + key : key;
    const value = object[key];
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flatten(value, fullKey));
    } else {
      result[fullKey] = value;
    }
  }
  return result;
}`,

`export function mergeDeep(target, source) {
  const result = deepClone(target);
  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    if (sourceValue !== null && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
      const targetValue = result[key];
      result[key] = mergeDeep(
        targetValue !== null && typeof targetValue === 'object' ? targetValue : {},
        sourceValue
      );
    } else {
      result[key] = sourceValue;
    }
  }
  return result;
}`,

`export function invert(object) {
  const result = {};
  for (const key of Object.keys(object)) {
    result[object[key]] = key;
  }
  return result;
}`,

`export function mapValues(object, mapper) {
  const result = {};
  for (const key of Object.keys(object)) {
    result[key] = mapper(object[key], key);
  }
  return result;
}`,

`export function mapKeys(object, mapper) {
  const result = {};
  for (const key of Object.keys(object)) {
    result[mapper(key)] = object[key];
  }
  return result;
}`,

`export function sortByKeys(object) {
  return Object.keys(object)
    .sort()
    .reduce((result, key) => {
      result[key] = object[key];
      return result;
    }, {});
}`,

`export function hasPath(object, path) {
  let current = object;
  for (const part of path.split('.')) {
    if (current === null || typeof current !== 'object' || !(part in current)) {
      return false;
    }
    current = current[part];
  }
  return true;
}`,

`export function pickBy(object, predicate) {
  const result = {};
  for (const key of Object.keys(object)) {
    if (predicate(object[key], key)) result[key] = object[key];
  }
  return result;
}`,

`export function omitBy(object, predicate) {
  const result = {};
  for (const key of Object.keys(object)) {
    if (!predicate(object[key], key)) result[key] = object[key];
  }
  return result;
}`,

`export function stringifyOrdered(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(stringifyOrdered).join(',') + ']';
  const keys = Object.keys(value).sort();
  const body = keys
    .map((key) => JSON.stringify(key) + ':' + stringifyOrdered(value[key]))
    .join(',');
  return '{' + body + '}';
}`,

`export function zipObject(keys, values) {
  const result = {};
  keys.forEach((key, index) => {
    result[key] = values[index];
  });
  return result;
}`,

`export function defaults(object, fallback) {
  const result = deepClone(object);
  for (const key of Object.keys(fallback)) {
    if (result[key] === undefined) result[key] = fallback[key];
  }
  return result;
}`,

`export function isEmptyObject(object) {
  return Object.keys(object).length === 0;
}`,

`export function toPairs(object) {
  return Object.keys(object).map((key) => [key, object[key]]);
}`,

`export function fromPairs(pairs) {
  const result = {};
  for (const [key, value] of pairs) {
    result[key] = value;
  }
  return result;
}`,

`export function sizeOf(object) {
  return Object.keys(object).length;
}`,

`export function renameKey(object, oldKey, newKey) {
  const result = { ...object };
  if (oldKey in result) {
    result[newKey] = result[oldKey];
    delete result[oldKey];
  }
  return result;
}`,
    ],
  },

  // ---------------------------------------------------------------------------
  // validation.js
  // ---------------------------------------------------------------------------
  {
    name: 'validation.js',
    blocks: [
`/*
 * Validation helpers: format checks, range checks, and a small rule
 * engine for form and request validation.
 */`,

`export function isEmail(value) {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(value);
}`,

`export function isUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}`,

`export function isPhoneNumber(value) {
  const digits = value.replace(/\\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}`,

`export function isStrongPassword(value) {
  if (value.length < 12) return false;
  let categories = 0;
  if (/[a-z]/.test(value)) categories += 1;
  if (/[A-Z]/.test(value)) categories += 1;
  if (/\\d/.test(value)) categories += 1;
  if (/[^a-zA-Z0-9]/.test(value)) categories += 1;
  return categories >= 3;
}`,

`export function luhnCheck(value) {
  const digits = value.replace(/\\D/g, '').split('').map(Number);
  if (digits.length < 12) return false;
  let total = 0;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = digits[index];
    if ((digits.length - index) % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    total += digit;
  }
  return total % 10 === 0;
}`,

`export function isHexColor(value) {
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}`,

`export function isIntegerString(value) {
  return /^[+-]?\\d+$/.test(value.trim());
}`,

`export function isDecimalString(value) {
  return /^[+-]?\\d+(\\.\\d+)?$/.test(value.trim());
}`,

`export function isDateString(value) {
  const match = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12) return false;
  const daysInMonth = new Date(year, month, 0).getDate();
  return day >= 1 && day <= daysInMonth;
}`,

`export function isTimeString(value) {
  return /^([01]\\d|2[0-3]):[0-5]\\d(:[0-5]\\d)?$/.test(value);
}`,

`export function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}`,

`export function isAlphanumeric(value) {
  return /^[a-zA-Z0-9]+$/.test(value);
}`,

`export function isJson(value) {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}`,

`export function isIpv4(value) {
  const parts = value.split('.');
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    if (!/^\\d{1,3}$/.test(part)) return false;
    const number = Number(part);
    return number >= 0 && number <= 255;
  });
}`,

`export function isMacAddress(value) {
  return /^([0-9a-fA-F]{2}[:-]){5}[0-9a-fA-F]{2}$/.test(value);
}`,

`export function isBetween(value, low, high) {
  return value >= low && value <= high;
}`,

`export function isOneOf(value, allowed) {
  return allowed.includes(value);
}`,

`export function isSlug(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}`,

`export function isVersionString(value) {
  return /^\\d+\\.\\d+\\.\\d+$/.test(value);
}`,

`export function validateFields(data, rules) {
  const errors = {};
  for (const field of Object.keys(rules)) {
    const rule = rules[field];
    const value = data[field];
    if (rule.required && (value === undefined || value === '')) {
      errors[field] = rule.message || 'is required';
    } else if (value !== undefined && rule.test && !rule.test(value)) {
      errors[field] = rule.message || 'is invalid';
    }
  }
  return errors;
}`,

`export function isPostalCode(value, country = 'US') {
  if (country === 'US') return /^\\d{5}(-\\d{4})?$/.test(value);
  if (country === 'UK') return /^[A-Z]{1,2}\\d[A-Z\\d]? \\d[A-Z]{2}$/i.test(value);
  if (country === 'CA') return /^[A-Z]\\d[A-Z] \\d[A-Z]\\d$/i.test(value);
  return /^[A-Z0-9 -]{3,10}$/i.test(value);
}`,

`export function hasMinLength(value, minimum) {
  return typeof value === 'string' && value.length >= minimum;
}`,

`export function isIban(value) {
  const cleaned = value.replace(/\\s+/g, '').toUpperCase();
  if (!/^[A-Z]{2}\\d{2}[A-Z0-9]{11,30}$/.test(cleaned)) return false;
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
  const digits = rearranged
    .split('')
    .map((char) => (/\\d/.test(char) ? char : char.charCodeAt(0) - 55))
    .join('');
  let remainder = 0;
  for (let index = 0; index < digits.length; index += 1) {
    remainder = (remainder * 10 + Number(digits[index])) % 97;
  }
  return remainder === 1;
}`,
    ],
  },

  // ---------------------------------------------------------------------------
  // formatting.js
  // ---------------------------------------------------------------------------
  {
    name: 'formatting.js',
    blocks: [
`/*
 * Formatting helpers: numbers, currency, bytes, dates, and text layout
 * for reports and user-facing output.
 */`,

`export function formatNumber(value) {
  return value.toLocaleString('en-US');
}`,

`export function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}`,

`export function formatPercent(value, decimals = 1) {
  return value.toFixed(decimals) + '%';
}`,

`export function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  const digits = unitIndex === 0 ? 0 : 1;
  return value.toFixed(digits) + ' ' + units[unitIndex];
}`,

`export function formatMillis(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return String(hours).padStart(2, '0') + ':' +
    String(minutes).padStart(2, '0') + ':' +
    String(secs).padStart(2, '0');
}`,

`export function pluralize(count, singular, plural) {
  if (count === 1) return singular;
  return plural || singular + 's';
}`,

`export function ordinal(number) {
  const remainder = number % 100;
  if (remainder >= 11 && remainder <= 13) return number + 'th';
  const suffix = { 1: 'st', 2: 'nd', 3: 'rd' }[number % 10] || 'th';
  return number + suffix;
}`,

`export function formatPhone(digits) {
  const cleaned = digits.replace(/\\D/g, '');
  if (cleaned.length === 10) {
    return '(' + cleaned.slice(0, 3) + ') ' + cleaned.slice(3, 6) + '-' + cleaned.slice(6);
  }
  return cleaned;
}`,

`export function formatDateShort(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}`,

`export function formatDateTime(date) {
  return formatDateShort(date) + ' ' +
    String(date.getHours()).padStart(2, '0') + ':' +
    String(date.getMinutes()).padStart(2, '0');
}`,

`export function truncateMiddle(text, maxLength) {
  if (text.length <= maxLength) return text;
  const keep = Math.floor((maxLength - 3) / 2);
  return text.slice(0, keep) + '...' + text.slice(-keep);
}`,

`export function formatList(items, conjunction = 'and') {
  if (items.length === 0) return '';
  if (items.length === 1) return String(items[0]);
  if (items.length === 2) return items[0] + ' ' + conjunction + ' ' + items[1];
  return items.slice(0, -1).join(', ') + ', ' + conjunction + ' ' + items[items.length - 1];
}`,

`export function indent(text, spaces = 4) {
  const prefix = ' '.repeat(spaces);
  return text.split('\\n').map((line) => prefix + line).join('\\n');
}`,

`export function formatLargeNumber(value) {
  if (Math.abs(value) < 1000) return String(value);
  const units = ['K', 'M', 'B', 'T'];
  let scaled = value;
  let unitIndex = -1;
  while (Math.abs(scaled) >= 1000 && unitIndex < units.length - 1) {
    scaled /= 1000;
    unitIndex += 1;
  }
  return scaled.toFixed(1).replace(/\\.0$/, '') + units[unitIndex];
}`,

`export function percentChange(before, after) {
  if (before === 0) return 'n/a';
  const change = ((after - before) / Math.abs(before)) * 100;
  return (change >= 0 ? '+' : '') + change.toFixed(1) + '%';
}`,

`export function titleCase(text) {
  return text
    .split(/\\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}`,

`export function formatRating(value, max = 5) {
  const clamped = Math.max(0, Math.min(value, max));
  const full = '★'.repeat(Math.round(clamped));
  const empty = '☆'.repeat(max - Math.round(clamped));
  return full + empty + ' ' + clamped.toFixed(1);
}`,

`export function formatThroughput(bytes, seconds) {
  if (seconds <= 0) return '0 B/s';
  return formatBytes(bytes / seconds) + '/s';
}`,

`export function formatHex(value, width = 2) {
  return value.toString(16).toUpperCase().padStart(width, '0');
}`,

`export function formatCoordinates(latitude, longitude) {
  const latDirection = latitude >= 0 ? 'N' : 'S';
  const lonDirection = longitude >= 0 ? 'E' : 'W';
  return Math.abs(latitude).toFixed(4) + '°' + latDirection + ', ' +
    Math.abs(longitude).toFixed(4) + '°' + lonDirection;
}`,

`export function formatDurationShort(seconds) {
  if (seconds < 60) return seconds + 's';
  if (seconds < 3600) return Math.round(seconds / 60) + 'm';
  return Math.round(seconds / 3600) + 'h';
}`,

`export function formatPercentile(label, value) {
  return label + ': ' + value.toFixed(1) + 'ms';
}`,

`export function formatScore(value, max) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return value + '/' + max + ' (' + percentage.toFixed(0) + '%)';
}`,
    ],
  },
  // ---------------------------------------------------------------------------
  // http-client.js
  // ---------------------------------------------------------------------------
  {
    name: 'http-client.js',
    blocks: [
`/*
 * HTTP helpers: URL construction, headers, auth, retries, and small
 * response utilities for the API client layer.
 */`,

`export function buildQueryString(params) {
  const parts = [];
  for (const key of Object.keys(params)) {
    const value = params[key];
    if (Array.isArray(value)) {
      for (const item of value) {
        parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(item));
      }
    } else if (value !== undefined && value !== null) {
      parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    }
  }
  return parts.join('&');
}`,

`export function parseUrl(url) {
  const parsed = new URL(url);
  return {
    protocol: parsed.protocol,
    hostname: parsed.hostname,
    port: parsed.port,
    pathname: parsed.pathname,
    search: parsed.search,
    hash: parsed.hash,
  };
}`,

`export function basicAuth(username, password) {
  const token = Buffer.from(username + ':' + password).toString('base64');
  return 'Basic ' + token;
}`,

`export function bearerAuth(token) {
  return 'Bearer ' + token;
}`,

`export function joinUrl(base, path) {
  return base.replace(/\\/+$/, '') + '/' + String(path).replace(/^\\/+/, '');
}`,

`export function statusText(code) {
  const phrases = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    301: 'Moved Permanently',
    304: 'Not Modified',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    503: 'Service Unavailable',
  };
  return phrases[code] || 'Unknown';
}`,

`export function isSuccess(code) {
  return code >= 200 && code < 300;
}`,

`export function isRedirect(code) {
  return code >= 300 && code < 400;
}`,

`export function redactUrl(url, sensitiveKeys) {
  const parsed = new URL(url);
  for (const key of sensitiveKeys) {
    if (parsed.searchParams.has(key)) {
      parsed.searchParams.set(key, '***');
    }
  }
  return parsed.toString();
}`,

`export function parseHeaders(rawText) {
  const headers = {};
  for (const line of rawText.split('\\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const name = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    headers[name] = value;
  }
  return headers;
}`,

`export function cacheMaxAge(headers) {
  const directive = headers['cache-control'] || '';
  for (const part of directive.split(',')) {
    const [key, value] = part.trim().split('=');
    if (key === 'max-age') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}`,

`export function hostnameOf(url) {
  return new URL(url).hostname;
}`,

`export function resolveRedirect(headers, baseUrl) {
  const location = headers.location;
  if (!location) return null;
  return new URL(location, baseUrl).toString();
}`,

`export function buildRangeHeader(size, chunkIndex, totalChunks) {
  const start = chunkIndex * size;
  const end = Math.min(start + size - 1, totalChunks * size - 1);
  return 'bytes=' + start + '-' + end;
}`,

`export function backoffDelay(attempt, baseMs = 500, factor = 2) {
  return baseMs * Math.pow(factor, attempt - 1);
}`,

`export function parseQueryString(query) {
  const params = {};
  for (const [key, value] of new URLSearchParams(query)) {
    params[key] = value;
  }
  return params;
}`,

`export function contentTypeFor(filename) {
  const extension = filename.split('.').pop().toLowerCase();
  const types = {
    json: 'application/json',
    html: 'text/html',
    css: 'text/css',
    js: 'text/javascript',
    png: 'image/png',
    jpg: 'image/jpeg',
    svg: 'image/svg+xml',
    txt: 'text/plain',
    csv: 'text/csv',
    pdf: 'application/pdf',
    zip: 'application/zip',
  };
  return types[extension] || 'application/octet-stream';
}`,

`export async function fetchWithRetry(url, options = {}, attempts = 3) {
  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (response.status < 500) return response;
      lastError = new Error('HTTP ' + response.status);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, backoffDelay(attempt)));
  }
  throw lastError;
}`,

`export function statusClass(code) {
  if (code < 200) return 'informational';
  if (code < 300) return 'success';
  if (code < 400) return 'redirect';
  if (code < 500) return 'client-error';
  return 'server-error';
}`,

`export function prettyPrintJson(value) {
  return JSON.stringify(value, null, 2);
}`,

`export function requestDigest(method, url, body) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body || {});
  return method.toUpperCase() + ' ' + url + ' ' + payload.length + ' bytes';
}`,

`export function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('request timed out after ' + ms + 'ms')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}`,
    ],
  },

  // ---------------------------------------------------------------------------
  // data-processing.js
  // ---------------------------------------------------------------------------
  {
    name: 'data-processing.js',
    blocks: [
`/*
 * Data processing helpers: reshaping tables, aggregation, CSV/JSONL
 * conversion, and statistical summaries for the pipeline stage.
 */`,

`export function transpose(matrix) {
  if (matrix.length === 0) return [];
  return matrix[0].map((_, column) => matrix.map((row) => row[column]));
}`,

`export function pivot(rows, rowsKey, colsKey, valueKey) {
  const result = {};
  for (const row of rows) {
    const rowKey = row[rowsKey];
    const colKey = row[colsKey];
    if (!result[rowKey]) result[rowKey] = {};
    result[rowKey][colKey] = row[valueKey];
  }
  return result;
}`,

`export function aggregate(rows, keyFn, reducer) {
  const groups = {};
  for (const row of rows) {
    const key = keyFn(row);
    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
  }
  const result = {};
  for (const key of Object.keys(groups)) {
    result[key] = reducer(groups[key]);
  }
  return result;
}`,

`export function fillMissing(values, fallback) {
  let previous = fallback;
  return values.map((value) => {
    if (value === null || value === undefined) return previous;
    previous = value;
    return value;
  });
}`,

`export function dedupeBy(items, keyFn) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    const key = keyFn(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}`,

`export function filterOutliers(values, factor = 1.5) {
  const ordered = [...values].sort((a, b) => a - b);
  const q1 = ordered[Math.floor(ordered.length * 0.25)];
  const q3 = ordered[Math.floor(ordered.length * 0.75)];
  const spread = (q3 - q1) * factor;
  const lower = q1 - spread;
  const upper = q3 + spread;
  return values.filter((value) => value >= lower && value <= upper);
}`,

`export function movingAverage(values, window) {
  if (values.length < window) return [];
  const result = [];
  let total = 0;
  for (let index = 0; index < values.length; index += 1) {
    total += values[index];
    if (index >= window) total -= values[index - window];
    if (index >= window - 1) result.push(total / window);
  }
  return result;
}`,

`export function standardize(values) {
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - avg) ** 2, 0) / values.length;
  const sd = Math.sqrt(variance);
  if (sd === 0) return values.map(() => 0);
  return values.map((value) => (value - avg) / sd);
}`,

`export function splitCsvLine(line) {
  const cells = [];
  let current = '';
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if (char === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells.map((cell) => cell.replace(/^"|"$/g, '').replace(/""/g, '"'));
}`,

`export function csvToObjects(csvText) {
  const lines = csvText.trim().split(/\\r?\\n/);
  if (lines.length === 0) return [];
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = cells[index];
    });
    return row;
  });
}`,

`export function objectsToCsv(rows) {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((header) => String(row[header] ?? '')).join(','));
  }
  return lines.join('\\n');
}`,

`export function jsonlToObjects(text) {
  const result = [];
  for (const line of text.split('\\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      result.push(JSON.parse(trimmed));
    } catch {
      // Skip malformed lines rather than failing the whole batch.
    }
  }
  return result;
}`,

`export function mergeRows(base, extra, keyFn) {
  const map = new Map();
  for (const row of base) map.set(keyFn(row), { ...row });
  for (const row of extra) {
    const key = keyFn(row);
    if (map.has(key)) {
      map.set(key, { ...map.get(key), ...row });
    } else {
      map.set(key, { ...row });
    }
  }
  return [...map.values()];
}`,

`export function bucketize(values, size) {
  const buckets = {};
  for (const value of values) {
    const bucket = Math.floor(value / size) * size;
    const key = bucket + '-' + (bucket + size - 1);
    buckets[key] = (buckets[key] || 0) + 1;
  }
  return buckets;
}`,

`export function rankBy(items, keyFn) {
  const ordered = [...items].sort((a, b) => keyFn(b) - keyFn(a));
  const ranks = {};
  ordered.forEach((item, index) => {
    ranks[keyFn(item)] = index + 1;
  });
  return ranks;
}`,

`export function sampleRows(rows, fraction, seed = 42) {
  let state = seed;
  const nextRandom = () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
  return rows.filter(() => nextRandom() < fraction);
}`,

`export function histogram(values, bins) {
  if (values.length === 0 || bins <= 0) return [];
  const low = Math.min(...values);
  const width = (Math.max(...values) - low) / bins;
  const counts = new Array(bins).fill(0);
  for (const value of values) {
    const index = Math.min(bins - 1, Math.floor((value - low) / width));
    counts[index] += 1;
  }
  return counts;
}`,

`export function cumulativeSum(values) {
  const result = [];
  let total = 0;
  for (const value of values) {
    total += value;
    result.push(total);
  }
  return result;
}`,

`export function diffArray(values) {
  const result = [];
  for (let index = 1; index < values.length; index += 1) {
    result.push(values[index] - values[index - 1]);
  }
  return result;
}`,

`export function topN(items, keyFn, count) {
  return [...items]
    .sort((a, b) => keyFn(b) - keyFn(a))
    .slice(0, count);
}`,

`export function lookupIndex(items, keyFn) {
  const index = {};
  for (const item of items) {
    index[keyFn(item)] = item;
  }
  return index;
}`,

`export function rollupTable(rows, groupKey, measures) {
  const result = {};
  for (const row of rows) {
    const key = groupKey(row);
    if (!result[key]) {
      result[key] = {};
      for (const name of Object.keys(measures)) result[key][name] = 0;
    }
    for (const name of Object.keys(measures)) {
      result[key][name] += measures[name](row);
    }
  }
  return result;
}`,

`export function normalizeRow(row) {
  const result = {};
  for (const key of Object.keys(row)) {
    const value = row[key];
    if (typeof value === 'string') result[key] = value.trim();
    else result[key] = value;
  }
  return result;
}`,
    ],
  },

  // ---------------------------------------------------------------------------
  // algorithms.js
  // ---------------------------------------------------------------------------
  {
    name: 'algorithms.js',
    blocks: [
`/*
 * Classic algorithms: searching, sorting, graph traversal, and dynamic
 * programming solutions implemented cleanly and without dependencies.
 */`,

`export function binarySearch(sorted, target) {
  let low = 0;
  let high = sorted.length - 1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if (sorted[middle] === target) return middle;
    if (sorted[middle] < target) low = middle + 1;
    else high = middle - 1;
  }
  return -1;
}`,

`export function linearSearch(items, target) {
  for (let index = 0; index < items.length; index += 1) {
    if (items[index] === target) return index;
  }
  return -1;
}`,

`export function mergeSorted(first, second) {
  const merged = [];
  let i = 0;
  let j = 0;
  while (i < first.length && j < second.length) {
    if (first[i] <= second[j]) merged.push(first[i++]);
    else merged.push(second[j++]);
  }
  return merged.concat(first.slice(i), second.slice(j));
}`,

`export function quickSort(array) {
  if (array.length <= 1) return array;
  const pivot = array[Math.floor(array.length / 2)];
  const less = [];
  const equal = [];
  const greater = [];
  for (const value of array) {
    if (value < pivot) less.push(value);
    else if (value > pivot) greater.push(value);
    else equal.push(value);
  }
  return [...quickSort(less), ...equal, ...quickSort(greater)];
}`,

`export function insertionSort(array) {
  const result = [...array];
  for (let index = 1; index < result.length; index += 1) {
    const value = result[index];
    let position = index - 1;
    while (position >= 0 && result[position] > value) {
      result[position + 1] = result[position];
      position -= 1;
    }
    result[position + 1] = value;
  }
  return result;
}`,

`export function selectionSort(array) {
  const result = [...array];
  for (let index = 0; index < result.length - 1; index += 1) {
    let smallest = index;
    for (let cursor = index + 1; cursor < result.length; cursor += 1) {
      if (result[cursor] < result[smallest]) smallest = cursor;
    }
    if (smallest !== index) {
      [result[index], result[smallest]] = [result[smallest], result[index]];
    }
  }
  return result;
}`,

`export function twoSum(nums, target) {
  const seen = new Map();
  for (let index = 0; index < nums.length; index += 1) {
    const complement = target - nums[index];
    if (seen.has(complement)) return [seen.get(complement), index];
    seen.set(nums[index], index);
  }
  return [];
}`,

`export function longestCommonPrefix(strings) {
  if (strings.length === 0) return '';
  let prefix = strings[0];
  for (const value of strings.slice(1)) {
    while (!value.startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (prefix === '') return '';
    }
  }
  return prefix;
}`,

`export function levenshteinDistance(first, second) {
  const rows = first.length + 1;
  const cols = second.length + 1;
  const table = Array.from({ length: rows }, () => new Array(cols).fill(0));
  for (let row = 0; row < rows; row += 1) table[row][0] = row;
  for (let col = 0; col < cols; col += 1) table[0][col] = col;
  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const cost = first[row - 1] === second[col - 1] ? 0 : 1;
      table[row][col] = Math.min(
        table[row - 1][col] + 1,
        table[row][col - 1] + 1,
        table[row - 1][col - 1] + cost
      );
    }
  }
  return table[first.length][second.length];
}`,

`export function isAnagram(first, second) {
  const normalize = (text) => text.toLowerCase().split('').sort().join('');
  return normalize(first) === normalize(second);
}`,

`export function missingNumber(nums) {
  const length = nums.length;
  const expected = (length * (length + 1)) / 2;
  const actual = nums.reduce((total, value) => total + value, 0);
  return expected - actual;
}`,

`export function majorityElement(nums) {
  let candidate = null;
  let count = 0;
  for (const value of nums) {
    if (count === 0) {
      candidate = value;
      count = 1;
    } else if (value === candidate) {
      count += 1;
    } else {
      count -= 1;
    }
  }
  return candidate;
}`,

`export function maxSubarraySum(nums) {
  let best = nums[0];
  let current = nums[0];
  for (let index = 1; index < nums.length; index += 1) {
    current = Math.max(nums[index], current + nums[index]);
    best = Math.max(best, current);
  }
  return best;
}`,

`export function mergeIntervals(intervals) {
  const ordered = [...intervals].sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const interval of ordered) {
    const last = merged[merged.length - 1];
    if (last && interval[0] <= last[1]) {
      last[1] = Math.max(last[1], interval[1]);
    } else {
      merged.push([interval[0], interval[1]]);
    }
  }
  return merged;
}`,

`export function findDuplicates(nums) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of nums) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}`,

`export function longestIncreasingSubsequence(nums) {
  const tails = [];
  for (const value of nums) {
    let low = 0;
    let high = tails.length;
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      if (tails[middle] < value) low = middle + 1;
      else high = middle;
    }
    tails[low] = value;
  }
  return tails.length;
}`,

`export function coinChange(coins, amount) {
  const table = new Array(amount + 1).fill(Infinity);
  table[0] = 0;
  for (let total = 1; total <= amount; total += 1) {
    for (const coin of coins) {
      if (coin <= total) {
        table[total] = Math.min(table[total], table[total - coin] + 1);
      }
    }
  }
  return table[amount] === Infinity ? -1 : table[amount];
}`,

`export function knapsack(weights, values, capacity) {
  const count = weights.length;
  const table = Array.from({ length: count + 1 }, () => new Array(capacity + 1).fill(0));
  for (let item = 1; item <= count; item += 1) {
    for (let weight = 1; weight <= capacity; weight += 1) {
      if (weights[item - 1] <= weight) {
        table[item][weight] = Math.max(
          table[item - 1][weight],
          table[item - 1][weight - weights[item - 1]] + values[item - 1]
        );
      } else {
        table[item][weight] = table[item - 1][weight];
      }
    }
  }
  return table[count][capacity];
}`,

`export function breadthFirstSearch(graph, start) {
  const visited = new Set();
  const queue = [start];
  const order = [];
  while (queue.length > 0) {
    const node = queue.shift();
    if (visited.has(node)) continue;
    visited.add(node);
    order.push(node);
    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor)) queue.push(neighbor);
    }
  }
  return order;
}`,

`export function depthFirstSearch(graph, start) {
  const visited = new Set();
  const order = [];
  const visit = (node) => {
    if (visited.has(node)) return;
    visited.add(node);
    order.push(node);
    for (const neighbor of graph[node] || []) visit(neighbor);
  };
  visit(start);
  return order;
}`,

`export function hasCycle(graph) {
  const visiting = new Set();
  const done = new Set();
  const visit = (node) => {
    if (done.has(node)) return false;
    if (visiting.has(node)) return true;
    visiting.add(node);
    for (const neighbor of graph[node] || []) {
      if (visit(neighbor)) return true;
    }
    visiting.delete(node);
    done.add(node);
    return false;
  };
  return Object.keys(graph).some((node) => visit(node));
}`,

`export function topologicalSort(graph) {
  const visited = new Set();
  const order = [];
  const visit = (node) => {
    if (visited.has(node)) return;
    visited.add(node);
    for (const neighbor of graph[node] || []) visit(neighbor);
    order.push(node);
  };
  for (const node of Object.keys(graph)) visit(node);
  return order.reverse();
}`,

`export function rotateMatrix(matrix) {
  return matrix[0].map((_, column) => matrix.map((row) => row[column]).reverse());
}`,
    ],
  },
  // ---------------------------------------------------------------------------
  // async-utils.js
  // ---------------------------------------------------------------------------
  {
    name: 'async-utils.js',
    blocks: [
`/*
 * Async utilities: concurrency limits, retries, debouncing, and timing
 * helpers for asynchronous application code.
 */`,

`export async function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}`,

`export async function withTimeout(promise, milliseconds, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message || 'operation timed out')), milliseconds);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}`,

`export async function retry(operation, attempts, delayMs = 250) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(delayMs * attempt);
    }
  }
  throw lastError;
}`,

`export async function mapWithConcurrency(items, worker, limit) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}`,

`export async function filterWithConcurrency(items, predicate, limit) {
  const flags = await mapWithConcurrency(items, predicate, limit);
  return items.filter((_, index) => flags[index]);
}`,

`export function debounce(fn, waitMs) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), waitMs);
  };
}`,

`export function throttle(fn, intervalMs) {
  let waiting = false;
  let lastArgs = null;
  return function (...args) {
    if (waiting) {
      lastArgs = args;
      return;
    }
    fn.apply(this, args);
    waiting = true;
    setTimeout(() => {
      waiting = false;
      if (lastArgs) {
        fn.apply(this, lastArgs);
        lastArgs = null;
      }
    }, intervalMs);
  };
}`,

`export async function pollUntil(check, timeoutMs, intervalMs = 100) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await check()) return true;
    await sleep(intervalMs);
  }
  return false;
}`,

`export async function firstResolved(promises, timeoutMs) {
  const withTimer = promises.map((promise) => withTimeout(promise, timeoutMs));
  return Promise.race(withTimer);
}`,

`export async function runSequentially(tasks) {
  const results = [];
  for (const task of tasks) {
    results.push(await task());
  }
  return results;
}`,

`export async function batchProcess(items, handler, batchSize = 100) {
  for (let start = 0; start < items.length; start += batchSize) {
    await handler(items.slice(start, start + batchSize));
  }
}`,

`export function memoizeAsync(fn) {
  const cache = new Map();
  return async function (...args) {
    const key = JSON.stringify(args);
    if (!cache.has(key)) {
      cache.set(key, fn.apply(this, args));
    }
    return cache.get(key);
  };
}`,

`export async function withRetryBackoff(fn, attempts, baseMs = 200) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        const jitter = Math.random() * 100;
        await sleep(baseMs * 2 ** (attempt - 1) + jitter);
      }
    }
  }
  throw lastError;
}`,

`export function once(fn) {
  let called = false;
  let result;
  return function (...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}`,

`export function parallelAll(operations) {
  return Promise.all(operations.map((operation) => operation()));
}`,

`export async function waterfall(stages, initialValue) {
  let current = initialValue;
  for (const stage of stages) {
    current = await stage(current);
  }
  return current;
}`,

`export function queue(items, worker, concurrency = 4) {
  let cursor = 0;
  const runWorker = async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      await worker(items[index], index);
    }
  };
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, runWorker);
  return Promise.all(workers);
}`,

`export async function everyAsync(items, predicate, limit = 4) {
  const flags = await mapWithConcurrency(items, predicate, limit);
  return flags.every(Boolean);
}`,

`export async function someAsync(items, predicate, limit = 4) {
  const flags = await mapWithConcurrency(items, predicate, limit);
  return flags.some(Boolean);
}`,

`export function cancelableDelay(milliseconds, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, milliseconds);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('delay aborted', 'AbortError'));
    });
  });
}`,

`export async function tryEach(attempts, fallback) {
  for (const operation of attempts) {
    try {
      return await operation();
    } catch {
      // Try the next candidate.
    }
  }
  return fallback;
}`,

`export function timed(name, fn) {
  return async function (...args) {
    const start = performance.now();
    try {
      return await fn.apply(this, args);
    } finally {
      const elapsed = performance.now() - start;
      console.log(name + ' took ' + elapsed.toFixed(1) + 'ms');
    }
  };
}`,
    ],
  },

  // ---------------------------------------------------------------------------
  // tree-utils.js
  // ---------------------------------------------------------------------------
  {
    name: 'tree-utils.js',
    blocks: [
`/*
 * Tree utilities: traversal, transformation, and queries over nested
 * node structures keyed by a configurable children property.
 */`,

`export function treeDepth(node, childrenKey = 'children') {
  const children = node[childrenKey] || [];
  if (children.length === 0) return 1;
  return 1 + Math.max(...children.map((child) => treeDepth(child, childrenKey)));
}`,

`export function countLeaves(node, childrenKey = 'children') {
  const children = node[childrenKey] || [];
  if (children.length === 0) return 1;
  return children.reduce((total, child) => total + countLeaves(child, childrenKey), 0);
}`,

`export function nodeCount(node, childrenKey = 'children') {
  const children = node[childrenKey] || [];
  return 1 + children.reduce((total, child) => total + nodeCount(child, childrenKey), 0);
}`,

`export function findNode(root, predicate) {
  if (predicate(root)) return root;
  for (const child of root.children || []) {
    const found = findNode(child, predicate);
    if (found) return found;
  }
  return null;
}`,

`export function flattenTree(root, childrenKey = 'children') {
  const result = [root];
  for (const child of root[childrenKey] || []) {
    result.push(...flattenTree(child, childrenKey));
  }
  return result;
}`,

`export function filterTree(root, predicate, childrenKey = 'children') {
  if (!predicate(root)) return null;
  const children = (root[childrenKey] || [])
    .map((child) => filterTree(child, predicate, childrenKey))
    .filter(Boolean);
  return { ...root, [childrenKey]: children };
}`,

`export function mapTree(root, mapper, childrenKey = 'children') {
  const mapped = mapper(root);
  const children = (root[childrenKey] || []).map((child) => mapTree(child, mapper, childrenKey));
  return { ...mapped, [childrenKey]: children };
}`,

`export function treeToPaths(root, childrenKey = 'children') {
  const paths = [];
  const walk = (node, prefix) => {
    const current = prefix.concat(node);
    const children = node[childrenKey] || [];
    if (children.length === 0) {
      paths.push(current);
      return;
    }
    for (const child of children) walk(child, current);
  };
  walk(root, []);
  return paths;
}`,

`export function buildTree(nodes, parentKey = 'parentId') {
  const byId = new Map(nodes.map((node) => [node.id, { ...node, children: [] }]));
  const roots = [];
  for (const node of byId.values()) {
    const parent = byId.get(node[parentKey]);
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  return roots;
}`,

`export function walkPreorder(root, visit, childrenKey = 'children') {
  visit(root);
  for (const child of root[childrenKey] || []) {
    walkPreorder(child, visit, childrenKey);
  }
}`,

`export function walkPostorder(root, visit, childrenKey = 'children') {
  for (const child of root[childrenKey] || []) {
    walkPostorder(child, visit, childrenKey);
  }
  visit(root);
}`,

`export function isBalanced(root, childrenKey = 'children') {
  const check = (node) => {
    const children = node[childrenKey] || [];
    if (children.length === 0) return { depth: 1, balanced: true };
    const depths = children.map((child) => check(child));
    if (depths.some((result) => !result.balanced)) return { depth: 0, balanced: false };
    const levels = depths.map((result) => result.depth);
    const difference = Math.max(...levels) - Math.min(...levels);
    return { depth: 1 + Math.max(...levels), balanced: difference <= 1 };
  };
  return check(root).balanced;
}`,

`export function minDepth(root, childrenKey = 'children') {
  const children = root[childrenKey] || [];
  if (children.length === 0) return 1;
  return 1 + Math.min(...children.map((child) => minDepth(child, childrenKey)));
}`,

`export function treeWidth(root, childrenKey = 'children') {
  let widest = 0;
  let level = [root];
  while (level.length > 0) {
    widest = Math.max(widest, level.length);
    level = level.flatMap((node) => node[childrenKey] || []);
  }
  return widest;
}`,

`export function subtreeSum(node, valueKey = 'value', childrenKey = 'children') {
  const own = node[valueKey] || 0;
  const childrenTotal = (node[childrenKey] || []).reduce(
    (total, child) => total + subtreeSum(child, valueKey, childrenKey),
    0
  );
  return own + childrenTotal;
}`,

`export function pruneTree(root, predicate, childrenKey = 'children') {
  const children = (root[childrenKey] || [])
    .map((child) => pruneTree(child, predicate, childrenKey))
    .filter(Boolean);
  if (children.length === 0 && !predicate(root)) return null;
  return { ...root, [childrenKey]: children };
}`,

`export function sortTree(root, keyFn, childrenKey = 'children') {
  const children = (root[childrenKey] || [])
    .map((child) => sortTree(child, keyFn, childrenKey))
    .sort((a, b) => keyFn(a) - keyFn(b));
  return { ...root, [childrenKey]: children };
}`,

`export function mirrorTree(root, childrenKey = 'children') {
  const children = (root[childrenKey] || [])
    .map((child) => mirrorTree(child, childrenKey))
    .reverse();
  return { ...root, [childrenKey]: children };
}`,

`export function pathsToLeaves(root, childrenKey = 'children') {
  const result = [];
  const walk = (node, path) => {
    const current = path.concat(node);
    const children = node[childrenKey] || [];
    if (children.length === 0) {
      result.push(current);
      return;
    }
    for (const child of children) walk(child, current);
  };
  walk(root, []);
  return result;
}`,

`export function deepestNode(root, childrenKey = 'children') {
  let best = root;
  let bestDepth = -1;
  const walk = (node, depth) => {
    if (depth > bestDepth) {
      best = node;
      bestDepth = depth;
    }
    for (const child of node[childrenKey] || []) walk(child, depth + 1);
  };
  walk(root, 0);
  return best;
}`,

`export function hasPathSum(root, target, valueKey = 'value', childrenKey = 'children') {
  const remaining = target - (root[valueKey] || 0);
  const children = root[childrenKey] || [];
  if (children.length === 0) return remaining === 0;
  return children.some((child) => hasPathSum(child, remaining, valueKey, childrenKey));
}`,

`export function collectByKey(root, key, childrenKey = 'children') {
  const result = [];
  const walk = (node) => {
    if (key in node) result.push(node[key]);
    for (const child of node[childrenKey] || []) walk(child);
  };
  walk(root);
  return result;
}`,
    ],
  },

  // ---------------------------------------------------------------------------
  // metrics.js
  // ---------------------------------------------------------------------------
  {
    name: 'metrics.js',
    blocks: [
`/*
 * Metrics and monitoring helpers: distribution summaries, SLO math, and
 * aggregate statistics for the observability dashboard.
 */`,

`export function mean(values) {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}`,

`export function median(values) {
  if (values.length === 0) return 0;
  const ordered = [...values].sort((a, b) => a - b);
  const middle = Math.floor(ordered.length / 2);
  if (ordered.length % 2 === 1) return ordered[middle];
  return (ordered[middle - 1] + ordered[middle]) / 2;
}`,

`export function mode(values) {
  const counts = new Map();
  for (const value of values) {
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  let best = null;
  let bestCount = 0;
  for (const [value, count] of counts) {
    if (count > bestCount) {
      best = value;
      bestCount = count;
    }
  }
  return best;
}`,

`export function variance(values) {
  if (values.length < 2) return 0;
  const avg = mean(values);
  return values.reduce((total, value) => total + (value - avg) ** 2, 0) / (values.length - 1);
}`,

`export function stddev(values) {
  return Math.sqrt(variance(values));
}`,

`export function percentile(values, rank) {
  if (values.length === 0) return 0;
  const ordered = [...values].sort((a, b) => a - b);
  const position = Math.ceil((rank / 100) * ordered.length) - 1;
  return ordered[Math.max(0, Math.min(position, ordered.length - 1))];
}`,

`export function interquartileRange(values) {
  return percentile(values, 75) - percentile(values, 25);
}`,

`export function correlation(first, second) {
  if (first.length !== second.length || first.length === 0) return 0;
  const meanFirst = mean(first);
  const meanSecond = mean(second);
  let numerator = 0;
  let denomFirst = 0;
  let denomSecond = 0;
  for (let index = 0; index < first.length; index += 1) {
    const dx = first[index] - meanFirst;
    const dy = second[index] - meanSecond;
    numerator += dx * dy;
    denomFirst += dx * dx;
    denomSecond += dy * dy;
  }
  const denominator = Math.sqrt(denomFirst * denomSecond);
  return denominator === 0 ? 0 : numerator / denominator;
}`,

`export function linearRegression(xs, ys) {
  const meanX = mean(xs);
  const meanY = mean(ys);
  let numerator = 0;
  let denominator = 0;
  for (let index = 0; index < xs.length; index += 1) {
    numerator += (xs[index] - meanX) * (ys[index] - meanY);
    denominator += (xs[index] - meanX) ** 2;
  }
  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = meanY - slope * meanX;
  return { slope, intercept };
}`,

`export function zScore(value, avg, sd) {
  if (sd === 0) return 0;
  return (value - avg) / sd;
}`,

`export function entropy(probabilities) {
  let total = 0;
  for (const probability of probabilities) {
    if (probability <= 0) continue;
    total -= probability * Math.log2(probability);
  }
  return total;
}`,

`export function exponentialMovingAverage(values, alpha) {
  if (values.length === 0) return [];
  const result = [values[0]];
  for (let index = 1; index < values.length; index += 1) {
    result.push(alpha * values[index] + (1 - alpha) * result[index - 1]);
  }
  return result;
}`,

`export function successRate(successes, total) {
  if (total === 0) return 0;
  return (successes / total) * 100;
}`,

`export function throughput(count, seconds) {
  if (seconds <= 0) return 0;
  return count / seconds;
}`,

`export function latencySummary(latencies) {
  return {
    p50: percentile(latencies, 50),
    p90: percentile(latencies, 90),
    p95: percentile(latencies, 95),
    p99: percentile(latencies, 99),
    max: latencies.length ? Math.max(...latencies) : 0,
  };
}`,

`export function availability(uptimeSeconds, totalSeconds) {
  if (totalSeconds <= 0) return 0;
  return (uptimeSeconds / totalSeconds) * 100;
}`,

`export function errorBudget(remainingMinutes, periodMinutes, targetPercent) {
  const allowedDown = periodMinutes * (1 - targetPercent / 100);
  return (remainingMinutes / Math.max(1, allowedDown)) * 100;
}`,

`export function apdexScore(satisfied, tolerating, frustrated) {
  const total = satisfied + tolerating + frustrated;
  if (total === 0) return 1;
  return (satisfied + tolerating / 2) / total;
}`,

`export function deltaRate(before, after) {
  if (before === 0) return after === 0 ? 0 : Infinity;
  return ((after - before) / before) * 100;
}`,

`export function distributionSummary(values) {
  if (values.length === 0) {
    return { min: 0, max: 0, mean: 0, median: 0, count: 0 };
  }
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    mean: mean(values),
    median: median(values),
    count: values.length,
  };
}`,

`export function quantileBuckets(values, bounds) {
  const buckets = new Array(bounds.length + 1).fill(0);
  for (const value of values) {
    let bucket = bounds.length;
    for (let index = 0; index < bounds.length; index += 1) {
      if (value <= bounds[index]) {
        bucket = index;
        break;
      }
    }
    buckets[bucket] += 1;
  }
  return buckets;
}`,

`export function weightedMean(values, weights) {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  if (totalWeight === 0) return 0;
  let total = 0;
  for (let index = 0; index < values.length; index += 1) {
    total += values[index] * weights[index];
  }
  return total / totalWeight;
}`,
    ],
  },

  // ---------------------------------------------------------------------------
  // models.js
  // ---------------------------------------------------------------------------
  {
    name: 'models.js',
    blocks: [
`/*
 * Domain models: classes for users, orders, accounts, and reusable
 * infrastructure objects like rate limiters and caches.
 */`,

`export class User {
  constructor(id, username, email) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.roles = [];
  }

  hasRole(role) {
    return this.roles.includes(role);
  }

  addRole(role) {
    if (!this.roles.includes(role)) this.roles.push(role);
  }
}`,

`export class Address {
  constructor(street, city, zipCode, country = 'US') {
    this.street = street;
    this.city = city;
    this.zipCode = zipCode;
    this.country = country;
  }

  format() {
    return this.street + ', ' + this.city + ' ' + this.zipCode + ', ' + this.country;
  }
}`,

`export class LineItem {
  constructor(sku, name, price, quantity = 1) {
    this.sku = sku;
    this.name = name;
    this.price = price;
    this.quantity = quantity;
  }

  total() {
    return this.price * this.quantity;
  }
}`,

`export class Order {
  constructor(orderId, customerId) {
    this.orderId = orderId;
    this.customerId = customerId;
    this.items = [];
    this.status = 'pending';
  }

  addItem(item) {
    this.items.push(item);
  }

  subtotal() {
    return this.items.reduce((total, item) => total + item.total(), 0);
  }

  markShipped() {
    if (this.status === 'pending' || this.status === 'paid') {
      this.status = 'shipped';
    }
  }
}`,

`export class Session {
  constructor(userId, token, expiresAt) {
    this.userId = userId;
    this.token = token;
    this.expiresAt = expiresAt;
    this.createdAt = new Date();
  }

  isExpired(now = new Date()) {
    return now >= this.expiresAt;
  }
}`,

`export class InventoryItem {
  constructor(sku, onHand, lowThreshold = 5) {
    this.sku = sku;
    this.onHand = onHand;
    this.lowThreshold = lowThreshold;
  }

  get available() {
    return Math.max(0, this.onHand);
  }

  get status() {
    if (this.onHand <= 0) return 'out-of-stock';
    if (this.onHand <= this.lowThreshold) return 'low';
    return 'in-stock';
  }

  restock(quantity) {
    this.onHand += quantity;
  }
}`,

`export class Account {
  constructor(owner, initialBalance = 0) {
    this.owner = owner;
    this.balance = initialBalance;
    this.transactions = [];
  }

  deposit(amount) {
    if (amount <= 0) throw new Error('deposit must be positive');
    this.balance += amount;
    this.transactions.push({ type: 'deposit', amount, at: new Date() });
  }

  withdraw(amount) {
    if (amount <= 0) throw new Error('withdrawal must be positive');
    if (amount > this.balance) throw new Error('insufficient funds');
    this.balance -= amount;
    this.transactions.push({ type: 'withdraw', amount, at: new Date() });
  }
}`,

`export class Project {
  constructor(name, dueDate) {
    this.name = name;
    this.dueDate = dueDate;
    this.tasks = [];
    this.archived = false;
  }

  addTask(task) {
    this.tasks.push(task);
  }

  progress() {
    if (this.tasks.length === 0) return 0;
    const done = this.tasks.filter((task) => task.completed).length;
    return Math.round((done / this.tasks.length) * 100);
  }

  archive() {
    this.archived = true;
  }
}`,

`export class Task {
  constructor(title, assignee) {
    this.title = title;
    this.assignee = assignee;
    this.completed = false;
    this.priority = 'normal';
    this.tags = [];
  }

  complete() {
    this.completed = true;
  }

  tag(...names) {
    this.tags.push(...names);
  }
}`,

`export class Stopwatch {
  constructor() {
    this.startedAt = null;
    this.laps = [];
  }

  start() {
    this.startedAt = Date.now();
    return this;
  }

  lap() {
    if (this.startedAt === null) throw new Error('stopwatch is not running');
    const now = Date.now();
    const previous = this.laps[this.laps.length - 1] || this.startedAt;
    this.laps.push(now - previous);
    return this.laps[this.laps.length - 1];
  }

  elapsed() {
    if (this.startedAt === null) return 0;
    return Date.now() - this.startedAt;
  }
}`,

`export class Page {
  constructor(items, pageNumber, pageSize, total) {
    this.items = items;
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
    this.total = total;
  }

  get hasMore() {
    return this.pageNumber * this.pageSize < this.total;
  }

  get totalPages() {
    return Math.ceil(this.total / this.pageSize);
  }
}`,

`export class Result {
  constructor(ok, value = null, error = null) {
    this.ok = ok;
    this.value = value;
    this.error = error;
  }

  static success(value) {
    return new Result(true, value);
  }

  static failure(error) {
    return new Result(false, null, error);
  }

  unwrap() {
    if (!this.ok) throw this.error;
    return this.value;
  }
}`,

`export class GeoPoint {
  constructor(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
  }

  distanceTo(other) {
    const toRadians = (degrees) => (degrees * Math.PI) / 180;
    const earthRadius = 6371;
    const deltaLat = toRadians(other.latitude - this.latitude);
    const deltaLon = toRadians(other.longitude - this.longitude);
    const a =
      Math.sin(deltaLat / 2) ** 2 +
      Math.cos(toRadians(this.latitude)) * Math.cos(toRadians(other.latitude)) *
      Math.sin(deltaLon / 2) ** 2;
    return 2 * earthRadius * Math.asin(Math.sqrt(a));
  }
}`,

`export class ConfigStore {
  constructor(defaults = {}) {
    this.values = { ...defaults };
  }

  get(key, fallback) {
    return this.values[key] !== undefined ? this.values[key] : fallback;
  }

  set(key, value) {
    this.values[key] = value;
  }

  snapshot() {
    return { ...this.values };
  }
}`,

`export class Logger {
  constructor(level = 'info') {
    this.level = level;
    const order = ['debug', 'info', 'warn', 'error'];
    this.threshold = order.indexOf(level);
  }

  log(level, message, extra = {}) {
    const order = ['debug', 'info', 'warn', 'error'];
    if (order.indexOf(level) < this.threshold) return;
    const line = new Date().toISOString() + ' [' + level + '] ' + message;
    if (extra && Object.keys(extra).length > 0) {
      console.log(line, extra);
    } else {
      console.log(line);
    }
  }

  debug(message, extra) { this.log('debug', message, extra); }
  info(message, extra) { this.log('info', message, extra); }
  warn(message, extra) { this.log('warn', message, extra); }
  error(message, extra) { this.log('error', message, extra); }
}`,

`export class RateLimiter {
  constructor(limit, windowMs) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.requests = [];
  }

  allow() {
    const now = Date.now();
    this.requests = this.requests.filter((stamp) => now - stamp < this.windowMs);
    if (this.requests.length >= this.limit) return false;
    this.requests.push(now);
    return true;
  }

  remaining() {
    const now = Date.now();
    this.requests = this.requests.filter((stamp) => now - stamp < this.windowMs);
    return Math.max(0, this.limit - this.requests.length);
  }
}`,

`export class Cache {
  constructor(maxEntries = 100) {
    this.maxEntries = maxEntries;
    this.map = new Map();
  }

  get(key) {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.maxEntries) {
      const oldest = this.map.keys().next().value;
      this.map.delete(oldest);
    }
  }
}`,

`export class Emitter {
  constructor() {
    this.listeners = new Map();
  }

  on(event, handler) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    const handlers = this.listeners.get(event);
    if (!handlers) return;
    const index = handlers.indexOf(handler);
    if (index !== -1) handlers.splice(index, 1);
  }

  emit(event, payload) {
    for (const handler of this.listeners.get(event) || []) {
      handler(payload);
    }
  }
}`,

`export class Queue {
  constructor() {
    this.items = [];
  }

  enqueue(item) {
    this.items.push(item);
  }

  dequeue() {
    return this.items.shift();
  }

  get size() {
    return this.items.length;
  }

  isEmpty() {
    return this.items.length === 0;
  }
}`,

`export class Stack {
  constructor() {
    this.items = [];
  }

  push(item) {
    this.items.push(item);
  }

  pop() {
    return this.items.pop();
  }

  peek() {
    return this.items[this.items.length - 1];
  }

  get size() {
    return this.items.length;
  }
}`,

`export class PriorityQueue {
  constructor() {
    this.heap = [];
  }

  push(item, priority) {
    this.heap.push({ item, priority });
    this.heap.sort((a, b) => a.priority - b.priority);
  }

  pop() {
    const entry = this.heap.shift();
    return entry ? entry.item : undefined;
  }

  peek() {
    return this.heap.length > 0 ? this.heap[0].item : undefined;
  }

  get size() {
    return this.heap.length;
  }
}`,

`export class Temperature {
  constructor(celsius) {
    this.celsius = celsius;
  }

  toFahrenheit() {
    return (this.celsius * 9) / 5 + 32;
  }

  toKelvin() {
    return this.celsius + 273.15;
  }

  static fromFahrenheit(fahrenheit) {
    return new Temperature(((fahrenheit - 32) * 5) / 9);
  }
}`,
    ],
  },
];

// --- writer ---------------------------------------------------------------
for (const file of files) {
  const target = path.join(OUT, file.name);
  fs.writeFileSync(target, file.blocks.join('\n\n') + '\n');
}

const total = files.reduce((count, file) => count + file.blocks.length, 0);
console.log(`wrote ${files.length} javascript files, ${total} blocks total`);
