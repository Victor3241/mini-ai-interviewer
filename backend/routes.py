"""API route handlers for the interview endpoints."""

from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from backend import interviewer, storage
from backend.config import NUM_QUESTIONS
from backend.models import (
    AnswerRequest,
    InterviewState,
    InterviewStatus,
    QuestionResponse,
    StartInterviewRequest,
)

router = APIRouter(prefix="/api")

# In-memory store for active (in-progress) interviews.
# Completed interviews are persisted to MySQL via storage.py.
active_interviews: dict[str, InterviewState] = {}


@router.post("/interviews")
async def start_interview(req: StartInterviewRequest):
    """Begin a new interview: generate the first question and return it."""
    interview_id = str(uuid4())[:8]

    first_question = await interviewer.generate_question(
        topic=req.topic,
        transcript=[],
        question_number=1,
        total_questions=NUM_QUESTIONS,
    )

    state = InterviewState(
        id=interview_id,
        topic=req.topic,
        transcript=[{"role": "interviewer", "content": first_question}],
        current_question=1,
        total_questions=NUM_QUESTIONS,
        created_at=datetime.now(),
    )
    active_interviews[interview_id] = state
    await storage.save_interview(state)

    return {
        "interview_id": interview_id,
        "question": QuestionResponse(
            question_number=1,
            total_questions=NUM_QUESTIONS,
            question=first_question,
        ),
    }


@router.post("/interviews/{interview_id}/answer")
async def submit_answer(interview_id: str, req: AnswerRequest):
    """Accept an answer, then return the next question or the final summary."""
    state = active_interviews.get(interview_id)
    if not state:
        raise HTTPException(status_code=404, detail="Interview not found")

    state.transcript.append({"role": "user", "content": req.answer})

    if state.current_question >= state.total_questions:
        # Final answer received — generate summary
        summary = await interviewer.generate_summary(
            topic=state.topic,
            transcript=state.transcript,
        )
        state.status = InterviewStatus.COMPLETED
        state.summary = summary
        await storage.save_interview(state)

        return {"done": True, "summary": summary}

    # Generate the next adaptive question
    state.current_question += 1
    next_question = await interviewer.generate_question(
        topic=state.topic,
        transcript=state.transcript,
        question_number=state.current_question,
        total_questions=state.total_questions,
    )
    state.transcript.append({"role": "interviewer", "content": next_question})
    await storage.save_interview(state)

    return {
        "done": False,
        "question": QuestionResponse(
            question_number=state.current_question,
            total_questions=state.total_questions,
            question=next_question,
        ),
    }


@router.get("/interviews/{interview_id}")
async def get_interview(interview_id: str):
    """Return a single interview (from memory if active, else from DB)."""
    state = active_interviews.get(interview_id)
    if state:
        return state.model_dump()

    db_record = await storage.get_interview(interview_id)
    if db_record:
        return db_record

    raise HTTPException(status_code=404, detail="Interview not found")


@router.get("/interviews")
async def list_interviews():
    """Return all completed interviews for the dashboard."""
    return await storage.list_interviews()
