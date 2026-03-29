import { useState, useEffect } from 'react'
import useFinance from '../hooks/useFinance'
import FinanceChatbot from './FinanceChatbot'
import { api } from '../services/api'

export default function FirePlanner() {
  const { income, expenses, fireData, setFireData } = useFinance();
  const [loading, setLoading] = useState(false);
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(45);
  const [currentCorpus, setCurrentCorpus] = useState('');
  const [expectedReturn, setExpectedReturn] = useState(12);

  const calculateFire = async () => {
    setLoading(true);
    try {
      const response = await api.getFirePlan({
        current_age: currentAge,
        retirement_age: retirementAge,
        monthly_expenses: expenses,
        current_corpus: currentCorpus,
        expected_return: expectedReturn
      });
      
      setFireData(response.data.data);
      console.log('FIRE calculation result:', response.data.data);
    } catch (error) {
      console.error('FIRE calculation failed:', error);
      // Fallback calculation
      const years = retirementAge - currentAge;
      const inflationRate = 6.0;
      const futureAnnualExpenses = expenses * 12 * Math.pow(1 + inflationRate / 100, years);
      const targetCorpus = futureAnnualExpenses / 0.04;
      
      setFireData({
        target_corpus: Math.round(targetCorpus),
        monthly_sip: Math.round(targetCorpus / (years * 12 * 10)), // Rough estimate
        yearly_projection: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate on initial load only
  useEffect(() => {
    calculateFire();
  }, []);

  // Helper function to generate SVG path for wealth trajectory
  const generateTrajectoryPath = (returnRate, startingCorpus, targetCorpus, years) => {
    if (!years || years <= 0) return "M0 100 L100 100";
    
    const monthlySIP = fireData?.monthly_sip || 10000;
    const monthlyReturn = returnRate / 100 / 12;
    
    // Generate points for each year
    let corpus = startingCorpus;
    let path = "M0 100 "; // Start at bottom-left
    
    for (let year = 1; year <= years; year++) {
      // Compound monthly with SIP
      for (let month = 0; month < 12; month++) {
        corpus = corpus * (1 + monthlyReturn) + monthlySIP;
      }
      
      const x = (year / years) * 100;
      const y = 100 - Math.min((corpus / targetCorpus) * 100, 100);
      
      // Use quadratic bezier for smooth curve
      if (year === 1) {
        path += `Q ${x/2} ${y + (100-y)/2}, ${x} ${y} `;
      } else {
        const prevX = ((year - 1) / years) * 100;
        const cpX = prevX + (x - prevX) / 2;
        path += `T ${x} ${y} `;
      }
    }
    
    return path;
  };

  // Helper to calculate corpus at a specific year
  const getCorpusAtYear = (targetYear, returnRate, startingCorpus, targetCorpus) => {
    if (!fireData) return 0;
    
    const monthlySIP = fireData.monthly_sip || 10000;
    const monthlyReturn = returnRate / 100 / 12;
    
    let corpus = startingCorpus;
    for (let month = 0; month < targetYear * 12; month++) {
      corpus = corpus * (1 + monthlyReturn) + monthlySIP;
    }
    
    return Math.min(corpus, targetCorpus);
  };

  return (
    <div className="section-page active fade-up">
      <div className="relative min-h-screen pt-10 pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
                <span className="flex h-2 w-2 rounded-full bg-[#c799ff] animate-pulse"></span>
                <span className="text-[#c799ff] font-label text-xs font-bold tracking-widest uppercase">Trajectory Simulation Live</span>
              </div>
              <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter text-[#ecedf6] leading-none mb-4">
                FIRE <span className="text-[#c799ff]">Planner</span>
              </h1>
              <p className="text-[#a9abb3] text-lg font-body max-w-xl">
                Your path to Financial Independence, Retire Early. We continuously recalculate your trajectory based on real-time market beta and savings velocity.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-6 min-w-[280px]">
              <p className="text-[#a9abb3] font-label text-xs uppercase tracking-widest mb-1">Target Corpus</p>
              <p className="font-headline text-4xl font-black text-[#4af8e3]">
                ₹{fireData ? (fireData.target_corpus / 10000000).toFixed(1) : '8.5'}<span className="text-xl text-[#33e9d5]">Cr</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="material-symbols-outlined text-[#c799ff] text-sm">trending_up</span>
                <span className="text-[#ecedf6] font-label text-xs">Monthly SIP: ₹{fireData ? fireData.monthly_sip.toLocaleString('en-IN') : '0'}</span>
              </div>
            </div>
          </div>

          {/* Input Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="glass-card rounded-2xl p-6">
              <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-2">Current Age</label>
              <input 
                type="number" 
                value={currentAge}
                onChange={(e) => setCurrentAge(Number(e.target.value))}
                className="w-full bg-white/5 border border-[#c799ff]/15 rounded-xl px-4 py-3 text-[#ecedf6] font-body"
              />
            </div>
            <div className="glass-card rounded-2xl p-6">
              <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-2">Retirement Age</label>
              <input 
                type="number" 
                value={retirementAge}
                onChange={(e) => setRetirementAge(Number(e.target.value))}
                className="w-full bg-white/5 border border-[#c799ff]/15 rounded-xl px-4 py-3 text-[#ecedf6] font-body"
              />
            </div>
            <div className="glass-card rounded-2xl p-6">
              <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-2">Current Corpus (₹)</label>
              <input 
                type="number" 
                value={currentCorpus}
                placeholder="1000000"
                onChange={(e) => setCurrentCorpus(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white/5 border border-[#c799ff]/15 rounded-xl px-4 py-3 text-[#ecedf6] font-body"
              />
            </div>
            <div className="glass-card rounded-2xl p-6">
              <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-2">Expected Return (%)</label>
              <input 
                type="number" 
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(Number(e.target.value))}
                className="w-full bg-white/5 border border-[#c799ff]/15 rounded-xl px-4 py-3 text-[#ecedf6] font-body"
              />
            </div>
          </div>

          {/* Calculate Button */}
          <div className="flex justify-center mb-8">
            <button 
              onClick={calculateFire}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-[#c799ff] to-[#bc87fe] rounded-full text-[#340064] font-headline font-bold text-lg hover:shadow-[0_0_30px_rgba(199,153,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#340064]/30 border-t-[#340064] rounded-full animate-spin"></div>
                  Calculating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">calculate</span>
                  Calculate FIRE Plan
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#22262f] rounded-lg text-[#a9abb3]"><span className="material-symbols-outlined text-sm">hourglass_empty</span></div>
                <h3 className="font-headline font-bold text-[#ecedf6]">Time to FIRE</h3>
              </div>
              <p className="font-headline text-5xl font-black text-[#c799ff]">
                {fireData ? retirementAge - currentAge : '--'}<span className="text-2xl text-[#a9abb3]">yrs</span>
              </p>
              <p className="text-[#a9abb3] text-sm mt-2 font-body">Expected at age {retirementAge}</p>
            </div>
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#22262f] rounded-lg text-[#a9abb3]"><span className="material-symbols-outlined text-sm">savings</span></div>
                <h3 className="font-headline font-bold text-[#ecedf6]">Savings Rate</h3>
              </div>
              <p className="font-headline text-5xl font-black text-[#4af8e3]">
                {income > 0 ? Math.round(((income - expenses) / income) * 100) : 0}<span className="text-2xl text-[#a9abb3]">%</span>
              </p>
              <p className="text-[#a9abb3] text-sm mt-2 font-body">
                {income > 0 && ((income - expenses) / income) >= 0.4 ? 'Optimal. Top decile performer.' : 'Work towards 40%+ for faster FIRE'}
              </p>
            </div>
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#22262f] rounded-lg text-[#a9abb3]"><span className="material-symbols-outlined text-sm">account_balance_wallet</span></div>
                <h3 className="font-headline font-bold text-[#ecedf6]">Current Corpus</h3>
              </div>
              <p className="font-headline text-4xl font-black mt-2">
                ₹{fireData ? (currentCorpus / 10000000).toFixed(2) : '0'}<span className="text-xl text-[#a9abb3]">Cr</span>
              </p>
              <div className="w-full bg-[#22262f] h-1.5 rounded-full mt-4 overflow-hidden">
                <div 
                  className="bg-[#c799ff] h-full rounded-full transition-all duration-500" 
                  style={{ width: fireData ? Math.min((currentCorpus / fireData.target_corpus) * 100, 100) + '%' : '0%' }}
                ></div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#c799ff]/5 rounded-full blur-3xl"></div>
            <div className="flex justify-between items-center mb-12 relative z-10">
              <h3 className="font-headline text-xl font-bold">Wealth Accumulation Trajectory</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#45484f]"></div>
                  <span className="text-xs font-label text-[#a9abb3]">Conservative (8%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#c799ff] shadow-[0_0_8px_rgba(199,153,255,0.6)]"></div>
                  <span className="text-xs font-label text-[#ecedf6] font-bold">Projected ({expectedReturn}%)</span>
                </div>
              </div>
            </div>

            <div className="relative h-64 w-full flex items-end">
              {/* Dynamic Graph */}
              <div className="absolute inset-0 z-0">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  {/* Conservative trajectory (8% return) */}
                  <path 
                    d={fireData ? generateTrajectoryPath(8, currentCorpus, fireData.target_corpus * 0.7, retirementAge - currentAge) : "M0 100 Q 20 95, 40 80 T 100 10"} 
                    fill="none" 
                    stroke="#45484f" 
                    strokeWidth="1" 
                    strokeDasharray="4 4"
                  />
                  {/* Projected trajectory (user's expected return) */}
                  <path 
                    d={fireData ? generateTrajectoryPath(expectedReturn, currentCorpus, fireData.target_corpus, retirementAge - currentAge) : "M0 100 Q 20 90, 40 60 T 100 0"} 
                    fill="none" 
                    stroke="#c799ff" 
                    strokeWidth="3" 
                    className="drop-shadow-[0_0_8px_rgba(199,153,255,0.6)]"
                  />
                </svg>
              </div>
              
              {/* Year 5 Milestone Marker */}
              {fireData && (
                <div 
                  className="absolute text-center z-10 hidden md:block"
                  style={{ 
                    left: `${Math.min(40, 100 / (retirementAge - currentAge) * 5)}%`, 
                    top: `${100 - (getCorpusAtYear(5, expectedReturn, currentCorpus, fireData.target_corpus) / fireData.target_corpus * 100)}%` 
                  }}
                >
                  <div className="w-3 h-3 bg-[#4af8e3] rounded-full shadow-[0_0_10px_rgba(74,248,227,0.8)] mx-auto mb-2"></div>
                  <div className="bg-[#22262f] border border-[#30363d] rounded-lg p-2 shadow-xl">
                    <p className="text-[10px] font-label text-[#a9abb3] uppercase tracking-widest">Year 5 Milestone</p>
                    <p className="font-headline font-bold">₹{(getCorpusAtYear(5, expectedReturn, currentCorpus, fireData.target_corpus) / 10000000).toFixed(1)} Cr</p>
                  </div>
                </div>
              )}
              
              {/* FIRE Goal Marker */}
              {fireData && (
                <div className="absolute top-0 right-0 text-center z-10 hidden md:block">
                  <div className="w-4 h-4 bg-[#c799ff] rounded-full border-4 border-[#0b0e14] shadow-[0_0_15px_rgba(199,153,255,1)] mx-auto mb-2 relative left-2"></div>
                  <div className="bg-gradient-to-br from-[#c799ff]/20 to-transparent border border-[#c799ff]/50 rounded-lg p-3 backdrop-blur-md">
                    <p className="text-[10px] font-label text-[#c799ff] uppercase tracking-widest font-bold">FIRE Achieved (Age {retirementAge})</p>
                    <p className="font-headline text-2xl font-black">₹{(fireData.target_corpus / 10000000).toFixed(1)} Cr</p>
                  </div>
                </div>
              )}

              {/* Grid Lines */}
              <div className="w-full h-full flex flex-col justify-between absolute inset-0 pointer-events-none opacity-20">
                <div className="border-t border-[#45484f] w-full"></div>
                <div className="border-t border-[#45484f] w-full"></div>
                <div className="border-t border-[#45484f] w-full"></div>
                <div className="border-t border-[#45484f] w-full"></div>
                <div className="border-t border-[#45484f] w-full border-opacity-100"></div>
              </div>
            </div>
            <div className="flex justify-between mt-4 text-[#a9abb3] text-xs font-label uppercase tracking-widest relative z-10">
              <span>Today (Age {currentAge})</span>
              <span>Year {Math.min(5, retirementAge - currentAge)} (Age {Math.min(currentAge + 5, retirementAge)})</span>
              <span>FIRE (Age {retirementAge})</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-6">
              <h4 className="font-headline font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4af8e3]">tune</span>
                Assumptions & Levers
              </h4>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2"><span className="text-[#a9abb3] font-label">Inflation Rate</span><span className="font-bold">6.0%</span></div>
                  <input type="range" className="w-full accent-[#c799ff]" disabled value="6" min="4" max="10"/>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2"><span className="text-[#a9abb3] font-label">Post-FIRE Return</span><span className="font-bold text-[#4af8e3]">8.5%</span></div>
                  <input type="range" className="w-full accent-[#4af8e3]" disabled value="8.5" min="6" max="12" step="0.5"/>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2"><span className="text-[#a9abb3] font-label">Withdrawal Rate (SWR)</span><span className="font-bold text-[#f85149]">3.5%</span></div>
                  <input type="range" className="w-full accent-[#f85149]" disabled value="3.5" min="2" max="5" step="0.1"/>
                </div>
              </div>
            </div>
            
            <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-[#c799ff]/5 to-transparent">
              <h4 className="font-headline font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c799ff]">insights</span>
                AI Strategic Insight
              </h4>
              <p className="text-[#ecedf6] font-body leading-relaxed text-sm mb-4">
                Your current SWR of 3.5% is highly conservative and safe for a 40+ year retirement in India, assuming 6% inflation. 
              </p>
              <div className="p-4 bg-[#22262f]/50 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#4af8e3] text-sm mt-0.5">check_circle</span>
                  <p className="text-xs text-[#a9abb3]">You have padded your corpus by ₹1.2Cr above the mathematical minimum.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#ff6e84] text-sm mt-0.5">warning</span>
                  <p className="text-xs text-[#a9abb3]">If global markets underperform by 2% annually, FIRE will be delayed to Age 45.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Finance Chatbot */}
      <div>
        <FinanceChatbot 
          context={fireData}
          page="fire"
        />
      </div>
    </div>
  )
}