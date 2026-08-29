"""Hand-rolled data structures — the kind of code you meet when a standard
library type does not quite fit the constraints."""

from __future__ import annotations

from collections import OrderedDict
from typing import Generic, Iterator, Optional, TypeVar

T = TypeVar("T")


class ListNode(Generic[T]):
    """A single node in a singly linked list."""

    def __init__(self, value: T, next_node: Optional["ListNode[T]"] = None) -> None:
        self.value = value
        self.next = next_node


class LinkedList(Generic[T]):
    """A minimal singly linked list with append and iteration."""

    def __init__(self) -> None:
        self.head: Optional[ListNode[T]] = None
        self.tail: Optional[ListNode[T]] = None
        self.size = 0

    def append(self, value: T) -> None:
        node = ListNode(value)
        if self.tail is None:
            self.head = self.tail = node
        else:
            self.tail.next = node
            self.tail = node
        self.size += 1

    def __iter__(self) -> Iterator[T]:
        current = self.head
        while current is not None:
            yield current.value
            current = current.next

    def __len__(self) -> int:
        return self.size


class Stack(Generic[T]):
    """A LIFO stack with an optional capacity limit."""

    def __init__(self, capacity: Optional[int] = None) -> None:
        self._items: list[T] = []
        self._capacity = capacity

    def push(self, item: T) -> None:
        if self._capacity is not None and len(self._items) >= self._capacity:
            raise OverflowError("stack capacity exceeded")
        self._items.append(item)

    def pop(self) -> T:
        if not self._items:
            raise IndexError("pop from empty stack")
        return self._items.pop()

    def peek(self) -> T:
        if not self._items:
            raise IndexError("peek from empty stack")
        return self._items[-1]

    def __len__(self) -> int:
        return len(self._items)


class Queue(Generic[T]):
    """A FIFO queue backed by a deque for O(1) pops from the front."""

    def __init__(self) -> None:
        self._items = __import__("collections").deque()

    def enqueue(self, item: T) -> None:
        self._items.append(item)

    def dequeue(self) -> T:
        if not self._items:
            raise IndexError("dequeue from empty queue")
        return self._items.popleft()

    def __bool__(self) -> bool:
        return bool(self._items)

    def __len__(self) -> int:
        return len(self._items)


class MinHeap(Generic[T]):
    """A thin wrapper around heapq that tracks items by priority."""

    def __init__(self) -> None:
        self._heap: list[tuple[float, int, T]] = []
        self._counter = 0

    def push(self, priority: float, item: T) -> None:
        self._counter += 1
        heapq_heappush = __import__("heapq").heappush
        heapq_heappush(self._heap, (priority, self._counter, item))

    def pop(self) -> T:
        if not self._heap:
            raise IndexError("pop from empty heap")
        heapq_heappop = __import__("heapq").heappop
        return heapq_heappop(self._heap)[2]

    def __len__(self) -> int:
        return len(self._heap)


class LRUCache(Generic[T]):
    """A least-recently-used cache with O(1) get and put."""

    def __init__(self, capacity: int) -> None:
        if capacity <= 0:
            raise ValueError("capacity must be positive")
        self._capacity = capacity
        self._store: OrderedDict[str, T] = OrderedDict()

    def get(self, key: str) -> Optional[T]:
        if key not in self._store:
            return None
        self._store.move_to_end(key)
        return self._store[key]

    def put(self, key: str, value: T) -> None:
        if key in self._store:
            self._store.move_to_end(key)
        self._store[key] = value
        if len(self._store) > self._capacity:
            self._store.popitem(last=False)

    def __len__(self) -> int:
        return len(self._store)


class TrieNode:
    """A node in a prefix tree for efficient string lookups."""

    def __init__(self) -> None:
        self.children: dict[str, "TrieNode"] = {}
        self.is_end = False


class Trie:
    """A prefix tree supporting insert, search, and starts-with queries."""

    def __init__(self) -> None:
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        node = self.root
        for char in word:
            node = node.children.setdefault(char, TrieNode())
        node.is_end = True

    def search(self, word: str) -> bool:
        node = self._walk(word)
        return node is not None and node.is_end

    def starts_with(self, prefix: str) -> bool:
        return self._walk(prefix) is not None

    def _walk(self, prefix: str) -> Optional[TrieNode]:
        node = self.root
        for char in prefix:
            if char not in node.children:
                return None
            node = node.children[char]
        return node
