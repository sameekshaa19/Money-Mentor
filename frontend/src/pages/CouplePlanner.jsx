import { useState } from 'react';
import useFinance from '../hooks/useFinance';
import FinanceChatbot from './FinanceChatbot';

export default function CouplePlanner() {
  const { analyzeCouple, coupleAnalysis, loading } = useFinance();
  
  // Form states for Partner A
  const [partnerA, setPartnerA] = useState({
    name: '',
    age: 30,
    monthly_income: '',
    monthly_expenses: '',
    basic_salary: '',
    hra_received: '',
    rent_paid: '',
    city: '',
    tax_bracket: 30,
    has_chronic_condition: false,
    current_health_cover: '',
    savings: '',
    mf_value: '',
    pf_balance: '',
    nps_balance: '',
    property_value: '',
    gold_value: '',
    home_loan_outstanding: '',
    car_loan: '',
    credit_card_debt: '',
    other_loans: ''
  });

  // Form states for Partner B  
  const [partnerB, setPartnerB] = useState({
    name: '',
    age: 30,
    monthly_income: '',
    monthly_expenses: '',
    basic_salary: '',
    hra_received: '',
    rent_paid: '',
    city: '',
    tax_bracket: 30,
    has_chronic_condition: false,
    current_health_cover: '',
    savings: '',
    mf_value: '',
    pf_balance: '',
    nps_balance: '',
    property_value: '',
    gold_value: '',
    home_loan_outstanding: '',
    car_loan: '',
    credit_card_debt: '',
    other_loans: ''
  });

  const [monthlySipTarget, setMonthlySipTarget] = useState(50000);

  const handleAnalyze = async () => {
    const result = await analyzeCouple({
      partner_a: partnerA,
      partner_b: partnerB,
      monthly_sip_target: monthlySipTarget
    });
    if (result) {
      console.log('Couple analysis result:', result);
    }
  };

  const formatCurrency = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

  return (
    <div className="section-page active fade-up">
      <div className="relative min-h-screen pt-10 pb-32">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="mb-12 fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <span className="flex h-2 w-2 rounded-full bg-[#4af8e3] animate-pulse"></span>
              <span className="text-[#4af8e3] font-label text-xs font-bold tracking-widest uppercase">Couple Finance Engine Active</span>
            </div>
            <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter text-[#ecedf6] leading-none mb-4">
              Couple's <span className="text-[#4af8e3]">Planner</span>
            </h1>
            <p className="text-[#a9abb3] text-lg font-body">Optimize your finances together. Tax planning, investment allocation, and insurance recommendations for couples.</p>
          </div>

          {/* Input Forms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Partner A Form */}
            <div className="glass-card rounded-2xl p-6 fade-up">
              <h3 className="font-headline text-xl font-bold text-[#ecedf6] mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#c799ff]/30 border-4 border-[#0b0e14] flex items-center justify-center text-sm font-bold text-[#c799ff]">A</div>
                Partner A
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-2">Name</label>
                    <input 
                      type="text" 
                      value={partnerA.name}
                      onChange={(e) => setPartnerA({...partnerA, name: e.target.value})}
                      className="w-full bg-white/5 border border-[#c799ff]/15 rounded-xl px-4 py-3 text-[#ecedf6] font-body"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-2">Age</label>
                    <input 
                      type="number" 
                      value={partnerA.age}
                      onChange={(e) => setPartnerA({...partnerA, age: Number(e.target.value)})}
                      className="w-full bg-white/5 border border-[#c799ff]/15 rounded-xl px-4 py-3 text-[#ecedf6] font-body"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-2">City</label>
                  <input 
                    type="text" 
                    value={partnerA.city}
                    onChange={(e) => setPartnerA({...partnerA, city: e.target.value})}
                    className="w-full bg-white/5 border border-[#c799ff]/15 rounded-xl px-4 py-3 text-[#ecedf6] font-body"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-2">Basic Salary</label>
                    <input 
                      type="number" 
                      value={partnerA.basic_salary}
                      placeholder="0"
                      onChange={(e) => setPartnerA({...partnerA, basic_salary: e.target.value === '' ? '' : Number(e.target.value)})}
                      className="w-full bg-white/5 border border-[#c799ff]/15 rounded-xl px-4 py-3 text-[#ecedf6] font-body"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-2">HRA Received</label>
                    <input 
                      type="number" 
                      value={partnerA.hra_received}
                      placeholder="0"
                      onChange={(e) => setPartnerA({...partnerA, hra_received: e.target.value === '' ? '' : Number(e.target.value)})}
                      className="w-full bg-white/5 border border-[#c799ff]/15 rounded-xl px-4 py-3 text-[#ecedf6] font-body"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-2">Rent Paid</label>
                    <input 
                      type="number" 
                      value={partnerA.rent_paid}
                      placeholder="0"
                      onChange={(e) => setPartnerA({...partnerA, rent_paid: e.target.value === '' ? '' : Number(e.target.value)})}
                      className="w-full bg-white/5 border border-[#c799ff]/15 rounded-xl px-4 py-3 text-[#ecedf6] font-body"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-2">Monthly Income</label>
                    <input 
                      type="number" 
                      value={partnerA.monthly_income}
                      placeholder="0"
                      onChange={(e) => setPartnerA({...partnerA, monthly_income: e.target.value === '' ? '' : Number(e.target.value)})}
                      className="w-full bg-white/5 border border-[#c799ff]/15 rounded-xl px-4 py-3 text-[#ecedf6] font-body"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-2">Monthly Expenses</label>
                    <input 
                      type="number" 
                      value={partnerA.monthly_expenses}
                      placeholder="0"
                      onChange={(e) => setPartnerA({...partnerA, monthly_expenses: e.target.value === '' ? '' : Number(e.target.value)})}
                      className="w-full bg-white/5 border border-[#c799ff]/15 rounded-xl px-4 py-3 text-[#ecedf6] font-body"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-2">Tax Bracket (%)</label>
                    <select 
                      value={partnerA.tax_bracket}
                      onChange={(e) => setPartnerA({...partnerA, tax_bracket: Number(e.target.value)})}
                      className="w-full bg-white/5 border border-[#c799ff]/15 rounded-xl px-4 py-3 text-[#ecedf6] font-body"
                    >
                      <option value={0}>0%</option>
                      <option value={5}>5%</option>
                      <option value={10}>10%</option>
                      <option value={20}>20%</option>
                      <option value={30}>30%</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={partnerA.has_chronic_condition}
                    onChange={(e) => setPartnerA({...partnerA, has_chronic_condition: e.target.checked})}
                    className="w-4 h-4 rounded"
                  />
                  <label className="text-sm text-[#a9abb3] font-body">Has chronic health condition</label>
                </div>

                <div>
                  <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-2">Current Health Cover</label>
                  <input 
                    type="number" 
                    value={partnerA.current_health_cover}
                    placeholder="0"
                    onChange={(e) => setPartnerA({...partnerA, current_health_cover: e.target.value === '' ? '' : Number(e.target.value)})}
                    className="w-full bg-white/5 border border-[#c799ff]/15 rounded-xl px-4 py-3 text-[#ecedf6] font-body"
                  />
                </div>

                <div className="border-t border-[#22262f]/30 pt-4">
                  <h4 className="font-headline text-sm font-bold text-[#ecedf6] mb-3">Assets & Liabilities</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-1">Savings</label>
                      <input 
                        type="number" 
                        value={partnerA.savings}
                        placeholder="0"
                        onChange={(e) => setPartnerA({...partnerA, savings: e.target.value === '' ? '' : Number(e.target.value)})}
                        className="w-full bg-white/5 border border-[#c799ff]/15 rounded-lg px-3 py-2 text-[#ecedf6] font-body text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-1">Mutual Funds</label>
                      <input 
                        type="number" 
                        value={partnerA.mf_value}
                        placeholder="0"
                        onChange={(e) => setPartnerA({...partnerA, mf_value: e.target.value === '' ? '' : Number(e.target.value)})}
                        className="w-full bg-white/5 border border-[#c799ff]/15 rounded-lg px-3 py-2 text-[#ecedf6] font-body text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-1">PF Balance</label>
                      <input 
                        type="number" 
                        value={partnerA.pf_balance}
                        placeholder="0"
                        onChange={(e) => setPartnerA({...partnerA, pf_balance: e.target.value === '' ? '' : Number(e.target.value)})}
                        className="w-full bg-white/5 border border-[#c799ff]/15 rounded-lg px-3 py-2 text-[#ecedf6] font-body text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-1">NPS Balance</label>
                      <input 
                        type="number" 
                        value={partnerA.nps_balance}
                        placeholder="0"
                        onChange={(e) => setPartnerA({...partnerA, nps_balance: e.target.value === '' ? '' : Number(e.target.value)})}
                        className="w-full bg-white/5 border border-[#c799ff]/15 rounded-lg px-3 py-2 text-[#ecedf6] font-body text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-1">Property Value</label>
                      <input 
                        type="number" 
                        value={partnerA.property_value}
                        placeholder="0"
                        onChange={(e) => setPartnerA({...partnerA, property_value: e.target.value === '' ? '' : Number(e.target.value)})}
                        className="w-full bg-white/5 border border-[#c799ff]/15 rounded-lg px-3 py-2 text-[#ecedf6] font-body text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-1">Gold Value</label>
                      <input 
                        type="number" 
                        value={partnerA.gold_value}
                        placeholder="0"
                        onChange={(e) => setPartnerA({...partnerA, gold_value: e.target.value === '' ? '' : Number(e.target.value)})}
                        className="w-full bg-white/5 border border-[#c799ff]/15 rounded-lg px-3 py-2 text-[#ecedf6] font-body text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-1">Home Loan</label>
                      <input 
                        type="number" 
                        value={partnerA.home_loan_outstanding}
                        placeholder="0"
                        onChange={(e) => setPartnerA({...partnerA, home_loan_outstanding: e.target.value === '' ? '' : Number(e.target.value)})}
                        className="w-full bg-white/5 border border-[#c799ff]/15 rounded-lg px-3 py-2 text-[#ecedf6] font-body text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-1">Other Loans</label>
                      <input 
                        type="number" 
                        value={partnerA.other_loans}
                        placeholder="0"
                        onChange={(e) => setPartnerA({...partnerA, other_loans: e.target.value === '' ? '' : Number(e.target.value)})}
                        className="w-full bg-white/5 border border-[#c799ff]/15 rounded-lg px-3 py-2 text-[#ecedf6] font-body text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Partner B Form */}
            <div className="glass-card rounded-2xl p-6 fade-up">
              <h3 className="font-headline text-xl font-bold text-[#ecedf6] mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#4af8e3]/30 border-4 border-[#0b0e14] flex items-center justify-center text-sm font-bold text-[#4af8e3]">S</div>
                Partner B
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-2">Name</label>
                    <input 
                      type="text" 
                      value={partnerB.name}
                      onChange={(e) => setPartnerB({...partnerB, name: e.target.value})}
                      className="w-full bg-white/5 border border-[#4af8e3]/15 rounded-xl px-4 py-3 text-[#ecedf6] font-body"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-2">Age</label>
                    <input 
                      type="number" 
                      value={partnerB.age}
                      onChange={(e) => setPartnerB({...partnerB, age: Number(e.target.value)})}
                      className="w-full bg-white/5 border border-[#4af8e3]/15 rounded-xl px-4 py-3 text-[#ecedf6] font-body"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-2">City</label>
                  <input 
                    type="text" 
                    value={partnerB.city}
                    onChange={(e) => setPartnerB({...partnerB, city: e.target.value})}
                    className="w-full bg-white/5 border border-[#4af8e3]/15 rounded-xl px-4 py-3 text-[#ecedf6] font-body"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-2">Basic Salary</label>
                    <input 
                      type="number" 
                      value={partnerB.basic_salary}
                      placeholder="0"
                      onChange={(e) => setPartnerB({...partnerB, basic_salary: e.target.value === '' ? '' : Number(e.target.value)})}
                      className="w-full bg-white/5 border border-[#4af8e3]/15 rounded-xl px-4 py-3 text-[#ecedf6] font-body"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-2">HRA Received</label>
                    <input 
                      type="number" 
                      value={partnerB.hra_received}
                      placeholder="0"
                      onChange={(e) => setPartnerB({...partnerB, hra_received: e.target.value === '' ? '' : Number(e.target.value)})}
                      className="w-full bg-white/5 border border-[#4af8e3]/15 rounded-xl px-4 py-3 text-[#ecedf6] font-body"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-2">Rent Paid</label>
                    <input 
                      type="number" 
                      value={partnerB.rent_paid}
                      placeholder="0"
                      onChange={(e) => setPartnerB({...partnerB, rent_paid: e.target.value === '' ? '' : Number(e.target.value)})}
                      className="w-full bg-white/5 border border-[#4af8e3]/15 rounded-xl px-4 py-3 text-[#ecedf6] font-body"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-2">Monthly Income</label>
                    <input 
                      type="number" 
                      value={partnerB.monthly_income}
                      placeholder="0"
                      onChange={(e) => setPartnerB({...partnerB, monthly_income: e.target.value === '' ? '' : Number(e.target.value)})}
                      className="w-full bg-white/5 border border-[#4af8e3]/15 rounded-xl px-4 py-3 text-[#ecedf6] font-body"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-2">Monthly Expenses</label>
                    <input 
                      type="number" 
                      value={partnerB.monthly_expenses}
                      placeholder="0"
                      onChange={(e) => setPartnerB({...partnerB, monthly_expenses: e.target.value === '' ? '' : Number(e.target.value)})}
                      className="w-full bg-white/5 border border-[#4af8e3]/15 rounded-xl px-4 py-3 text-[#ecedf6] font-body"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-2">Tax Bracket (%)</label>
                    <select 
                      value={partnerB.tax_bracket}
                      onChange={(e) => setPartnerB({...partnerB, tax_bracket: Number(e.target.value)})}
                      className="w-full bg-white/5 border border-[#4af8e3]/15 rounded-xl px-4 py-3 text-[#ecedf6] font-body"
                    >
                      <option value={0}>0%</option>
                      <option value={5}>5%</option>
                      <option value={10}>10%</option>
                      <option value={20}>20%</option>
                      <option value={30}>30%</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={partnerB.has_chronic_condition}
                    onChange={(e) => setPartnerB({...partnerB, has_chronic_condition: e.target.checked})}
                    className="w-4 h-4 rounded"
                  />
                  <label className="text-sm text-[#a9abb3] font-body">Has chronic health condition</label>
                </div>

                <div>
                  <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-2">Current Health Cover</label>
                  <input 
                    type="number" 
                    value={partnerB.current_health_cover}
                    placeholder="0"
                    onChange={(e) => setPartnerB({...partnerB, current_health_cover: e.target.value === '' ? '' : Number(e.target.value)})}
                    className="w-full bg-white/5 border border-[#4af8e3]/15 rounded-xl px-4 py-3 text-[#ecedf6] font-body"
                  />
                </div>

                <div className="border-t border-[#22262f]/30 pt-4">
                  <h4 className="font-headline text-sm font-bold text-[#ecedf6] mb-3">Assets & Liabilities</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-1">Savings</label>
                      <input 
                        type="number" 
                        value={partnerB.savings}
                        placeholder="0"
                        onChange={(e) => setPartnerB({...partnerB, savings: e.target.value === '' ? '' : Number(e.target.value)})}
                        className="w-full bg-white/5 border border-[#4af8e3]/15 rounded-lg px-3 py-2 text-[#ecedf6] font-body text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-1">Mutual Funds</label>
                      <input 
                        type="number" 
                        value={partnerB.mf_value}
                        placeholder="0"
                        onChange={(e) => setPartnerB({...partnerB, mf_value: e.target.value === '' ? '' : Number(e.target.value)})}
                        className="w-full bg-white/5 border border-[#4af8e3]/15 rounded-lg px-3 py-2 text-[#ecedf6] font-body text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-1">PF Balance</label>
                      <input 
                        type="number" 
                        value={partnerB.pf_balance}
                        placeholder="0"
                        onChange={(e) => setPartnerB({...partnerB, pf_balance: e.target.value === '' ? '' : Number(e.target.value)})}
                        className="w-full bg-white/5 border border-[#4af8e3]/15 rounded-lg px-3 py-2 text-[#ecedf6] font-body text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-1">NPS Balance</label>
                      <input 
                        type="number" 
                        value={partnerB.nps_balance}
                        placeholder="0"
                        onChange={(e) => setPartnerB({...partnerB, nps_balance: e.target.value === '' ? '' : Number(e.target.value)})}
                        className="w-full bg-white/5 border border-[#4af8e3]/15 rounded-lg px-3 py-2 text-[#ecedf6] font-body text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-1">Property Value</label>
                      <input 
                        type="number" 
                        value={partnerB.property_value}
                        placeholder="0"
                        onChange={(e) => setPartnerB({...partnerB, property_value: e.target.value === '' ? '' : Number(e.target.value)})}
                        className="w-full bg-white/5 border border-[#4af8e3]/15 rounded-lg px-3 py-2 text-[#ecedf6] font-body text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-1">Gold Value</label>
                      <input 
                        type="number" 
                        value={partnerB.gold_value}
                        placeholder="0"
                        onChange={(e) => setPartnerB({...partnerB, gold_value: e.target.value === '' ? '' : Number(e.target.value)})}
                        className="w-full bg-white/5 border border-[#4af8e3]/15 rounded-lg px-3 py-2 text-[#ecedf6] font-body text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-1">Home Loan</label>
                      <input 
                        type="number" 
                        value={partnerB.home_loan_outstanding}
                        placeholder="0"
                        onChange={(e) => setPartnerB({...partnerB, home_loan_outstanding: e.target.value === '' ? '' : Number(e.target.value)})}
                        className="w-full bg-white/5 border border-[#4af8e3]/15 rounded-lg px-3 py-2 text-[#ecedf6] font-body text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-label text-[#a9abb3] uppercase tracking-widest block mb-1">Other Loans</label>
                      <input 
                        type="number" 
                        value={partnerB.other_loans}
                        placeholder="0"
                        onChange={(e) => setPartnerB({...partnerB, other_loans: e.target.value === '' ? '' : Number(e.target.value)})}
                        className="w-full bg-white/5 border border-[#4af8e3]/15 rounded-lg px-3 py-2 text-[#ecedf6] font-body text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Monthly SIP Target */}
          <div className="glass-card rounded-2xl p-6 mb-8 fade-up">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-headline text-lg font-bold text-[#ecedf6]">Monthly SIP Target</h3>
                <p className="text-[#a9abb3] text-sm font-label">Total monthly investment amount for optimal allocation</p>
              </div>
              <div className="flex items-center gap-4">
                <input 
                  type="number" 
                  value={monthlySipTarget}
                  placeholder="50000"
                  onChange={(e) => setMonthlySipTarget(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-32 bg-white/5 border border-[#c799ff]/15 rounded-xl px-4 py-3 text-[#ecedf6] font-body text-right"
                />
                <button 
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-[#4af8e3] to-[#33e9d5] rounded-full text-[#0b0e14] font-headline font-bold hover:shadow-[0_0_20px_rgba(74,248,227,0.3)] transition-all disabled:opacity-50"
                >
                  {loading ? 'Analyzing...' : 'Analyze Couple'}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {coupleAnalysis && (
            <div className="space-y-8 fade-up">
              {/* HRA Optimization */}
              {coupleAnalysis.hra_optimization && (
                <div className="glass-card rounded-2xl p-8">
                  <h3 className="font-headline text-xl font-bold text-[#ecedf6] mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#c799ff]">home</span>
                    HRA Optimization
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-[#22262f]/30 rounded-xl">
                      <p className="text-xs font-label text-[#a9abb3] uppercase tracking-widest mb-2">Partner A Exemption</p>
                      <p className="font-headline text-2xl font-bold text-[#c799ff]">{formatCurrency(coupleAnalysis.hra_optimization.partner_a_exemption)}</p>
                      <p className="text-xs text-[#a9abb3] mt-1">Tax saved: {formatCurrency(coupleAnalysis.hra_optimization.partner_a_tax_saved)}</p>
                    </div>
                    <div className="text-center p-4 bg-[#22262f]/30 rounded-xl">
                      <p className="text-xs font-label text-[#a9abb3] uppercase tracking-widest mb-2">Partner B Exemption</p>
                      <p className="font-headline text-2xl font-bold text-[#4af8e3]">{formatCurrency(coupleAnalysis.hra_optimization.partner_b_exemption)}</p>
                      <p className="text-xs text-[#a9abb3] mt-1">Tax saved: {formatCurrency(coupleAnalysis.hra_optimization.partner_b_tax_saved)}</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-[#c799ff]/10 to-transparent rounded-xl border border-[#c799ff]/30">
                      <p className="text-xs font-label text-[#c799ff] uppercase tracking-widest mb-2">Recommended Claimant</p>
                      <p className="font-headline text-2xl font-bold text-[#c799ff]">Partner {coupleAnalysis.hra_optimization.recommended_claimant}</p>
                      <p className="text-xs text-[#a9abb3] mt-1">Additional saving: {formatCurrency(coupleAnalysis.hra_optimization.additional_saving_if_optimized)}</p>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-[#22262f]/20 rounded-xl">
                    <p className="text-sm text-[#a9abb3] font-body leading-relaxed">{coupleAnalysis.hra_optimization.explanation}</p>
                  </div>
                </div>
              )}

              {/* NPS Optimization */}
              {coupleAnalysis.nps_optimization && (
                <div className="glass-card rounded-2xl p-8">
                  <h3 className="font-headline text-xl font-bold text-[#ecedf6] mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#33e9d5]">savings</span>
                    NPS Tax Optimization
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-[#22262f]/30 rounded-xl">
                      <p className="text-xs font-label text-[#a9abb3] uppercase tracking-widest mb-2">Partner A NPS</p>
                      <p className="font-headline text-2xl font-bold text-[#33e9d5]">{formatCurrency(coupleAnalysis.nps_optimization.partner_a_recommended_contribution)}</p>
                      <p className="text-xs text-[#a9abb3] mt-1">Tax saved: {formatCurrency(coupleAnalysis.nps_optimization.partner_a_tax_saving)}</p>
                    </div>
                    <div className="text-center p-4 bg-[#22262f]/30 rounded-xl">
                      <p className="text-xs font-label text-[#a9abb3] uppercase tracking-widest mb-2">Partner B NPS</p>
                      <p className="font-headline text-2xl font-bold text-[#33e9d5]">{formatCurrency(coupleAnalysis.nps_optimization.partner_b_recommended_contribution)}</p>
                      <p className="text-xs text-[#a9abb3] mt-1">Tax saved: {formatCurrency(coupleAnalysis.nps_optimization.partner_b_tax_saving)}</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-[#33e9d5]/10 to-transparent rounded-xl border border-[#33e9d5]/30">
                      <p className="text-xs font-label text-[#33e9d5] uppercase tracking-widest mb-2">Total Household Saving</p>
                      <p className="font-headline text-2xl font-bold text-[#33e9d5]">{formatCurrency(coupleAnalysis.nps_optimization.total_household_nps_saving)}</p>
                      <p className="text-xs text-[#a9abb3] mt-1">Per year</p>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-[#22262f]/20 rounded-xl">
                    <p className="text-sm text-[#a9abb3] font-body leading-relaxed">
                      Both partners can invest ₹50,000 each in NPS under Section 80CCD(1B) for additional tax benefits over and above the ₹1.5L 80C limit.
                    </p>
                  </div>
                </div>
              )}

              {/* SIP Split */}
              {coupleAnalysis.sip_split && (
                <div className="glass-card rounded-2xl p-8">
                  <h3 className="font-headline text-xl font-bold text-[#ecedf6] mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#4af8e3]">account_balance</span>
                    SIP Allocation Strategy
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center p-4 bg-[#22262f]/30 rounded-xl">
                      <p className="text-xs font-label text-[#a9abb3] uppercase tracking-widest mb-2">Partner A SIP</p>
                      <p className="font-headline text-3xl font-bold text-[#c799ff]">{formatCurrency(coupleAnalysis.sip_split.partner_a_sip)}</p>
                      <p className="text-xs text-[#a9abb3] mt-2">per month</p>
                    </div>
                    <div className="text-center p-4 bg-[#22262f]/30 rounded-xl">
                      <p className="text-xs font-label text-[#a9abb3] uppercase tracking-widest mb-2">Partner B SIP</p>
                      <p className="font-headline text-3xl font-bold text-[#4af8e3]">{formatCurrency(coupleAnalysis.sip_split.partner_b_sip)}</p>
                      <p className="text-xs text-[#a9abb3] mt-2">per month</p>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-[#22262f]/20 rounded-xl">
                    <p className="text-sm text-[#a9abb3] font-body leading-relaxed mb-3">{coupleAnalysis.sip_split.reasoning}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-label text-[#a9abb3] uppercase tracking-widest">Split Ratio</span>
                      <span className="font-headline text-lg font-bold text-[#c799ff]">{coupleAnalysis.sip_split.split_ratio}</span>
                    </div>
                    {coupleAnalysis.sip_split.annual_tax_saving_from_split > 0 && (
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs font-label text-[#a9abb3] uppercase tracking-widest">Estimated Annual Tax Saving</span>
                        <span className="font-headline text-lg font-bold text-[#4af8e3]">{formatCurrency(coupleAnalysis.sip_split.annual_tax_saving_from_split)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Health Insurance */}
              {coupleAnalysis.health_insurance && (
                <div className="glass-card rounded-2xl p-8">
                  <h3 className="font-headline text-xl font-bold text-[#ecedf6] mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ff6e84]">health_and_safety</span>
                    Health Insurance Recommendation
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center p-4 bg-[#22262f]/30 rounded-xl">
                      <p className="text-xs font-label text-[#a9abb3] uppercase tracking-widest mb-2">Recommended Type</p>
                      <p className="font-headline text-2xl font-bold capitalize text-[#ff6e84]">{coupleAnalysis.health_insurance.recommendation}</p>
                    </div>
                    <div className="text-center p-4 bg-[#22262f]/30 rounded-xl">
                      <p className="text-xs font-label text-[#a9abb3] uppercase tracking-widest mb-2">Recommended Cover</p>
                      <p className="font-headline text-2xl font-bold text-[#ff6e84]">{formatCurrency(coupleAnalysis.health_insurance.recommended_cover)}</p>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-[#22262f]/20 rounded-xl">
                    <p className="text-sm text-[#a9abb3] font-body leading-relaxed mb-3">{coupleAnalysis.health_insurance.reasoning}</p>
                    {coupleAnalysis.health_insurance.current_gap > 0 && (
                      <div className="p-3 bg-[#ff6e84]/10 rounded-lg border border-[#ff6e84]/30">
                        <p className="text-sm font-bold text-[#ff6e84]">Coverage Gap: {formatCurrency(coupleAnalysis.health_insurance.current_gap)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Net Worth */}
              {coupleAnalysis.net_worth && (
                <div className="glass-card rounded-2xl p-8">
                  <h3 className="font-headline text-xl font-bold text-[#ecedf6] mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#c799ff]">trending_up</span>
                    Combined Net Worth
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center p-4 bg-[#22262f]/30 rounded-xl">
                      <p className="text-xs font-label text-[#a9abb3] uppercase tracking-widest mb-2">Partner A Net Worth</p>
                      <p className="font-headline text-2xl font-bold text-[#c799ff]">
                        {formatCurrency(coupleAnalysis.net_worth.partner_a_assets - coupleAnalysis.net_worth.partner_a_liabilities)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-[#22262f]/30 rounded-xl">
                      <p className="text-xs font-label text-[#a9abb3] uppercase tracking-widest mb-2">Partner B Net Worth</p>
                      <p className="font-headline text-2xl font-bold text-[#4af8e3]">
                        {formatCurrency(coupleAnalysis.net_worth.partner_b_assets - coupleAnalysis.net_worth.partner_b_liabilities)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-[#c799ff]/10 to-transparent rounded-xl border border-[#c799ff]/30">
                      <p className="text-xs font-label text-[#c799ff] uppercase tracking-widest mb-2">Combined Net Worth</p>
                      <p className="font-headline text-3xl font-bold text-[#c799ff]">{formatCurrency(coupleAnalysis.net_worth.net_worth)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-headline text-sm font-bold text-[#ecedf6] mb-3">Assets Breakdown</h4>
                      <div className="space-y-2">
                        {Object.entries(coupleAnalysis.net_worth.asset_breakdown).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-[#a9abb3] capitalize">{key.replace(/_/g, ' ')}</span>
                            <span className="text-[#ecedf6] font-bold">{formatCurrency(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-headline text-sm font-bold text-[#ecedf6] mb-3">Liabilities Breakdown</h4>
                      <div className="space-y-2">
                        {Object.entries(coupleAnalysis.net_worth.liability_breakdown).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-[#a9abb3] capitalize">{key.replace(/_/g, ' ')}</span>
                            <span className="text-[#f85149] font-bold">{formatCurrency(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Finance Chatbot */}
              <div>
                <FinanceChatbot 
                  context={coupleAnalysis}
                  page="couples"
                  profiles={{ partnerA, partnerB }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}