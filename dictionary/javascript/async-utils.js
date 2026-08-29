/*
 * Async utilities: concurrency limits, retries, debouncing, and timing
 * helpers for asynchronous application code.
 */

export async function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function withTimeout(promise, milliseconds, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message || 'operation timed out')), milliseconds);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

export async function retry(operation, attempts, delayMs = 250) {
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
}

export async function mapWithConcurrency(items, worker, limit) {
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
}

export async function filterWithConcurrency(items, predicate, limit) {
  const flags = await mapWithConcurrency(items, predicate, limit);
  return items.filter((_, index) => flags[index]);
}

export function debounce(fn, waitMs) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), waitMs);
  };
}

export function throttle(fn, intervalMs) {
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
}

export async function pollUntil(check, timeoutMs, intervalMs = 100) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await check()) return true;
    await sleep(intervalMs);
  }
  return false;
}

export async function firstResolved(promises, timeoutMs) {
  const withTimer = promises.map((promise) => withTimeout(promise, timeoutMs));
  return Promise.race(withTimer);
}

export async function runSequentially(tasks) {
  const results = [];
  for (const task of tasks) {
    results.push(await task());
  }
  return results;
}

export async function batchProcess(items, handler, batchSize = 100) {
  for (let start = 0; start < items.length; start += batchSize) {
    await handler(items.slice(start, start + batchSize));
  }
}

export function memoizeAsync(fn) {
  const cache = new Map();
  return async function (...args) {
    const key = JSON.stringify(args);
    if (!cache.has(key)) {
      cache.set(key, fn.apply(this, args));
    }
    return cache.get(key);
  };
}

export async function withRetryBackoff(fn, attempts, baseMs = 200) {
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
}

export function once(fn) {
  let called = false;
  let result;
  return function (...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

export function parallelAll(operations) {
  return Promise.all(operations.map((operation) => operation()));
}

export async function waterfall(stages, initialValue) {
  let current = initialValue;
  for (const stage of stages) {
    current = await stage(current);
  }
  return current;
}

export function queue(items, worker, concurrency = 4) {
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
}

export async function everyAsync(items, predicate, limit = 4) {
  const flags = await mapWithConcurrency(items, predicate, limit);
  return flags.every(Boolean);
}

export async function someAsync(items, predicate, limit = 4) {
  const flags = await mapWithConcurrency(items, predicate, limit);
  return flags.some(Boolean);
}

export function cancelableDelay(milliseconds, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, milliseconds);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('delay aborted', 'AbortError'));
    });
  });
}

export async function tryEach(attempts, fallback) {
  for (const operation of attempts) {
    try {
      return await operation();
    } catch {
      // Try the next candidate.
    }
  }
  return fallback;
}

export function timed(name, fn) {
  return async function (...args) {
    const start = performance.now();
    try {
      return await fn.apply(this, args);
    } finally {
      const elapsed = performance.now() - start;
      console.log(name + ' took ' + elapsed.toFixed(1) + 'ms');
    }
  };
}
