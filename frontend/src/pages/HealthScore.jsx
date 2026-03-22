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
    { title: 'Income & Lifestyle', fields: ['monthly_income', 'monthly_expenses'] },
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

  const TIPS = {
    'Emergency Fund': 'Build up 6 months of expenses in a liquid savings account or FD.',
    'Debt-to-Income': 'Keep your total EMIs below 30% of monthly income.',
    'Insurance Coverage': 'Get life cover of at least 10x your annual income.',
    'Investment Diversification': 'Spread investments across equity, debt, and gold.',
    'Savings Rate': 'Aim to save and invest at least 30% of your monthly income.',
    'Retirement Readiness': 'Start a monthly SIP now — even ₹2,000/month makes a big difference over 20 years.',
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
                  {field.replace(/_/g, ' ')} (₹)
                </label>
                <input
                  type="number"
                  value={user[field]}
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
                    insight={`${d.name}: ${TIPS[d.name] || 'Keep monitoring this area.'}`}
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