"""MySQL connection pool and schema initialization."""

import aiomysql

from backend.config import MYSQL_CONFIG

_pool: aiomysql.Pool | None = None


async def init_db():
    """Create the connection pool and ensure the interviews table exists."""
    global _pool
    _pool = await aiomysql.create_pool(**MYSQL_CONFIG, minsize=1, maxsize=5, autocommit=True)

    async with _pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("""
                CREATE TABLE IF NOT EXISTS interviews (
                    id          VARCHAR(8) PRIMARY KEY,
                    topic       VARCHAR(255) NOT NULL,
                    status      ENUM('in_progress', 'completed') DEFAULT 'in_progress',
                    transcript  JSON,
                    summary     JSON,
                    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    completed_at TIMESTAMP NULL
                )
            """)


async def close_db():
    """Close the connection pool."""
    global _pool
    if _pool:
        _pool.close()
        await _pool.wait_closed()
        _pool = None


def get_pool() -> aiomysql.Pool:
    """Return the active connection pool (must call init_db first)."""
    assert _pool is not None, "Database not initialized. Call init_db() first."
    return _pool
