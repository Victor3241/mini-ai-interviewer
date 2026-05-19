import { useState, useEffect } from 'react'
import { listInterviews } from '../api'
import Statistics from './Statistics'

const SENTIMENT_COLORS = {
  positive: '#22c55e',
  neutral: '#eab308',
  negative: '#ef4444',
}

function getSentimentColor(score) {
  const s = parseFloat(score) || 0
  if (s > 0.3) return SENTIMENT_COLORS.positive
  if (s < -0.3) return SENTIMENT_COLORS.negative
  return SENTIMENT_COLORS.neutral
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function Dashboard({ onBack, onViewInterview }) {
  const [interviews, setInterviews] = useState([])
  const [fetching, setFetching] = useState(true)
  const [showStats, setShowStats] = useState(false)

  useEffect(() => {
    listInterviews()
      .then(setInterviews)
      .catch((err) => console.error('Failed to load interviews:', err))
      .finally(() => setFetching(false))
  }, [])

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>{showStats ? 'Statistics' : 'Past Interviews'}</h2>
        <div className="dashboard-actions">
          <button
            className={`back-btn ${showStats ? 'active' : ''}`}
            onClick={() => setShowStats(!showStats)}
            disabled={fetching || interviews.length === 0}
          >
            {showStats ? 'View List' : 'Statistics'}
          </button>
          <button className="back-btn" onClick={onBack}>Back to Home</button>
        </div>
      </div>

      {fetching ? (
        <p className="dashboard-empty">Loading...</p>
      ) : interviews.length === 0 ? (
        <p className="dashboard-empty">No completed interviews yet. Start one first!</p>
      ) : showStats ? (
        <Statistics interviews={interviews} />
      ) : (
        <div className="dashboard-list">
          {interviews.map((interview) => {
            const score = parseFloat(interview.summary?.sentiment_score) || 0
            return (
              <div
                key={interview.id}
                className="dashboard-card"
                onClick={() => onViewInterview(interview.id)}
              >
                <div className="dashboard-card-header">
                  <span className="dashboard-topic">{interview.topic}</span>
                  <span
                    className="dashboard-sentiment"
                    style={{ backgroundColor: getSentimentColor(score) }}
                  >
                    {score.toFixed(1)}
                  </span>
                </div>
                <div className="dashboard-card-meta">
                  {formatDate(interview.completed_at || interview.created_at)}
                </div>
                {interview.summary?.themes?.length > 0 && (
                  <div className="dashboard-card-themes">
                    {interview.summary.themes.slice(0, 3).map((theme, i) => (
                      <span key={i} className="tag theme-tag small">{theme}</span>
                    ))}
                  </div>
                )}
                {interview.summary?.summary && (
                  <p className="dashboard-card-preview">
                    {interview.summary.summary.slice(0, 120)}...
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Dashboard
