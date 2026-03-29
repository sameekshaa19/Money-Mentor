export default function FirePlanner() {
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
              <p className="font-headline text-4xl font-black text-[#4af8e3]">₹8.5<span className="text-xl text-[#33e9d5]">Cr</span></p>
              <div className="flex items-center gap-2 mt-2">
                <span className="material-symbols-outlined text-[#c799ff] text-sm">trending_up</span>
                <span className="text-[#ecedf6] font-label text-xs">Tracking 14% ahead of baseline</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#22262f] rounded-lg text-[#a9abb3]"><span className="material-symbols-outlined text-sm">hourglass_empty</span></div>
                <h3 className="font-headline font-bold text-[#ecedf6]">Time to FIRE</h3>
              </div>
              <p className="font-headline text-5xl font-black text-[#c799ff]">11<span className="text-2xl text-[#a9abb3]">yrs</span></p>
              <p className="text-[#a9abb3] text-sm mt-2 font-body">Expected at age 42</p>
            </div>
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#22262f] rounded-lg text-[#a9abb3]"><span className="material-symbols-outlined text-sm">savings</span></div>
                <h3 className="font-headline font-bold text-[#ecedf6]">Savings Rate</h3>
              </div>
              <p className="font-headline text-5xl font-black text-[#4af8e3]">46<span className="text-2xl text-[#a9abb3]">%</span></p>
              <p className="text-[#a9abb3] text-sm mt-2 font-body">Optimal. Top decile performer.</p>
            </div>
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#22262f] rounded-lg text-[#a9abb3]"><span className="material-symbols-outlined text-sm">account_balance_wallet</span></div>
                <h3 className="font-headline font-bold text-[#ecedf6]">Current Corpus</h3>
              </div>
              <p className="font-headline text-4xl font-black mt-2">₹1.48<span className="text-xl text-[#a9abb3]">Cr</span></p>
              <div className="w-full bg-[#22262f] h-1.5 rounded-full mt-4 overflow-hidden">
                <div className="bg-[#c799ff] h-full rounded-full" style={{ width: '17%' }}></div>
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
                  <span className="text-xs font-label text-[#ecedf6] font-bold">AI Projected (12%)</span>
                </div>
              </div>
            </div>

            <div className="relative h-64 w-full flex items-end">
              {/* Fake Graph */}
              <div className="absolute inset-0 z-0">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M0 100 Q 20 95, 40 80 T 100 10" fill="none" stroke="#45484f" strokeWidth="1" strokeDasharray="4 4"/>
                  <path d="M0 100 Q 20 90, 40 60 T 100 0" fill="none" stroke="#c799ff" strokeWidth="3" className="drop-shadow-[0_0_8px_rgba(199,153,255,0.6)]"/>
                </svg>
              </div>
              
              {/* Year Markers */}
              <div className="absolute top-[37%] left-[40%] text-center z-10 hidden md:block">
                <div className="w-3 h-3 bg-[#4af8e3] rounded-full shadow-[0_0_10px_rgba(74,248,227,0.8)] mx-auto mb-2"></div>
                <div className="bg-[#22262f] border border-[#30363d] rounded-lg p-2 shadow-xl">
                  <p className="text-[10px] font-label text-[#a9abb3] uppercase tracking-widest">Year 5 Milestone</p>
                  <p className="font-headline font-bold">₹3.2 Cr</p>
                </div>
              </div>
              
              {/* Goal Marker */}
              <div className="absolute top-0 right-0 text-center z-10 hidden md:block">
                <div className="w-4 h-4 bg-[#c799ff] rounded-full border-4 border-[#0b0e14] shadow-[0_0_15px_rgba(199,153,255,1)] mx-auto mb-2 relative left-2"></div>
                <div className="bg-gradient-to-br from-[#c799ff]/20 to-transparent border border-[#c799ff]/50 rounded-lg p-3 backdrop-blur-md">
                  <p className="text-[10px] font-label text-[#c799ff] uppercase tracking-widest font-bold">FIRE Achieved (Age 42)</p>
                  <p className="font-headline text-2xl font-black">₹8.5 Cr</p>
                </div>
              </div>

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
              <span>Today (Age 31)</span>
              <span>Year 5 (Age 36)</span>
              <span>FIRE (Age 42)</span>
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
    </div>
  )
}