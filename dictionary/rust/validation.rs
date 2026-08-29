// vibetyper Rust dictionary — input validation

fn is_valid_email(email: &str) -> bool {
    let at_count = email.chars().filter(|c| *c == '@').count();
    if at_count != 1 || email.chars().any(|c| c.is_whitespace()) {
        return false;
    }
    let (local, domain) = email.split_once('@').unwrap();
    !local.is_empty() && !domain.is_empty()
}

fn is_strong_password(pw: &str, min_len: usize) -> bool {
    if pw.chars().count() < min_len {
        return false;
    }
    let has_lower = pw.chars().any(|c| c.is_ascii_lowercase());
    let has_upper = pw.chars().any(|c| c.is_ascii_uppercase());
    let has_digit = pw.chars().any(|c| c.is_ascii_digit());
    let has_symbol = pw.chars().any(|c| !c.is_ascii_alphanumeric());
    let classes = [has_lower, has_upper, has_digit, has_symbol]
        .into_iter()
        .filter(|b| *b)
        .count();
    classes >= 3
}

fn is_valid_us_phone(input: &str) -> bool {
    let digits: String = input.chars().filter(|c| c.is_ascii_digit()).collect();
    if digits.len() != 10 {
        return false;
    }
    input.chars().all(|c| {
        c.is_ascii_digit() || c == '-' || c == '(' || c == ')' || c == ' ' || c == '.'
    })
}

fn is_valid_ipv4(input: &str) -> bool {
    let parts: Vec<&str> = input.split('.').collect();
    if parts.len() != 4 {
        return false;
    }
    parts.iter().all(|part| {
        if part.is_empty() || part.len() > 3 || !part.chars().all(|c| c.is_ascii_digit()) {
            return false;
        }
        let value: u32 = part.parse().unwrap_or(0);
        value <= 255
    })
}

fn is_valid_hex_color(input: &str) -> bool {
    let body = match input.strip_prefix('#') {
        Some(rest) => rest,
        None => return false,
    };
    body.len() == 6 && body.chars().all(|c| c.is_ascii_hexdigit())
}

fn is_valid_username(name: &str) -> bool {
    let len = name.chars().count();
    if !(3..=20).contains(&len) {
        return false;
    }
    name.chars().all(|c| c.is_ascii_alphanumeric() || c == '_')
}

fn is_valid_port(input: &str) -> bool {
    match input.parse::<u32>() {
        Ok(value) => (1..=65535).contains(&value),
        Err(_) => false,
    }
}

fn is_valid_date_ymd(year: i32, month: u32, day: u32) -> bool {
    if !(1..=12).contains(&month) || day == 0 {
        return false;
    }
    let days = match month {
        2 => {
            let leap = year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
            if leap { 29 } else { 28 }
        }
        4 | 6 | 9 | 11 => 30,
        _ => 31,
    };
    day <= days
}

fn is_leap_year(year: i32) -> bool {
    if year % 4 != 0 {
        return false;
    }
    if year % 100 == 0 && year % 400 != 0 {
        return false;
    }
    true
}

fn is_valid_isbn10(isbn: &str) -> bool {
    let cleaned: Vec<char> = isbn.chars().filter(|c| *c != '-').collect();
    if cleaned.len() != 10 || cleaned[..9].iter().any(|c| !c.is_ascii_digit()) {
        return false;
    }
    let mut sum = 0u32;
    for (i, c) in cleaned.iter().enumerate() {
        let value = if *c == 'X' && i == 9 {
            10
        } else {
            c.to_digit(10).unwrap_or(0)
        };
        sum += value * (10 - i as u32);
    }
    sum % 11 == 0
}

