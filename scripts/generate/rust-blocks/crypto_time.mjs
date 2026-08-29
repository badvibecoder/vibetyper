// vibetyper rust dictionary data — hashing, encoding & time
export const blocks = [
  String.raw`fn djb2_hash(text: &str) -> u32 {
    let mut hash: u32 = 5381;
    for byte in text.as_bytes() {
        hash = hash
            .wrapping_mul(33)
            .wrapping_add(u32::from(*byte));
    }
    hash
}`,

  String.raw`fn simple_checksum(bytes: &[u8]) -> u8 {
    let mut sum: u32 = 0;
    for byte in bytes {
        sum = sum.wrapping_add(u32::from(*byte));
    }
    (sum & 0xff) as u8
}`,

  String.raw`// Scramble each byte with the key; applying it twice restores the input.
fn xor_encrypt_bytes(bytes: &[u8], key: u8) -> Vec<u8> {
    bytes.iter().map(|byte| byte ^ key).collect()
}`,

  String.raw`// Compact base-36 encoding for short opaque ids.
fn base36_encode(mut value: u64) -> String {
    const DIGITS: &[u8] = b"0123456789abcdefghijklmnopqrstuvwxyz";
    if value == 0 {
        return "0".to_string();
    }
    let mut out = Vec::new();
    while value > 0 {
        out.push(DIGITS[(value % 36) as usize]);
        value /= 36;
    }
    out.reverse();
    String::from_utf8(out).expect("base36 digits are valid utf-8")
}`,

  String.raw`fn xor_checksum_bytes(bytes: &[u8]) -> u8 {
    let mut checksum = 0u8;
    for byte in bytes {
        checksum ^= byte;
    }
    checksum
}`,

  String.raw`// Compare without early exit so timing reveals nothing.
fn constant_time_eq(left: &[u8], right: &[u8]) -> bool {
    if left.len() != right.len() {
        return false;
    }
    let mut diff = 0u8;
    for i in 0..left.len() {
        diff |= left[i] ^ right[i];
    }
    diff == 0
}`,

  String.raw`fn session_token_from_seed(mut seed: u64) -> String {
    let mut out = String::with_capacity(16);
    for _ in 0..2 {
        seed = seed
            .wrapping_mul(6364136223846793005)
            .wrapping_add(1442695040888963407);
        out.push_str(&format!("{:08x}", (seed >> 32) as u32));
    }
    out
}`,

  String.raw`fn unix_to_date_parts(days: i64) -> (i32, u32, u32) {
    let z = days + 719_468;
    let era = z.div_euclid(146_097);
    let doe = z.rem_euclid(146_097);
    let yoe = (doe - doe / 1460 + doe / 36_524 - doe / 146_096) / 365;
    let year = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let day = (doy - (153 * mp + 2) / 5 + 1) as u32;
    let month = (mp + if mp < 10 { 3 } else { -9 }) as u32;
    let year = year + i64::from(mp < 10);
    (year as i32, month, day)
}`,

  String.raw`fn days_from_civil(year: i32, month: u32, day: u32) -> i64 {
    let y = i64::from(year) - i64::from(month <= 2);
    let era = y.div_euclid(400);
    let yoe = y.rem_euclid(400);
    let mp = i64::from(month) + if month > 2 { -3 } else { 9 };
    let doy = (153 * mp + 2) / 5 + i64::from(day) - 1;
    let doe = 365 * yoe + yoe / 4 - yoe / 100 + doy;
    era * 146_097 + doe - 719_468
}`,

  String.raw`fn day_of_week_sakamoto(year: u32, month: u32, day: u32) -> u32 {
    let table = [0u32, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
    let year = if month < 3 { year - 1 } else { year };
    let offset = table[(month - 1) as usize];
    (year + year / 4 - year / 100 + year / 400 + offset + day) % 7
}`,

  String.raw`fn days_in_month(year: u32, month: u32) -> u32 {
    match month {
        1 | 3 | 5 | 7 | 8 | 10 | 12 => 31,
        4 | 6 | 9 | 11 => 30,
        2 => {
            let leap = (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
            if leap { 29 } else { 28 }
        }
        _ => 0,
    }
}`,

  String.raw`fn month_name(month: u32) -> Option<String> {
    const NAMES: [&str; 12] = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];
    if month == 0 {
        return None;
    }
    NAMES.get((month - 1) as usize).map(|name| name.to_string())
}`,

  String.raw`fn ms_since_epoch(time: std::time::SystemTime) -> u128 {
    match time.duration_since(std::time::UNIX_EPOCH) {
        Ok(duration) => duration.as_millis(),
        Err(_) => 0,
    }
}`,

  String.raw`fn seconds_to_hms(total: u64) -> (u32, u32, u32) {
    let hours = (total / 3600) as u32;
    let minutes = ((total % 3600) / 60) as u32;
    let seconds = (total % 60) as u32;
    (hours, minutes, seconds)
}`,

  String.raw`fn parse_hhmm_to_minutes(text: &str) -> Option<u32> {
    let (hours, minutes) = text.split_once(':')?;
    let hours: u32 = hours.parse().ok()?;
    let minutes: u32 = minutes.parse().ok()?;
    if hours > 23 || minutes > 59 {
        return None;
    }
    Some(hours * 60 + minutes)
}`,

  String.raw`fn is_weekend_ts(unix_seconds: i64) -> bool {
    let days = unix_seconds.div_euclid(86_400);
    let weekday = (days + 4).rem_euclid(7);
    weekday == 6 || weekday == 0
}`,

  String.raw`fn elapsed_seconds_between(start: u64, end: u64) -> u64 {
    if end >= start {
        end - start
    } else {
        0
    }
}`,

  String.raw`fn round_ts_to_minute(unix_seconds: i64) -> i64 {
    let remainder = unix_seconds.rem_euclid(60);
    if remainder < 30 {
        unix_seconds - remainder
    } else {
        unix_seconds + (60 - remainder)
    }
}`,

  String.raw`fn hours_between_ts(start: i64, end: i64) -> f64 {
    let seconds = end.saturating_sub(start);
    seconds as f64 / 3600.0
}`,

  String.raw`fn time_of_day_label(hour: u32) -> String {
    match hour {
        5..=11 => "morning".to_string(),
        12..=17 => "afternoon".to_string(),
        18..=21 => "evening".to_string(),
        _ => "night".to_string(),
    }
}`,
];
// total: 20
