import { useState } from 'react'
import useFinance from '../hooks/useFinance'

const LIFE_EVENTS = [
  { id: 'bonus',       label: 'Got a Bonus',         desc: 'Deploy a windfall smartly',               icon: 'redeem',         color: '#4af8e3', bg: 'rgba(74,248,227,0.1)' },
  { id: 'inheritance', label: 'Received Inheritance',desc: 'Lump sum investment strategy',            icon: 'account_balance',color: '#c799ff', bg: 'rgba(199,153,255,0.1)' },
  { id: 'marriage',    label: 'Getting Married',     desc: 'Merge finances, plan together',           icon: 'favorite',       color: '#ff6e84', bg: 'rgba(255,110,132,0.1)' },
  { id: 'baby',        label: 'New Baby',            desc: 'Insurance, education fund, will',         icon: 'child_care',     color: '#4af8e3', bg: 'rgba(74,248,227,0.1)' },
  { id: 'job_loss',    label: 'Lost My Job',         desc: 'Emergency plan, cut expenses',            icon: 'work_off',       color: '#ff6e84', bg: 'rgba(255,110,132,0.1)' },
  { id: 'home',        label: 'Buying a Home',       desc: 'EMI impact, tax benefits, SIP cuts',      icon: 'home',           color: '#c799ff', bg: 'rgba(199,153,255,0.1)' },
]

const MOCK_PROFILE = {
  monthly_income: 120000,
  monthly_expenses: 55000,
  total_investments: 850000,
  insurance_cover: 5000000,
  emergency_fund: 180000,
}

const formatVal = (v) => typeof v === 'number' ? '₹' + Number(v).toLocaleString('en-IN') : v

export default function LifeEventAdvisor() {
  const { fetchLifeEventAdvice } = useFinance();
  const [selected, setSelected] = useState(null)
  const [advice, setAdvice] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleEventClick = async (event) => {
    console.log('Event clicked:', event); // Debug log
    setSelected(event)
    setLoading(true)
    setAdvice(null)
    try {
      const adviceData = await fetchLifeEventAdvice(event.id);
      console.log('Advice data received:', adviceData); // Debug log
      if (adviceData) {
        setAdvice(adviceData)
      } else {
        throw new Error("No data returned");
      }
    } catch (err) {
      console.error('API fetch failed, using fallback', err)
      // Enhanced fallback data
      setAdvice({
        before: { 
          'Monthly SIP': 25000, 
          'Emergency Fund': 180000, 
          'Insurance': 5000000, 
          'Net Worth': 850000,
          'Monthly Expenses': 55000
        },
        after: { 
          'Monthly SIP': 35000, 
          'Emergency Fund': 300000, 
          'Insurance': 10000000, 
          'Net Worth': 1020000,
          'Monthly Expenses': event.id === 'job_loss' ? 45000 : 60000
        },
        recommendations: [
          'Review and increase your emergency fund',
          'Update your insurance coverage',
          'Adjust your monthly SIP amounts',
          'Consult a financial advisor for personalised advice',
          `Consider tax implications for ${event.label.toLowerCase()}`
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="section-page active">
      <div className="relative min-h-screen pt-10 pb-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-12 fade-up">
            <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter text-[#ecedf6] leading-none mb-4">
              Life Event <span className="text-[#4af8e3]">Advisor</span>
            </h1>
            <p className="text-[#a9abb3] text-lg font-body">Navigate life's financial crossroads with AI precision. See immediate impact on your baseline.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Event Picker Column */}
            <div className="md:col-span-5 space-y-4 fade-up">
              <h3 className="font-headline text-xl font-bold mb-4">Select Event</h3>
              {LIFE_EVENTS.map(event => {
                const isActive = selected?.id === event.id;
                return (
                  <div 
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className={`glass-card rounded-2xl p-5 border-l-4 cursor-pointer transition-all ${isActive ? 'bg-[#22262f] shadow-[0_0_20px_rgba(255,255,255,0.05)] translate-x-1' : 'hover:translate-x-1'}`}
                    style={{ borderColor: event.color }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors" style={{ background: event.bg, color: event.color }}>
                        <span className="material-symbols-outlined">{event.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-headline font-bold text-[#ecedf6] text-lg">{event.label}</h4>
                        <p className="text-[#a9abb3] text-xs font-label">{event.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Analysis Column */}
            <div className="md:col-span-7">
              {!selected ? (
                <div className="glass-card-static rounded-2xl p-12 h-full flex flex-col items-center justify-center text-center text-[#a9abb3] border-dashed">
                  <span className="material-symbols-outlined text-6xl mb-4 text-[#22262f]">hub</span>
                  <p className="font-headline text-xl font-bold text-[#ecedf6] mb-2">Awaiting Parameters</p>
                  <p className="text-sm font-label">Select a life event to trigger the simulation engine.</p>
                </div>
              ) : (
                <div className="event-detail space-y-6">
                  {loading && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-on-surface-variant)' }}>
                      <div className="spinner"></div>
                      <p style={{ marginTop: '12px', fontSize: '13px' }}>Analysing your financial shift...</p>
                    </div>
                  )}

                  {!loading && advice && (
                    <>
                      {/* Before / After Header */}
                      <div className="glass-card-static rounded-2xl overflow-hidden">
                        <div className="grid grid-cols-2 divide-x divide-[#22262f] border-b border-[#22262f]">
                          <div className="p-4 text-center">
                            <span className="text-[10px] font-bold text-[#a9abb3] uppercase tracking-widest font-label block mb-1">Baseline</span>
                            <span className="font-headline font-bold text-lg text-[#ecedf6]">Before</span>
                          </div>
                          <div className="p-4 text-center bg-[#4af8e3]/5">
                            <span className="text-[10px] font-bold text-[#4af8e3] uppercase tracking-widest font-label block mb-1">Simulated</span>
                            <span className="font-headline font-bold text-lg text-[#4af8e3]">After</span>
                          </div>
                        </div>

                        {/* Metrics Rows */}
                        <div className="divide-y divide-[#22262f]/50">
                          {Object.keys(advice.after || {}).map(key => {
                            const valBefore = advice.before?.[key] || 0;
                            const valAfter = advice.after[key];
                            return (
                              <div key={key} className="grid grid-cols-12 items-center p-4 hover:bg-[#22262f]/30 transition-colors">
                                <div className="col-span-4 text-sm font-bold text-[#a9abb3]">{key}</div>
                                <div className="col-span-3 text-right font-headline">{formatVal(valBefore)}</div>
                                <div className="col-span-2 flex justify-center text-[#45484f]"><span className="material-symbols-outlined text-sm">arrow_forward</span></div>
                                <div className="col-span-3 text-left font-headline font-bold text-[#4af8e3]">{formatVal(valAfter)}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Action Plan */}
                      <div className="glass-card-static rounded-2xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#c799ff]/10 blur-3xl rounded-full"></div>
                        <h4 className="font-headline font-bold text-xl mb-6 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#c799ff]">auto_awesome</span> Tactical Protocol
                        </h4>
                        <div className="space-y-4 relative z-10">
                          {(advice.recommendations || []).map((action, i) => (
                            <div key={i} className="flex gap-4 items-start">
                              <div className="w-6 h-6 rounded-full bg-[#c799ff]/20 text-[#c799ff] flex items-center justify-center text-xs font-bold font-label shrink-0 mt-0.5">{i + 1}</div>
                              <p className="text-[#ecedf6] text-sm font-body leading-relaxed">{action}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}