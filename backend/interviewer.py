"""LLM interaction layer — generates adaptive interview questions and structured summaries."""

import json
import re

import httpx

from backend.config import MODEL_NAME, OLLAMA_BASE_URL

# ── Prompts ────────────────────────────────────────────────────────────────────

QUESTION_SYSTEM_PROMPT = """\
You are a skilled qualitative research interviewer. You are conducting a short \
interview about the topic: "{topic}".

Guidelines:
- Ask clear, open-ended questions that invite thoughtful responses.
- Each question should build on what the participant has already shared. \
Do NOT repeat themes already covered. Instead, go deeper or explore a new angle.
- Use the participant's own words and ideas as springboards for follow-up questions.
- Be warm and conversational, not clinical or robotic.
- Ask ONE question at a time. Do not number it or add preamble — just ask the question directly.
- Keep your response short: just the question itself, nothing else.
- This is question {question_number} of {total_questions}. If this is the first question, \
start broad. As you progress, get more specific based on what you've learned. \
For the final question, ask something reflective or forward-looking."""

SUMMARY_SYSTEM_PROMPT = """\
You are a research analyst. You have just observed an interview about "{topic}".
Analyze the interview transcript below and produce a structured summary.

Your response MUST be valid JSON with exactly this structure:
{{
  "summary": "A 2-3 paragraph narrative summary of the interview.",
  "themes": ["theme1", "theme2", "theme3"],
  "sentiment": "A one-sentence description of the overall emotional tone",
  "sentiment_score": 0.0,
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}}

Guidelines:
- "themes": 3-5 recurring ideas or topics from the participant's answers.
- "sentiment_score": overall emotional valence from -1.0 (very negative) to 1.0 \
(very positive). Pay close attention to the participant's language: words like "hard", \
"difficult", "conflict", "frustrating", "worse", "not as good" indicate negative sentiment. \
Words like "love", "great", "exciting", "helpful" indicate positive sentiment. \
Do NOT default to 0.0 — a truly neutral interview is rare. If the participant expressed \
mostly complaints or challenges, the score should be negative (e.g., -0.3 to -0.8).
- "sentiment": one-sentence tone description. Include the sentiment_score in parentheses.
- "keywords": 5-8 significant terms or phrases from the participant's answers (not the questions).
- Be specific and reference what the participant actually said. Do not be generic.
- Be concise in your summary. Keep it focused.

Respond with ONLY the JSON object, no other text."""


# ── Helpers ────────────────────────────────────────────────────────────────────


def _strip_thinking(text: str) -> str:
    """Remove <think>...</think> blocks that Qwen3 may emit."""
    return re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()


async def _call_llm(messages: list[dict], temperature: float = 0.7) -> str:
    """Send a chat-completion request to Ollama and return the assistant's reply."""
    async with httpx.AsyncClient(timeout=httpx.Timeout(600.0, connect=30.0)) as client:
        resp = await client.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json={
                "model": MODEL_NAME,
                "messages": messages,
                "stream": False,
                "options": {"temperature": temperature},
            },
        )
        resp.raise_for_status()
        return _strip_thinking(resp.json()["message"]["content"])


# ── Public API ─────────────────────────────────────────────────────────────────


async def generate_question(
    topic: str,
    transcript: list[dict],
    question_number: int,
    total_questions: int,
) -> str:
    """Generate the next adaptive interview question based on conversation history."""
    system_msg = QUESTION_SYSTEM_PROMPT.format(
        topic=topic,
        question_number=question_number,
        total_questions=total_questions,
    )

    messages: list[dict] = [{"role": "system", "content": system_msg}]

    for entry in transcript:
        role = "assistant" if entry["role"] == "interviewer" else "user"
        messages.append({"role": role, "content": entry["content"]})

    # Append /no_think to disable Qwen3's thinking mode for faster responses
    if transcript:
        messages.append({
            "role": "user",
            "content": "Based on the conversation so far, ask the next interview question. /no_think",
        })
    else:
        messages.append({
            "role": "user",
            "content": "Begin the interview. Ask your first question about this topic. /no_think",
        })

    return await _call_llm(messages, temperature=0.7)


async def generate_summary(topic: str, transcript: list[dict]) -> dict:
    """Generate a structured summary with themes, sentiment, and keywords."""
    system_msg = SUMMARY_SYSTEM_PROMPT.format(topic=topic)

    transcript_text = "\n\n".join(
        f"{'Interviewer' if t['role'] == 'interviewer' else 'Participant'}: {t['content']}"
        for t in transcript
    )

    messages = [
        {"role": "system", "content": system_msg},
        {"role": "user", "content": f"Here is the interview transcript:\n\n{transcript_text}\n\n/no_think"},
    ]

    response = await _call_llm(messages, temperature=0.3)

    try:
        return json.loads(response)
    except json.JSONDecodeError:
        # Try to extract JSON from surrounding text
        match = re.search(r"\{.*\}", response, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
        return {
            "summary": response,
            "themes": [],
            "sentiment": "Unable to analyze",
            "sentiment_score": 0.0,
            "keywords": [],
        }
