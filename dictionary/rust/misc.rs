// vibetyper Rust dictionary — misc utilities

fn xorshift64_next(state: &mut u64) -> u64 {
    let mut x = *state;
    x ^= x << 13;
    x ^= x >> 7;
    x ^= x << 17;
    *state = x;
    x
}

fn rand_u64_in_range(state: &mut u64, lo: u64, hi: u64) -> u64 {
    debug_assert!(lo < hi);
    let span = hi - lo;
    lo + xorshift64_next(state) % span
}

use std::collections::HashMap;

fn parse_key_value_lines(text: &str) -> HashMap<String, String> {
    let mut out = HashMap::new();
    for line in text.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        if let Some((key, value)) = line.split_once('=') {
            out.insert(key.trim().to_string(), value.trim().to_string());
        }
    }
    out
}

fn env_var_or_default(key: &str, fallback: &str) -> String {
    std::env::var(key).unwrap_or_else(|_| fallback.to_string())
}

fn sleep_millis(ms: u64) {
    std::thread::sleep(std::time::Duration::from_millis(ms));
}

fn elapsed_millis(start: std::time::Instant) -> u128 {
    start.elapsed().as_millis()
}

fn byte_size_human(bytes: u64) -> String {
    const UNITS: [&str; 5] = ["B", "KiB", "MiB", "GiB", "TiB"];
    let mut value = bytes as f64;
    let mut unit = 0;
    while value >= 1024.0 && unit + 1 < UNITS.len() {
        value /= 1024.0;
        unit += 1;
    }
    if unit == 0 {
        format!("{} B", bytes)
    } else {
        format!("{:.1} {}", value, UNITS[unit])
    }
}

fn clamp_ord<T: Ord>(value: T, lower: T, upper: T) -> T {
    value.max(lower).min(upper)
}

fn reverse_bits_u32(mut value: u32) -> u32 {
    let mut reversed = 0u32;
    for _ in 0..32 {
        reversed = (reversed << 1) | (value & 1);
        value >>= 1;
    }
    reversed
}

fn is_power_of_two(value: u64) -> bool {
    value > 0 && (value & (value - 1)) == 0
}

fn align_up(value: usize, alignment: usize) -> usize {
    debug_assert!(alignment.is_power_of_two());
    (value + alignment - 1) & !(alignment - 1)
}

fn split_csv_line(line: &str) -> Vec<String> {
    let mut fields = Vec::new();
    let mut current = String::new();
    let mut in_quotes = false;
    for ch in line.chars() {
        match ch {
            '"' => in_quotes = !in_quotes,
            ',' if !in_quotes => {
                fields.push(current.trim().to_string());
                current.clear();
            }
            _ => current.push(ch),
        }
    }
    fields.push(current.trim().to_string());
    fields
}

fn escape_shell_arg(arg: &str) -> String {
    format!("'{}'", arg.replace('\'', "'\\''"))
}

fn hex_encode(bytes: &[u8]) -> String {
    let mut out = String::with_capacity(bytes.len() * 2);
    for byte in bytes {
        out.push_str(&format!("{:02x}", byte));
    }
    out
}

fn min_max_slice(values: &[i32]) -> Option<(i32, i32)> {
    let mut iter = values.iter();
    let first = *iter.next()?;
    let mut min = first;
    let mut max = first;
    for &v in iter {
        min = min.min(v);
        max = max.max(v);
    }
    Some((min, max))
}

fn median_of_three(a: i32, b: i32, c: i32) -> i32 {
    if (a > b) != (a > c) {
        a
    } else if (b > a) != (b > c) {
        b
    } else {
        c
    }
}

fn is_printable(text: &str) -> bool {
    text.chars()
        .all(|c| c.is_ascii_graphic() || c == ' ' || c == '\t' || c == '\n')
}

fn retry_operation<F>(mut operation: F, attempts: u32) -> Result<(), String>
where
    F: FnMut() -> Result<(), String>,
{
    for attempt in 0..attempts {
        match operation() {
            Ok(()) => return Ok(()),
            Err(err) if attempt + 1 < attempts => {
                eprintln!("attempt {} failed: {}", attempt + 1, err);
            }
            Err(err) => return Err(err),
        }
    }
    Ok(())
}

fn fnv1a_hash(text: &str) -> u64 {
    const OFFSET: u64 = 0xcbf29ce484222325;
    const PRIME: u64 = 0x100000001b3;
    let mut hash = OFFSET;
    for byte in text.as_bytes() {
        hash ^= u64::from(*byte);
        hash = hash.wrapping_mul(PRIME);
    }
    hash
}

use std::collections::HashSet;

fn has_unique_chars(text: &str) -> bool {
    let mut seen = HashSet::new();
    text.chars().all(|c| seen.insert(c))
}

fn bitmask_for_bits(count: u32) -> u64 {
    if count >= 64 {
        u64::MAX
    } else {
        (1u64 << count) - 1
    }
}

fn parse_boolish(value: &str) -> Option<bool> {
    match value.trim().to_ascii_lowercase().as_str() {
        "true" | "yes" | "1" | "on" => Some(true),
        "false" | "no" | "0" | "off" => Some(false),
        _ => None,
    }
}
