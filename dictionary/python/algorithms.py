"""Classic algorithms written with a production bent: type hints, guard
clauses, and docstrings so each block reads like real library code."""

from __future__ import annotations

import heapq
import itertools
from collections import Counter, deque
from typing import Iterable, Iterator, Sequence, TypeVar

T = TypeVar("T")


def binary_search(items: Sequence[int], target: int) -> int:
    """Return the index of *target* in a sorted sequence, or -1 if absent."""
    low, high = 0, len(items) - 1
    while low <= high:
        mid = (low + high) // 2
        guess = items[mid]
        if guess == target:
            return mid
        if guess < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1


def merge_sorted(left: Sequence[int], right: Sequence[int]) -> list[int]:
    """Merge two sorted sequences into one sorted list in O(n)."""
    merged: list[int] = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1
    merged.extend(left[i:])
    merged.extend(right[j:])
    return merged


def quicksort(items: list[int]) -> list[int]:
    """Return a new sorted list using an in-place quicksort copy."""
    if len(items) <= 1:
        return items
    pivot = items[len(items) // 2]
    left = [x for x in items if x < pivot]
    middle = [x for x in items if x == pivot]
    right = [x for x in items if x > pivot]
    return quicksort(left) + middle + quicksort(right)


def top_k(items: Iterable[int], k: int) -> list[int]:
    """Return the *k* largest values using a bounded min-heap."""
    heap: list[int] = []
    for value in items:
        if len(heap) < k:
            heapq.heappush(heap, value)
        elif value > heap[0]:
            heapq.heapreplace(heap, value)
    return sorted(heap, reverse=True)


def sliding_window_max(values: Sequence[int], window: int) -> list[int]:
    """Return the maximum of every contiguous window of *window* size."""
    result: list[int] = []
    window_deque: deque[int] = deque()
    for index, value in enumerate(values):
        if window_deque and window_deque[0] <= index - window:
            window_deque.popleft()
        while window_deque and values[window_deque[-1]] <= value:
            window_deque.pop()
        window_deque.append(index)
        if index >= window - 1:
            result.append(values[window_deque[0]])
    return result


def longest_increasing_subsequence(seq: Sequence[int]) -> int:
    """Return the length of the longest strictly increasing subsequence."""
    tails: list[int] = []
    for value in seq:
        low, high = 0, len(tails)
        while low < high:
            mid = (low + high) // 2
            if tails[mid] < value:
                low = mid + 1
            else:
                high = mid
        if low == len(tails):
            tails.append(value)
        else:
            tails[low] = value
    return len(tails)


def fibonacci(n: int) -> int:
    """Return the n-th Fibonacci number iteratively in O(n) time."""
    if n < 0:
        raise ValueError("n must be non-negative")
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a


def gcd(a: int, b: int) -> int:
    """Compute the greatest common divisor with Euclid's algorithm."""
    while b:
        a, b = b, a % b
    return abs(a)


def sieve_of_eratosthenes(limit: int) -> list[int]:
    """Return all primes up to *limit* using a boolean sieve."""
    if limit < 2:
        return []
    sieve = bytearray(b"\x01") * (limit + 1)
    sieve[0:2] = b"\x00\x00"
    for prime in range(2, int(limit**0.5) + 1):
        if sieve[prime]:
            sieve[prime * prime : limit + 1 : prime] = b"\x00" * (
                ((limit - prime * prime) // prime) + 1
            )
    return [index for index, flag in enumerate(sieve) if flag]


def rotate_matrix(matrix: list[list[int]]) -> list[list[int]]:
    """Rotate a square matrix 90 degrees clockwise."""
    size = len(matrix)
    rotated = [[0] * size for _ in range(size)]
    for row in range(size):
        for col in range(size):
            rotated[col][size - 1 - row] = matrix[row][col]
    return rotated


def count_frequencies(items: Iterable[T]) -> dict[T, int]:
    """Count how many times each hashable item appears."""
    return dict(Counter(items))


def chunked(iterable: Iterable[T], size: int) -> Iterator[list[T]]:
    """Yield successive chunks of *size* from an iterable."""
    if size <= 0:
        raise ValueError("chunk size must be positive")
    chunk: list[T] = []
    for item in iterable:
        chunk.append(item)
        if len(chunk) == size:
            yield chunk
            chunk = []
    if chunk:
        yield chunk


def running_average(values: Iterable[float]) -> Iterator[float]:
    """Yield a running arithmetic average without storing the input."""
    total = 0.0
    count = 0
    for value in values:
        count += 1
        total += value
        yield total / count


def permutations_of(seq: Sequence[T]) -> Iterator[tuple[T, ...]]:
    """Yield every permutation of a sequence lazily."""
    yield from itertools.permutations(seq)
