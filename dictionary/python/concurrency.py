"""Async and concurrency patterns: bounded fan-out, retries, polling, worker
queues, and timed coordination for service code."""
from __future__ import annotations
import asyncio
import time
from concurrent.futures import ThreadPoolExecutor
from typing import Any, AsyncIterable, Awaitable, Callable, Iterable, TypeVar
T = TypeVar("T")

async def run_with_timeout(coro: Awaitable[T], timeout: float) -> T:
    """Await *coro* but raise TimeoutError if it runs too long."""
    return await asyncio.wait_for(coro, timeout=timeout)

async def gather_limited(coros: Iterable[Awaitable[T]], limit: int) -> list[T]:
    """Run awaitables with at most *limit* in flight at once."""
    semaphore = asyncio.Semaphore(limit)

    async def guarded(coro: Awaitable[T]) -> T:
        async with semaphore:
            return await coro

    return list(await asyncio.gather(*(guarded(c) for c in coros)))

async def retry_async(operation: Callable[[], Awaitable[T]], attempts: int, delay: float = 1.0) -> T:
    """Retry an async operation with a growing delay between failures."""
    last_error: Exception | None = None
    for attempt in range(attempts):
        try:
            return await operation()
        except Exception as error:  # noqa: BLE001
            last_error = error
            if attempt < attempts - 1:
                await asyncio.sleep(delay * (attempt + 1))
    raise RuntimeError(f"operation failed after {attempts} attempts") from last_error

async def wait_for_any(tasks: Iterable[Awaitable[T]], timeout: float) -> T:
    """Return the first result to complete within *timeout* seconds."""
    first, _ = await asyncio.wait(
        {asyncio.ensure_future(task) for task in tasks},
        return_when=asyncio.FIRST_COMPLETED,
        timeout=timeout,
    )
    if not first:
        raise asyncio.TimeoutError(f"no task finished within {timeout}s")
    done = first.pop()
    return await done

async def poll_until(predicate: Callable[[], Awaitable[bool]], timeout: float, interval: float = 0.5) -> bool:
    """Poll an async predicate until it is true or the timeout passes."""
    loop = asyncio.get_event_loop()
    deadline = loop.time() + timeout
    while loop.time() < deadline:
        if await predicate():
            return True
        await asyncio.sleep(interval)
    return False

def thread_pool_map(function: Callable[[T], Any], items: Iterable[T], workers: int = 4) -> list[Any]:
    """Map a blocking function over items using a fixed thread pool."""
    with ThreadPoolExecutor(max_workers=workers) as pool:
        return list(pool.map(function, items))

class TaskQueue:
    """A bounded queue drained by a fixed number of worker tasks."""

    def __init__(self, workers: int = 4) -> None:
        self._queue: asyncio.Queue[Any] = asyncio.Queue()
        self._workers = workers

    async def run(self, handler: Callable[[Any], Awaitable[None]]) -> None:
        async def worker() -> None:
            while True:
                item = await self._queue.get()
                try:
                    await handler(item)
                finally:
                    self._queue.task_done()

        tasks = [asyncio.create_task(worker()) for _ in range(self._workers)]
        await self._queue.join()
        for task in tasks:
            task.cancel()

    async def put(self, item: Any) -> None:
        await self._queue.put(item)

async def run_stages(stages: list[Callable[[T], Awaitable[T]]], initial: T) -> T:
    """Pipe a value through a sequence of async stages in order."""
    current = initial
    for stage in stages:
        current = await stage(current)
    return current

async def heartbeat(interval: float, on_tick: Callable[[int], Awaitable[None]], stop: asyncio.Event) -> None:
    """Emit periodic ticks until the stop event is set."""
    tick_count = 0
    while not stop.is_set():
        await on_tick(tick_count)
        tick_count += 1
        try:
            await asyncio.wait_for(stop.wait(), timeout=interval)
        except asyncio.TimeoutError:
            continue

async def with_lock(lock: asyncio.Lock, coro: Awaitable[T]) -> T:
    """Run an awaitable while holding a lock, releasing it afterwards."""
    async with lock:
        return await coro

async def first_successful(attempts: Iterable[Callable[[], Awaitable[T]]]) -> T:
    """Try operations in order, returning the first one that succeeds."""
    errors: list[Exception] = []
    for operation in attempts:
        try:
            return await operation()
        except Exception as error:  # noqa: BLE001
            errors.append(error)
    raise RuntimeError("all attempts failed") from errors[-1]

class PeriodicTask:
    """Run a coroutine every *interval* seconds until cancelled."""

    def __init__(self, interval: float, target: Callable[[], Awaitable[None]]) -> None:
        self._interval = interval
        self._target = target
        self._task: asyncio.Task[None] | None = None

    def start(self) -> None:
        self._task = asyncio.create_task(self._loop())

    async def _loop(self) -> None:
        while True:
            await self._target()
            await asyncio.sleep(self._interval)

    async def stop(self) -> None:
        if self._task is not None:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass

async def consume_stream(stream: AsyncIterable[T], on_item: Callable[[T], Awaitable[None]], max_items: int = 1000) -> int:
    """Consume an async iterable, running a handler per item."""
    count = 0
    async for item in stream:
        await on_item(item)
        count += 1
        if count >= max_items:
            break
    return count

async def timeout_group(coros: list[Awaitable[T]], timeout: float) -> list[T]:
    """Await all tasks, cancelling stragglers after the deadline."""
    tasks = [asyncio.create_task(coro) for coro in coros]
    done, pending = await asyncio.wait(tasks, timeout=timeout)
    for task in pending:
        task.cancel()
    return [task.result() for task in done]

def rate_limited_loop(items: Iterable[T], per_second: float) -> Iterable[T]:
    """Yield items, sleeping between them to respect a rate limit."""
    delay = 1.0 / per_second if per_second > 0 else 0.0
    for item in items:
        yield item
        if delay:
            time.sleep(delay)

async def batch_process(items: list[T], handler: Callable[[list[T]], Awaitable[None]], batch_size: int = 100) -> None:
    """Feed items to an async handler in chunks of *batch_size*."""
    for start in range(0, len(items), batch_size):
        await handler(items[start : start + batch_size])

async def supervisor(workers: list[Callable[[], Awaitable[None]]], restart_delay: float = 2.0) -> None:
    """Restart worker coroutines whenever they exit unexpectedly."""
    tasks = {asyncio.create_task(worker()): worker for worker in workers}
    while tasks:
        done, _ = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
        for finished in done:
            worker = tasks.pop(finished)
            try:
                await finished
            except asyncio.CancelledError:
                raise
            except Exception:  # noqa: BLE001
                await asyncio.sleep(restart_delay)
                tasks[asyncio.create_task(worker())] = worker

async def call_with_fallback(primary: Callable[[], Awaitable[T]], fallback: Callable[[], Awaitable[T]]) -> T:
    """Try the primary operation, falling back when it fails."""
    try:
        return await primary()
    except Exception:  # noqa: BLE001
        return await fallback()
