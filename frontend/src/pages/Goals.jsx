import { useState } from 'react';
import useStore from '../store';
import { api } from '../api';
import Card from '../components/Card';
import MetricCard from '../components/MetricCard';
import Button from '../components/Button';
import InsightCard from '../components/InsightCard';
import Loader from '../components/Loader';

const GOAL_TEMPLATES = [
  { name: 'Buy a Home', target: 5000000, color: 'blue', icon: '🏠' },
  { name: 'Child Education', target: 2500000, color: 'emerald', icon: '🎓' },
  { name: 'Dream Vacation', target: 500000, color: 'amber', icon: '✈️' },
  { name: 'Retirement', target: 45000000, color: 'rose', icon: '🏝️' },
];

export default function Goals() {
  const { user, goals, setGoals } = useStore();
  const [loading, setLoading] = useState(false);
  const [planResults, setPlanResults] = useState(null);

  const addGoal = (template) => {
    setGoals([...goals, { ...template, current_savings: 0, timeline_years: 10, expected_return: 12 }]);
  };

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await api.getGoalsPlan({
        goals: goals.map(g => ({
          name: g.name,
          target_amount: g.target,
          current_savings: g.current_savings,
          timeline_years: g.timeline_years,
          expected_return: g.expected_return
        })),
        monthly_surplus: user.monthly_income - user.monthly_expenses
      });
      setPlanResults(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Balancing your life goals & surplus..." />;

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Life Goals</h1>
          <p className="text-slate-500">Track multiple financial milestones and manage funding conflicts.</p>
        </div>
        <Button onClick={handleCalculate} disabled={goals.length === 0}>Generate My SIP Plan</Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {goals.length === 0 ? (
             <Card className="p-12 text-center border-dashed border-2 border-slate-200 bg-transparent">
                <div className="text-4xl mb-4">🎯</div>
                <div className="text-xl font-bold text-slate-400">Select templates from the right to add goals</div>
             </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {goals.map((goal, idx) => (
                 <Card key={idx} title={`${goal.icon} ${goal.name}`} className="relative group">
                    <div className="space-y-4">
                       <div>
                          <label className="text-xs font-bold text-slate-400 block mb-1">Target Amount (₹)</label>
                          <input 
                            type="number" value={goal.target} 
                            onChange={(e) => {
                              const newGoals = [...goals];
                              newGoals[idx].target = Number(e.target.value);
                              setGoals(newGoals);
                            }}
                            className="bg-slate-50 border-none rounded-lg p-3 w-full font-bold text-lg" 
                          />
                       </div>
                       <div className="flex gap-4">
                          <div className="flex-1">
                             <label className="text-xs font-bold text-slate-400 block mb-1">Years To Goal</label>
                             <input 
                                type="number" value={goal.timeline_years} 
                                onChange={(e) => {
                                  const newGoals = [...goals];
                                  newGoals[idx].timeline_years = Number(e.target.value);
                                  setGoals(newGoals);
                                }}
                                className="bg-slate-50 border-none rounded-lg p-2 w-full" 
                             />
                          </div>
                          <div className="flex-1">
                             <label className="text-xs font-bold text-slate-400 block mb-1">Return (%)</label>
                             <input 
                                type="number" value={goal.expected_return} 
                                onChange={(e) => {
                                  const newGoals = [...goals];
                                  newGoals[idx].expected_return = Number(e.target.value);
                                  setGoals(newGoals);
                                }}
                                className="bg-slate-50 border-none rounded-lg p-2 w-full" 
                             />
                          </div>
                       </div>
                    </div>
                    <button 
                      onClick={() => setGoals(goals.filter((_, i) => i !== idx))}
                      className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      🗑️
                    </button>
                 </Card>
               ))}
            </div>
          )}

          {planResults && (
            <Card title="Goal Funding Plan" className="bg-slate-900 text-white">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {planResults.goals.map((g, idx) => (
                    <div key={idx} className="p-4 border border-slate-700 rounded-xl bg-slate-800 flex flex-col items-center">
                       <span className="text-xs text-slate-400 uppercase font-bold mb-1 truncate w-full text-center">{g.name}</span>
                       <span className="text-lg font-bold">₹{Math.round(g.monthly_sip).toLocaleString()}</span>
                       <span className="text-xs text-blue-400 mt-1">SIP/Mo</span>
                    </div>
                  ))}
               </div>
               
               <InsightCard insight={planResults.ai_insights?.raw_response || "Based on your surplus, you can fund all selected goals."} type={planResults.has_conflict ? 'warning' : 'success'} />
               
               {planResults.has_conflict && (
                 <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-sm flex items-center gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>Conflict: Total SIP (₹{planResults.total_sip_needed.toLocaleString()}) exceeds your monthly surplus (₹{planResults.monthly_surplus.toLocaleString()}). Prioritize goals using the AI advice.</div>
                 </div>
               )}
            </Card>
          )}
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
           <Card title="Available Templates">
              <div className="space-y-3">
                 {GOAL_TEMPLATES.map(t => (
                   <button 
                     key={t.name}
                     onClick={() => addGoal(t)}
                     className="w-full p-4 flex items-center gap-4 bg-white border border-slate-100 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all text-left"
                   >
                     <span className="text-2xl">{t.icon}</span>
                     <div>
                        <div className="font-bold text-slate-800">{t.name}</div>
                        <div className="text-xs text-slate-400">Target: ₹{(t.target/100000).toFixed(1)}L+</div>
                     </div>
                   </button>
                 ))}
              </div>
           </Card>
           
           <Card title="Financial Capacity">
              <MetricCard label="Monthly Surplus" value={`₹${(user.monthly_income - user.monthly_expenses).toLocaleString()}`} subtext="Available for Savings/SIP" color="emerald" />
              <div className="mt-4 text-xs text-slate-400 leading-relaxed italic">
                 Your surplus is the maximum amount you can invest per month without taking additional debt or cutting lifestyle expenses.
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
