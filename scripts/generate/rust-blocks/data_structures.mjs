// vibetyper rust dictionary data — data structures.
// Each entry is ONE complete, balanced top-level Rust unit.

export const blocks = [
  String.raw`// A classic LIFO stack backed by a growable vector.
#[derive(Debug, Clone, PartialEq)]
struct Stack<T> {
    items: Vec<T>,
}`,

  String.raw`impl<T> Stack<T> {
    fn new() -> Self {
        Stack { items: Vec::new() }
    }
    fn push(&mut self, value: T) {
        self.items.push(value);
    }
    fn pop(&mut self) -> Option<T> {
        self.items.pop()
    }
    fn peek(&self) -> Option<&T> {
        self.items.last()
    }
}`,

  String.raw`// FIFO queue built on VecDeque so both ends stay O(1).
#[derive(Debug, Clone, PartialEq)]
struct Queue<T> {
    queue: std::collections::VecDeque<T>,
}`,

  String.raw`impl<T> Queue<T> {
    fn new() -> Self {
        Queue { queue: std::collections::VecDeque::new() }
    }
    fn enqueue(&mut self, value: T) {
        self.queue.push_back(value);
    }
    fn dequeue(&mut self) -> Option<T> {
        self.queue.pop_front()
    }
    fn front(&self) -> Option<&T> {
        self.queue.front()
    }
}`,

  String.raw`// Min-heap adapter: Reverse flips BinaryHeap so the smallest value is on top.
#[derive(Debug, Clone)]
struct MinHeap {
    heap: std::collections::BinaryHeap<std::cmp::Reverse<i64>>,
}`,

  String.raw`impl MinHeap {
    fn new() -> Self {
        MinHeap { heap: std::collections::BinaryHeap::new() }
    }
    fn push(&mut self, value: i64) {
        self.heap.push(std::cmp::Reverse(value));
    }
    fn pop(&mut self) -> Option<i64> {
        self.heap.pop().map(|rev| rev.0)
    }
    fn peek(&self) -> Option<i64> {
        self.heap.peek().map(|rev| rev.0)
    }
}`,

  String.raw`// Fixed-capacity circular buffer: pushing past capacity evicts the oldest item.
#[derive(Debug, Clone)]
struct RingBuffer<T> {
    capacity: usize,
    buffer: std::collections::VecDeque<T>,
}`,

  String.raw`impl<T> RingBuffer<T> {
    fn new(capacity: usize) -> Self {
        RingBuffer { capacity, buffer: std::collections::VecDeque::new() }
    }
    fn push(&mut self, value: T) {
        if self.buffer.len() == self.capacity {
            self.buffer.pop_front();
        }
        self.buffer.push_back(value);
    }
    fn pop(&mut self) -> Option<T> {
        self.buffer.pop_front()
    }
}`,

  String.raw`// Tally of named events; defaults to zero for unseen keys.
#[derive(Debug, Clone, Default)]
struct Counter {
    counts: std::collections::HashMap<String, u64>,
}`,

  String.raw`impl Counter {
    fn inc(&mut self, key: &str) {
        *self.counts.entry(key.to_string()).or_insert(0) += 1;
    }
    fn dec(&mut self, key: &str) {
        if let Some(count) = self.counts.get_mut(key) {
            *count = count.saturating_sub(1);
        }
    }
    fn get(&self, key: &str) -> u64 {
        *self.counts.get(key).unwrap_or(&0)
    }
}`,

  String.raw`#[derive(Debug, Clone, PartialEq)]
struct SortedList<T> {
    entries: Vec<T>,
}`,

  String.raw`impl<T: Ord> SortedList<T> {
    fn insert(&mut self, value: T) {
        let pos = self.entries.partition_point(|entry| entry < &value);
        self.entries.insert(pos, value);
    }
    fn contains(&self, value: &T) -> bool {
        self.entries.binary_search(value).is_ok()
    }
    fn len(&self) -> usize {
        self.entries.len()
    }
}`,

  String.raw`// Half-open time range over u64 nanoseconds.
#[derive(Debug, Clone, Copy, PartialEq)]
struct Interval {
    start: u64,
    end: u64,
}`,

  String.raw`impl Interval {
    fn contains(&self, point: u64) -> bool {
        point >= self.start && point <= self.end
    }
    fn overlaps(&self, other: &Interval) -> bool {
        self.start <= other.end && other.start <= self.end
    }
    fn len(&self) -> u64 {
        self.end - self.start
    }
}`,

  String.raw`// Packed bitset stored in 64-bit words.
#[derive(Debug, Clone, PartialEq)]
struct BitSet {
    words: Vec<u64>,
}`,

  String.raw`impl BitSet {
    fn new(bits: usize) -> Self {
        BitSet {
            words: vec![0; (bits + 63) / 64],
        }
    }
    fn set(&mut self, index: usize) {
        self.words[index / 64] |= 1u64 << (index % 64);
    }
    fn test(&self, index: usize) -> bool {
        self.words[index / 64] & (1u64 << (index % 64)) != 0
    }
    fn count(&self) -> usize {
        self.words.iter().map(|word| word.count_ones() as usize).sum()
    }
}`,

  String.raw`#[derive(Debug, Clone, Copy, PartialEq)]
struct RingIndex {
    current: usize,
    modulus: usize,
}`,

  String.raw`impl RingIndex {
    fn next(&mut self) -> usize {
        let value = self.current;
        self.current = (self.current + 1) % self.modulus;
        value
    }
    fn current(&self) -> usize {
        self.current
    }
    fn reset(&mut self) {
        self.current = 0;
    }
}`,

  String.raw`// Token bucket rate limiter with a continuous refill schedule.
#[derive(Debug, Clone)]
struct TokenBucket {
    capacity: u64,
    tokens: f64,
    refill_per_sec: f64,
    last_refill: std::time::Instant,
}`,

  String.raw`impl TokenBucket {
    fn new(capacity: u64, refill_per_sec: f64) -> Self {
        TokenBucket { capacity, refill_per_sec, tokens: capacity as f64, last_refill: std::time::Instant::now() }
    }
    fn try_take(&mut self) -> bool {
        let now = std::time::Instant::now();
        let gained = now.duration_since(self.last_refill).as_secs_f64() * self.refill_per_sec;
        self.tokens = (self.tokens + gained).min(self.capacity as f64);
        self.last_refill = now;
        if self.tokens >= 1.0 { self.tokens -= 1.0; true } else { false }
    }
}`,

  String.raw`// Welford online update: feed one sample, get back (mean, m2, count).
fn welford_update(mean: f64, variance: f64, count: usize, value: f64) -> (f64, f64, usize) {
    let new_count = count + 1;
    let delta = value - mean;
    let new_mean = mean + delta / new_count as f64;
    let new_variance = variance + delta * (value - new_mean);
    (new_mean, new_variance, new_count)
}`,

  String.raw`// Union-find root lookup with path halving compression.
fn find_root(parent: &mut Vec<usize>, mut node: usize) -> usize {
    while parent[node] != node {
        parent[node] = parent[parent[node]];
        node = parent[node];
    }
    node
}`,

  String.raw`fn classify_edge(prev: f64, current: f64, tolerance: f64) -> Option<bool> {
    if current - prev > tolerance {
        Some(true)
    } else if prev - current > tolerance {
        Some(false)
    } else {
        None
    }
}`,

  String.raw`// Rolling sum over a sliding window; short inputs yield short output.
fn rolling_sum(values: &[i64], window: usize) -> Vec<i64> {
    if values.is_empty() || window == 0 {
        return Vec::new();
    }
    let mut out = Vec::with_capacity(values.len());
    let mut sum: i64 = values[..window.min(values.len())].iter().sum();
    out.push(sum);
    for (i, &value) in values.iter().enumerate().skip(window) {
        sum += value - values[i - window];
        out.push(sum);
    }
    out
}`,
];
// total: 24
