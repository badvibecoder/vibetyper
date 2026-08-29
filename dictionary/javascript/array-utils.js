/*
 * Array utilities: partitioning, sampling, grouping, and common
 * transformations used throughout the data layer.
 */

export function chunk(array, size) {
  if (size <= 0) throw new Error('chunk size must be positive');
  const result = [];
  for (let index = 0; index < array.length; index += size) {
    result.push(array.slice(index, index + size));
  }
  return result;
}

export function flattenDeep(array) {
  const result = [];
  for (const item of array) {
    if (Array.isArray(item)) {
      result.push(...flattenDeep(item));
    } else {
      result.push(item);
    }
  }
  return result;
}

export function unique(array) {
  return [...new Set(array)];
}

export function groupBy(items, keyFn) {
  const groups = {};
  for (const item of items) {
    const key = keyFn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
}

export function partition(items, predicate) {
  const matches = [];
  const rest = [];
  for (const item of items) {
    if (predicate(item)) matches.push(item);
    else rest.push(item);
  }
  return [matches, rest];
}

export function shuffle(array) {
  const result = [...array];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

export function sample(array, count = 1) {
  if (count >= array.length) return shuffle(array);
  const pool = [...array];
  const picked = [];
  while (picked.length < count) {
    const index = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(index, 1)[0]);
  }
  return picked;
}

export function intersection(first, second) {
  const secondSet = new Set(second);
  return [...new Set(first)].filter((item) => secondSet.has(item));
}

export function difference(first, second) {
  const secondSet = new Set(second);
  return first.filter((item) => !secondSet.has(item));
}

export function sumBy(items, keyFn) {
  return items.reduce((total, item) => total + keyFn(item), 0);
}

export function maxBy(items, keyFn) {
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
}

export function minBy(items, keyFn) {
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
}

export function sortBy(items, keyFn, descending = false) {
  const factor = descending ? -1 : 1;
  return [...items].sort((a, b) => {
    const keyA = keyFn(a);
    const keyB = keyFn(b);
    if (keyA < keyB) return -1 * factor;
    if (keyA > keyB) return 1 * factor;
    return 0;
  });
}

export function zip(...arrays) {
  const length = Math.min(...arrays.map((array) => array.length));
  const result = [];
  for (let index = 0; index < length; index += 1) {
    result.push(arrays.map((array) => array[index]));
  }
  return result;
}

export function range(start, end, step = 1) {
  const result = [];
  if (step === 0) throw new Error('step cannot be zero');
  if (step > 0) {
    for (let value = start; value <= end; value += step) result.push(value);
  } else {
    for (let value = start; value >= end; value += step) result.push(value);
  }
  return result;
}

export function movingWindow(array, size) {
  const windows = [];
  for (let index = 0; index + size <= array.length; index += 1) {
    windows.push(array.slice(index, index + size));
  }
  return windows;
}

export function countBy(items, keyFn) {
  const counts = {};
  for (const item of items) {
    const key = keyFn(item);
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

export function rotate(array, steps) {
  if (array.length === 0) return [];
  const shift = ((steps % array.length) + array.length) % array.length;
  return array.slice(shift).concat(array.slice(0, shift));
}

export function firstWhere(items, predicate) {
  for (const item of items) {
    if (predicate(item)) return item;
  }
  return undefined;
}

export function takeWhile(items, predicate) {
  const result = [];
  for (const item of items) {
    if (!predicate(item)) break;
    result.push(item);
  }
  return result;
}

export function medianOf(array) {
  if (array.length === 0) throw new Error('cannot take median of empty array');
  const ordered = [...array].sort((a, b) => a - b);
  const middle = Math.floor(ordered.length / 2);
  if (ordered.length % 2 === 1) return ordered[middle];
  return (ordered[middle - 1] + ordered[middle]) / 2;
}

export function pairs(array) {
  const result = [];
  for (let index = 0; index + 1 < array.length; index += 2) {
    result.push([array[index], array[index + 1]]);
  }
  return result;
}

export function compact(array) {
  return array.filter((item) => item !== null && item !== undefined && item !== '');
}