// Luhn checksum used by card and account numbers.
fn is_valid_luhn(input: &str) -> bool {
    if input.is_empty() || !input.chars().all(|c| c.is_ascii_digit()) {
        return false;
    }
    let mut sum = 0u32;
    for (i, c) in input.chars().rev().enumerate() {
        let mut digit = c.to_digit(10).unwrap();
        if i % 2 == 1 {
            digit = digit * 2 - 9 * (digit > 4) as u32;
        }
        sum += digit;
    }
    sum % 10 == 0
}

fn is_balanced_parentheses(input: &str) -> bool {
    let mut stack: Vec<char> = Vec::new();
    for c in input.chars() {
        if "([{".contains(c) {
            stack.push(match c {
                '(' => ')',
                '[' => ']',
                _ => '}',
            });
        } else if ")]}".contains(c) && stack.pop() != Some(c) {
            return false;
        }
    }
    stack.is_empty()
}

fn contains_only_digits(input: &str) -> bool {
    if input.is_empty() {
        return false;
    }
    input.chars().all(|c| c.is_ascii_digit())
}

fn is_valid_slug(slug: &str) -> bool {
    if slug.is_empty() || slug.starts_with('-') || slug.ends_with('-') {
        return false;
    }
    slug.chars()
        .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '-')
}

fn is_valid_semver(version: &str) -> bool {
    let parts: Vec<&str> = version.split('.').collect();
    if parts.len() != 3 {
        return false;
    }
    parts
        .iter()
        .all(|p| !p.is_empty() && p.parse::<u64>().is_ok())
}

fn is_valid_percent(input: &str) -> bool {
    match input.trim().parse::<f64>() {
        Ok(value) => (0.0..=100.0).contains(&value),
        Err(_) => false,
    }
}

fn is_ascii_printable(input: &str) -> bool {
    input
        .chars()
        .all(|c| c.is_ascii() && !c.is_ascii_control())
}

fn is_valid_domain_label(label: &str) -> bool {
    if label.is_empty() || label.len() > 63 {
        return false;
    }
    if label.starts_with('-') || label.ends_with('-') {
        return false;
    }
    label
        .chars()
        .all(|c| c.is_ascii_alphanumeric() || c == '-')
}

// Accept only http and https with a non-empty host part.
fn is_valid_http_url(url: &str) -> bool {
    let rest = if let Some(r) = url.strip_prefix("https://") {
        r
    } else if let Some(r) = url.strip_prefix("http://") {
        r
    } else {
        return false;
    };
    !rest.is_empty()
        && rest
            .split(|c| c == '/' || c == '?' || c == '#')
            .next()
            .is_some_and(|host| !host.is_empty())
}

fn is_valid_coordinates(lat: f64, lon: f64) -> bool {
    if !(-90.0..=90.0).contains(&lat) {
        return false;
    }
    (-180.0..=180.0).contains(&lon)
}

fn is_valid_hex_str(input: &str) -> bool {
    if input.len() % 2 != 0 {
        return false;
    }
    input.chars().all(|c| c.is_ascii_hexdigit())
}

fn is_valid_identifier(ident: &str) -> bool {
    let mut chars = ident.chars();
    match chars.next() {
        Some(first) => {
            (first == '_' || first.is_ascii_alphabetic())
                && chars.all(|c| c.is_ascii_alphanumeric() || c == '_')
        }
        None => false,
    }
}

fn is_valid_hhmm_time(input: &str) -> bool {
    let (hour, minute) = match input.split_once(':') {
        Some(pair) => pair,
        None => return false,
    };
    match (hour.parse::<u32>(), minute.parse::<u32>()) {
        (Ok(h), Ok(m)) => h < 24 && m < 60,
        _ => false,
    }
}

fn is_strong_api_key(key: &str) -> bool {
    if key.len() < 24 {
        return false;
    }
    let mut flags = 0u8;
    for c in key.chars() {
        flags |= (c.is_ascii_uppercase() as u8) << 2;
        flags |= (c.is_ascii_lowercase() as u8) << 1;
        flags |= (c.is_ascii_digit() as u8) << 0;
    }
    flags == 0b111
}
