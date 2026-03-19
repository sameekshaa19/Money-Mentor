import { useState } from 'react';
import useStore from '../store';
import { api } from '../api';
import Card from '../components/Card';
import MetricCard from '../components/MetricCard';
import Button from '../components/Button';
import InsightCard from '../components/InsightCard';
import Loader from '../components/Loader';

const EVENT_TYPES = [
  { id: 'marriage', label: 'Wedding', icon: '💍' },
  { id: 'baby', label: 'New Baby', icon: '🍼' },
  { id: 'home_purchase', label: 'Home Purchase', icon: '🏠' },
  { id: 'job_change', label: 'Job Change', icon: '👔' },
];

export default function LifeEvent() {
  const { user, lifeEventAdvice, setLifeEventAdvice } = useStore();
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleAnalise = async (eventId) => {
    setSelectedEvent(eventId);
    setLoading(true);
    try {
      const res = await api.getLifeEventAdvice({
        event_type: eventId,
        monthly_income: user.monthly_income,
        monthly_expenses: user.monthly_expenses,
        total_investments: user.total_investments,
        insurance_cover: user.insurance_cover,
        emergency_fund: user.emergency_fund,
        additional_details: "Based in Tier-1 city"
      });
      setLifeEventAdvice(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Simulating life impact based on actuarial patterns..." />;

  const eventInfo = EVENT_TYPES.find(e => e.id === selectedEvent);

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Life Event Impact</h1>
        <p className="text-slate-500">How would a major life event change your financial trajectory? Let AI analyze the impact.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {EVENT_TYPES.map(event => (
          <button 
            key={event.id}
            onClick={() => handleAnalise(event.id)}
            className={`p-6 bg-white rounded-2xl shadow-sm border-2 transition-all flex flex-col items-center gap-3 ${
              selectedEvent === event.id ? 'border-blue-600 ring-4 ring-blue-50' : 'border-slate-50 hover:border-blue-200'
            }`}
          >
            <span className="text-4xl">{event.icon}</span>
            <span className="font-bold text-slate-700">{event.label}</span>
          </button>
        ))}
      </div>

      {lifeEventAdvice ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card title={`Before ${eventInfo.label}`} className="bg-slate-50 border-none">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monthly Cash Flow</span>
                    <span className="font-bold text-emerald-600">₹{(user.monthly_income - user.monthly_expenses).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Emergency Fund</span>
                    <span className="font-bold">₹{user.emergency_fund.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Insurance Cover</span>
                    <span className="font-bold">₹{(user.insurance_cover/100000).toFixed(1)}L</span>
                  </div>
                </div>
            </Card>

            <Card title={`After ${eventInfo.label} (AI Projection)`} className="bg-white border-blue-100">
                <div className="space-y-4">
                   {lifeEventAdvice.after && Object.entries(lifeEventAdvice.after).map(([k, v]) => (
                     <div key={k} className="flex justify-between">
                        <span className="text-slate-500 capitalize">{k.replace('_', ' ')}</span>
                        <span className="font-bold text-blue-600">{typeof v === 'number' ? `₹${v.toLocaleString()}` : v}</span>
                     </div>
                   ))}
                </div>
            </Card>
          </div>

          <Card title="Team Gemini Recommendations">
             <div className="space-y-4">
                {(lifeEventAdvice.recommendations || []).map((rec, idx) => (
                  <InsightCard key={idx} insight={rec} type="info" />
                ))}
             </div>
          </Card>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
           <div className="text-6xl mb-4 text-slate-200">🔮</div>
           <div className="text-xl font-bold text-slate-300">Click an event above to see your future.</div>
        </div>
      )}
    </div>
  );
}
