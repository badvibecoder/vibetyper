// vibetyper Rust dictionary — concurrency & threads

fn spawn_and_join_worker() -> u64 {
    let handle = std::thread::spawn(|| {
        let mut total = 0u64;
        for n in 1..=100 {
            total += n * n;
        }
        total
    });
    handle.join().unwrap_or(0)
}

fn parallel_sum(values: &[i64], threads: usize) -> i64 {
    if values.is_empty() {
        return 0;
    }
    let chunk = values.len().div_ceil(threads.max(1));
    let handles: Vec<_> = values.chunks(chunk).map(|slice| {
        let owned = slice.to_vec();
        std::thread::spawn(move || owned.iter().sum::<i64>())
    }).collect();
    handles.into_iter().map(|h| h.join().unwrap_or(0)).sum()
}

fn mpsc_send_receive() -> Vec<i32> {
    use std::sync::mpsc;
    let (tx, rx) = mpsc::channel();
    std::thread::spawn(move || {
        for n in 0..8 {
            tx.send(n * 10).unwrap();
        }
    });
    rx.into_iter().collect()
}

fn shared_counter_mutex() -> u32 {
    use std::sync::{Arc, Mutex};
    let counter = Arc::new(Mutex::new(0u32));
    let mut handles = Vec::new();
    for _ in 0..4 {
        let c = Arc::clone(&counter);
        handles.push(std::thread::spawn(move || {
            for _ in 0..25 {
                *c.lock().unwrap() += 1;
            }
        }));
    }
    for handle in handles { handle.join().unwrap(); }
    *counter.lock().unwrap()
}

fn atomic_counter() -> u64 {
    use std::sync::{Arc, atomic::{AtomicU64, Ordering}};
    let counter = Arc::new(AtomicU64::new(0));
    let handles: Vec<_> = (0..8)
        .map(|_| {
            let c = Arc::clone(&counter);
            std::thread::spawn(move || {
                for _ in 0..50 {
                    c.fetch_add(1, Ordering::Relaxed);
                }
            })
        })
        .collect();
    handles.into_iter().for_each(|h| h.join().unwrap());
    counter.load(Ordering::Relaxed)
}

fn recv_with_timeout() -> Option<i32> {
    use std::sync::mpsc;
    use std::time::Duration;
    let (tx, rx) = mpsc::channel();
    std::thread::spawn(move || {
        std::thread::sleep(Duration::from_millis(20));
        tx.send(7).unwrap();
    });
    match rx.recv_timeout(Duration::from_secs(1)) {
        Ok(value) => Some(value),
        Err(_) => None,
    }
}

fn spawn_and_collect_results() -> Vec<i32> {
    let datasets = vec![vec![1, 2, 3], vec![4, 5, 6], vec![7, 8, 9]];
    let handles: Vec<_> = datasets
        .into_iter()
        .map(|nums| std::thread::spawn(move || nums.iter().sum::<i32>()))
        .collect();
    handles.into_iter().map(|h| h.join().unwrap_or(0)).collect()
}

fn parallel_increment(threads: usize, per_thread: u32) -> (u32, u32) {
    let counter = std::sync::Arc::new(std::sync::Mutex::new(0u32));
    let mut workers = Vec::new();
    for _ in 0..threads {
        let counter = std::sync::Arc::clone(&counter);
        workers.push(std::thread::spawn(move || {
            for _ in 0..per_thread {
                *counter.lock().unwrap() += 1;
            }
        }));
    }
    for worker in workers { worker.join().unwrap(); }
    let actual = *counter.lock().unwrap();
    (actual, threads as u32 * per_thread)
}

fn scoped_threads(values: &[i32]) -> i32 {
    let mut total = 0;
    std::thread::scope(|scope| {
        let mut handles = Vec::new();
        for chunk in values.chunks(2) {
            handles.push(scope.spawn(move || chunk.iter().sum::<i32>()));
        }
        for handle in handles {
            total += handle.join().unwrap();
        }
    });
    total
}

fn config_once() -> u32 {
    static CONFIG_LEVEL: std::sync::OnceLock<u32> = std::sync::OnceLock::new();
    *CONFIG_LEVEL.get_or_init(|| {
        let parsed = std::env::var("VIBETYPER_LEVEL").ok();
        parsed.and_then(|v| v.parse().ok()).unwrap_or(3)
    })
}

fn barrier_rendezvous() -> usize {
    use std::sync::{Arc, Barrier, atomic::{AtomicUsize, Ordering}};
    let barrier = Arc::new(Barrier::new(4));
    let arrived = Arc::new(AtomicUsize::new(0));
    let mut handles = Vec::new();
    for _ in 0..4 {
        let b = Arc::clone(&barrier);
        let a = Arc::clone(&arrived);
        handles.push(std::thread::spawn(move || {
            b.wait();
            a.fetch_add(1, Ordering::SeqCst);
        }));
    }
    for handle in handles { handle.join().unwrap(); }
    arrived.load(Ordering::SeqCst)
}

