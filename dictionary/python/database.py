"""Database access layer patterns: query builders, connection retries, and
row mapping — the SQL-facing code you find in most backend services."""

from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from typing import Any, Iterable, Iterator, Optional


def connect(path: str) -> sqlite3.Connection:
    """Open a SQLite connection with row access by column name."""
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    return connection


@contextmanager
def transaction(connection: sqlite3.Connection) -> Iterator[sqlite3.Cursor]:
    """Run statements inside a transaction, committing or rolling back."""
    cursor = connection.cursor()
    try:
        yield cursor
        connection.commit()
    except Exception:
        connection.rollback()
        raise


def create_table(connection: sqlite3.Connection, name: str, columns: dict[str, str]) -> None:
    """Create a table from a mapping of column names to type strings."""
    definitions = ", ".join(f"{col} {typ}" for col, typ in columns.items())
    connection.execute(f"CREATE TABLE IF NOT EXISTS {name} ({definitions})")


def insert(connection: sqlite3.Connection, table: str, row: dict[str, Any]) -> int:
    """Insert a row and return its auto-incremented primary key."""
    columns = ", ".join(row.keys())
    placeholders = ", ".join("?" for _ in row)
    cursor = connection.execute(
        f"INSERT INTO {table} ({columns}) VALUES ({placeholders})",
        tuple(row.values()),
    )
    return cursor.lastrowid


def select_all(
    connection: sqlite3.Connection,
    table: str,
    where: Optional[dict[str, Any]] = None,
) -> list[dict[str, Any]]:
    """Select rows, optionally filtering by exact column matches."""
    if where:
        clause = " AND ".join(f"{col} = ?" for col in where)
        cursor = connection.execute(
            f"SELECT * FROM {table} WHERE {clause}", tuple(where.values())
        )
    else:
        cursor = connection.execute(f"SELECT * FROM {table}")
    return [dict(row) for row in cursor.fetchall()]


def paginate_query(
    connection: sqlite3.Connection,
    table: str,
    page: int,
    page_size: int,
) -> dict[str, Any]:
    """Fetch a page of rows along with total row count."""
    page = max(1, page)
    page_size = max(1, min(page_size, 100))
    total = connection.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
    offset = (page - 1) * page_size
    rows = connection.execute(
        f"SELECT * FROM {table} ORDER BY rowid LIMIT ? OFFSET ?",
        (page_size, offset),
    ).fetchall()
    return {"rows": [dict(row) for row in rows], "total": total, "page": page}


def upsert(
    connection: sqlite3.Connection,
    table: str,
    row: dict[str, Any],
    key: str,
) -> None:
    """Insert or update a row keyed by a unique column."""
    columns = ", ".join(row.keys())
    placeholders = ", ".join("?" for _ in row)
    updates = ", ".join(f"{col} = excluded.{col}" for col in row if col != key)
    connection.execute(
        f"INSERT INTO {table} ({columns}) VALUES ({placeholders}) "
        f"ON CONFLICT({key}) DO UPDATE SET {updates}",
        tuple(row.values()),
    )


def build_where(conditions: Iterable[str]) -> str:
    """Join a list of WHERE conditions into a single clause."""
    parts = [c for c in conditions if c]
    return " AND ".join(parts) if parts else "1=1"


def to_sql_list(values: Iterable[Any]) -> str:
    """Serialize a Python list into a SQL IN() value list."""
    quoted = ", ".join(repr(v) for v in values)
    return f"({quoted})"


def safe_identifier(name: str) -> str:
    """Quote a table or column name to prevent SQL injection."""
    return '"' + name.replace('"', '""') + '"'


class Repository:
    """A generic table repository with typed row conversion."""

    def __init__(self, connection: sqlite3.Connection, table: str) -> None:
        self.connection = connection
        self.table = safe_identifier(table)

    def find(self, key: str, value: Any) -> Optional[dict[str, Any]]:
        cursor = self.connection.execute(
            f"SELECT * FROM {self.table} WHERE {safe_identifier(key)} = ?",
            (value,),
        )
        row = cursor.fetchone()
        return dict(row) if row else None
