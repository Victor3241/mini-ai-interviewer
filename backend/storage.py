"""Database CRUD operations for interviews."""

import json
from datetime import datetime

import aiomysql

from backend.database import get_pool
from backend.models import InterviewState


async def save_interview(state: InterviewState) -> None:
    """Insert or update an interview record in MySQL."""
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                """
                INSERT INTO interviews (id, topic, status, transcript, summary, created_at, completed_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    status       = VALUES(status),
                    transcript   = VALUES(transcript),
                    summary      = VALUES(summary),
                    completed_at = VALUES(completed_at)
                """,
                (
                    state.id,
                    state.topic,
                    state.status.value,
                    json.dumps(state.transcript),
                    json.dumps(state.summary) if state.summary else None,
                    state.created_at,
                    datetime.now() if state.status == "completed" else None,
                ),
            )


async def get_interview(interview_id: str) -> dict | None:
    """Fetch a single interview by ID, parsing JSON columns."""
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT * FROM interviews WHERE id = %s", (interview_id,))
            row = await cur.fetchone()
            if row is None:
                return None
            if isinstance(row["transcript"], str):
                row["transcript"] = json.loads(row["transcript"])
            if row["summary"] and isinstance(row["summary"], str):
                row["summary"] = json.loads(row["summary"])
            return row


async def list_interviews() -> list[dict]:
    """Fetch all completed interviews, most recent first."""
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute(
                """
                SELECT id, topic, status, summary, created_at, completed_at
                FROM interviews
                WHERE status = 'completed'
                ORDER BY created_at DESC
                """
            )
            rows = await cur.fetchall()
            for row in rows:
                if row["summary"] and isinstance(row["summary"], str):
                    row["summary"] = json.loads(row["summary"])
            return rows
