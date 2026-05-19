import SentimentBar from './SentimentBar'
import TranscriptView from './TranscriptView'

function Summary({ summary, topic, messages, onNewInterview }) {
  if (!summary) return null

  return (
    <div className="summary">
      <h2>Interview Complete</h2>
      <p className="summary-topic">Topic: {topic}</p>

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

      <SentimentBar
        sentiment={summary.sentiment}
        sentimentScore={summary.sentiment_score}
      />

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

      <TranscriptView messages={messages} />

      <button className="start-btn" onClick={onNewInterview}>
        Start New Interview
      </button>
    </div>
  )
}

export default Summary
