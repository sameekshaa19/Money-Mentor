import { useNavigate } from 'react-router-dom';
import useStore from '../store';

export default function PortfolioXRay() {
  const navigate = useNavigate();
  const { user, healthScore, firePlan, couplePlan } = useStore();

  const cash = user.emergency_fund || 0;
  const equity = (user.total_investments || 0) * 0.6;
  const debt = (user.total_investments || 0) * 0.3;
  const gold = (user.total_investments || 0) * 0.1;
  const totalAssets = cash + equity + debt + gold;
  const totalWealth = totalAssets - (user.total_debt || 0);

  const formatLakhs = (val) => val >= 100000 ? `₹${(val / 100000).toFixed(1)}L` : `₹${Math.round(val).toLocaleString('en-IN')}`;

  const eqPct = totalAssets > 0 ? Math.round((equity / totalAssets) * 100) : 0;
  const debtPct = totalAssets > 0 ? Math.round((debt / totalAssets) * 100) : 0;
  const goldPct = totalAssets > 0 ? Math.round((gold / totalAssets) * 100) : 0;
  const cashPct = totalAssets > 0 ? Math.round((cash / totalAssets) * 100) : 0;

  return (
    <div className="section-page active fade-up">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 pt-10 pb-20">
        <div className="max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
            <span className="flex h-2 w-2 rounded-full bg-[#4af8e3] animate-pulse"></span>
            <span className="text-[#4af8e3] font-label text-xs font-bold tracking-widest uppercase">Celestial Ledger AI Active</span>
          </div>
          <h1 className="hero-title font-headline text-7xl md:text-9xl font-black tracking-tighter text-[#ecedf6] leading-none">
            Money <span className="text-[#c799ff]">Minter</span>
          </h1>
          <p className="font-body text-xl md:text-2xl text-[#a9abb3] max-w-2xl mx-auto leading-relaxed">
            Experience financial intelligence as an immersive voyage. Navigating your wealth through the constellation of possibilities.
          </p>
          <div className="pt-8 flex flex-col md:flex-row gap-6 justify-center">
            <button onClick={() => navigate('/goals')} className="px-10 py-5 bg-gradient-to-r from-[#c799ff] to-[#bc87fe] rounded-full text-[#340064] font-headline font-bold text-lg hover:shadow-[0_0_30px_rgba(199,153,255,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer">
              Plan Your Goals
            </button>
            <button onClick={() => navigate('/life')} className="px-10 py-5 glass-card rounded-full text-[#ecedf6] font-headline font-bold text-lg hover:bg-[#4af8e3]/10 transition-all cursor-pointer">
              Life Event Advisor
            </button>
          </div>
        </div>
        <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center gap-2">
          <span className="text-[#a9abb3] text-[10px] font-label uppercase tracking-widest">Scroll to Command Center</span>
          <span className="material-symbols-outlined text-[#c799ff]">expand_more</span>
        </div>
      </section>

      {/* Dashboard Cards */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-32 space-y-16">
        {/* Row 1: X-Ray & Health */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* X-Ray */}
          <div className="md:col-span-8 glass-card rounded-2xl p-8 flex flex-col justify-between overflow-hidden relative">
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[#4af8e3]">radar</span>
                  <h3 className="font-headline text-xl font-bold text-[#ecedf6] tracking-tight">Portfolio X-Ray</h3>
                </div>
                <p className="text-[#a9abb3] text-sm font-label">Global Asset Allocation Breakdown</p>
              </div>
              <div className="text-right">
                <span className="block text-4xl font-headline font-bold text-[#4af8e3] tracking-tight">₹{Math.round(totalWealth).toLocaleString('en-IN')}</span>
                <span className="text-xs font-label text-[#33e9d5] flex items-center justify-end gap-1 font-bold mt-1">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  Live Data Synced
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="relative h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="transparent" r="40" stroke="#22262f" strokeWidth="12"/>
                  <circle cx="50" cy="50" fill="transparent" r="40" stroke="#c799ff" strokeDasharray="251.2" strokeDashoffset="100" strokeWidth="12"/>
                  <circle cx="50" cy="50" fill="transparent" r="40" stroke="#33e9d5" strokeDasharray="251.2" strokeDashoffset="200" strokeWidth="12"/>
                  <circle cx="50" cy="50" fill="transparent" r="40" stroke="#af7aef" strokeDasharray="251.2" strokeDashoffset="230" strokeWidth="12"/>
                  <circle cx="50" cy="50" fill="transparent" r="40" stroke="#73757d" strokeDasharray="251.2" strokeDashoffset="251.2" strokeWidth="12"/>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold tracking-widest text-[#a9abb3] uppercase font-label">Global</span>
                  <span className="text-lg font-headline font-bold">Core</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#22262f]/30 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-[#c799ff]"></div><span className="text-xs font-label font-bold text-[#a9abb3] uppercase">Equity</span></div>
                  <p className="text-lg font-headline font-bold">{eqPct}%</p><p className="text-[10px] text-[#a9abb3] font-label">{formatLakhs(equity)}</p>
                </div>
                <div className="p-4 bg-[#22262f]/30 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-[#4af8e3]"></div><span className="text-xs font-label font-bold text-[#a9abb3] uppercase">Debt</span></div>
                  <p className="text-lg font-headline font-bold">{debtPct}%</p><p className="text-[10px] text-[#a9abb3] font-label">{formatLakhs(debt)}</p>
                </div>
                <div className="p-4 bg-[#22262f]/30 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-[#af7aef]"></div><span className="text-xs font-label font-bold text-[#a9abb3] uppercase">Gold</span></div>
                  <p className="text-lg font-headline font-bold">{goldPct}%</p><p className="text-[10px] text-[#a9abb3] font-label">{formatLakhs(gold)}</p>
                </div>
                <div className="p-4 bg-[#22262f]/30 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-[#73757d]"></div><span className="text-xs font-label font-bold text-[#a9abb3] uppercase">Cash</span></div>
                  <p className="text-lg font-headline font-bold">{cashPct}%</p><p className="text-[10px] text-[#a9abb3] font-label">{formatLakhs(cash)}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Health Score */}
          <div className="md:col-span-4 glass-card rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-6">
            <h3 className="font-headline text-lg font-bold text-[#ecedf6] tracking-tight uppercase">Financial Health</h3>
            <div className="relative flex items-center justify-center">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle cx="96" cy="96" fill="transparent" r="80" stroke="#22262f" strokeDasharray="502.4" strokeDashoffset="0" strokeWidth="12"/>
                <circle className="circular-progress-glow" cx="96" cy="96" fill="transparent" r="80" stroke="#c799ff" strokeDasharray="502.4" strokeDashoffset="90" strokeLinecap="round" strokeWidth="12"/>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-headline text-6xl font-black text-[#ecedf6]">{healthScore?.local_scores?.overall_score || '--'}</span>
                <span className="text-[10px] font-black tracking-[0.3em] text-[#c799ff] mt-1 font-label">SCORE</span>
              </div>
            </div>
            <div className="space-y-2">
              <span className="px-6 py-2 rounded-full bg-[#c799ff]/20 text-[#c799ff] font-label text-sm font-black border border-[#c799ff]/30 tracking-widest">
                {healthScore ? (healthScore.local_scores.overall_score >= 70 ? 'EXCELLENT' : healthScore.local_scores.overall_score >= 40 ? 'FAIR' : 'NEEDS WORK') : 'PENDING'}
              </span>
              <p className="text-xs text-[#a9abb3] px-4 font-body">Run your Health Score analysis to keep this updated.</p>
            </div>
          </div>
        </div>

        {/* Row 2: FIRE, Couples, Zindagi, Events */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* FIRE */}
          <div className="md:col-span-4 glass-card rounded-2xl p-8 space-y-8 flex flex-col justify-between cursor-pointer hover:bg-[#c799ff]/5" onClick={() => navigate('/fire')}>
            <div className="flex justify-between items-start">
              <div className="p-3 bg-[#c799ff]/10 w-fit rounded-xl border border-[#c799ff]/20">
                <span className="material-symbols-outlined text-[#c799ff]">local_fire_department</span>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-[#c799ff] uppercase tracking-widest font-label">Projected Horizon</p>
                <p className="font-headline text-2xl font-bold">Year 2035</p>
              </div>
            </div>
            <div>
              <h3 className="font-headline text-2xl font-bold mb-2">FIRE Planner</h3>
              <p className="text-[#a9abb3] text-sm leading-relaxed font-body">You are tracking 3 years ahead of your original baseline. High savings velocity maintained.</p>
            </div>
            <div className="space-y-4">
              <div className="w-full bg-[#22262f] rounded-full h-3 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#c799ff] to-[#bc87fe] h-3 rounded-full shadow-[0_0_15px_rgba(199,153,255,0.4)]" style={{ width: '65%' }}></div>
              </div>
              <div className="flex justify-between text-xs font-label font-bold">
                <div className="flex flex-col"><span className="text-[#a9abb3] uppercase text-[10px]">Current Age</span><span className="text-[#ecedf6] text-base">{user.age || '--'}</span></div>
                <div className="flex flex-col items-end"><span className="text-[#c799ff] uppercase text-[10px]">Target Goal</span><span className="text-[#c799ff] text-base">{firePlan ? firePlan.target_age || '--' : '--'}</span></div>
              </div>
            </div>
          </div>

          {/* Couple */}
          <div className="md:col-span-4 glass-card rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden cursor-pointer hover:bg-[#4af8e3]/5" onClick={() => navigate('/couple')}>
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#4af8e3]/10 rounded-full blur-3xl"></div>
            <div className="flex justify-between items-center mb-8">
              <div className="flex -space-x-3">
                <div className="w-12 h-12 rounded-full bg-[#c799ff]/30 border-4 border-[#0b0e14] flex items-center justify-center text-xl font-bold text-[#c799ff]">A</div>
                <div className="w-12 h-12 rounded-full bg-[#4af8e3]/30 border-4 border-[#0b0e14] flex items-center justify-center text-xl font-bold text-[#4af8e3]">S</div>
              </div>
              <div className="px-3 py-1 bg-[#4af8e3]/10 text-[#4af8e3] border border-[#4af8e3]/20 rounded-full text-[10px] font-black tracking-widest flex items-center gap-1 font-label">
                <span className="material-symbols-outlined text-xs">sync</span> SYNCED
              </div>
            </div>
            <div>
              <h3 className="font-headline text-2xl font-bold">Couple's Planner</h3>
              <p className="text-[#a9abb3] text-sm mt-3 leading-relaxed font-body">Shared ambitions with <span className="text-[#ecedf6] font-bold">Sarah</span>. Both ledgers are perfectly aligned for multi-generational growth.</p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="bg-[#1c2028]/50 p-3 rounded-xl border border-white/5">
                <p className="text-[10px] font-bold text-[#a9abb3] uppercase tracking-tighter font-label">Shared Goals</p>
                <p className="text-xl font-headline font-bold">2 Active</p>
              </div>
              <div className="bg-[#1c2028]/50 p-3 rounded-xl border border-white/5">
                <p className="text-[10px] font-bold text-[#a9abb3] uppercase tracking-tighter font-label">Pool Health</p>
                <p className="text-xl font-headline font-bold text-[#4af8e3]">94%</p>
              </div>
            </div>
          </div>

          {/* Zindagi + Events */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="glass-card rounded-2xl p-6 border-l-4 border-l-[#c799ff] cursor-pointer hover:bg-[#c799ff]/5" onClick={() => navigate('/goals')}>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-headline font-bold text-lg">Zindagi Goals</h4>
                <span className="material-symbols-outlined text-[#c799ff] text-xl">stars</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 group/item">
                  <div className="w-10 h-10 rounded-lg bg-[#22262f] flex items-center justify-center text-[#a9abb3] group-hover/item:bg-[#c799ff]/20 group-hover/item:text-[#c799ff] transition-all">
                    <span className="material-symbols-outlined text-sm">celebration</span>
                  </div>
                  <div className="flex-1 pb-2 border-b border-[#22262f]/30">
                    <p className="text-sm font-bold font-headline">Wedding</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-[#a9abb3] uppercase font-label">SIP ₹18,500/mo</span>
                      <span className="text-[10px] text-[#c799ff] font-bold font-label">8 Years</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 group/item">
                  <div className="w-10 h-10 rounded-lg bg-[#22262f] flex items-center justify-center text-[#a9abb3] group-hover/item:bg-[#c799ff]/20 group-hover/item:text-[#c799ff] transition-all">
                    <span className="material-symbols-outlined text-sm">school</span>
                  </div>
                  <div className="flex-1 pb-2 border-b border-[#22262f]/30">
                    <p className="text-sm font-bold font-headline">Child's Education</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-[#a9abb3] uppercase font-label">SIP ₹15,000/mo</span>
                      <span className="text-[10px] text-[#a9abb3] font-bold font-label">12 Years</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="glass-card rounded-2xl p-6 border-l-4 border-l-[#4af8e3] cursor-pointer hover:bg-[#4af8e3]/5" onClick={() => navigate('/life')}>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-headline font-bold text-lg">Life Events</h4>
                <span className="material-symbols-outlined text-[#4af8e3] text-xl">event</span>
              </div>
              <div className="relative pl-6 space-y-4">
                <div className="absolute left-2 top-2 bottom-2 w-px bg-[#4af8e3]/30"></div>
                <div className="relative">
                  <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#4af8e3] shadow-[0_0_8px_rgba(74,248,227,0.5)]"></div>
                  <p className="text-xs font-bold text-[#ecedf6] uppercase tracking-tight font-label">New Baby</p>
                  <p className="text-xs text-[#a9abb3] font-body">Insurance & education planning</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#22262f]"></div>
                  <p className="text-xs font-bold text-[#ecedf6] uppercase tracking-tight font-label">Home Purchase</p>
                  <p className="text-xs text-[#a9abb3] font-body">EMI impact & tax benefits</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-12">
          <div className="space-y-6">
            <h2 className="font-headline text-4xl font-bold leading-tight">Your wealth, decoded by <span className="text-[#c799ff] italic">Intelligence</span>.</h2>
            <p className="text-[#a9abb3] text-lg leading-relaxed font-body">We don't just show you numbers. We show you possibilities. Our AI-driven Celestial Ledger analyses your full financial picture to ensure your trajectory remains optimal.</p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3"><span className="material-symbols-outlined text-[#4af8e3]">check_circle</span><span className="font-body text-[#ecedf6] font-medium">Real SIP calculations with numpy-financial</span></li>
              <li className="flex items-center gap-3"><span className="material-symbols-outlined text-[#4af8e3]">check_circle</span><span className="font-body text-[#ecedf6] font-medium">AI-powered life event impact analysis</span></li>
              <li className="flex items-center gap-3"><span className="material-symbols-outlined text-[#4af8e3]">check_circle</span><span className="font-body text-[#ecedf6] font-medium">Conflict detection across all your goals</span></li>
            </ul>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-[#c799ff]/20 blur-[100px] rounded-full scale-75"></div>
            <div className="relative glass-card rounded-2xl overflow-hidden shadow-2xl group p-8 text-center space-y-4">
              <div className="text-6xl">🚀</div>
              <p className="text-xs font-label text-[#c799ff] uppercase font-black tracking-widest">Active Analysis</p>
              <p className="font-headline text-2xl font-bold">Optimizing Your Goals</p>
              <p className="text-[#a9abb3] text-sm">Backend running on port 8000. Gemini AI insights active.</p>
              <button onClick={() => navigate('/goals')} className="mt-4 px-8 py-3 bg-gradient-to-r from-[#c799ff] to-[#bc87fe] rounded-full text-[#340064] font-headline font-bold hover:shadow-[0_0_20px_rgba(199,153,255,0.4)] transition-all cursor-pointer">
                Start Planning
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}