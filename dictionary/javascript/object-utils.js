/*
 * Object utilities: deep operations, path access, and key/value
 * transforms used by the configuration and state layers.
 */

export function deepClone(value) {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(deepClone);
  const clone = {};
  for (const key of Object.keys(value)) {
    clone[key] = deepClone(value[key]);
  }
  return clone;
}

export function deepEqual(first, second) {
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
}

export function pick(object, keys) {
  const result = {};
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      result[key] = object[key];
    }
  }
  return result;
}

export function omit(object, keys) {
  const excluded = new Set(keys);
  const result = {};
  for (const key of Object.keys(object)) {
    if (!excluded.has(key)) result[key] = object[key];
  }
  return result;
}

export function getPath(object, path, defaultValue) {
  let current = object;
  for (const part of path.split('.')) {
    if (current === null || typeof current !== 'object' || !(part in current)) {
      return defaultValue;
    }
    current = current[part];
  }
  return current;
}

export function setPath(object, path, value) {
  const parts = path.split('.');
  let current = object;
  for (const part of parts.slice(0, -1)) {
    if (typeof current[part] !== 'object' || current[part] === null) {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

export function flatten(object, prefix = '') {
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
}

export function mergeDeep(target, source) {
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
}

export function invert(object) {
  const result = {};
  for (const key of Object.keys(object)) {
    result[object[key]] = key;
  }
  return result;
}

export function mapValues(object, mapper) {
  const result = {};
  for (const key of Object.keys(object)) {
    result[key] = mapper(object[key], key);
  }
  return result;
}

export function mapKeys(object, mapper) {
  const result = {};
  for (const key of Object.keys(object)) {
    result[mapper(key)] = object[key];
  }
  return result;
}

export function sortByKeys(object) {
  return Object.keys(object)
    .sort()
    .reduce((result, key) => {
      result[key] = object[key];
      return result;
    }, {});
}

export function hasPath(object, path) {
  let current = object;
  for (const part of path.split('.')) {
    if (current === null || typeof current !== 'object' || !(part in current)) {
      return false;
    }
    current = current[part];
  }
  return true;
}

export function pickBy(object, predicate) {
  const result = {};
  for (const key of Object.keys(object)) {
    if (predicate(object[key], key)) result[key] = object[key];
  }
  return result;
}

export function omitBy(object, predicate) {
  const result = {};
  for (const key of Object.keys(object)) {
    if (!predicate(object[key], key)) result[key] = object[key];
  }
  return result;
}

export function stringifyOrdered(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(stringifyOrdered).join(',') + ']';
  const keys = Object.keys(value).sort();
  const body = keys
    .map((key) => JSON.stringify(key) + ':' + stringifyOrdered(value[key]))
    .join(',');
  return '{' + body + '}';
}

export function zipObject(keys, values) {
  const result = {};
  keys.forEach((key, index) => {
    result[key] = values[index];
  });
  return result;
}

export function defaults(object, fallback) {
  const result = deepClone(object);
  for (const key of Object.keys(fallback)) {
    if (result[key] === undefined) result[key] = fallback[key];
  }
  return result;
}

export function isEmptyObject(object) {
  return Object.keys(object).length === 0;
}

export function toPairs(object) {
  return Object.keys(object).map((key) => [key, object[key]]);
}

export function fromPairs(pairs) {
  const result = {};
  for (const [key, value] of pairs) {
    result[key] = value;
  }
  return result;
}

export function sizeOf(object) {
  return Object.keys(object).length;
}

export function renameKey(object, oldKey, newKey) {
  const result = { ...object };
  if (oldKey in result) {
    result[newKey] = result[oldKey];
    delete result[oldKey];
  }
  return result;
}
