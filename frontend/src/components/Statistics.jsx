import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { buildSentimentDistribution, buildTopKeywords } from '../statsUtils'

const PIE_COLORS = [
  '#4f46e5', '#7c3aed', '#2563eb', '#0891b2', '#059669',
  '#d97706', '#dc2626', '#db2777', '#6b7280',
]

const BAR_COLOR = '#4f46e5'

function Statistics({ interviews }) {
  const sentimentData = useMemo(
    () => buildSentimentDistribution(interviews),
    [interviews]
  )
  const keywordData = useMemo(
    () => buildTopKeywords(interviews, 8),
    [interviews]
  )

  return (
    <div className="statistics">
      <section className="summary-section">
        <h3>Sentiment Score Distribution</h3>
        <p className="stats-subtitle">{interviews.length} interview{interviews.length !== 1 ? 's' : ''} analyzed</p>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sentimentData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip />
              <Bar dataKey="count" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="summary-section">
        <h3>Top Keywords</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={keywordData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {keywordData.map((entry, index) => (
                  <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}

export default Statistics
