import { useState } from 'react'
import * as api from './api'
import TopicSelection from './components/TopicSelection'
import Interview from './components/Interview'
import Summary from './components/Summary'
import Dashboard from './components/Dashboard'
import InterviewDetail from './components/InterviewDetail'

function App() {
  const [screen, setScreen] = useState('topic')
  const [interviewId, setInterviewId] = useState(null)
  const [topic, setTopic] = useState('')
  const [messages, setMessages] = useState([])
  const [totalQuestions, setTotalQuestions] = useState(5)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [detailData, setDetailData] = useState(null)

  const resetToHome = () => {
    setScreen('topic')
    setInterviewId(null)
    setTopic('')
    setMessages([])
    setSummary(null)
    setCurrentQuestion(0)
    setLoading(false)
    setDetailData(null)
  }

  const handleStartInterview = async (selectedTopic) => {
    setTopic(selectedTopic)
    setScreen('interview')
    setMessages([])
    setLoading(true)

    try {
      const data = await api.startInterview(selectedTopic)
      setInterviewId(data.interview_id)
      setTotalQuestions(data.question.total_questions)
      setCurrentQuestion(data.question.question_number)
      setMessages([{ role: 'interviewer', content: data.question.question }])
    } catch (err) {
      console.error('Failed to start interview:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAnswer = async (answer) => {
    setMessages((prev) => [...prev, { role: 'user', content: answer }])
    setLoading(true)

    try {
      const data = await api.submitAnswer(interviewId, answer)
      if (data.done) {
        setSummary(data.summary)
        setScreen('summary')
      } else {
        setCurrentQuestion(data.question.question_number)
        setMessages((prev) => [
          ...prev,
          { role: 'interviewer', content: data.question.question },
        ])
      }
    } catch (err) {
      console.error('Failed to submit answer:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewInterview = async (id) => {
    setLoading(true)
    try {
      const data = await api.getInterview(id)
      setDetailData(data)
      setScreen('detail')
    } catch (err) {
      console.error('Failed to load interview:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 onClick={resetToHome} style={{ cursor: 'pointer' }}>AI Interviewer</h1>
        <p className="tagline">An AI-powered research interview experience</p>
      </header>

      <main className="app-main">
        {screen === 'topic' && (
          <TopicSelection
            onStart={handleStartInterview}
            onDashboard={() => setScreen('dashboard')}
            loading={loading}
          />
        )}
        {screen === 'interview' && (
          <Interview
            messages={messages}
            currentQuestion={currentQuestion}
            totalQuestions={totalQuestions}
            loading={loading}
            onSubmit={handleSubmitAnswer}
            topic={topic}
          />
        )}
        {screen === 'summary' && (
          <Summary
            summary={summary}
            topic={topic}
            messages={messages}
            onNewInterview={resetToHome}
          />
        )}
        {screen === 'dashboard' && (
          <Dashboard
            onBack={resetToHome}
            onViewInterview={handleViewInterview}
            loading={loading}
          />
        )}
        {screen === 'detail' && (
          <InterviewDetail
            data={detailData}
            onBack={() => setScreen('dashboard')}
          />
        )}
      </main>
    </div>
  )
}

export default App
