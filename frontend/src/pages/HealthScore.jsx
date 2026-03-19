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
        setHealthScore(res.data.data);
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

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Financial Health Score</h1>
        <p className="text-slate-500">A holistic checkup of your finances using rule-based math and Gemini AI insights.</p>
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
                  {field.replace('_', ' ')} (₹)
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
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <Radar name="Score" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-6">
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

            <Card title="Gemini Health Prescriptions">
               <div className="space-y-4">
                  {(healthScore.ai_insights?.dimensions || []).map((ins, idx) => (
                    <InsightCard key={idx} insight={ins.insight} type={healthScore.local_scores.dimensions[idx]?.status === 'critical' ? 'warning' : 'info'} />
                  ))}
               </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
