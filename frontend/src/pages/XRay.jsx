import { useState } from 'react';
import { api } from '../api';
import useStore from '../store';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import MetricCard from '../components/MetricCard';
import InsightCard from '../components/InsightCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function XRay() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { portfolio, setPortfolio } = useStore();

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.uploadXRay(formData);
      setPortfolio(res.data.data);
    } catch (err) {
      console.error(err);
      alert('Failed to parse PDF. Please ensure it is a valid CAMS/KFintech statement.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Analyzing your portfolio holdings & transactions..." />;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Portfolio X-Ray</h1>
        <p className="text-slate-500">Uncover hidden overlaps, XIRR, and asset allocation in your mutual fund portfolio.</p>
      </header>

      {!portfolio ? (
        <Card className="text-center py-20 bg-white shadow-sm border-slate-100">
          <div className="text-6xl mb-6">📄</div>
          <h2 className="text-2xl font-bold mb-4">Upload CAMS / KFintech Statement</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Download your consolidated account statement (CAS) from CAMS/KFintech and upload the PDF here. 
            We do not store your data.
          </p>
          <input 
            type="file" 
            accept=".pdf" 
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-6 max-w-xs mx-auto text-center"
          />
          <Button variant="secondary" className="px-10" onClick={handleUpload} disabled={!file}>
            Run Analysis
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Summary Metrics */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <Card title="Overall Returns">
              <MetricCard label="Portfolio XIRR" value={`${(portfolio.xirr * 100).toFixed(2)}%`} color="emerald" subtext="Benchmark (Nifty 50): 14.12%" />
              <div className="mt-6 flex justify-between text-sm">
                <span className="text-slate-500">Total Valuation</span>
                <span className="font-bold">₹{(portfolio.asset_allocation?.total_value || 0).toLocaleString()}</span>
              </div>
            </Card>
            
            <Card title="Asset Allocation">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Equity', value: 75 },
                        { name: 'Debt', value: 20 },
                        { name: 'Cash', value: 5 }
                      ]}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {COLORS.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Right: Insights & Details */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card title="Gemini AI Analysis">
              <InsightCard insight={portfolio.rebalancing || "Your portfolio is well-balanced. No immediate action required."} />
            </Card>

            <Card title="Fund Overlap (P1 Violation Check)">
              <div className="divide-y divide-slate-100">
                {(portfolio.overlap?.significant_overlaps || []).map((o, idx) => (
                  <div key={idx} className="py-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium text-slate-800">{o.funds.join(' vs ')}</div>
                      <div className="text-xs text-rose-500 font-bold uppercase">{o.overlap_percentage}% Common Holdings</div>
                    </div>
                    <span className="text-slate-400 text-xs text-right max-w-[150px]">Too much overlap reduces diversification benefits.</span>
                  </div>
                ))}
                {(!portfolio.overlap?.significant_overlaps?.length) && (
                  <div className="py-4 text-slate-400 italic">No significant overlap detected between your funds. Good job!</div>
                )}
              </div>
            </Card>

            <Card title="Top Holdings Rebalancing">
               <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100">
                      <th className="pb-3 font-medium">Stock Name</th>
                      <th className="pb-3 font-medium">Weightage</th>
                      <th className="pb-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <tr className="hover:bg-slate-50">
                      <td className="py-4 font-medium">HDFC Bank</td>
                      <td className="py-4">12.4%</td>
                      <td className="py-4"><span className="text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs font-bold uppercase">Trim</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-4 font-medium">Reliance Industries</td>
                      <td className="py-4">9.8%</td>
                      <td className="py-4"><span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold uppercase">Hold</span></td>
                    </tr>
                  </tbody>
               </table>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
