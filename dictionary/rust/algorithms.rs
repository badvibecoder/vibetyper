// vibetyper Rust dictionary — algorithms

fn binary_search(sorted: &[i32], target: i32) -> Option<usize> {
    let mut low = 0;
    let mut high = sorted.len();
    while low < high {
        let mid = low + (high - low) / 2;
        if sorted[mid] < target {
            low = mid + 1;
        } else if sorted[mid] > target {
            high = mid;
        } else {
            return Some(mid);
        }
    }
    None
}

// Repeatedly pick the smallest remaining value and swap it into place.
fn selection_sort(items: &mut [i32]) {
    for i in 0..items.len() {
        let mut min_index = i;
        for j in (i + 1)..items.len() {
            if items[j] < items[min_index] {
                min_index = j;
            }
        }
        items.swap(i, min_index);
    }
}

fn insertion_sort(items: &mut [i32]) {
    for i in 1..items.len() {
        let key = items[i];
        let mut j = i;
        while j > 0 && items[j - 1] > key {
            items[j] = items[j - 1];
            j -= 1;
        }
        items[j] = key;
    }
}

fn merge_sort(values: Vec<i32>) -> Vec<i32> {
    if values.len() <= 1 {
        return values;
    }
    let mid = values.len() / 2;
    let mut left = merge_sort(values[..mid].to_vec()).into_iter().peekable();
    let mut right = merge_sort(values[mid..].to_vec()).into_iter().peekable();
    let mut merged = Vec::new();
    while left.peek().is_some() || right.peek().is_some() {
        let take_left = left.peek().zip(right.peek()).map_or(true, |(a, b)| a <= b);
        merged.push((if take_left { left.next() } else { right.next() }).unwrap());
    }
    merged
}

fn quicksort(items: &mut [i32]) {
    if items.len() < 2 { return; }
    let pivot = items[items.len() - 1];
    let mut store = 0;
    for i in 0..items.len() - 1 {
        if items[i] < pivot {
            items.swap(i, store);
            store += 1;
        }
    }
    items.swap(store, items.len() - 1);
    let (left, right) = items.split_at_mut(store);
    quicksort(left);
    quicksort(&mut right[1..]);
}

// Counting sort for small, bounded u32 keys.
fn counting_sort(values: &[u32], max_value: u32) -> Vec<u32> {
    let mut counts = vec![0usize; max_value as usize + 1];
    for &value in values {
        counts[value as usize] += 1;
    }
    let mut out = Vec::with_capacity(values.len());
    for (value, &count) in counts.iter().enumerate() {
        out.extend(std::iter::repeat(value as u32).take(count));
    }
    out
}

fn bfs_can_reach(graph: &[Vec<usize>], start: usize, goal: usize) -> bool {
    let mut seen = vec![false; graph.len()];
    let mut queue = std::collections::VecDeque::new();
    seen[start] = true;
    queue.push_back(start);
    while let Some(node) = queue.pop_front() {
        if node == goal { return true; }
        for &next in &graph[node] {
            if !seen[next] {
                seen[next] = true;
                queue.push_back(next);
            }
        }
    }
    false
}

fn dfs_has_cycle(graph: &[Vec<usize>]) -> bool {
    fn visit(node: usize, graph: &[Vec<usize>], state: &mut [u8]) -> bool {
        state[node] = 1;
        for &next in &graph[node] {
            if state[next] == 1 || (state[next] == 0 && visit(next, graph, state)) {
                return true;
            }
        }
        state[node] = 2;
        false
    }
    let mut state = vec![0u8; graph.len()];
    (0..graph.len()).any(|node| state[node] == 0 && visit(node, graph, &mut state))
}

