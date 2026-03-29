import { useState, useEffect } from 'react'
import axios from 'axios'

const BACKEND = 'http://localhost:8000';

const PRESET_GOALS = [
  { id:'wedding',   name:'Wedding',           icon:'celebration',  defaultAmount:3000000, defaultYears:8,  expectedReturn:12 },
  { id:'education', name:"Child's Education", icon:'school',       defaultAmount:5000000, defaultYears:12, expectedReturn:12 },
  { id:'home',      name:'Home Purchase',     icon:'home',         defaultAmount:2500000, defaultYears:5,  expectedReturn:10 },
  { id:'parents',   name:"Parents' Medical",  icon:'favorite',     defaultAmount:2000000, defaultYears:3,  expectedReturn:7  },
  { id:'car',       name:'Car',               icon:'directions_car',defaultAmount:800000, defaultYears:2,  expectedReturn:7  },
  { id:'vacation',  name:'Vacation',          icon:'flight',       defaultAmount:300000,  defaultYears:1,  expectedReturn:6  },
];

const INITIAL_GOALS = [
  { id:1, name:'Wedding',           targetAmount:3000000, years:8,  monthlySIP:18500, fundCategory:'Equity Fund',      conflict:false },
  { id:2, name:"Child's Education", targetAmount:5000000, years:12, monthlySIP:15000, fundCategory:'Equity Large Cap', conflict:false },
  { id:3, name:'Home Purchase',     targetAmount:2500000, years:5,  monthlySIP:32000, fundCategory:'Hybrid Fund',      conflict:true  },
];

