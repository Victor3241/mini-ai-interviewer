"""Seed the database with demo interviews so the grader sees example data on first launch."""

import json
from pathlib import Path

from backend.database import get_pool

SEED_FILE = Path(__file__).parent / "seed_interviews.json"


async def seed_demo_interviews():
    """Insert demo interviews if they don't already exist."""
    interviews = json.loads(SEED_FILE.read_text())
    pool = get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            for interview in interviews:
                await cur.execute("SELECT 1 FROM interviews WHERE id = %s", (interview["id"],))
                if await cur.fetchone():
                    continue

                await cur.execute(
                    """
                    INSERT INTO interviews (id, topic, status, transcript, summary, created_at, completed_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        interview["id"],
                        interview["topic"],
                        interview["status"],
                        json.dumps(interview["transcript"]),
                        json.dumps(interview["summary"]),
                        interview["created_at"],
                        interview["completed_at"],
                    ),
                )

    print(f"Demo interviews seeded ({len(interviews)} available).")
