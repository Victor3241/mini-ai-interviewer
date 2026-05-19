"""Pydantic models for request/response schemas and internal state."""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class InterviewStatus(str, Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class StartInterviewRequest(BaseModel):
    topic: str


class AnswerRequest(BaseModel):
    answer: str


class QuestionResponse(BaseModel):
    question_number: int
    total_questions: int
    question: str


class SummaryResponse(BaseModel):
    summary: str
    themes: list[str]
    sentiment: str
    sentiment_score: float
    keywords: list[str]
    transcript: list[dict]


class InterviewState(BaseModel):
    id: str
    topic: str
    status: InterviewStatus = InterviewStatus.IN_PROGRESS
    transcript: list[dict] = []
    current_question: int = 0
    total_questions: int = 5
    created_at: datetime = Field(default_factory=datetime.now)
    summary: dict | None = None
