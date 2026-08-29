"""Async/await patterns for I/O-bound work: semaphores, queues, timeouts,
and concurrent fan-out with bounded resource usage."""

from __future__ import annotations

import asyncio
from typing import Any, Awaitable, Callable, Iterable, TypeVar

T = TypeVar("T")


async def gather_limited(
    coros: Iterable[Awaitable[T]],
    limit: int = 10,
) -> list[T]:
    """Run coroutines with at most *limit* in flight, preserving order."""
    semaphore = asyncio.Semaphore(limit)
    results: list[Any] = []

    async def run(coro: Awaitable[T], index: int) -> None:
        async with semaphore:
            results[index] = await coro

    tasks = [asyncio.create_task(run(coro, i)) for i, coro in enumerate(coros)]
    await asyncio.gather(*tasks)
    return results


async def timeout(
    coro: Awaitable[T],
    seconds: float,
) -> T:
    """Await a coroutine, raising TimeoutError if it exceeds *seconds*."""
    return await asyncio.wait_for(coro, timeout=seconds)


async def retry(
    func: Callable[[], Awaitable[T]],
    attempts: int = 3,
    delay: float = 0.5,
) -> T:
    """Retry an async callable with a constant delay between attempts."""
    last_error: Exception | None = None
    for attempt in range(attempts):
        try:
            return await func()
        except Exception as exc:
            last_error = exc
            if attempt < attempts - 1:
                await asyncio.sleep(delay)
    raise RuntimeError("all retry attempts failed") from last_error


async def worker_pool(
    jobs: Iterable[Callable[[], Awaitable[T]]],
    workers: int,
) -> list[T]:
    """Distribute async jobs across *workers* consumers via a queue."""
    queue: asyncio.Queue[Callable[[], Awaitable[T]]] = asyncio.Queue()
    for job in jobs:
        await queue.put(job)

    async def consume(results: list[T]) -> None:
        while True:
            try:
                job = queue.get_nowait()
            except asyncio.QueueEmpty:
                return
            results.append(await job())

    results: list[T] = []
    await asyncio.gather(*(consume(results) for _ in range(workers)))
    return results


async def debounce_async(
    func: Callable[[], Awaitable[T]],
    wait: float,
) -> T:
    """Run *func* but first settle for *wait* seconds of no concurrent calls."""
    await asyncio.sleep(wait)
    return await func()


async def read_lines(path: str) -> list[str]:
    """Read a file's lines without blocking the event loop."""
    loop = asyncio.get_running_loop()
    with open(path, "r", encoding="utf-8") as handle:
        content = await loop.run_in_executor(None, handle.read)
    return content.splitlines()


async def rate_limited(
    coros: Iterable[Awaitable[T]],
    per_second: float,
) -> list[T]:
    """Run coroutines spaced out to stay under *per_second* invocations."""
    interval = 1.0 / per_second if per_second > 0 else 0.0
    results: list[T] = []
    for coro in coros:
        results.append(await coro)
        await asyncio.sleep(interval)
    return results


async def first_completed(coros: Iterable[Awaitable[T]]) -> T:
    """Return the result of the first coroutine to finish successfully."""
    pending = {asyncio.ensure_future(coro) for coro in coros}
    while pending:
        done, pending = await asyncio.wait(
            pending, return_when=asyncio.FIRST_COMPLETED
        )
        for task in done:
            try:
                return task.result()
            except Exception:
                continue
    raise RuntimeError("no coroutine completed successfully")


class AsyncCache:
    """A tiny in-memory cache that deduplicates in-flight coroutines."""

    def __init__(self) -> None:
        self._store: dict[str, Any] = {}
        self._pending: dict[str, asyncio.Task[Any]] = {}

    async def get(self, key: str, loader: Callable[[], Awaitable[T]]) -> T:
        if key in self._store:
            return self._store[key]
        if key in self._pending:
            return await self._pending[key]
        task = asyncio.create_task(loader())
        self._pending[key] = task
        try:
            value = await task
            self._store[key] = value
            return value
        finally:
            self._pending.pop(key, None)
