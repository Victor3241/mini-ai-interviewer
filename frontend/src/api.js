/**
 * API service — all backend communication in one place.
 */

const API_BASE = '/api'

async function request(path, options = {}) {
  const resp = await fetch(`${API_BASE}${path}`, options)
  if (!resp.ok) {
    throw new Error(`API error: ${resp.status} ${resp.statusText}`)
  }
  return resp.json()
}

export function startInterview(topic) {
  return request('/interviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic }),
  })
}

export function submitAnswer(interviewId, answer) {
  return request(`/interviews/${interviewId}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answer }),
  })
}

export function getInterview(interviewId) {
  return request(`/interviews/${interviewId}`)
}

export function listInterviews() {
  return request('/interviews')
}
