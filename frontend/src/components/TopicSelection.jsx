import { useState } from 'react'

const PRESET_TOPICS = [
  { label: 'AI in the Workplace', icon: '🤖' },
  { label: 'Productivity Tools', icon: '⚡' },
  { label: 'Scientific Research', icon: '🔬' },
  { label: 'Remote Work Culture', icon: '🏠' },
]

function TopicSelection({ onStart, onDashboard, loading }) {
  const [customTopic, setCustomTopic] = useState('')
  const [selectedPreset, setSelectedPreset] = useState(null)

  const handleStart = () => {
    const topic = customTopic.trim() || selectedPreset
    if (topic) {
      onStart(topic)
    }
  }

  const handlePresetClick = (label) => {
    setSelectedPreset(label)
    setCustomTopic('')
  }

  const handleCustomChange = (e) => {
    setCustomTopic(e.target.value)
    setSelectedPreset(null)
  }

  const activeTopic = customTopic.trim() || selectedPreset

  return (
    <div className="topic-selection">
      <h2>Choose an Interview Topic</h2>
      <p className="subtitle">Select a topic below or enter your own to begin the interview.</p>

      <div className="topic-cards">
        {PRESET_TOPICS.map(({ label, icon }) => (
          <button
            key={label}
            className={`topic-card ${selectedPreset === label ? 'selected' : ''}`}
            onClick={() => handlePresetClick(label)}
          >
            <span className="topic-icon">{icon}</span>
            <span className="topic-label">{label}</span>
          </button>
        ))}
      </div>

      <div className="custom-topic">
        <span className="divider-text">or enter your own</span>
        <input
          type="text"
          placeholder="e.g., Climate change, Education technology..."
          value={customTopic}
          onChange={handleCustomChange}
          onKeyDown={(e) => e.key === 'Enter' && activeTopic && handleStart()}
        />
      </div>

      <button
        className="start-btn"
        onClick={handleStart}
        disabled={!activeTopic || loading}
      >
        {loading ? 'Starting...' : 'Start Interview'}
      </button>

      <button className="dashboard-link" onClick={onDashboard}>
        View Past Interviews
      </button>
    </div>
  )
}

export default TopicSelection
