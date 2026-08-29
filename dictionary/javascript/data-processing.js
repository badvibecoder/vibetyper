/*
 * Data processing helpers: reshaping tables, aggregation, CSV/JSONL
 * conversion, and statistical summaries for the pipeline stage.
 */

export function transpose(matrix) {
  if (matrix.length === 0) return [];
  return matrix[0].map((_, column) => matrix.map((row) => row[column]));
}

export function pivot(rows, rowsKey, colsKey, valueKey) {
  const result = {};
  for (const row of rows) {
    const rowKey = row[rowsKey];
    const colKey = row[colsKey];
    if (!result[rowKey]) result[rowKey] = {};
    result[rowKey][colKey] = row[valueKey];
  }
  return result;
}

export function aggregate(rows, keyFn, reducer) {
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
}

export function fillMissing(values, fallback) {
  let previous = fallback;
  return values.map((value) => {
    if (value === null || value === undefined) return previous;
    previous = value;
    return value;
  });
}

export function dedupeBy(items, keyFn) {
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
}

export function filterOutliers(values, factor = 1.5) {
  const ordered = [...values].sort((a, b) => a - b);
  const q1 = ordered[Math.floor(ordered.length * 0.25)];
  const q3 = ordered[Math.floor(ordered.length * 0.75)];
  const spread = (q3 - q1) * factor;
  const lower = q1 - spread;
  const upper = q3 + spread;
  return values.filter((value) => value >= lower && value <= upper);
}

export function movingAverage(values, window) {
  if (values.length < window) return [];
  const result = [];
  let total = 0;
  for (let index = 0; index < values.length; index += 1) {
    total += values[index];
    if (index >= window) total -= values[index - window];
    if (index >= window - 1) result.push(total / window);
  }
  return result;
}

export function standardize(values) {
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - avg) ** 2, 0) / values.length;
  const sd = Math.sqrt(variance);
  if (sd === 0) return values.map(() => 0);
  return values.map((value) => (value - avg) / sd);
}

export function splitCsvLine(line) {
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
}

export function csvToObjects(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
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
}

export function objectsToCsv(rows) {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((header) => String(row[header] ?? '')).join(','));
  }
  return lines.join('\n');
}

export function jsonlToObjects(text) {
  const result = [];
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      result.push(JSON.parse(trimmed));
    } catch {
      // Skip malformed lines rather than failing the whole batch.
    }
  }
  return result;
}

export function mergeRows(base, extra, keyFn) {
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
}

export function bucketize(values, size) {
  const buckets = {};
  for (const value of values) {
    const bucket = Math.floor(value / size) * size;
    const key = bucket + '-' + (bucket + size - 1);
    buckets[key] = (buckets[key] || 0) + 1;
  }
  return buckets;
}

export function rankBy(items, keyFn) {
  const ordered = [...items].sort((a, b) => keyFn(b) - keyFn(a));
  const ranks = {};
  ordered.forEach((item, index) => {
    ranks[keyFn(item)] = index + 1;
  });
  return ranks;
}

export function sampleRows(rows, fraction, seed = 42) {
  let state = seed;
  const nextRandom = () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
  return rows.filter(() => nextRandom() < fraction);
}

export function histogram(values, bins) {
  if (values.length === 0 || bins <= 0) return [];
  const low = Math.min(...values);
  const width = (Math.max(...values) - low) / bins;
  const counts = new Array(bins).fill(0);
  for (const value of values) {
    const index = Math.min(bins - 1, Math.floor((value - low) / width));
    counts[index] += 1;
  }
  return counts;
}

export function cumulativeSum(values) {
  const result = [];
  let total = 0;
  for (const value of values) {
    total += value;
    result.push(total);
  }
  return result;
}

export function diffArray(values) {
  const result = [];
  for (let index = 1; index < values.length; index += 1) {
    result.push(values[index] - values[index - 1]);
  }
  return result;
}

export function topN(items, keyFn, count) {
  return [...items]
    .sort((a, b) => keyFn(b) - keyFn(a))
    .slice(0, count);
}

export function lookupIndex(items, keyFn) {
  const index = {};
  for (const item of items) {
    index[keyFn(item)] = item;
  }
  return index;
}

export function rollupTable(rows, groupKey, measures) {
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
}

export function normalizeRow(row) {
  const result = {};
  for (const key of Object.keys(row)) {
    const value = row[key];
    if (typeof value === 'string') result[key] = value.trim();
    else result[key] = value;
  }
  return result;
}
