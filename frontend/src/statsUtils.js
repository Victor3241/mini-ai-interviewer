const SENTIMENT_BINS = [
  { label: 'Very Negative', min: -1.0, max: -0.6 },
  { label: 'Negative',      min: -0.6, max: -0.2 },
  { label: 'Neutral',       min: -0.2, max:  0.2 },
  { label: 'Positive',      min:  0.2, max:  0.6 },
  { label: 'Very Positive', min:  0.6, max:  1.01 },
]

export function buildSentimentDistribution(interviews) {
  const counts = SENTIMENT_BINS.map((bin) => ({ name: bin.label, count: 0 }))

  interviews.forEach((interview) => {
    const score = parseFloat(interview.summary?.sentiment_score)
    if (isNaN(score)) return

    for (let i = 0; i < SENTIMENT_BINS.length; i++) {
      if (score >= SENTIMENT_BINS[i].min && score < SENTIMENT_BINS[i].max) {
        counts[i].count += 1
        break
      }
    }
  })

  return counts
}

export function buildTopKeywords(interviews, topN = 8) {
  const freq = {}

  interviews.forEach((interview) => {
    const keywords = interview.summary?.keywords || []
    keywords.forEach((kw) => {
      const normalized = kw.toLowerCase().trim()
      freq[normalized] = (freq[normalized] || 0) + 1
    })
  })

  const sorted = Object.entries(freq)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const top = sorted.slice(0, topN)
  const otherCount = sorted.slice(topN).reduce((sum, item) => sum + item.value, 0)

  if (otherCount > 0) {
    top.push({ name: 'Other', value: otherCount })
  }

  return top
}