function fmtINR(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

function fundCategory(years) {
  return years <= 3 ? 'Debt Fund' : years <= 7 ? 'Hybrid Fund' : 'Equity Fund';
}

export default function ZindagiGoals() {
  const [income, setIncome] = useState(() => Number(localStorage.getItem('userIncome')) || 120000);
  const [expenses, setExpenses] = useState(() => Number(localStorage.getItem('userExpenses')) || 55000);
  const SURPLUS = income - expenses;

  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [viewState, setViewState] = useState('list'); // 'list', 'presets', 'customize'
  const [loading, setLoading] = useState(false);
  const [currentPreset, setCurrentPreset] = useState(null);
  
  const [customizeAmount, setCustomizeAmount] = useState('');
  const [customizeYears, setCustomizeYears] = useState('');

  const totalSIP = goals.reduce((s, g) => s + g.monthlySIP, 0);
  const conflict = totalSIP > SURPLUS;
  const pct = Math.min((totalSIP / SURPLUS) * 100, 100);

  // Recalculate conflict when goals change
  useEffect(() => {
    setGoals(prev => prev.map(g => ({ ...g, conflict: totalSIP > SURPLUS })));
  }, [totalSIP]);

  useEffect(() => {
    localStorage.setItem('userIncome', income);
    localStorage.setItem('userExpenses', expenses);
  }, [income, expenses]);

  const removeGoal = (id) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const openCustomize = (preset) => {
    setCurrentPreset(preset);
    setCustomizeAmount(preset.defaultAmount);
    setCustomizeYears(preset.defaultYears);
    setViewState('customize');
  };

  const addGoal = async () => {
    if (!currentPreset) return;
    const amount = Number(customizeAmount);
    const years = Number(customizeYears);
    if (!amount || !years) return;

    setViewState('list');
    setLoading(true);

    let monthlySIP;
    let aiInsight = null;
    try {
      const res = await axios.post(`${BACKEND}/api/goals`, {
        goals: [{ 
          name: currentPreset.name, 
          target_amount: amount, 
          current_savings: 0, 
          timeline_years: years, 
          expected_return: currentPreset.expectedReturn 
        }],
        monthly_surplus: SURPLUS
      });
      monthlySIP = Math.round(res.data.data.goals[0].monthly_sip);
      const aiData = res.data.data.ai_insights;
      if (aiData) {
        aiInsight = aiData.insight || aiData.message || JSON.stringify(aiData);
      } else {
        aiInsight = null;
      }
    } catch(e) {
      console.error('API failed, using estimate', e);
      monthlySIP = Math.round(amount / (years * 12));
    }

    setLoading(false);

    const newGoal = { 
      id: Date.now(), 
      name: currentPreset.name, 
      targetAmount: amount, 
      years, 
      monthlySIP, 
      fundCategory: fundCategory(years), 
      conflict: false,
      aiInsight
    };
    
    setGoals(prev => [...prev, newGoal]);
    setCurrentPreset(null);
  };

  return (
    <div className="section-page active">
      <div className="relative min-h-screen pt-10 pb-32">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="mb-12 fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <span className="flex h-2 w-2 rounded-full bg-[#c799ff] animate-pulse"></span>
              <span className="text-[#c799ff] font-label text-xs font-bold tracking-widest uppercase">Goal Engine Active</span>
            </div>
            <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter text-[#ecedf6] leading-none mb-4">
              Zindagi <span className="text-[#c799ff]">Goals</span>
            </h1>
            <p className="text-[#a9abb3] text-lg font-body">Plan for real Indian life goals — not just retirement. Every SIP calculated live from the backend.</p>
          </div>

          {/* Profile bar */}
          <div className="glass-card-static rounded-2xl p-6 mb-8 fade-up">
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest">Monthly Income (₹)</label>
                <input 
                  type="number" 
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value) || 0)}
                  className="bg-white/5 border border-[#c799ff]/15 rounded-xl px-4 py-3 text-[#ecedf6] font-body w-full"
                />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest">Monthly Expenses (₹)</label>
                <input 
                  type="number" 
                  value={expenses}
                  onChange={(e) => setExpenses(Number(e.target.value) || 0)}
                  className="bg-white/5 border border-[#c799ff]/15 rounded-xl px-4 py-3 text-[#ecedf6] font-body w-full"
                />
              </div>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[#a9abb3] text-sm font-label uppercase tracking-widest">Investable Surplus</span>
              <span className="font-headline text-2xl font-bold text-[#ecedf6]">{fmtINR(SURPLUS)}</span>
            </div>
            <div className="flex justify-between items-center mb-4 text-xs font-label text-[#a9abb3]">
              <span>Status</span>
              <span className="font-bold" style={{ color: conflict ? '#f85149' : '#4af8e3' }}>
                {conflict ? '⚠ Over Budget' : 'Available'}
              </span>
            </div>
            {/* SIP progress bar */}
            <div className="w-full bg-[#0d1117] rounded-full h-2 overflow-hidden">
              <div 
                className="sip-bar h-2 rounded-full" 
                style={{ 
                  width: `${pct}%`, 
                  background: conflict ? '#f85149' : 'linear-gradient(90deg,#c799ff,#bc87fe)' 
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs font-label text-[#a9abb3] mt-2">
              <span>Total SIPs: <span className="text-[#ecedf6] font-bold">{fmtINR(totalSIP)}</span>/mo</span>
              <span>Surplus: {fmtINR(SURPLUS)}</span>
            </div>
          </div>

          {/* Conflict banner */}
          {conflict && (
            <div className="rounded-2xl p-4 mb-6 fade-up" style={{ background: 'rgba(248,81,73,0.06)', border: '1px solid rgba(248,81,73,0.25)' }}>
              <div className="text-[#f85149] font-bold text-sm">⚠ SIP Conflict Detected</div>
              <div className="text-[#f85149]/70 text-xs mt-1">Total SIPs exceed your monthly surplus. Consider extending timelines or reducing targets.</div>
            </div>
          )}

          {/* Goal cards */}
          <div className="space-y-4 mb-6">
            {goals.map(g => (
              <div key={g.id} className="goal-row glass-card rounded-2xl p-6 fade-up" style={{ borderColor: g.conflict ? 'rgba(248,81,73,0.3)' : '' }}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-headline font-bold text-lg text-[#ecedf6]">{g.name}</h4>
                      {g.conflict && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-label uppercase tracking-widest" style={{ background: 'rgba(248,81,73,0.1)', color: '#f85149', border: '1px solid rgba(248,81,73,0.3)' }}>
                          Conflict
                        </span>
                      )}
                    </div>
                    <p className="text-[#a9abb3] text-sm font-label mb-4">{fmtINR(g.targetAmount)} in {g.years} years</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-3 py-1 rounded-full text-xs font-label font-bold uppercase tracking-wider" style={{ background: '#22262f', color: '#a9abb3' }}>
                        {g.fundCategory}
                      </span>
                      <span className="font-headline text-xl font-bold text-[#c799ff]">
                        {fmtINR(g.monthlySIP)}<span className="text-sm font-normal text-[#a9abb3]">/mo</span>
                      </span>
                    </div>
                    {g.aiInsight && (
                      <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(199,153,255,0.06)', borderLeft: '2px solid #c799ff' }}>
                        <div className="text-[11px] text-[#c799ff] font-bold mb-1 uppercase tracking-widest font-label flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">auto_awesome</span> AI Insight
                        </div>
                        <div className="text-xs text-[#a9abb3] font-body leading-relaxed whitespace-pre-wrap">
                          {g.aiInsight}
                        </div>
                      </div>
                    )}
                  </div>
                  <button 
                    className="remove-btn ml-4 p-2 rounded-lg hover:bg-[#f85149]/10 transition-all text-[#a9abb3] hover:text-[#f85149] cursor-pointer" 
                    onClick={() => removeGoal(g.id)}
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-3 text-[#a9abb3]">
                <div className="w-4 h-4 border-2 border-[#c799ff]/30 border-t-[#c799ff] rounded-full animate-spin"></div>
                <span className="font-label text-sm">Calculating SIP from backend...</span>
              </div>
            </div>
          )}

          {/* Add Goal button */}
          {viewState === 'list' && !loading && (
            <div>
              <button 
                onClick={() => setViewState('presets')} 
                className="w-full py-4 glass-card rounded-2xl text-[#a9abb3] hover:text-[#c799ff] font-headline font-bold text-sm tracking-widest uppercase transition-all hover:border-[#c799ff]/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">add</span> Add a Goal
              </button>
            </div>
          )}

          {/* Preset picker */}
          {viewState === 'presets' && (
            <div className="glass-card-static rounded-2xl p-6 fade-up">
              <p className="text-xs font-label text-[#a9abb3] uppercase tracking-widest mb-4">Select a goal to plan:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {PRESET_GOALS.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => openCustomize(p)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl text-[#ecedf6] font-headline font-bold text-sm transition-all border border-[#30363d] bg-[#0d1117] hover:border-[#c799ff]/40 group cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[#a9abb3] group-hover:text-[#c799ff] transition-colors">{p.icon}</span>
                    {p.name}
                  </button>
                ))}
              </div>
              <button onClick={() => setViewState('list')} className="text-[#a9abb3] text-xs font-label hover:text-[#ecedf6] transition-colors cursor-pointer">Cancel</button>
            </div>
          )}

          {/* Customize panel */}
          {viewState === 'customize' && currentPreset && (
            <div className="glass-card-static rounded-2xl p-6 fade-up">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setViewState('presets')} className="text-[#a9abb3] hover:text-[#ecedf6] transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                </button>
                <div>
                  <h3 className="font-headline font-bold text-lg">{currentPreset.name}</h3>
                  <p className="text-[#a9abb3] text-xs font-label">Adjust to your exact needs</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-[10px] font-label text-[#a9abb3] uppercase tracking-widest block mb-2">Target Amount (₹)</label>
                  <input 
                    type="number" 
                    value={customizeAmount}
                    onChange={(e) => setCustomizeAmount(e.target.value)}
                    className="rounded-lg px-3"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-label text-[#a9abb3] uppercase tracking-widest block mb-2">Timeline (Years)</label>
                  <input 
                    type="number" 
                    value={customizeYears}
                    onChange={(e) => setCustomizeYears(e.target.value)}
                    className="rounded-lg px-3"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={addGoal} className="flex-1 py-3 bg-gradient-to-r from-[#c799ff] to-[#bc87fe] rounded-full text-[#340064] font-headline font-bold hover:shadow-[0_0_20px_rgba(199,153,255,0.3)] transition-all cursor-pointer">
                  Calculate SIP
                </button>
                <button onClick={() => setViewState('list')} className="px-6 py-3 glass-card rounded-full text-[#a9abb3] font-headline font-bold hover:text-[#ecedf6] transition-all cursor-pointer">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}