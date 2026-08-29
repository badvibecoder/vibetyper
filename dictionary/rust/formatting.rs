// vibetyper Rust dictionary — formatting & rendering

fn format_duration_hms(total_seconds: u64) -> String {
    let hours = total_seconds / 3600;
    let minutes = (total_seconds % 3600) / 60;
    let seconds = total_seconds % 60;
    format!("{}h {:02}m {:02}s", hours, minutes, seconds)
}

fn format_number_with_commas(value: u64) -> String {
    let digits = value.to_string();
    let mut out = String::new();
    for (i, ch) in digits.chars().enumerate() {
        if i > 0 && (digits.len() - i) % 3 == 0 {
            out.push(',');
        }
        out.push(ch);
    }
    out
}

fn pad_start(text: &str, width: usize, fill: char) -> String {
    let padding = width.saturating_sub(text.chars().count());
    format!("{}{}", fill.to_string().repeat(padding), text)
}

fn pad_end(text: &str, width: usize, fill: char) -> String {
    let mut out = text.to_string();
    while out.chars().count() < width {
        out.push(fill);
    }
    out
}

// Keep the head and tail of a long label, ellipsize the middle.
fn truncate_middle(text: &str, max_len: usize) -> String {
    let chars: Vec<char> = text.chars().collect();
    if chars.len() <= max_len {
        return text.to_string();
    }
    let head = max_len / 2;
    let tail = max_len - head - 1;
    let mut out: String = chars[..head].iter().collect();
    out.push('\u{2026}');
    out.extend(&chars[chars.len() - tail..]);
    out
}

fn format_percent(ratio: f64) -> String {
    let clamped = ratio.clamp(0.0, 1.0);
    format!("{:.1}%", clamped * 100.0)
}

fn format_table_row(cells: &[&str], widths: &[usize]) -> String {
    cells
        .iter()
        .zip(widths.iter())
        .map(|(cell, &width)| format!("{:<width$}", cell, width = width))
        .collect::<Vec<_>>()
        .join("  ")
}

fn format_list_human(items: &[&str]) -> String {
    match items {
        [] => String::new(),
        [single] => single.to_string(),
        [rest @ .., last] => {
            let joined = rest.join(", ");
            format!("{} and {}", joined, last)
        }
    }
}

// Render a duration the way a status line would.
fn format_elapsed(duration: std::time::Duration) -> String {
    let secs = duration.as_secs_f64();
    if secs < 1.0 {
        format!("{}ms", duration.as_millis())
    } else if secs < 60.0 {
        format!("{:.1}s", secs)
    } else {
        let whole = duration.as_secs();
        format!("{}m {:02}s", whole / 60, whole % 60)
    }
}

fn format_money_cents(cents: u64) -> String {
    let dollars = cents / 100;
    let remainder = cents % 100;
    let mut out = format!("{}.{:02}", dollars, remainder);
    out.insert(0, '$');
    out
}

fn format_rate(count: u64, seconds: f64) -> String {
    if seconds <= 0.0 {
        return "0 req/s".to_string();
    }
    format!("{:.1} req/s", count as f64 / seconds)
}

fn align_columns(rows: &[Vec<String>]) -> Vec<String> {
    let columns = rows.iter().map(|row| row.len()).max().unwrap_or(0);
    let mut widths = vec![0usize; columns];
    for row in rows {
        for (i, cell) in row.iter().enumerate() {
            widths[i] = widths[i].max(cell.chars().count());
        }
    }
    let mut out = Vec::with_capacity(rows.len());
    for row in rows {
        out.push(row.iter().enumerate()
            .map(|(i, cell)| format!("{:<w$}", cell, w = widths[i]))
            .collect::<Vec<_>>().join(" "));
    }
    out
}

fn format_hex_pairs(bytes: &[u8]) -> String {
    bytes
        .iter()
        .map(|byte| format!("{:02x}", byte))
        .collect::<Vec<_>>()
        .join(" ")
}

fn format_count(count: usize, noun: &str) -> String {
    let plural = if noun.ends_with('y') {
        format!("{}ies", &noun[..noun.len() - 1])
    } else {
        format!("{}s", noun)
    };
    if count == 1 {
        format!("{} {}", count, noun)
    } else {
        format!("{} {}", count, plural)
    }
}

fn format_f64_compact(value: f64) -> String {
    if value == 0.0 {
        return "0".to_string();
    }
    let magnitude = value.abs().log10().floor() as i32;
    let decimals = (2 - magnitude).clamp(0, 4);
    format!("{:.*}", decimals as usize, value)
}

fn format_version(major: u32, minor: u32, patch: u32) -> String {
    let mut out = major.to_string();
    out.push('.');
    out.push_str(&minor.to_string());
    out.push('.');
    out.push_str(&patch.to_string());
    out
}

fn format_date_iso(year: u32, month: u32, day: u32) -> String {
    let mut out = String::with_capacity(10);
    out.push_str(&format!("{:04}", year));
    out.push('-');
    out.push_str(&format!("{:02}", month));
    out.push('-');
    out.push_str(&format!("{:02}", day));
    out
}

fn format_time_12h(hour: u32, minute: u32) -> String {
    let display = hour % 12;
    let display = if display == 0 { 12 } else { display };
    let period = if hour < 12 { "AM" } else { "PM" };
    format!("{}:{:02} {}", display, minute, period)
}

fn format_sorted_map(map: &std::collections::HashMap<String, i64>) -> String {
    let mut pairs: Vec<(&String, &i64)> = map.iter().collect();
    pairs.sort_by(|a, b| a.0.cmp(b.0));
    pairs
        .iter()
        .map(|(key, value)| format!("{}={}", key, value))
        .collect::<Vec<_>>()
        .join(", ")
}

fn format_line_numbered(lines: &[&str]) -> Vec<String> {
    let width = lines.len().to_string().len();
    lines
        .iter()
        .enumerate()
        .map(|(i, line)| format!("{:>width$}: {}", i + 1, line, width = width))
        .collect()
}

fn format_indent_block(text: &str, spaces: usize) -> String {
    let prefix = " ".repeat(spaces);
    text.lines()
        .map(|line| {
            if line.trim().is_empty() {
                String::new()
            } else {
                format!("{}{}", prefix, line)
            }
        })
        .collect::<Vec<_>>()
        .join("\n")
}

fn format_bool_yes_no(value: bool) -> String {
    if value {
        "yes".to_string()
    } else {
        "no".to_string()
    }
}
