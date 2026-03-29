import { useState } from 'react';
import { api } from '../api';
import useStore from '../store';
import Card from '../components/Card';
import MetricCard from '../components/MetricCard';
import Button from '../components/Button';
import InsightCard from '../components/InsightCard';
import Loader from '../components/Loader';

const INITIAL_PARTNER = {
  name: '', age: 30, annual_income: 1200000, monthly_expenses: 30000, 
  tax_regime: 'new', hra_received: 300000, rent_paid: 240000, 
  nps_contribution: 50000, insurance_cover: 2000000, total_investments: 500000
};

const PartnerForm = ({ data, setData, label }) => (
  <Card title={label} className="glass-card text-[#ecedf6] border-none">
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold text-[#a9abb3] block mb-1">Annual Income (₹)</label>
        <input 
          type="number" value={data.annual_income} 
          onChange={(e) => setData({...data, annual_income: e.target.value === '' ? '' : Number(e.target.value)})}
          className="w-full bg-[#161a21] text-[#ecedf6] p-2 rounded border border-[#22262f] font-bold outline-none focus:border-[#4af8e3]"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-[#a9abb3] block mb-1">Monthly Rent Paid (₹)</label>
        <input 
          type="number" value={data.rent_paid} 
          onChange={(e) => setData({...data, rent_paid: e.target.value === '' ? '' : Number(e.target.value)})}
          className="w-full bg-[#161a21] text-[#ecedf6] p-2 rounded border border-[#22262f] font-bold outline-none focus:border-[#4af8e3]"
        />
      </div>
      <div className="flex gap-4">
         <div className="flex-1">
           <label className="text-xs font-bold text-[#a9abb3] block mb-1">Tax Regime</label>
           <select 
             value={data.tax_regime} 
             onChange={(e) => setData({...data, tax_regime: e.target.value})}
             className="w-full bg-[#161a21] text-[#ecedf6] p-2 rounded border border-[#22262f] text-sm outline-none focus:border-[#4af8e3]"
           >
             <option value="new">New Regime</option>
             <option value="old">Old Regime</option>
           </select>
         </div>
         <div className="flex-1">
           <label className="text-xs font-bold text-[#a9abb3] block mb-1">NPS (80CCD)</label>
           <input 
             type="number" value={data.nps_contribution} 
             onChange={(e) => setData({...data, nps_contribution: e.target.value === '' ? '' : Number(e.target.value)})}
             className="w-full bg-[#161a21] text-[#ecedf6] p-2 rounded border border-[#22262f] font-bold outline-none focus:border-[#4af8e3]"
           />
         </div>
      </div>
    </div>
  </Card>
);

export default function Couple() {
  const { couplePlan, setCouplePlan } = useStore();
  const [partnerA, setPartnerA] = useState({ ...INITIAL_PARTNER, name: 'Partner One' });
  const [partnerB, setPartnerB] = useState({ ...INITIAL_PARTNER, name: 'Partner Two' });
  const [loading, setLoading] = useState(false);

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const res = await api.getCouplePlan({ partner_a: partnerA, partner_b: partnerB });
      setCouplePlan(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Optimizing joint taxes & HRA exemption splits..." />;

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold text-[#ecedf6] mb-2">Couple Finance Optimizer</h1>
          <p className="text-[#a9abb3] font-body">Combine forces! Optimize taxes, insurance, and investments as a household.</p>
        </div>
        <button className="px-8 py-3 bg-gradient-to-r from-[#4af8e3] to-[#33e9d5] text-[#0b0e14] rounded-full font-headline font-bold hover:shadow-[0_0_20px_rgba(74,248,227,0.4)] transition-all cursor-pointer" onClick={handleOptimize}>
          Optimize Jointly
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <PartnerForm data={partnerA} setData={setPartnerA} label="Partner A Profile" />
        <PartnerForm data={partnerB} setData={setPartnerB} label="Partner B Profile" />
      </div>

      {couplePlan && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1 bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none shadow-xl">
                 <div className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Total Joint Tax Savings</div>
                 <div className="text-5xl font-black">₹{(couplePlan.tax_savings.partner_a.annual_savings + couplePlan.tax_savings.partner_b.annual_savings).toLocaleString()}</div>
                 <div className="mt-4 text-xs bg-white/20 p-2 rounded-lg">Based on AI-recommended regime split</div>
              </Card>
              
              <MetricCard label="Recommended HRA Claim" value={couplePlan.joint_plan?.hra?.recommendation || "Partner A"} subtext="Highest tax slab benefit" />
              <MetricCard label="Combined Insurance Gap" value="₹1.5 Cr" subtext="Family Floater advised" color="rose" />
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card title="Joint Investment Strategy" className="bg-slate-900 text-white">
                 <div className="space-y-4">
                    <InsightCard insight={couplePlan.joint_plan?.joint_investments || "Diversify across both portfolios to manage capital gains taxes better."} />
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                          <span className="text-xs text-slate-400 block mb-1">Equity Weight</span>
                          <span className="text-xl font-bold">70%</span>
                       </div>
                       <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                          <span className="text-xs text-slate-400 block mb-1">Debt Weight</span>
                          <span className="text-xl font-bold">30%</span>
                       </div>
                    </div>
                 </div>
              </Card>

              <Card title="Tax Hacks (P1 Priority)">
                  <div className="divide-y divide-slate-100">
                     <div className="py-3 flex justify-between">
                        <span className="text-slate-600">Regime Optimization</span>
                        <span className="font-bold text-emerald-600">Saved ₹{couplePlan.tax_savings.partner_a.annual_savings.toLocaleString()}</span>
                     </div>
                     <div className="py-3 flex justify-between">
                        <span className="text-slate-600">HRA Exemption</span>
                        <span className="font-bold">₹{couplePlan.tax_savings.partner_a.hra_exemption.toLocaleString()}</span>
                     </div>
                     <div className="py-3 flex justify-between">
                        <span className="text-slate-600">Additional NPS (80CCD)</span>
                        <span className="font-bold text-blue-600">Saved ₹15,450</span>
                     </div>
                  </div>
                  <div className="mt-6">
                     <InsightCard insight="Consider paying rent to Senior Citizen parents to maximize HRA and 80D benefits." type="success" />
                  </div>
              </Card>
           </div>
        </div>
      )}
    </div>
  );
}
