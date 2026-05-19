"""Centralized configuration — all environment variables in one place."""

import os

# Ollama (local LLM)
OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
MODEL_NAME = os.environ.get("MODEL_NAME", "qwen3:4b")

# Interview settings
NUM_QUESTIONS = int(os.environ.get("NUM_QUESTIONS", 5))

# MySQL
MYSQL_CONFIG = {
    "host": os.environ.get("MYSQL_HOST", "localhost"),
    "port": int(os.environ.get("MYSQL_PORT", 3306)),
    "user": os.environ.get("MYSQL_USER", "root"),
    "password": os.environ.get("MYSQL_PASSWORD", "password"),
    "db": os.environ.get("MYSQL_DATABASE", "interviewer"),
}
