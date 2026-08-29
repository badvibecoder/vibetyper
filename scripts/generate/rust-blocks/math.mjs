// vibetyper rust dictionary data — math & numeric utilities
export const blocks = [
  String.raw`fn gcd(mut a: u64, mut b: u64) -> u64 {
    while b != 0 {
        let remainder = a % b;
        a = b;
        b = remainder;
    }
    a
}`,

  String.raw`fn lcm(a: u64, b: u64) -> Option<u64> {
    let divisor = gcd(a, b);
    if divisor == 0 {
        return None;
    }
    a.checked_mul(b / divisor)
}`,

  String.raw`fn is_prime(n: u64) -> bool {
    if n < 2 {
        return false;
    }
    if n % 2 == 0 {
        return n == 2;
    }
    let mut divisor = 3;
    while divisor * divisor <= n {
        if n % divisor == 0 {
            return false;
        }
        divisor += 2;
    }
    true
}`,

  String.raw`fn sieve_of_eratosthenes(n: usize) -> Vec<bool> {
    let mut is_prime = vec![true; n + 1];
    is_prime[0] = false;
    if n >= 1 {
        is_prime[1] = false;
    }
    for p in 2..=n {
        if is_prime[p] {
            for multiple in (p * p..=n).step_by(p) {
                is_prime[multiple] = false;
            }
        }
    }
    is_prime
}`,

  String.raw`fn nth_fibonacci(n: u32) -> u64 {
    if n == 0 {
        return 0;
    }
    let mut prev = 0u64;
    let mut current = 1u64;
    for _ in 1..n {
        let next = prev + current;
        prev = current;
        current = next;
    }
    current
}`,

  String.raw`fn checked_factorial(n: u32) -> Option<u64> {
    let mut result = 1u64;
    for factor in 2..=n {
        result = result.checked_mul(u64::from(factor))?;
    }
    Some(result)
}`,

  String.raw`fn clamp_f64(value: f64, lo: f64, hi: f64) -> f64 {
    if value < lo {
        lo
    } else if value > hi {
        hi
    } else {
        value
    }
}`,

  String.raw`fn degrees_to_radians(degrees: f64) -> f64 {
    // a full turn is 360 degrees and 2 * pi radians
    degrees * (2.0 * std::f64::consts::PI / 360.0)
}`,

  String.raw`fn mean(values: &[f64]) -> Option<f64> {
    if values.is_empty() {
        return None;
    }
    Some(values.iter().sum::<f64>() / values.len() as f64)
}`,

  String.raw`fn median(values: &[f64]) -> Option<f64> {
    if values.is_empty() {
        return None;
    }
    let mut sorted = values.to_vec();
    sorted.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let mid = sorted.len() / 2;
    if sorted.len() % 2 == 0 {
        Some((sorted[mid - 1] + sorted[mid]) / 2.0)
    } else {
        Some(sorted[mid])
    }
}`,

  String.raw`fn population_std_dev(values: &[f64]) -> Option<f64> {
    let count = values.len();
    if count == 0 {
        return None;
    }
    let mean = values.iter().sum::<f64>() / count as f64;
    let variance = values
        .iter()
        .map(|v| (v - mean) * (v - mean))
        .sum::<f64>()
        / count as f64;
    Some(variance.sqrt())
}`,

  String.raw`fn percentile(sorted: &[f64], p: u8) -> Option<f64> {
    if sorted.is_empty() || p > 100 {
        return None;
    }
    let rank = f64::from(p) / 100.0 * (sorted.len() - 1) as f64;
    let lower = rank.floor() as usize;
    let upper = rank.ceil() as usize;
    if lower == upper {
        Some(sorted[lower])
    } else {
        let weight = rank - lower as f64;
        Some(sorted[lower] * (1.0 - weight) + sorted[upper] * weight)
    }
}`,

  String.raw`fn euclidean_distance(ax: f64, ay: f64, bx: f64, by: f64) -> f64 {
    let dx = bx - ax;
    let dy = by - ay;
    dx.hypot(dy)
}`,

  String.raw`fn lerp(a: f64, b: f64, t: f64) -> f64 {
    let t = t.clamp(0.0, 1.0);
    a + (b - a) * t
}`,

  String.raw`fn modular_pow(base: u64, exponent: u64, modulus: u64) -> u64 {
    if modulus == 1 {
        return 0;
    }
    let mut result = 1u128;
    let mut base = u128::from(base) % u128::from(modulus);
    let mut exp = exponent;
    while exp > 0 {
        if exp & 1 == 1 {
            result = (result * base) % u128::from(modulus);
        }
        base = (base * base) % u128::from(modulus);
        exp >>= 1;
    }
    result as u64
}`,

  String.raw`fn digit_sum(mut n: u64) -> u32 {
    let mut sum = 0u32;
    while n > 0 {
        sum += (n % 10) as u32;
        n /= 10;
    }
    sum
}`,

  String.raw`fn is_palindrome_number(mut n: u32) -> bool {
    if n < 10 {
        return true;
    }
    let mut reversed = 0u32;
    let original = n;
    while n > 0 {
        reversed = reversed * 10 + n % 10;
        n /= 10;
    }
    original == reversed
}`,

  String.raw`fn collatz_steps(mut n: u64) -> Option<u32> {
    if n == 0 {
        return None;
    }
    let mut steps = 0u32;
    while n != 1 {
        n = if n % 2 == 0 { n / 2 } else { n * 3 + 1 };
        steps += 1;
    }
    Some(steps)
}`,

  String.raw`fn is_perfect_square(n: u64) -> bool {
    if n < 2 {
        return true;
    }
    // integer square root by Newton's method
    let mut guess = n;
    let mut next = (guess + n / guess) / 2;
    while next < guess {
        guess = next;
        next = (guess + n / guess) / 2;
    }
    guess * guess == n
}`,

  String.raw`fn popcount(mut n: u64) -> u32 {
    let mut count = 0u32;
    while n != 0 {
        n &= n - 1;
        count += 1;
    }
    count
}`,

  String.raw`fn to_base_string(mut n: u64, base: u32) -> String {
    assert!((2..=36).contains(&base));
    if n == 0 {
        return "0".to_string();
    }
    let digits = b"0123456789abcdefghijklmnopqrstuvwxyz";
    let mut out = Vec::new();
    while n > 0 {
        out.push(digits[(n % u64::from(base)) as usize]);
        n /= u64::from(base);
    }
    out.reverse();
    String::from_utf8(out).unwrap()
}`,

  String.raw`fn simple_moving_average(values: &[f64], window: usize) -> Vec<f64> {
    if window == 0 || values.len() < window {
        return Vec::new();
    }
    let mut averages = Vec::with_capacity(values.len() - window + 1);
    let mut sum: f64 = values[..window].iter().sum();
    averages.push(sum / window as f64);
    for i in window..values.len() {
        sum += values[i] - values[i - window];
        averages.push(sum / window as f64);
    }
    averages
}`,

  String.raw`fn safe_divide(a: f64, b: f64) -> Option<f64> {
    if b == 0.0 {
        None
    } else {
        Some(a / b)
    }
}`,

  String.raw`fn round_to_places(value: f64, places: u32) -> f64 {
    let factor = 10f64.powi(places as i32);
    (value * factor).round() / factor
}`,
];
// total: 24
