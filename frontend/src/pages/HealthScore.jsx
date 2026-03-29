import { useState, useEffect } from 'react';
import useFinance from '../hooks/useFinance';
import useUserProfileStore from '../store/useUserProfileStore';
import FinanceChatbot from './FinanceChatbot';
import { api } from '../services/api';

const HEALTH_METRICS = [
  { 
    id: 'emergency_fund', 
    label: 'Emergency Fund', 
    desc: '6 months of expenses saved', 
    weight: 25,
    icon: 'savings',
    color: '#4af8e3'
  },
  { 
    id: 'insurance_coverage', 
    label: 'Insurance Coverage', 
    desc: 'Adequate life & health insurance', 
    weight: 20,
    icon: 'health_and_safety',
    color: '#ff6e84'
  },
  { 
    id: 'debt_to_income', 
    label: 'Debt to Income Ratio', 
    desc: 'Low debt burden', 
    weight: 20,
    icon: 'account_balance',
    color: '#c799ff'
  },
  { 
    id: 'investment_diversification', 
    label: 'Investment Mix', 
    desc: 'Balanced asset allocation', 
    weight: 20,
    icon: 'pie_chart',
    color: '#33e9d5'
  },
  { 
    id: 'savings_rate', 
    label: 'Savings Rate', 
    desc: '% of income saved monthly', 
    weight: 15,
    icon: 'trending_up',
    color: '#f59e0b'
  }
];

