/*
 * Metrics and monitoring helpers: distribution summaries, SLO math, and
 * aggregate statistics for the observability dashboard.
 */

export function mean(values) {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function median(values) {
  if (values.length === 0) return 0;
  const ordered = [...values].sort((a, b) => a - b);
  const middle = Math.floor(ordered.length / 2);
  if (ordered.length % 2 === 1) return ordered[middle];
  return (ordered[middle - 1] + ordered[middle]) / 2;
}

export function mode(values) {
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
}

export function variance(values) {
  if (values.length < 2) return 0;
  const avg = mean(values);
  return values.reduce((total, value) => total + (value - avg) ** 2, 0) / (values.length - 1);
}

export function stddev(values) {
  return Math.sqrt(variance(values));
}

export function percentile(values, rank) {
  if (values.length === 0) return 0;
  const ordered = [...values].sort((a, b) => a - b);
  const position = Math.ceil((rank / 100) * ordered.length) - 1;
  return ordered[Math.max(0, Math.min(position, ordered.length - 1))];
}

export function interquartileRange(values) {
  return percentile(values, 75) - percentile(values, 25);
}

export function correlation(first, second) {
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
}

export function linearRegression(xs, ys) {
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
}

export function zScore(value, avg, sd) {
  if (sd === 0) return 0;
  return (value - avg) / sd;
}

export function entropy(probabilities) {
  let total = 0;
  for (const probability of probabilities) {
    if (probability <= 0) continue;
    total -= probability * Math.log2(probability);
  }
  return total;
}

export function exponentialMovingAverage(values, alpha) {
  if (values.length === 0) return [];
  const result = [values[0]];
  for (let index = 1; index < values.length; index += 1) {
    result.push(alpha * values[index] + (1 - alpha) * result[index - 1]);
  }
  return result;
}

export function successRate(successes, total) {
  if (total === 0) return 0;
  return (successes / total) * 100;
}

export function throughput(count, seconds) {
  if (seconds <= 0) return 0;
  return count / seconds;
}

export function latencySummary(latencies) {
  return {
    p50: percentile(latencies, 50),
    p90: percentile(latencies, 90),
    p95: percentile(latencies, 95),
    p99: percentile(latencies, 99),
    max: latencies.length ? Math.max(...latencies) : 0,
  };
}

export function availability(uptimeSeconds, totalSeconds) {
  if (totalSeconds <= 0) return 0;
  return (uptimeSeconds / totalSeconds) * 100;
}

export function errorBudget(remainingMinutes, periodMinutes, targetPercent) {
  const allowedDown = periodMinutes * (1 - targetPercent / 100);
  return (remainingMinutes / Math.max(1, allowedDown)) * 100;
}

export function apdexScore(satisfied, tolerating, frustrated) {
  const total = satisfied + tolerating + frustrated;
  if (total === 0) return 1;
  return (satisfied + tolerating / 2) / total;
}

export function deltaRate(before, after) {
  if (before === 0) return after === 0 ? 0 : Infinity;
  return ((after - before) / before) * 100;
}

export function distributionSummary(values) {
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
}

export function quantileBuckets(values, bounds) {
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
}

export function weightedMean(values, weights) {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  if (totalWeight === 0) return 0;
  let total = 0;
  for (let index = 0; index < values.length; index += 1) {
    total += values[index] * weights[index];
  }
  return total / totalWeight;
}
