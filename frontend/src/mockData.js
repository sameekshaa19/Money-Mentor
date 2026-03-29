export const mockData = {
  healthScore: {
    local_scores: {
      overall_score: 72,
      dimensions: [
        { name: 'Emergency Fund', score: 85, status: 'good' },
        { name: 'Debt-to-Income', score: 100, status: 'good' },
        { name: 'Insurance Coverage', score: 40, status: 'warning' },
        { name: 'Investment Diversification', score: 65, status: 'warning' },
        { name: 'Savings Rate', score: 90, status: 'good' },
        { name: 'Retirement Readiness', score: 55, status: 'warning' },
      ]
    },
    ai_insights: {
      dimensions: [
        { name: 'Insurance', insight: 'Your term insurance is below the 10x income rule. Consider increasing to ₹1.5 Cr.' }
      ]
    }
  },
  fire: {
    target_corpus: 45000000,
    monthly_sip: 45000,
    yearly_projection: [
      { year: 1, corpus: 850000 },
      { year: 5, corpus: 4500000 },
      { year: 10, corpus: 12000000 },
    ],
    ai_insights: {
      narrative: "You are on track to vanish from the workforce by age 45! Keep the aggressive savings rate."
    }
  }
};