export default function HealthScore() {
  const { income, expenses, healthScore, setHealthScore } = useFinance();
  const { profile } = useUserProfileStore();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const calculateHealthScore = async () => {
    setLoading(true);
    
    // Get actual values from user profile
    const monthlyIncome = income || profile.income?.salary || 50000;
    const monthlyExpenses = expenses || profile.expenses?.total || 30000;
    const emergencyFund = profile.savings?.emergencyFund || 0;
    const totalInvestments = profile.investments ? 
      Object.values(profile.investments).reduce((a, b) => a + (b || 0), 0) : 0;
    const totalDebt = profile.expenses?.loanEMIs || 0;
    const insuranceCover = profile.riskProfile?.insurance?.life + profile.riskProfile?.insurance?.health || 0;
    
    // Calculate 6-month expenses target
    const sixMonthExpenses = monthlyExpenses * 6;
    
    // Calculate individual scores based on actual data
    const emergencyFundScore = sixMonthExpenses > 0 ? 
      Math.min(100, (emergencyFund / sixMonthExpenses) * 100) : 0;
    
    const insuranceScore = monthlyIncome > 0 ? 
      Math.min(100, (insuranceCover / (monthlyIncome * 12 * 10)) * 100) : 0; // 10x annual income as ideal
    
    const debtRatioScore = monthlyIncome > 0 ? 
      Math.max(0, 100 - ((totalDebt / monthlyIncome) * 100 * 2)) : 100; // Penalize high debt
    
    // Calculate diversification score based on investment mix
    const investments = profile.investments || {};
    const totalInv = Object.values(investments).reduce((a, b) => a + (b || 0), 0);
    let diversificationScore = 50; // Base score
    if (totalInv > 0) {
      const hasEquity = investments.equity > 0;
      const hasDebt = investments.debt > 0 || investments.mutualFunds > 0;
      const hasGold = investments.gold > 0;
      const hasRealEstate = investments.realEstate > 0;
      const assetCount = [hasEquity, hasDebt, hasGold, hasRealEstate].filter(Boolean).length;
      diversificationScore = Math.min(100, assetCount * 25);
    }
    
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) : 0;
    const savingsRateScore = Math.min(100, savingsRate * 100 * 3); // 33% savings = 100 score

    const scores = {
      emergency_fund: Math.round(emergencyFundScore),
      insurance_coverage: Math.round(insuranceScore),
      debt_to_income: Math.round(debtRatioScore),
      investment_diversification: Math.round(diversificationScore),
      savings_rate: Math.round(savingsRateScore)
    };

    // Calculate weighted average
    const totalScore = HEALTH_METRICS.reduce((acc, metric) => {
      return acc + (scores[metric.id] * metric.weight / 100);
    }, 0);

    const scoreData = {
      overall: Math.round(totalScore),
      individual: scores,
      grade: getGrade(totalScore),
      recommendations: getRecommendations(scores),
      details: {
        monthlyIncome,
        monthlyExpenses,
        emergencyFund,
        totalInvestments,
        totalDebt,
        insuranceCover,
        savingsRate: Math.round(savingsRate * 100)
      }
    };

    setAnalysis(scoreData);
    setHealthScore(scoreData);
    setLoading(false);
  };

  const getGrade = (score) => {
    if (score >= 90) return { grade: 'A+', color: '#22c55e', text: 'Excellent' };
    if (score >= 80) return { grade: 'A', color: '#4af8e3', text: 'Very Good' };
    if (score >= 70) return { grade: 'B+', color: '#33e9d5', text: 'Good' };
    if (score >= 60) return { grade: 'B', color: '#f59e0b', text: 'Average' };
    if (score >= 50) return { grade: 'C', color: '#ff6e84', text: 'Below Average' };
    return { grade: 'D', color: '#ef4444', text: 'Poor' };
  };

  const getRecommendations = (scores) => {
    const recommendations = [];
    
    if (scores.emergency_fund < 80) {
      recommendations.push('Build emergency fund to cover 6 months of expenses');
    }
    if (scores.insurance_coverage < 70) {
      recommendations.push('Review and increase insurance coverage');
    }
    if (scores.debt_to_income < 70) {
      recommendations.push('Focus on reducing high-interest debt');
    }
    if (scores.investment_diversification < 70) {
      recommendations.push('Diversify investments across asset classes');
    }
    if (scores.savings_rate < 60) {
      recommendations.push('Increase monthly savings rate to at least 20%');
    }

    return recommendations;
  };

  useEffect(() => {
    calculateHealthScore();
  }, [income, expenses, profile]);

  const formatCurrency = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

  return (
    <div className="section-page active fade-up">
      <div className="relative min-h-screen pt-10 pb-32">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="mb-12 fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <span className="flex h-2 w-2 rounded-full bg-[#4af8e3] animate-pulse"></span>
              <span className="text-[#4af8e3] font-label text-xs font-bold tracking-widest uppercase">Financial Health Assessment</span>
            </div>
            <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter text-[#ecedf6] leading-none mb-4">
              Health <span className="text-[#4af8e3]">Score</span>
            </h1>
            <p className="text-[#a9abb3] text-lg font-body">Comprehensive analysis of your financial fitness and personalized recommendations.</p>
          </div>

          {/* Overall Score */}
          {analysis && (
            <div className="glass-card rounded-2xl p-8 mb-8 fade-up">
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-32 h-32 rounded-full border-8 border-[#22262f] flex items-center justify-center" 
                       style={{ borderColor: getGrade(analysis.overall).color + '30' }}>
                    <div className="text-center">
                      <div className="font-headline text-5xl font-black" style={{ color: getGrade(analysis.overall).color }}>
                        {analysis.overall}
                      </div>
                      <div className="text-sm font-bold text-[#a9abb3]">/100</div>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full"
                       style={{ backgroundColor: getGrade(analysis.overall).color }}>
                    <span className="text-xs font-bold text-[#0b0e14]">{analysis.grade.grade}</span>
                  </div>
                </div>
                <div>
                  <div className="font-headline text-xl font-bold text-[#ecedf6] mb-2">
                    {analysis.grade.text} Financial Health
                  </div>
                  <p className="text-[#a9abb3] text-sm font-body max-w-md mx-auto">
                    Your overall financial health score is calculated based on emergency fund, insurance coverage, 
                    debt management, investment diversification, and savings rate.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Individual Metrics */}
          {analysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {HEALTH_METRICS.map(metric => {
                const score = analysis.individual[metric.id];
                const percentage = score;
                const color = percentage >= 80 ? '#4af8e3' : percentage >= 60 ? '#f59e0b' : '#ff6e84';
                
                return (
                  <div key={metric.id} className="glass-card rounded-2xl p-6 fade-up">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                           style={{ backgroundColor: metric.color + '20', color: metric.color }}>
                        <span className="material-symbols-outlined">{metric.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-headline font-bold text-[#ecedf6]">{metric.label}</h3>
                        <p className="text-xs text-[#a9abb3]">{metric.desc}</p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-body text-[#a9abb3]">Score</span>
                        <span className="font-headline font-bold text-lg" style={{ color }}>{score}</span>
                      </div>
                      <div className="w-full bg-[#22262f] rounded-full h-2 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                             style={{ width: `${percentage}%`, backgroundColor: color }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recommendations */}
          {analysis && analysis.recommendations.length > 0 && (
            <div className="glass-card rounded-2xl p-8 mb-8 fade-up">
              <h3 className="font-headline text-xl font-bold text-[#ecedf6] mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c799ff]">lightbulb</span>
                Personalized Recommendations
              </h3>
              <div className="space-y-4">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="w-6 h-6 rounded-full bg-[#c799ff]/20 text-[#c799ff] flex items-center justify-center text-xs font-bold font-label shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-[#ecedf6] text-sm font-body leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="glass-card rounded-2xl p-6 fade-up">
              <h3 className="font-headline text-lg font-bold text-[#ecedf6] mb-4">Income Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#a9abb3] text-sm">Monthly Income</span>
                  <span className="font-headline font-bold text-[#4af8e3]">{formatCurrency(income)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#a9abb3] text-sm">Monthly Expenses</span>
                  <span className="font-headline font-bold text-[#ff6e84]">{formatCurrency(expenses)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-[#22262f]">
                  <span className="text-[#a9abb3] text-sm font-bold">Monthly Savings</span>
                  <span className="font-headline font-bold text-lg text-[#4af8e3]">{formatCurrency(income - expenses)}</span>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 fade-up">
              <h3 className="font-headline text-lg font-bold text-[#ecedf6] mb-4">Savings Rate</h3>
              <div className="text-center">
                <div className="font-headline text-4xl font-black text-[#4af8e3] mb-2">
                  {Math.round(((income - expenses) / income) * 100)}%
                </div>
                <p className="text-[#a9abb3] text-sm">of your income is saved monthly</p>
                <div className="mt-4 p-3 bg-[#22262f]/30 rounded-lg">
                  <p className="text-xs text-[#a9abb3]">
                    {((income - expenses) / income) * 100 >= 20 
                      ? 'Excellent! You\'re saving more than the recommended 20%' 
                      : ((income - expenses) / income) * 100 >= 15 
                      ? 'Good! Try to increase savings to 20% for optimal financial health'
                      : 'Consider increasing your savings rate to improve financial security'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Finance Chatbot */}
          <div>
            <FinanceChatbot 
              context={analysis}
              page="health"
            />
          </div>
        </div>
      </div>
    </div>
  );
}