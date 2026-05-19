# Mini AI Interviewer

## Problem

Create a small application that mimics a simplified version of the Anthropic Interviewer tool (more details here: https://www.anthropic.com/news/anthropic-interviewer). The goal is to design an interactive system that conducts short AI-powered interviews with users on a selected topic.

This README covers the solution, setup instructions, and a user's manual for navigating the app.

## Solution

An AI-powered interview tool that conducts adaptive 5-question interviews on any topic. It generates follow-up questions based on your answers (not a rigid script), then produces a structured summary with sentiment analysis, keyword extraction, and theme identification.

Built with **FastAPI**, **React 18**, **Qwen 3 1.7B** (via Ollama), and **MySQL 8**. Everything runs locally via Docker — no API keys or external accounts needed.

## Setup

The only prerequisite is [Docker](https://docs.docker.com/get-docker/).

```bash
git clone https://github.com/Victor3241/mini-ai-interviewer.git
cd mini-ai-interviewer
docker compose up --build
```

Open **http://localhost:8000** in your browser.

> On the first run, the Qwen 3 1.7B model (~1.5 GB) downloads automatically. This may take a few minutes. Subsequent starts are instant.

To stop:

```bash
docker compose down        # keeps data
docker compose down -v     # full reset
```

## User's Manual

### Home Screen

Choose an interview topic from the presets (Technology, Healthcare, Education, Environment) or type your own. Click **Start Interview** to begin.

### Interview

A chat-style interface where the AI asks 5 adaptive questions. Each question builds on your previous answers. A progress bar at the top tracks your position. Type your response and press **Send** to continue. Be patient between questions! Qwen 3 1.7B runs locally and may take a few seconds to generate each response.

### Summary

After the final question, the app generates:

- **Summary** — a narrative overview of your responses
- **Key Themes** — main topics identified across your answers
- **Sentiment** — a score from -1.0 (negative) to 1.0 (positive) displayed on a color-coded bar
- **Keywords** — specific terms extracted from the conversation

### Dashboard

Click **View Past Interviews** from the home screen to see all completed interviews. Each card shows the topic, sentiment score, date, themes, and a preview. Click any card to view the full detail of the interview.

### Statistics

From the Dashboard, click the **Statistics** button to view a short analysis of all previous interviews:

- **Sentiment Distribution** — a bar chart showing how many interviews fall into each sentiment range (Very Negative to Very Positive)
- **Top Keywords** — a pie chart showing the most frequent keywords across all interviews

Three demo interviews are pre-loaded so you can explore these features immediately.
