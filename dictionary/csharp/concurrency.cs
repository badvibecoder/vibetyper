// Runs a task on the thread pool and returns the started task.
public static Task RunInBackground(Action task)
{
    return Task.Run(task);
}

// Awaits every task in a batch, surfacing the first failure.
public static async Task RunAllAsync(IEnumerable<Task> tasks)
{
    Task all = Task.WhenAll(tasks);
    try
    {
        await all;
    }
    catch
    {
        throw all.Exception!;
    }
}

// Runs a task with a hard timeout, cancelling on expiry.
public static async Task<T> CallWithTimeoutAsync<T>(Func<Task<T>> taskFactory, TimeSpan timeout)
{
    using var cts = new CancellationTokenSource(timeout);
    Task<T> task = taskFactory();
    Task completed = await Task.WhenAny(task, Task.Delay(Timeout.Infinite, cts.Token));
    if (completed != task)
    {
        throw new TimeoutException($"task timed out after {timeout.TotalMilliseconds}ms");
    }
    return await task;
}

// Sums a large array in parallel.
public static long ParallelSum(int[] values)
{
    return values.AsParallel().Sum(v => (long)v);
}

// Runs a task after a fixed delay.
public static async Task RunAfterDelayAsync(Action task, TimeSpan delay)
{
    await Task.Delay(delay);
    task();
}

// Thread-safe counter backed by an atomic long.
public sealed class AtomicCounter
{
    private long value;

    public long Increment()
    {
        return Interlocked.Increment(ref value);
    }

    public long Current => Interlocked.Read(ref value);
}

// Chains two async stages, transforming the result of the first.
public static async Task<string> FetchAndTransformAsync(Task<string> first)
{
    string raw = await first;
    return raw.Trim().ToUpperInvariant();
}

// Retries an operation up to attempts times with a backoff delay.
public static async Task<T> RetryAsync<T>(Func<Task<T>> action, int attempts, TimeSpan delay)
{
    Exception? last = null;
    for (int i = 0; i < attempts; i++)
    {
        try
        {
            return await action();
        }
        catch (Exception ex)
        {
            last = ex;
            await Task.Delay(TimeSpan.FromMilliseconds(delay.TotalMilliseconds * (i + 1)));
        }
    }
    throw last!;
}

// Offers into a bounded queue without blocking, failing fast when full.
public static bool OfferOrSkip<T>(System.Collections.Concurrent.BlockingCollection<T> queue, T item)
{
    return queue.TryAdd(item);
}

// Waits for all producers to signal done, with a time cap.
public static bool AwaitAll(System.Threading.CountdownEvent countdown, TimeSpan timeout)
{
    return countdown.Wait(timeout);
}

// Acquires a semaphore permit with a timeout, guarding a resource.
public static async Task<bool> TryWithPermitAsync(SemaphoreSlim semaphore, Func<Task> guarded,
    TimeSpan timeout)
{
    if (!await semaphore.WaitAsync(timeout))
    {
        return false;
    }
    try
    {
        await guarded();
        return true;
    }
    finally
    {
        semaphore.Release();
    }
}

// Applies a transform to every element in parallel.
public static List<int> ParallelMap(List<int> values, Func<int, int> transform)
{
    return values.AsParallel().Select(transform).ToList();
}

// Reads or computes a cached value atomically.
public static V CachedCompute<K, V>(
    System.Collections.Concurrent.ConcurrentDictionary<K, V> cache, K key,
    Func<K, V> loader) where K : notnull
{
    return cache.GetOrAdd(key, loader);
}

// Takes whichever task finishes first.
public static async Task<T> AwaitAnyAsync<T>(Task<T> first, Task<T> second)
{
    Task<T> completed = await Task.WhenAny(first, second);
    return await completed;
}

// Serializes writes so only one writer proceeds at a time.
public sealed class SerializedWriter
{
    private readonly object gate = new();

    public void Write(string line)
    {
        lock (gate)
        {
            Console.WriteLine($"writing: {line}");
        }
    }
}

// Runs a batch of jobs across the thread pool, collecting results.
public static async Task<List<T>> ProcessBatchAsync<T>(IEnumerable<Func<Task<T>>> jobs)
{
    var tasks = jobs.Select(job => job()).ToList();
    T[] results = await Task.WhenAll(tasks);
    return results.ToList();
}

// Doubles a value atomically, guarding against lost updates.
public sealed class AtomicDoubler
{
    private long value;

    public long DoubleAndGet()
    {
        long current = Interlocked.Read(ref value);
        while (true)
        {
            long doubled = current * 2;
            long observed = Interlocked.CompareExchange(ref value, doubled, current);
            if (observed == current)
            {
                return doubled;
            }
            current = observed;
        }
    }
}

// Runs a task with cooperative cancellation support.
public static async Task RunWithCancellationAsync(Func<CancellationToken, Task> work,
    CancellationToken token)
{
    token.ThrowIfCancellationRequested();
    await work(token);
}

// Runs two independent tasks concurrently and waits for both.
public static async Task RunConcurrentlyAsync(Func<Task> first, Func<Task> second)
{
    await Task.WhenAll(first(), second());
}

// Limits how many tasks may run at once with a fixed-permit semaphore.
public static async Task WithConcurrencyLimitAsync(int permits, IEnumerable<Func<Task>> tasks)
{
    using var semaphore = new SemaphoreSlim(permits);
    var wrapped = tasks.Select(async task =>
    {
        await semaphore.WaitAsync();
        try
        {
            await task();
        }
        finally
        {
            semaphore.Release();
        }
    });
    await Task.WhenAll(wrapped);
}
