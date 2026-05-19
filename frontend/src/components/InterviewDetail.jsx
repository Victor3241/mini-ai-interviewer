import SentimentBar from './SentimentBar'
import TranscriptView from './TranscriptView'

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

function InterviewDetail({ data, onBack }) {
  if (!data) return null

  const summary = data.summary || {}
  const transcript = data.transcript || []

  return (
    <div className="summary">
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>Back to Dashboard</button>
      </div>

      <h2>{data.topic}</h2>
      <p className="summary-topic">Completed: {formatDate(data.completed_at)}</p>

      {summary.summary && (
        <section className="summary-section">
          <h3>Summary</h3>
          <p className="summary-text">{summary.summary}</p>
        </section>
      )}

      {summary.themes?.length > 0 && (
        <section className="summary-section">
          <h3>Key Themes</h3>
          <div className="tags">
            {summary.themes.map((theme, i) => (
              <span key={i} className="tag theme-tag">{theme}</span>
            ))}
          </div>
        </section>
      )}

      {(summary.sentiment || summary.sentiment_score) && (
        <SentimentBar
          sentiment={summary.sentiment}
          sentimentScore={summary.sentiment_score}
        />
      )}

      {summary.keywords?.length > 0 && (
        <section className="summary-section">
          <h3>Keywords</h3>
          <div className="tags">
            {summary.keywords.map((kw, i) => (
              <span key={i} className="tag keyword-tag">{kw}</span>
            ))}
          </div>
        </section>
      )}

      <TranscriptView messages={transcript} />
    </div>
  )
}

export default InterviewDetail
