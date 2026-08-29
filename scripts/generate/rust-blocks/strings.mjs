// vibetyper rust dictionary data — string utilities.
// Each entry is ONE complete, balanced top-level Rust unit (String.raw keeps
// backslash escapes literal so the emitted .rs source stays valid).

export const blocks = [
  String.raw`fn to_snake_case(input: &str) -> String {
    let mut out = String::with_capacity(input.len());
    for (i, ch) in input.chars().enumerate() {
        if ch.is_uppercase() {
            if i > 0 && !out.ends_with('_') {
                out.push('_');
            }
            out.extend(ch.to_lowercase());
        } else if ch.is_whitespace() || ch == '-' {
            if !out.ends_with('_') {
                out.push('_');
            }
        } else {
            out.push(ch);
        }
    }
    out.trim_matches('_').to_string()
}`,

  String.raw`fn to_pascal_case(input: &str) -> String {
    let mut out = String::new();
    let mut capitalize = true;
    for ch in input.chars() {
        if ch == '_' || ch == '-' || ch.is_whitespace() {
            capitalize = true;
        } else if capitalize {
            out.extend(ch.to_uppercase());
            capitalize = false;
        } else {
            out.push(ch);
        }
    }
    out
}`,

  String.raw`fn slugify(text: &str) -> String {
    let mut slug = String::new();
    let mut last_dash = false;
    for ch in text.chars() {
        let c = ch.to_ascii_lowercase();
        if c.is_ascii_alphanumeric() {
            slug.push(c);
            last_dash = false;
        } else if !last_dash && !slug.is_empty() {
            slug.push('-');
            last_dash = true;
        }
    }
    slug.trim_end_matches('-').to_string()
}`,

  String.raw`fn count_words(text: &str) -> usize {
    text.split_whitespace()
        .filter(|w| w.chars().any(|c| c.is_alphanumeric()))
        .count()
}`,

  String.raw`use std::collections::HashMap;

fn word_frequencies(text: &str) -> HashMap<String, usize> {
    let mut freq = HashMap::new();
    for word in text.split_whitespace() {
        let cleaned: String = word
            .trim_matches(|c: char| !c.is_alphanumeric())
            .to_lowercase();
        if !cleaned.is_empty() {
            *freq.entry(cleaned).or_insert(0) += 1;
        }
    }
    freq
}`,

  String.raw`fn reverse_words(sentence: &str) -> String {
    sentence
        .split_whitespace()
        .rev()
        .collect::<Vec<_>>()
        .join(" ")
}`,

  String.raw`fn truncate_with_ellipsis(text: &str, max_chars: usize) -> String {
    if text.chars().count() <= max_chars {
        return text.to_string();
    }
    let cut: String = text.chars().take(max_chars.saturating_sub(3)).collect();
    format!("{}...", cut.trim_end())
}`,

  String.raw`fn is_alpha_palindrome(text: &str) -> bool {
    let chars: Vec<char> = text
        .chars()
        .filter(|c| c.is_alphanumeric())
        .map(|c| c.to_ascii_lowercase())
        .collect();
    let mut left = 0;
    let mut right = chars.len();
    while left < right {
        right -= 1;
        if chars[left] != chars[right] {
            return false;
        }
        left += 1;
    }
    true
}`,

  String.raw`fn strip_control_chars(input: &str) -> String {
    input
        .chars()
        .filter(|c| !c.is_control() || *c == '\t' || *c == '\n')
        .collect()
}`,

  String.raw`fn longest_common_prefix(words: &[&str]) -> String {
    let Some(first) = words.first() else {
        return String::new();
    };
    let mut end = first.len();
    for word in &words[1..] {
        end = end.min(word.len());
        while end > 0 && !word[..end].eq_ignore_ascii_case(&first[..end]) {
            end -= 1;
        }
    }
    first[..end].to_string()
}`,

  String.raw`fn levenshtein_distance(a: &str, b: &str) -> usize {
    let a: Vec<char> = a.chars().collect();
    let b: Vec<char> = b.chars().collect();
    let mut prev: Vec<usize> = (0..=b.len()).collect();
    for (i, ca) in a.iter().enumerate() {
        let mut cur = vec![i + 1; b.len() + 1];
        for (j, cb) in b.iter().enumerate() {
            cur[j + 1] = if ca == cb {
                prev[j]
            } else {
                1 + prev[j].min(prev[j + 1].min(cur[j]))
            };
        }
        prev = cur;
    }
    prev[b.len()]
}`,

  String.raw`use std::collections::HashMap;

fn top_char_frequencies(text: &str, top: usize) -> Vec<(char, usize)> {
    let mut freq: HashMap<char, usize> = HashMap::new();
    for ch in text.chars().filter(|c| !c.is_whitespace()) {
        *freq.entry(ch).or_insert(0) += 1;
    }
    let mut ranked: Vec<(char, usize)> = freq.into_iter().collect();
    ranked.sort_by(|a, b| b.1.cmp(&a.1).then(a.0.cmp(&b.0)));
    ranked.truncate(top);
    ranked
}`,

  String.raw`fn split_camel_case(input: &str) -> Vec<String> {
    let mut words = Vec::new();
    let mut current = String::new();
    for ch in input.chars() {
        if ch.is_uppercase() && !current.is_empty() {
            words.push(std::mem::take(&mut current));
        }
        current.push(ch);
    }
    if !current.is_empty() {
        words.push(current);
    }
    words
}`,

  String.raw`fn mask_sensitive(input: &str, visible: usize) -> String {
    let chars: Vec<char> = input.chars().collect();
    if chars.len() <= visible {
        return input.to_string();
    }
    let tail: String = chars[chars.len() - visible..].iter().collect();
    format!("{}{}", "*".repeat(chars.len() - visible), tail)
}`,

  String.raw`fn indent_lines(text: &str, indent: &str) -> String {
    text.lines()
        .map(|line| format!("{}{}", indent, line))
        .collect::<Vec<_>>()
        .join("\n")
}`,

  String.raw`fn wrap_text(text: &str, width: usize) -> Vec<String> {
    let mut lines = Vec::new();
    let mut current = String::new();
    for word in text.split_whitespace() {
        if current.len() + word.len() + 1 > width && !current.is_empty() {
            lines.push(std::mem::take(&mut current));
        }
        if !current.is_empty() {
            current.push(' ');
        }
        current.push_str(word);
    }
    if !current.is_empty() {
        lines.push(current);
    }
    lines
}`,

  String.raw`fn collapse_repeats(text: &str) -> String {
    let mut out = String::new();
    let mut prev: Option<char> = None;
    for ch in text.chars() {
        if prev != Some(ch) {
            out.push(ch);
        }
        prev = Some(ch);
    }
    out
}`,

  String.raw`fn is_anagram(left: &str, right: &str) -> bool {
    let mut a: Vec<char> = left
        .chars()
        .filter(|c| !c.is_whitespace())
        .map(|c| c.to_ascii_lowercase())
        .collect();
    let mut b: Vec<char> = right
        .chars()
        .filter(|c| !c.is_whitespace())
        .map(|c| c.to_ascii_lowercase())
        .collect();
    a.sort_unstable();
    b.sort_unstable();
    a == b
}`,

  String.raw`fn title_case(text: &str) -> String {
    text.split_whitespace()
        .map(|word| {
            let mut chars = word.chars();
            match chars.next() {
                Some(first) => {
                    let rest: String = chars.map(|c| c.to_ascii_lowercase()).collect();
                    format!("{}{}", first.to_uppercase(), rest)
                }
                None => String::new(),
            }
        })
        .collect::<Vec<_>>()
        .join(" ")
}`,

  String.raw`fn initials(name: &str) -> String {
    name.split_whitespace()
        .filter_map(|word| word.chars().next())
        .map(|c| c.to_uppercase().to_string())
        .collect()
}`,

  String.raw`fn humanize_identifier(ident: &str) -> String {
    let mut out = String::new();
    for (i, ch) in ident.chars().enumerate() {
        if ch.is_uppercase() && i > 0 {
            out.push(' ');
        }
        if ch == '_' || ch == '-' {
            out.push(' ');
        } else {
            out.push(ch);
        }
    }
    out.split_whitespace()
        .map(|w| {
            let mut c = w.chars();
            match c.next() {
                Some(f) => format!("{}{}", f.to_uppercase(), c.as_str()),
                None => String::new(),
            }
        })
        .collect::<Vec<_>>()
        .join(" ")
}`,

  String.raw`fn safe_filename(name: &str) -> String {
    name.chars()
        .map(|c| {
            if c.is_alphanumeric() || c == '-' || c == '_' || c == '.' {
                c
            } else {
                '_'
            }
        })
        .collect::<String>()
        .trim_matches('.')
        .to_string()
}`,

  String.raw`fn extract_digits(text: &str) -> String {
    text.chars().filter(|c| c.is_ascii_digit()).collect()
}`,

  String.raw`fn pluralize(count: usize, singular: &str, plural: &str) -> String {
    if count == 1 {
        format!("{} {}", count, singular)
    } else {
        format!("{} {}", count, plural)
    }
}`,

  String.raw`fn normalize_whitespace(text: &str) -> String {
    text.split_whitespace().collect::<Vec<_>>().join(" ")
}`,

  String.raw`fn caesar_shift(text: &str, shift: u8) -> String {
    text.chars()
        .map(|c| {
            if c.is_ascii_alphabetic() {
                let base = if c.is_ascii_lowercase() { b'a' } else { b'A' };
                let shifted = (c as u8 - base + shift % 26) % 26 + base;
                shifted as char
            } else {
                c
            }
        })
        .collect()
}`,
];
// total: 26
