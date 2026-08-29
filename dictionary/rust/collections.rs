// vibetyper Rust dictionary — collections & container helpers

use std::collections::HashMap;

fn count_occurrences(values: &[i32]) -> HashMap<i32, usize> {
    let mut counts = HashMap::new();
    for &value in values {
        *counts.entry(value).or_insert(0) += 1;
    }
    counts
}

use std::collections::HashSet;

fn dedupe_preserving_order(items: Vec<String>) -> Vec<String> {
    let mut seen = HashSet::new();
    items
        .into_iter()
        .filter(|item| seen.insert(item.clone()))
        .collect()
}

use std::collections::HashMap;

fn group_by_first_letter(words: &[&str]) -> HashMap<char, Vec<&str>> {
    let mut groups: HashMap<char, Vec<&str>> = HashMap::new();
    for word in words {
        if let Some(letter) = word.chars().next() {
            groups.entry(letter).or_default().push(word);
        }
    }
    groups
}

fn chunk<T>(slice: &[T], size: usize) -> Vec<&[T]> {
    if size == 0 {
        return Vec::new();
    }
    let mut chunks = Vec::new();
    for start in (0..slice.len()).step_by(size) {
        let end = (start + size).min(slice.len());
        chunks.push(&slice[start..end]);
    }
    chunks
}

fn rotate_right(mut values: Vec<i32>, mut k: usize) -> Vec<i32> {
    if values.is_empty() {
        return values;
    }
    k %= values.len();
    let split = values.len() - k;
    let mut tail = values.split_off(split);
    tail.extend(values);
    tail
}

use std::collections::HashMap;

fn most_frequent(values: &[i32]) -> Option<i32> {
    let mut counts: HashMap<i32, usize> = HashMap::new();
    for &value in values {
        *counts.entry(value).or_insert(0) += 1;
    }
    counts
        .into_iter()
        .max_by_key(|(_, count)| *count)
        .map(|(value, _)| value)
}

fn intersection_sorted(left: &[i32], right: &[i32]) -> Vec<i32> {
    let mut result = Vec::new();
    let (mut i, mut j) = (0, 0);
    while i < left.len() && j < right.len() {
        if left[i] < right[j] {
            i += 1;
        } else if left[i] > right[j] {
            j += 1;
        } else {
            result.push(left[i]);
            i += 1;
            j += 1;
        }
    }
    result
}

fn union_sorted(left: &[i32], right: &[i32]) -> Vec<i32> {
    let mut merged: Vec<i32> = left.iter().chain(right.iter()).copied().collect();
    merged.sort_unstable();
    merged.dedup();
    merged
}

fn running_sums(values: &[i64]) -> Vec<i64> {
    let mut sums = Vec::with_capacity(values.len());
    let mut total = 0i64;
    for &value in values {
        total += value;
        sums.push(total);
    }
    sums
}

fn zip_names_with_scores(names: &[String], scores: &[u32]) -> Vec<(String, u32)> {
    names
        .iter()
        .zip(scores)
        .map(|(name, &score)| (name.clone(), score))
        .collect()
}

fn flatten(outer: Vec<Vec<i32>>) -> Vec<i32> {
    let capacity: usize = outer.iter().map(Vec::len).sum();
    let mut flat = Vec::with_capacity(capacity);
    for inner in outer {
        flat.extend(inner);
    }
    flat
}

fn split_at_predicate<F>(values: Vec<i32>, mut predicate: F) -> (Vec<i32>, Vec<i32>)
where
    F: FnMut(&i32) -> bool,
{
    let mut matching = Vec::new();
    let mut rest = Vec::new();
    for value in values {
        if predicate(&value) {
            matching.push(value);
        } else {
            rest.push(value);
        }
    }
    (matching, rest)
}

fn sliding_window_max(values: Vec<i32>, k: usize) -> Vec<i32> {
    if k == 0 || values.len() < k {
        return Vec::new();
    }
    let mut maxima = Vec::with_capacity(values.len() - k + 1);
    for window in values.windows(k) {
        maxima.push(*window.iter().max().unwrap());
    }
    maxima
}

fn byte_histogram(bytes: &[u8]) -> [usize; 256] {
    let mut histogram = [0usize; 256];
    for &byte in bytes {
        histogram[byte as usize] += 1;
    }
    histogram
}

fn sorted_insert(mut values: Vec<i32>, value: i32) -> Vec<i32> {
    let position = values.binary_search(&value).unwrap_or_else(|pos| pos);
    values.insert(position, value);
    values
}

fn index_of_max(values: &[f64]) -> Option<usize> {
    values
        .iter()
        .enumerate()
        .max_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap())
        .map(|(index, _)| index)
}

fn remove_duplicates_sorted_in_place(mut values: Vec<i32>) -> usize {
    if values.is_empty() {
        return 0;
    }
    let mut write = 1;
    for read in 1..values.len() {
        if values[read] != values[write - 1] {
            values[write] = values[read];
            write += 1;
        }
    }
    values.truncate(write);
    write
}

fn prefix_sums(values: &[u64]) -> Vec<u64> {
    values
        .iter()
        .scan(0u64, |running, &value| {
            *running = running.wrapping_add(value);
            Some(*running)
        })
        .collect()
}

fn merge_two_sorted(left: Vec<i32>, right: Vec<i32>) -> Vec<i32> {
    let mut merged = Vec::with_capacity(left.len() + right.len());
    let (mut i, mut j) = (0, 0);
    while i < left.len() && j < right.len() {
        if left[i] <= right[j] {
            merged.push(left[i]);
            i += 1;
        } else {
            merged.push(right[j]);
            j += 1;
        }
    }
    merged.extend_from_slice(&left[i..]);
    merged.extend_from_slice(&right[j..]);
    merged
}

fn partition_even_odd(values: &[i32]) -> (Vec<i32>, Vec<i32>) {
    let mut evens = Vec::new();
    let mut odds = Vec::new();
    for &value in values {
        if value % 2 == 0 {
            evens.push(value);
        } else {
            odds.push(value);
        }
    }
    (evens, odds)
}

fn pairwise_diffs(values: &[i32]) -> Vec<i32> {
    values
        .windows(2)
        .map(|pair| pair[1] - pair[0])
        .collect()
}

fn top_k_smallest(mut values: Vec<i32>, k: usize) -> Vec<i32> {
    values.sort_unstable();
    values.truncate(k);
    values
}

fn remove_all_value(values: Vec<i32>, target: i32) -> Vec<i32> {
    values
        .into_iter()
        .filter(|&value| value != target)
        .collect()
}

fn cumulative_max(values: &[i32]) -> Vec<i32> {
    let mut maxima = Vec::with_capacity(values.len());
    let mut best = i32::MIN;
    for &value in values {
        best = best.max(value);
        maxima.push(best);
    }
    maxima
}