fn fan_out_channel() -> i32 {
    use std::sync::mpsc;
    let (tx, rx) = mpsc::channel();
    let mut producers = Vec::new();
    for base in 0..3 {
        let tx = tx.clone();
        producers.push(std::thread::spawn(move || {
            for n in 0..5 {
                tx.send(base * 10 + n).unwrap();
            }
        }));
    }
    drop(tx);
    for producer in producers { producer.join().unwrap(); }
    rx.into_iter().sum()
}

fn try_lock_guard() -> u32 {
    use std::sync::Mutex;
    let cache = Mutex::new(42u32);
    match cache.try_lock() {
        Ok(mut guard) => {
            *guard += 10;
            *guard
        }
        Err(std::sync::TryLockError::WouldBlock) => 0,
    }
}

fn join_all_handles(handles: Vec<std::thread::JoinHandle<Result<u32, String>>>) -> Result<u32, String> {
    let mut total = 0;
    for handle in handles {
        total += handle.join().map_err(|_| "worker panicked".to_string())??;
    }
    Ok(total)
}

fn message_worker_loop(messages: Vec<String>) -> usize {
    use std::sync::mpsc;
    let (tx, rx) = mpsc::channel();
    let worker = std::thread::spawn(move || {
        let mut seen = 0usize;
        for message in rx {
            if message.starts_with("job:") {
                seen += 1;
            }
        }
        seen
    });
    for message in messages { tx.send(message).unwrap(); }
    drop(tx);
    worker.join().unwrap_or(0)
}

fn atomic_fetch_max(shared: &std::sync::atomic::AtomicU64, candidate: u64) -> u64 {
    use std::sync::atomic::Ordering;
    let mut current = shared.load(Ordering::Relaxed);
    while candidate > current {
        match shared.compare_exchange_weak(current, candidate, Ordering::Relaxed, Ordering::Relaxed) {
            Ok(_) => return candidate,
            Err(actual) => current = actual,
        }
    }
    current
}

fn compute_in_thread() -> u64 {
    let handle = std::thread::spawn(|| {
        let (mut a, mut b, mut sum) = (1u64, 2u64, 0u64);
        while a <= 4_000_000 {
            if a % 2 == 0 {
                sum += a;
            }
            let next = a + b;
            a = b;
            b = next;
        }
        sum
    });
    handle.join().unwrap_or(0)
}

fn thread_park_timeout() -> bool {
    use std::time::Duration;
    let start = std::time::Instant::now();
    let unparker = std::thread::current().unpark_handle();
    std::thread::spawn(move || {
        std::thread::sleep(Duration::from_millis(10));
        unparker.unpark();
    });
    std::thread::park_timeout(Duration::from_millis(500));
    start.elapsed().as_millis() < 500
}

fn push_sorted_under_mutex(list: &std::sync::Mutex<Vec<u32>>, value: u32) -> usize {
    let mut items = list.lock().unwrap();
    let position = items.binary_search(&value).unwrap_or_else(|insert_at| insert_at);
    items.insert(position, value);
    position
}

fn parallel_min_max(values: &[i32]) -> Option<(i32, i32)> {
    if values.len() < 2 { return values.first().map(|v| (*v, *v)); }
    let mid = values.len() / 2;
    let left = values[..mid].to_vec();
    let right = values[mid..].to_vec();
    let lh = std::thread::spawn(move || {
        left.iter().copied().fold((i32::MAX, i32::MIN), |(lo, hi), v| (lo.min(v), hi.max(v)))
    });
    let rh = std::thread::spawn(move || {
        right.iter().copied().fold((i32::MAX, i32::MIN), |(lo, hi), v| (lo.min(v), hi.max(v)))
    });
    let (lmin, lmax) = lh.join().unwrap_or((i32::MAX, i32::MIN));
    let (rmin, rmax) = rh.join().unwrap_or((i32::MAX, i32::MIN));
    Some((lmin.min(rmin), lmax.max(rmax)))
}

fn channel_worker_result() -> u32 {
    use std::sync::mpsc;
    let (tx, rx) = mpsc::channel();
    std::thread::spawn(move || {
        let primes: u32 = (2..=100)
            .filter(|&n| (2..n).all(|d| n % d != 0))
            .count() as u32;
        tx.send(primes).unwrap();
    });
    rx.recv().unwrap_or(0)
}

fn producer_consumer() -> u64 {
    use std::sync::mpsc;
    let (tx, rx) = mpsc::channel();
    let producer = std::thread::spawn(move || {
        for n in 0u64..100 {
            tx.send(n * n).unwrap();
        }
    });
    let consumer = std::thread::spawn(move || {
        rx.into_iter().sum::<u64>()
    });
    producer.join().unwrap();
    consumer.join().unwrap_or(0)
}
