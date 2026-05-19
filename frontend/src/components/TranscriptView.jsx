/**
 * Reusable transcript display — scrollable list of interviewer/participant messages.
 * Used in both Summary and InterviewDetail screens.
 */
function TranscriptView({ messages }) {
  if (!messages || messages.length === 0) return null

  return (
    <section className="summary-section">
      <h3>Full Transcript</h3>
      <div className="transcript">
        {messages.map((msg, i) => (
          <div key={i} className="transcript-entry">
            <strong>{msg.role === 'interviewer' ? 'Interviewer' : 'Participant'}:</strong>{' '}
            {msg.content}
          </div>
        ))}
      </div>
    </section>
  )
}

export default TranscriptView
