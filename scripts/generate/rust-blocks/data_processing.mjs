// vibetyper rust dictionary data — data processing & parsing
export const blocks = [
  String.raw`fn parse_csv_row(line: &str) -> Vec<String> {
    line.split(',')
        .map(|field| field.trim().to_string())
        .collect()
}`,

  String.raw`fn parse_key_value_line(line: &str) -> Option<(String, String)> {
    let trimmed = line.trim();
    if trimmed.is_empty() || trimmed.starts_with('#') {
        return None;
    }
    let (key, value) = trimmed.split_once('=')?;
    Some((key.trim().to_string(), value.trim().to_string()))
}`,

  String.raw`fn parse_query_string(query: &str) -> Vec<(String, String)> {
    query
        .split('&')
        .filter(|pair| !pair.is_empty())
        .filter_map(|pair| {
            let (key, value) = pair.split_once('=')?;
            Some((key.to_string(), value.to_string()))
        })
        .collect()
}`,

  String.raw`fn extract_numbers_from_text(text: &str) -> Vec<f64> {
    let mut numbers = Vec::new();
    for token in text.split(|c: char| !c.is_ascii_digit() && c != '.' && c != '-') {
        if let Ok(value) = token.parse::<f64>() {
            numbers.push(value);
        }
    }
    numbers
}`,

  String.raw`fn tokenize_words(text: &str) -> Vec<String> {
    text.split(|c: char| !c.is_alphanumeric())
        .filter(|token| !token.is_empty())
        .map(|token| token.to_lowercase())
        .collect()
}`,

  String.raw`fn normalize_text(text: &str) -> String {
    text.split_whitespace()
        .collect::<Vec<_>>()
        .join(" ")
        .to_lowercase()
}`,

  String.raw`fn count_lines_words_chars(text: &str) -> (usize, usize, usize) {
    let lines = text.lines().count();
    let words = text.split_whitespace().count();
    let chars = text.chars().count();
    (lines, words, chars)
}`,

  String.raw`fn parse_integer_list(input: &str) -> Result<Vec<i64>, String> {
    let mut values = Vec::new();
    for part in input.split(',') {
        let trimmed = part.trim();
        if trimmed.is_empty() {
            return Err(format!("empty element at position {}", values.len() + 1));
        }
        match trimmed.parse::<i64>() {
            Ok(value) => values.push(value),
            Err(_) => return Err(format!("invalid integer: {}", trimmed)),
        }
    }
    Ok(values)
}`,

  String.raw`fn transpose_matrix(matrix: &[Vec<f64>]) -> Option<Vec<Vec<f64>>> {
    let rows = matrix.len();
    let cols = matrix.first()?.len();
    if matrix.iter().any(|row| row.len() != cols) {
        return None;
    }
    let mut out = vec![vec![0.0; rows]; cols];
    for (i, row) in matrix.iter().enumerate() {
        for (j, value) in row.iter().enumerate() {
            out[j][i] = *value;
        }
    }
    Some(out)
}`,

  String.raw`use std::collections::HashMap;

fn sum_by_key(entries: Vec<(String, i64)>) -> HashMap<String, i64> {
    let mut totals = HashMap::new();
    for (key, value) in entries {
        *totals.entry(key).or_insert(0) += value;
    }
    totals
}`,

  String.raw`fn binned_counts(values: &[f64], bin_count: usize) -> Vec<usize> {
    if values.is_empty() || bin_count == 0 {
        return Vec::new();
    }
    let min = values.iter().copied().fold(f64::INFINITY, f64::min);
    let max = values.iter().copied().fold(f64::NEG_INFINITY, f64::max);
    let span = (max - min).max(1.0);
    let mut bins = vec![0usize; bin_count];
    for value in values {
        let index = (((value - min) / span) * bin_count as f64) as usize;
        bins[index.min(bin_count - 1)] += 1;
    }
    bins
}`,

  String.raw`fn interpolate_missing(values: &[Option<f64>]) -> Vec<f64> {
    let points: Vec<(usize, f64)> = values
        .iter()
        .enumerate()
        .filter_map(|(i, v)| v.map(|x| (i, x)))
        .collect();
    let mut out: Vec<f64> = values.iter().map(|v| v.unwrap_or(0.0)).collect();
    for window in points.windows(2) {
        let (a, av) = window[0];
        let (b, bv) = window[1];
        for i in a + 1..b {
            out[i] = av + (bv - av) * (i - a) as f64 / (b - a) as f64;
        }
    }
    out
}`,

  String.raw`fn parse_duration_string(input: &str) -> Option<u64> {
    let mut total = 0u64;
    let mut rest = input.trim();
    while let Some(idx) = rest.find(|c: char| !c.is_ascii_digit()) {
        let amount = rest[..idx].parse::<u64>().ok()?;
        let (unit, tail) = rest[idx..].split_at(1);
        total += amount * match unit {
            "s" => 1,
            "m" => 60,
            "h" => 3600,
            _ => return None,
        };
        rest = tail;
    }
    if rest.is_empty() { Some(total) } else { None }
}`,

  String.raw`fn parse_size_string(input: &str) -> Option<u64> {
    let trimmed = input.trim().to_ascii_lowercase();
    let split = trimmed.find(|c: char| !c.is_ascii_digit() && c != '.');
    let (number, unit) = split
        .map(|idx| (&trimmed[..idx], &trimmed[idx..]))
        .unwrap_or((trimmed.as_str(), ""));
    let value = number.parse::<f64>().ok()?;
    let multiplier = match unit {
        "" | "b" => 1.0,
        "kb" => 1024.0,
        "mb" => 1024.0 * 1024.0,
        "gb" => 1024.0 * 1024.0 * 1024.0,
        _ => return None,
    };
    Some((value * multiplier) as u64)
}`,

  String.raw`fn split_commands_quoted(input: &str) -> Vec<String> {
    let mut commands = Vec::new();
    let mut current = String::new();
    let mut in_quotes = false;
    for c in input.chars() {
        match c {
            '"' => in_quotes = !in_quotes,
            ';' if !in_quotes => commands.push(std::mem::take(&mut current)),
            _ => current.push(c),
        }
    }
    commands.push(current);
    commands.retain(|c| !c.is_empty());
    commands
}`,

  String.raw`fn find_duplicate_values(values: Vec<String>) -> Vec<String> {
    use std::collections::HashMap;
    let mut counts: HashMap<String, usize> = HashMap::new();
    for value in values {
        *counts.entry(value).or_insert(0) += 1;
    }
    let mut duplicates: Vec<String> = counts
        .into_iter()
        .filter(|(_, count)| *count > 1)
        .map(|(value, _)| value)
        .collect();
    duplicates.sort();
    duplicates
}`,

  String.raw`use std::collections::HashMap;

fn aggregate_counts_by_category(items: &[&str]) -> HashMap<&str, usize> {
    let mut counts = HashMap::new();
    for item in items {
        *counts.entry(*item).or_insert(0) += 1;
    }
    counts
}`,

  String.raw`fn outliers(values: &[f64]) -> Vec<f64> {
    if values.is_empty() {
        return Vec::new();
    }
    let n = values.len() as f64;
    let mean = values.iter().sum::<f64>() / n;
    let variance = values.iter().map(|v| (v - mean).powi(2)).sum::<f64>() / n;
    let stddev = variance.sqrt();
    values
        .iter()
        .copied()
        .filter(|v| (v - mean).abs() > 2.0 * stddev)
        .collect()
}`,

  String.raw`fn minmax_normalize(values: Vec<f64>) -> Vec<f64> {
    let Some(min) = values.iter().copied().reduce(f64::min) else {
        return Vec::new();
    };
    let max = values.iter().copied().reduce(f64::max).unwrap_or(min);
    let span = max - min;
    values
        .into_iter()
        .map(|v| if span == 0.0 { 0.5 } else { (v - min) / span })
        .collect()
}`,

  String.raw`fn parse_coord_pair(input: &str) -> Option<(f64, f64)> {
    let (lat_str, lon_str) = input.split_once(',')?;
    let lat = lat_str.trim().parse::<f64>().ok()?;
    let lon = lon_str.trim().parse::<f64>().ok()?;
    if !(-90.0..=90.0).contains(&lat) || !(-180.0..=180.0).contains(&lon) {
        return None;
    }
    Some((lat, lon))
}`,

  String.raw`// Replace runs of digits with a single hash mark.
fn redact_numbers(text: &str) -> String {
    let mut out = String::with_capacity(text.len());
    let mut in_run = false;
    for c in text.chars() {
        let is_digit = c.is_ascii_digit();
        if is_digit && !in_run {
            out.push('#');
        }
        if !is_digit {
            out.push(c);
        }
        in_run = is_digit;
    }
    out
}`,

  String.raw`fn sample_every_nth<T>(values: Vec<T>, step: usize) -> Vec<T> {
    if step == 0 {
        return Vec::new();
    }
    values
        .into_iter()
        .enumerate()
        .filter(|(i, _)| i % step == 0)
        .map(|(_, value)| value)
        .collect()
}`,

  String.raw`fn cumulative_average(values: &[f64]) -> Vec<f64> {
    let mut result = Vec::with_capacity(values.len());
    let mut sum = 0.0;
    for (i, value) in values.iter().enumerate() {
        sum += value;
        result.push(sum / (i + 1) as f64);
    }
    result
}`,

  String.raw`fn parse_http_header_line(line: &str) -> Option<(String, String)> {
    let (name, value) = line.split_once(':')?;
    let name = name.trim();
    if name.is_empty() || name.chars().any(|c| c.is_whitespace()) {
        return None;
    }
    Some((name.to_string(), value.trim().to_string()))
}`,
];
// total: 24
