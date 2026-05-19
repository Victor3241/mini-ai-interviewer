/**
 * Reusable sentiment visualization — gradient bar with marker and score label.
 * Used in both Summary and InterviewDetail screens.
 */
function SentimentBar({ sentiment, sentimentScore }) {
  const score = parseFloat(sentimentScore) || 0
  const scorePercent = ((score + 1) / 2) * 100

  return (
    <section className="summary-section">
      <h3>Sentiment Analysis</h3>
      {sentiment && <p className="sentiment-label">{sentiment}</p>}
      <div className="sentiment-bar-container">
        <div className="sentiment-bar">
          <div
            className="sentiment-marker"
            style={{ left: `${scorePercent}%` }}
          />
        </div>
        <div className="sentiment-labels">
          <span>Negative</span>
          <span>Neutral</span>
          <span>Positive</span>
        </div>
        <div className="sentiment-score">
          Score: {score.toFixed(2)}
        </div>
      </div>
    </section>
  )
}

export default SentimentBar
