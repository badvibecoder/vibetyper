// Java concurrency blocks — one complete method per block.
export const concurrency = [
`// Runs a task on a fresh daemon thread.
public static Thread runInBackground(Runnable task) {
    Thread thread = new Thread(task, "worker");
    thread.setDaemon(true);
    thread.start();
    return thread;
}`,
`// Submits several tasks to a fixed pool and waits for all of them.
public static void runAll(java.util.concurrent.ExecutorService pool, List<Runnable> tasks)
        throws InterruptedException {
    List<java.util.concurrent.Future<?>> futures = new ArrayList<>();
    for (Runnable task : tasks) {
        futures.add(pool.submit(task));
    }
    for (java.util.concurrent.Future<?> future : futures) {
        try {
            future.get();
        } catch (java.util.concurrent.ExecutionException e) {
            throw new RuntimeException(e.getCause());
        }
    }
}`,
`// Runs a callable with a hard timeout, cancelling on expiry.
public static <T> T callWithTimeout(java.util.concurrent.Callable<T> task, long timeoutMillis)
        throws Exception {
    java.util.concurrent.ExecutorService pool = java.util.concurrent.Executors.newSingleThreadExecutor();
    try {
        java.util.concurrent.Future<T> future = pool.submit(task);
        return future.get(timeoutMillis, java.util.concurrent.TimeUnit.MILLISECONDS);
    } catch (java.util.concurrent.TimeoutException e) {
        throw new java.util.concurrent.TimeoutException("task timed out after " + timeoutMillis + "ms");
    } finally {
        pool.shutdownNow();
    }
}`,
`// Sums a large array in parallel using a parallel stream.
public static long parallelSum(int[] values) {
    return java.util.Arrays.stream(values).parallel().asLongStream().sum();
}`,
`// Schedules a task to run after a fixed delay.
public static java.util.concurrent.ScheduledFuture<?> runAfterDelay(
        java.util.concurrent.ScheduledExecutorService scheduler, Runnable task, long delayMillis) {
    return scheduler.schedule(task, delayMillis, java.util.concurrent.TimeUnit.MILLISECONDS);
}`,
`// Thread-safe counter backed by an atomic long.
public static class AtomicCounter {
    private final java.util.concurrent.atomic.AtomicLong value = new java.util.concurrent.atomic.AtomicLong();

    public long increment() {
        return value.incrementAndGet();
    }

    public long current() {
        return value.get();
    }
}`,
`// Chains two async stages, transforming the result of the first.
public static java.util.concurrent.CompletableFuture<String> fetchAndTransform(
        java.util.concurrent.CompletableFuture<String> first) {
    return first.thenApplyAsync(raw -> raw.trim().toUpperCase());
}`,
`// Retries an operation up to attempts times with a backoff delay.
public static <T> T retry(java.util.concurrent.Callable<T> action, int attempts, long delayMillis)
        throws Exception {
    Exception last = null;
    for (int i = 0; i < attempts; i++) {
        try {
            return action.call();
        } catch (Exception e) {
            last = e;
            Thread.sleep(delayMillis * (i + 1));
        }
    }
    throw last;
}`,
`// Offers into a bounded queue, failing fast when it is full.
public static <T> boolean offerOrSkip(java.util.concurrent.BlockingQueue<T> queue, T item) {
    return queue.offer(item);
}`,
`// Blocks until a latch reaches zero, with a time cap.
public static boolean awaitAll(java.util.concurrent.CountDownLatch latch, long timeoutMillis)
        throws InterruptedException {
    return latch.await(timeoutMillis, java.util.concurrent.TimeUnit.MILLISECONDS);
}`,
`// Acquires a permit with a timeout, guarding a shared resource.
public static boolean tryWithPermit(java.util.concurrent.Semaphore semaphore, Runnable guarded,
        long timeoutMillis) throws InterruptedException {
    if (!semaphore.tryAcquire(timeoutMillis, java.util.concurrent.TimeUnit.MILLISECONDS)) {
        return false;
    }
    try {
        guarded.run();
        return true;
    } finally {
        semaphore.release();
    }
}`,
`// Applies a transform to every element in parallel.
public static List<Integer> parallelMap(List<Integer> values, java.util.function.IntUnaryOperator fn) {
    return values.parallelStream()
            .mapToInt(fn::applyAsInt)
            .boxed()
            .collect(Collectors.toList());
}`,
`// Gracefully shuts down a pool, forcing termination on refusal.
public static void shutdownPool(java.util.concurrent.ExecutorService pool) {
    pool.shutdown();
    try {
        if (!pool.awaitTermination(5, java.util.concurrent.TimeUnit.SECONDS)) {
            pool.shutdownNow();
        }
    } catch (InterruptedException e) {
        pool.shutdownNow();
        Thread.currentThread().interrupt();
    }
}`,
`// Reads or computes a cached value atomically.
public static <K, V> V cachedCompute(
        java.util.concurrent.ConcurrentMap<K, V> cache, K key,
        java.util.function.Function<? super K, ? extends V> loader) {
    return cache.computeIfAbsent(key, loader);
}`,
`// Takes whichever future completes first.
public static <T> T awaitAny(java.util.concurrent.CompletableFuture<T> first,
        java.util.concurrent.CompletableFuture<T> second) throws Exception {
    return java.util.concurrent.CompletableFuture.anyOf(first, second).get();
}`,
`// Serializes writes with a lock so only one writer proceeds at a time.
public static class SerializedWriter {
    private final Object lock = new Object();

    public void write(String line) {
        synchronized (lock) {
            System.out.println("writing: " + line);
        }
    }
}`,
`// Runs a batch of work items across a pool, collecting results.
public static <T> List<T> processBatch(java.util.concurrent.ExecutorService pool,
        List<java.util.concurrent.Callable<T>> jobs) throws InterruptedException {
    List<java.util.concurrent.Future<T>> futures = new ArrayList<>();
    for (java.util.concurrent.Callable<T> job : jobs) {
        futures.add(pool.submit(job));
    }
    List<T> results = new ArrayList<>();
    for (java.util.concurrent.Future<T> future : futures) {
        try {
            results.add(future.get());
        } catch (java.util.concurrent.ExecutionException e) {
            throw new RuntimeException(e.getCause());
        }
    }
    return results;
}`,
`// Doubles a value atomically, guarding against lost updates.
public static class AtomicDoubler {
    private final java.util.concurrent.atomic.AtomicLong value = new java.util.concurrent.atomic.AtomicLong();

    public long doubleAndGet() {
        while (true) {
            long current = value.get();
            long doubled = current * 2;
            if (value.compareAndSet(current, doubled)) {
                return doubled;
            }
        }
    }
}`,
`// Waits for a thread to finish, ignoring interrupts.
public static void joinQuietly(Thread thread) {
    try {
        thread.join();
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
}`,
`// Runs two independent tasks concurrently and waits for both.
public static void runConcurrently(Runnable first, Runnable second) throws InterruptedException {
    Thread a = new Thread(first);
    Thread b = new Thread(second);
    a.start();
    b.start();
    a.join();
    b.join();
}`,
`// Limits how many tasks may run at once with a fixed-permit semaphore.
public static void withConcurrencyLimit(int permits, List<Runnable> tasks)
        throws InterruptedException {
    java.util.concurrent.Semaphore semaphore = new java.util.concurrent.Semaphore(permits);
    List<Thread> threads = new ArrayList<>();
    for (Runnable task : tasks) {
        Thread thread = new Thread(() -> {
            try {
                semaphore.acquire();
                try {
                    task.run();
                } finally {
                    semaphore.release();
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        threads.add(thread);
        thread.start();
    }
    for (Thread thread : threads) {
        thread.join();
    }
}`,
];
