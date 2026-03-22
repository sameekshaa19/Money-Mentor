import { useState } from 'react';
import useStore from '../store';
import { api } from '../api';
import Card from '../components/Card';
import MetricCard from '../components/MetricCard';
import StepForm from '../components/StepForm';
import InsightCard from '../components/InsightCard';
import Loader from '../components/Loader';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

export default function HealthScore() {
  const { user, setUser, healthScore, setHealthScore } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const steps = [
    { title: 'Income & Lifestyle', fields: ['age', 'monthly_income', 'monthly_expenses'] },
    { title: 'Assets & Safety', fields: ['emergency_fund', 'total_investments', 'insurance_cover'] },
    { title: 'Debt & Savings', fields: ['total_debt', 'savings_rate'] },
  ];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setLoading(true);
      try {
        const res = await api.getHealthScore(user);
        setHealthScore({ local_scores: res.data.data, ai_insights: res.data.data });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) return <Loader message="Scoring your financial life across 6 dimensions..." />;

  const chartData = healthScore?.local_scores?.dimensions?.map(d => ({
    subject: d.name,
    A: d.score,
    fullMark: 100,
  })) || [];

  const getDynamicTip = (d) => {
    const score = d.score;
    const name = d.name;

    if (name === 'Emergency Fund') {
      if (score >= 70) return 'Great job! Your emergency fund is solid. Keep it topped up as your expenses grow.';
      if (score >= 40) return 'You have some emergency savings but need more. Target 6 months of expenses in a liquid FD or savings account.';
      return 'Critical! You have almost no emergency fund. Start immediately — even ₹5,000/month into a separate savings account helps.';
    }
    if (name === 'Debt-to-Income') {
      if (score >= 70) return 'Your debt is well under control. EMIs are a healthy portion of your income.';
      if (score >= 40) return 'Your EMIs are getting high. Avoid taking any new loans until you pay down existing debt.';
      return 'Danger zone! Your EMIs are above 40% of income. Prioritize paying off high-interest debt immediately.';
    }
    if (name === 'Insurance Coverage') {
      if (score >= 70) return 'Good coverage! Make sure to review your policy every 2 years as your income grows.';
      if (score >= 40) return 'Your insurance cover needs improvement. Aim for at least 10x your annual income in term life insurance.';
      return 'Very low insurance! Get a term life insurance policy immediately — a ₹1 Crore cover costs only ~₹8,000/year in your 20s.';
    }
    if (name === 'Investment Diversification') {
      if (score >= 70) return 'Well diversified! Keep maintaining a mix of equity, debt, and gold.';
      if (score >= 40) return 'Spread your investments more. Add debt funds or gold ETFs alongside your equity investments.';
      return 'Too concentrated! Start a small SIP in a Nifty index fund and add some gold ETF to balance your portfolio.';
    }
    if (name === 'Savings Rate') {
      if (score >= 70) return 'Excellent savings rate! You are building wealth faster than most Indians.';
      if (score >= 40) return 'Decent savings but aim for 30% of income. Try automating a SIP on salary day so you save before spending.';
      return 'Low savings rate! Try the 50-30-20 rule — 50% needs, 30% wants, 20% savings. Start with even ₹2,000/month SIP.';
    }
    if (name === 'Retirement Readiness') {
      if (score >= 70) return 'You are on track for retirement! Keep your SIPs running and increase by 10% every year.';
      if (score >= 40) return 'Slightly behind on retirement savings. Increase your monthly SIP by at least ₹2,000 and consider NPS for extra tax benefit.';
      return 'Far behind on retirement savings! Start a dedicated retirement SIP today. Even ₹3,000/month now is worth ₹1 Crore in 25 years at 12%.';
    }
    return 'Keep monitoring this area and improving gradually.';
  };

  const getPlaceholder = (field) => {
    if (field === 'age') return 'e.g. 28';
    if (field === 'savings_rate') return 'e.g. 20';
    if (field === 'monthly_income') return 'e.g. 80000';
    if (field === 'monthly_expenses') return 'e.g. 45000';
    if (field === 'emergency_fund') return 'e.g. 100000';
    if (field === 'total_investments') return 'e.g. 500000';
    if (field === 'insurance_cover') return 'e.g. 10000000';
    if (field === 'total_debt') return 'e.g. 200000';
    return 'Enter amount';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Financial Health Score</h1>
        <p className="text-slate-500">A holistic checkup of your finances using rule-based math and AI insights.</p>
      </header>

      {!healthScore ? (
        <Card className="max-w-2xl mx-auto bg-white py-12">
          <div className="mb-10 text-center">
            <h2 className="text-xl font-bold text-slate-800">{steps[currentStep].title}</h2>
            <p className="text-sm text-slate-400">Step {currentStep + 1} of {steps.length}</p>
          </div>
          <div className="space-y-6 px-10">
            {steps[currentStep].fields.map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-slate-700 mb-2 capitalize">
                  {field.replace(/_/g, ' ')} {field === 'savings_rate' ? '(%)' : field === 'age' ? '(years)' : '(₹)'}
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder={getPlaceholder(field)}
                  value={user[field] || ''}
                  onChange={(e) => setUser({ [field]: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            ))}
          </div>
          <StepForm
            steps={steps}
            currentStep={currentStep}
            onNext={handleNext}
            onPrev={() => setCurrentStep(currentStep - 1)}
            isLast={currentStep === steps.length - 1}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Card title="Your Health Radar">
            <div className="h-[420px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="55%"
                  data={chartData}
                  margin={{ top: 20, right: 40, bottom: 20, left: 40 }}
                >
                  <PolarGrid />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 11, fill: '#475569' }}
                  />
                  <Radar name="Score" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-2">
              <div className="text-sm text-slate-400 uppercase font-bold tracking-widest mb-1">Overall Score</div>
              <div className="text-6xl font-black text-blue-600">{healthScore.local_scores.overall_score}</div>
            </div>
          </Card>

          <div className="flex flex-col gap-6">
            <Card title="Dimension Breakdown">
              <div className="grid grid-cols-2 gap-4">
                {healthScore.local_scores.dimensions.map(d => (
                  <MetricCard
                    key={d.name}
                    label={d.name}
                    value={`${d.score}/100`}
                    color={d.status === 'good' ? 'emerald' : d.status === 'warning' ? 'amber' : 'rose'}
                  />
                ))}
              </div>
            </Card>

            <Card title="Health Prescriptions">
              <div className="space-y-4">
                {healthScore.local_scores.dimensions.map((d, idx) => (
                  <InsightCard
                    key={idx}
                    insight={getDynamicTip(d)}
                    type={d.status === 'critical' ? 'warning' : 'info'}
                  />
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}