/*
 * Numeric helpers: rounding, sequences, number theory, and small
 * statistical primitives used by the analytics modules.
 */

export function clamp(value, low, high) {
  return Math.max(low, Math.min(value, high));
}

export function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

export function roundTo(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function sum(array) {
  return array.reduce((total, value) => total + value, 0);
}

export function product(array) {
  return array.reduce((total, value) => total * value, 1);
}

export function average(array) {
  if (array.length === 0) return NaN;
  return sum(array) / array.length;
}

export function median(array) {
  if (array.length === 0) return NaN;
  const ordered = [...array].sort((a, b) => a - b);
  const middle = Math.floor(ordered.length / 2);
  if (ordered.length % 2 === 1) return ordered[middle];
  return (ordered[middle - 1] + ordered[middle]) / 2;
}

export function variance(array, sample = true) {
  if (array.length < 2) return 0;
  const avg = average(array);
  const squared = array.reduce((total, value) => total + (value - avg) ** 2, 0);
  return squared / (array.length - (sample ? 1 : 0));
}

export function stddev(array, sample = true) {
  return Math.sqrt(variance(array, sample));
}

export function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

export function lcm(a, b) {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}

export function isPrime(value) {
  if (value < 2) return false;
  if (value < 4) return true;
  if (value % 2 === 0 || value % 3 === 0) return false;
  for (let divisor = 5; divisor * divisor <= value; divisor += 6) {
    if (value % divisor === 0 || value % (divisor + 2) === 0) return false;
  }
  return true;
}

export function primesUpTo(limit) {
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
}

export function factorial(value) {
  if (value < 0) throw new Error('factorial of a negative number is undefined');
  let result = 1;
  for (let factor = 2; factor <= value; factor += 1) {
    result *= factor;
  }
  return result;
}

export function fibonacci(index) {
  if (index < 0) throw new Error('index must be non-negative');
  let previous = 0;
  let current = 1;
  for (let step = 0; step < index; step += 1) {
    [previous, current] = [current, previous + current];
  }
  return previous;
}

export function binomial(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let result = 1;
  for (let index = 1; index <= k; index += 1) {
    result = (result * (n - k + index)) / index;
  }
  return Math.round(result);
}

export function percentile(array, rank) {
  if (array.length === 0) throw new Error('empty array');
  if (rank < 0 || rank > 100) throw new Error('rank must be between 0 and 100');
  const ordered = [...array].sort((a, b) => a - b);
  const position = Math.ceil((rank / 100) * ordered.length) - 1;
  return ordered[Math.max(0, position)];
}

export function normalize(array) {
  if (array.length === 0) return [];
  const low = Math.min(...array);
  const high = Math.max(...array);
  if (high === low) return array.map(() => 0);
  return array.map((value) => (value - low) / (high - low));
}

export function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

export function toDegrees(radians) {
  return (radians * 180) / Math.PI;
}

export function isPowerOfTwo(value) {
  return Number.isInteger(value) && value > 0 && (value & (value - 1)) === 0;
}

export function digitSum(value) {
  return Math.abs(value)
    .toString()
    .split('')
    .reduce((total, digit) => total + Number(digit), 0);
}

export function randomInt(low, high) {
  return low + Math.floor(Math.random() * (high - low + 1));
}