fn connected_components(graph: &[Vec<usize>]) -> usize {
    let mut seen = vec![false; graph.len()];
    let mut components = 0;
    for start in 0..graph.len() {
        if seen[start] { continue; }
        components += 1;
        let mut stack = vec![start];
        seen[start] = true;
        while let Some(node) = stack.pop() {
            for &next in &graph[node] {
                if !seen[next] { seen[next] = true; stack.push(next); }
            }
        }
    }
    components
}

fn dijkstra_shortest(graph: &[Vec<(usize, u64)>], start: usize) -> Vec<u64> {
    let mut dist = vec![u64::MAX; graph.len()];
    let mut heap = std::collections::BinaryHeap::new();
    dist[start] = 0;
    heap.push(std::cmp::Reverse((0, start)));
    while let Some(std::cmp::Reverse((cost, node))) = heap.pop() {
        if cost > dist[node] { continue; }
        for &(next, weight) in &graph[node] {
            let candidate = cost + weight;
            if candidate < dist[next] { dist[next] = candidate; heap.push(std::cmp::Reverse((candidate, next))); }
        }
    }
    dist
}

// 0/1 knapsack with a one-dimensional DP table over capacity.
fn knapsack_01(weights: &[u64], values: &[u64], capacity: u64) -> u64 {
    let mut best = vec![0u64; capacity as usize + 1];
    for (index, &weight) in weights.iter().enumerate() {
        let value = values[index];
        for cap in (weight..=capacity).rev() {
            let take = best[cap as usize - weight as usize] + value;
            best[cap as usize] = best[cap as usize].max(take);
        }
    }
    best[capacity as usize]
}

fn coin_change_min(coins: &[u64], amount: u64) -> Option<usize> {
    let mut fewest = vec![usize::MAX; amount as usize + 1];
    fewest[0] = 0;
    for sum in 1..=amount as usize {
        for &coin in coins {
            if coin as usize <= sum && fewest[sum - coin as usize] != usize::MAX {
                fewest[sum] = fewest[sum].min(fewest[sum - coin as usize] + 1);
            }
        }
    }
    if fewest[amount as usize] == usize::MAX {
        None
    } else {
        Some(fewest[amount as usize])
    }
}

fn lcs_length(a: &str, b: &str) -> usize {
    let a: Vec<char> = a.chars().collect();
    let b: Vec<char> = b.chars().collect();
    let mut table = vec![vec![0usize; b.len() + 1]; a.len() + 1];
    for i in 0..a.len() {
        for j in 0..b.len() {
            table[i + 1][j + 1] = if a[i] == b[j] {
                table[i][j] + 1
            } else {
                table[i][j + 1].max(table[i + 1][j])
            };
        }
    }
    table[a.len()][b.len()]
}

fn lis_length(values: &[i32]) -> usize {
    let mut tails: Vec<i32> = Vec::new();
    for &value in values {
        let pos = tails.partition_point(|&tail| tail < value);
        if pos == tails.len() {
            tails.push(value);
        } else {
            tails[pos] = value;
        }
    }
    tails.len()
}

// Kadane algorithm: largest sum of any contiguous subarray.
fn kadane_max_subarray(values: &[i32]) -> i32 {
    let mut best = i32::MIN;
    let mut current = 0;
    for &value in values {
        current = current.max(0) + value;
        best = best.max(current);
    }
    best
}

fn two_sum_sorted(sorted: &[i32], target: i32) -> Option<(usize, usize)> {
    let mut left = 0;
    let mut right = sorted.len().saturating_sub(1);
    while left < right {
        let sum = sorted[left] + sorted[right];
        if sum == target {
            return Some((left, right));
        }
        if sum < target {
            left += 1;
        } else {
            right -= 1;
        }
    }
    None
}

// One pass with a hash map recording where each value was seen.
fn pair_with_sum(values: &[i32], target: i32) -> Option<(usize, usize)> {
    use std::collections::HashMap;
    let mut seen = HashMap::new();
    for (index, &value) in values.iter().enumerate() {
        if let Some(&other) = seen.get(&(target - value)) {
            return Some((other, index));
        }
        seen.insert(value, index);
    }
    None
}

