import { useState, useEffect, useRef } from 'react'

function Interview({ messages, currentQuestion, totalQuestions, loading, onSubmit, topic }) {
  const [answer, setAnswer] = useState('')
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (!loading) {
      textareaRef.current?.focus()
    }
  }, [loading])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (answer.trim() && !loading) {
      onSubmit(answer.trim())
      setAnswer('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="interview">
      <div className="interview-header">
        <span className="interview-topic">{topic}</span>
        <span className="interview-progress">
          Question {currentQuestion} of {totalQuestions}
        </span>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
        />
      </div>

      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <div className="message-label">
              {msg.role === 'interviewer' ? 'AI Interviewer' : 'You'}
            </div>
            <div className="message-bubble">{msg.content}</div>
          </div>
        ))}

        {loading && (
          <div className="message interviewer">
            <div className="message-label">AI Interviewer</div>
            <div className="message-bubble typing">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="answer-form" onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your answer..."
          disabled={loading}
          rows={3}
        />
        <button type="submit" disabled={!answer.trim() || loading}>
          Send
        </button>
      </form>
    </div>
  )
}

export default Interview
