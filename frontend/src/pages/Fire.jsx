import { useState } from 'react';
import useStore from '../store';
import { api } from '../api';
import Card from '../components/Card';
import MetricCard from '../components/MetricCard';
import Loader from '../components/Loader';
import Button from '../components/Button';
import InsightCard from '../components/InsightCard';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Fire() {
  const { user, firePlan, setFirePlan } = useStore();
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    retirement_age: 45,
    expected_return: 12,
  });

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await api.getFirePlan({
        current_age: user.age,
        retirement_age: inputs.retirement_age,
        monthly_expenses: user.monthly_expenses,
        current_corpus: user.total_investments,
        expected_return: inputs.expected_return
      });
      setFirePlan(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Simulating your FIRE path... Hang tight!" />;

  const formatYAxis = (value) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(0)}L`;
    return `₹${value}`;
  };

  const formatTooltip = (value) => {
    if (value >= 10000000) return [`₹${(value / 10000000).toFixed(2)} Cr`, 'Corpus'];
    if (value >= 100000) return [`₹${(value / 100000).toFixed(1)} L`, 'Corpus'];
    return [`₹${value}`, 'Corpus'];
  };

  const chartData = firePlan?.yearly_projection || firePlan?.monthly_array || [];
  const corpusKey = chartData.length > 0 && chartData[0].corpus !== undefined ? 'corpus' : 'portfolio_value';

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">FIRE Planner</h1>
        <p className="text-slate-500">Calculate the exact corpus and monthly SIP needed to retire early in India.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <Card title="Simulation Controls" className="lg:col-span-1">
          <div className="space-y-8">
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-slate-500 font-medium">Target Retirement Age</span>
                <span className="text-blue-600 font-bold">{inputs.retirement_age}</span>
              </div>
              <input
                type="range" min={30} max={65}
                value={inputs.retirement_age}
                onChange={(e) => setInputs({ ...inputs, retirement_age: Number(e.target.value) })}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-slate-500 font-medium">Expected Return (%)</span>
                <span className="text-blue-600 font-bold">{inputs.expected_return}%</span>
              </div>
              <input
                type="range" min={5} max={18}
                value={inputs.expected_return}
                onChange={(e) => setInputs({ ...inputs, expected_return: Number(e.target.value) })}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <Button className="w-full py-4 bg-slate-900" onClick={handleCalculate}>Recalculate Path</Button>
          </div>
        </Card>

        {firePlan ? (
          <div className="lg:col-span-2 grid grid-cols-2 gap-6">
            <MetricCard label="Target FIRE Corpus" value={`₹${(firePlan.target_corpus / 10000000).toFixed(2)} Cr`} subtext="4% Rule Adjusted for Inflation" color="emerald" />
            <MetricCard label="Monthly SIP Needed" value={`₹${firePlan.monthly_sip.toLocaleString()}`} subtext={`For next ${inputs.retirement_age - user.age} years`} color="blue" />

            <Card title="Corpus Growth Projection" className="col-span-2">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 60, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorCorpus" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="year"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      label={{ value: 'Year', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 12 }}
                    />
                    <YAxis
                      tickFormatter={formatYAxis}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      width={60}
                      label={{ value: 'Corpus', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={formatTooltip}
                      labelFormatter={(label) => `Year ${label}`}
                    />
                    <Area type="monotone" dataKey={corpusKey} stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorCorpus)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 text-xs text-slate-400 text-center">
                X axis = Years from now &nbsp;|&nbsp; Y axis = Total corpus value in ₹
              </div>
            </Card>

            <div className="col-span-2">
              <InsightCard insight={firePlan.ai_insights?.narrative || "Starting today can significantly reduce your required monthly SIP. The earlier you start, the more compounding works in your favor."} />
            </div>
          </div>
        ) : (
          <Card className="lg:col-span-2 flex items-center justify-center p-20 border-dashed border-2 border-slate-200 bg-transparent">
            <div className="text-center">
              <div className="text-4xl mb-4">🏖️</div>
              <div className="text-xl font-bold text-slate-400">Run the simulation to see your FIRE path</div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}