fn next_permutation(values: &mut [i32]) -> bool {
    let Some(pivot) = (0..values.len().saturating_sub(1))
        .rev()
        .find(|&i| values[i] < values[i + 1])
    else {
        return false;
    };
    let swap_with = (pivot + 1..values.len())
        .rev()
        .find(|&j| values[j] > values[pivot])
        .unwrap();
    values.swap(pivot, swap_with);
    values[pivot + 1..].reverse();
    true
}

fn rotate_matrix_90(matrix: &mut [Vec<i32>]) {
    let size = matrix.len();
    for layer in 0..size / 2 {
        for offset in 0..size - 2 * layer - 1 {
            let top = matrix[layer][layer + offset];
            matrix[layer][layer + offset] = matrix[size - 1 - layer - offset][layer];
            matrix[size - 1 - layer - offset][layer] = matrix[size - 1 - layer][size - 1 - layer - offset];
            matrix[size - 1 - layer][size - 1 - layer - offset] = matrix[layer + offset][size - 1 - layer];
            matrix[layer + offset][size - 1 - layer] = top;
        }
    }
}

fn spiral_order(matrix: &[Vec<i32>]) -> Vec<i32> {
    if matrix.is_empty() || matrix[0].is_empty() { return Vec::new(); }
    let mut top = 0;
    let mut bottom = matrix.len() - 1;
    let mut left = 0;
    let mut right = matrix[0].len() - 1;
    let mut out = Vec::new();
    while top <= bottom && left <= right {
        for col in left..=right { out.push(matrix[top][col]); }
        for row in top + 1..=bottom { out.push(matrix[row][right]); }
        if top < bottom { for col in (left..right).rev() { out.push(matrix[bottom][col]); } }
        if left < right { for row in (top + 1..bottom).rev() { out.push(matrix[row][left]); } }
        top += 1; bottom -= 1; left += 1; right -= 1;
    }
    out
}

// Naive row-by-column product; loop order is cache friendly.
fn matrix_multiply(left: &[Vec<f64>], right: &[Vec<f64>]) -> Vec<Vec<f64>> {
    let rows = left.len();
    let cols = right[0].len();
    let inner = right.len();
    let mut out = vec![vec![0.0; cols]; rows];
    for i in 0..rows {
        for k in 0..inner {
            let factor = left[i][k];
            for j in 0..cols {
                out[i][j] += factor * right[k][j];
            }
        }
    }
    out
}

fn binary_search_rotated(values: &[i32], target: i32) -> Option<usize> {
    let mut low = 0;
    let mut high = values.len();
    while low < high {
        let mid = low + (high - low) / 2;
        if values[mid] == target { return Some(mid); }
        if values[low] <= values[mid] {
            if values[low] <= target && target < values[mid] { high = mid; } else { low = mid + 1; }
        } else if values[mid] < target && target <= values[high - 1] { low = mid + 1; } else { high = mid; }
    }
    None
}

fn fibonacci_memoized(n: usize) -> u64 {
    let mut memo: Vec<Option<u64>> = vec![None; n + 1];
    fn fib(index: usize, memo: &mut [Option<u64>]) -> u64 {
        if let Some(value) = memo[index] {
            return value;
        }
        let value = if index < 2 {
            index as u64
        } else {
            fib(index - 1, memo) + fib(index - 2, memo)
        };
        memo[index] = Some(value);
        value
    }
    fib(n, &mut memo)
}

// Lomuto partition; the returned index is the final position of the pivot.
fn partition_lomuto(items: &mut [i32]) -> usize {
    let pivot = items[items.len() - 1];
    let mut store = 0;
    for i in 0..items.len() - 1 {
        if items[i] <= pivot {
            items.swap(i, store);
            store += 1;
        }
    }
    items.swap(store, items.len() - 1);
    store
}
