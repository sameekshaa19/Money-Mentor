import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useFinance from '../hooks/useFinance';
import FinanceChatbot from './FinanceChatbot';

export default function PortfolioXRay() {
  const { uploadXRay, portfolio, loading, error, setPortfolio, setLoading, setError } = useFinance();
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadController, setUploadController] = useState(null);

  const handleFileUpload = async (uploadedFile) => {
    if (!uploadedFile) return;
    
    // Cancel any existing upload
    if (uploadController) {
      uploadController.abort();
    }
    
    setFile(uploadedFile);
    
    // Create new abort controller
    const controller = new AbortController();
    setUploadController(controller);
    
    await uploadXRay(uploadedFile, controller.signal);
    setUploadController(null);
  };

  const cancelUpload = () => {
    if (uploadController) {
      uploadController.abort();
      setUploadController(null);
      setLoading(false);
      setError({ message: 'Upload cancelled by user' });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const formatCurrency = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
  const formatPercentage = (n) => `${(n || 0).toFixed(2)}%`;

  return (
    <div className="section-page active fade-up">
      <div className="relative min-h-screen pt-10 pb-32">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="mb-12 fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <span className="flex h-2 w-2 rounded-full bg-[#4af8e3] animate-pulse"></span>
              <span className="text-[#4af8e3] font-label text-xs font-bold tracking-widest uppercase">Portfolio X-Ray Active</span>
            </div>
            <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter text-[#ecedf6] leading-none mb-4">
              Portfolio <span className="text-[#4af8e3]">X-Ray</span>
            </h1>
            <p className="text-[#a9abb3] text-lg font-body">Upload your CAMS/KFintech statement for deep portfolio analysis with AI insights.</p>
          </div>

          {/* Upload Section */}
          {!portfolio && (
            <div className="glass-card rounded-2xl p-8 mb-8 fade-up">
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                  dragActive 
                    ? 'border-[#4af8e3] bg-[#4af8e3]/5' 
                    : 'border-[#30363d] hover:border-[#4af8e3]/50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#22262f] flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-[#4af8e3]">cloud_upload</span>
                  </div>
                  <div>
                    <h3 className="font-headline text-xl font-bold text-[#ecedf6] mb-2">
                      {dragActive ? 'Drop your statement here' : 'Upload CAMS Statement'}
                    </h3>
                    <p className="text-[#a9abb3] text-sm font-body mb-4">
                      Drag and drop your PDF statement or click to browse
                    </p>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4af8e3] to-[#33e9d5] rounded-full text-[#0b0e14] font-headline font-bold hover:shadow-[0_0_20px_rgba(74,248,227,0.3)] transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined">folder_open</span>
                      Choose File
                    </label>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-6 p-4 bg-[#f85149]/10 rounded-xl border border-[#f85149]/30">
                  <p className="text-[#f85149] text-sm font-body">Failed to process statement: {error.message}</p>
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="glass-card rounded-2xl p-12 text-center">
              <div className="w-12 h-12 border-4 border-[#4af8e3]/30 border-t-[#4af8e3] rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="font-headline text-lg font-bold text-[#ecedf6] mb-2">Analyzing Your Portfolio</h3>
              <p className="text-[#a9abb3] text-sm font-body mb-6">Parsing transactions, calculating XIRR, and generating AI insights...</p>
              <button
                onClick={cancelUpload}
                className="px-6 py-2 bg-[#ff6e84] hover:bg-[#ff5252] text-white rounded-lg font-headline font-bold transition-colors"
              >
                Cancel Upload
              </button>
            </div>
          )}

          {/* Portfolio Analysis Results */}
          {portfolio && (
            <div className="space-y-8 fade-up">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-[#4af8e3]">account_balance</span>
                    <h3 className="font-headline text-sm font-bold text-[#ecedf6]">Total Value</h3>
                  </div>
                  <p className="font-headline text-3xl font-bold text-[#4af8e3]">{formatCurrency(portfolio.total_value)}</p>
                  <p className="text-[#a9abb3] text-xs font-label mt-1">{portfolio.fund_count} funds</p>
                </div>

                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-[#c799ff]">trending_up</span>
                    <h3 className="font-headline text-sm font-bold text-[#ecedf6]">Overall XIRR</h3>
                  </div>
                  <p className="font-headline text-3xl font-bold text-[#c799ff]">{formatPercentage(portfolio.overall_xirr * 100)}</p>
                  <p className="text-[#a9abb3] text-xs font-label mt-1">Annualized return</p>
                </div>

                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-[#ff6e84]">show_chart</span>
                    <h3 className="font-headline text-sm font-bold text-[#ecedf6]">Expense Ratio</h3>
                  </div>
                  <p className="font-headline text-3xl font-bold text-[#ff6e84]">{formatPercentage(portfolio.expense_drag.avg_expense_ratio * 100)}</p>
                  <p className="text-[#a9abb3] text-xs font-label mt-1">Average cost</p>
                </div>

                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-[#33e9d5]">compare_arrows</span>
                    <h3 className="font-headline text-sm font-bold text-[#ecedf6]">vs Benchmark</h3>
                  </div>
                  <p className="font-headline text-3xl font-bold text-[#33e9d5]">
                    {portfolio.benchmark.is_beating_benchmark ? '+' : ''}{formatPercentage(portfolio.benchmark.alpha * 100)}
                  </p>
                  <p className="text-[#a9abb3] text-xs font-label mt-1">Alpha</p>
                </div>
              </div>

              {/* Holdings Table */}
              <div className="glass-card rounded-2xl p-8">
                <h3 className="font-headline text-xl font-bold text-[#ecedf6] mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#c799ff]">list</span>
                  Portfolio Holdings
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#22262f]">
                        <th className="text-left py-3 px-4 text-xs font-label text-[#a9abb3] uppercase tracking-widest">Fund Name</th>
                        <th className="text-right py-3 px-4 text-xs font-label text-[#a9abb3] uppercase tracking-widest">Units</th>
                        <th className="text-right py-3 px-4 text-xs font-label text-[#a9abb3] uppercase tracking-widest">NAV</th>
                        <th className="text-right py-3 px-4 text-xs font-label text-[#a9abb3] uppercase tracking-widest">Value</th>
                        <th className="text-right py-3 px-4 text-xs font-label text-[#a9abb3] uppercase tracking-widest">XIRR</th>
                        <th className="text-right py-3 px-4 text-xs font-label text-[#a9abb3] uppercase tracking-widest">Expense</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.portfolio.map((fund, index) => (
                        <tr key={index} className="border-b border-[#22262f]/30 hover:bg-[#22262f]/20 transition-colors">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-headline font-bold text-[#ecedf6] text-sm">{fund.fund_name}</p>
                              <p className="text-xs text-[#a9abb3]">{fund.category}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right font-body text-[#ecedf6]">{fund.units}</td>
                          <td className="py-4 px-4 text-right font-body text-[#ecedf6]">{formatCurrency(fund.current_nav)}</td>
                          <td className="py-4 px-4 text-right font-headline font-bold text-[#4af8e3]">
                            {formatCurrency(fund.current_value)}
                          </td>
                          <td className="py-4 px-4 text-right font-body text-[#ecedf6]">{formatPercentage(fund.xirr * 100)}</td>
                          <td className="py-4 px-4 text-right font-body text-[#ecedf6]">{formatPercentage(fund.expense_ratio * 100)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Analysis Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Overlap Analysis */}
                <div className="glass-card rounded-2xl p-8">
                  <h3 className="font-headline text-xl font-bold text-[#ecedf6] mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ff6e84]">layers</span>
                    Fund Overlap Analysis
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-[#22262f]/30 rounded-xl">
                      <p className="text-sm text-[#a9abb3] mb-2">Most Overlapping Pair</p>
                      <p className="font-headline font-bold text-[#ff6e84]">
                        {portfolio.overlap.most_overlapping_pair || 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {portfolio.overlap.pairs?.slice(0, 3).map((pair, index) => (
                        <div key={index} className="flex justify-between text-sm p-2 bg-[#22262f]/20 rounded">
                          <span className="text-[#a9abb3]">{pair.fund1} ↔ {pair.fund2}</span>
                          <span className="text-[#ecedf6] font-bold">{formatPercentage(pair.overlap_percentage * 100)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Expense Drag */}
                <div className="glass-card rounded-2xl p-8">
                  <h3 className="font-headline text-xl font-bold text-[#ecedf6] mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#f85149]">trending_down</span>
                    Cost Impact Analysis
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-[#22262f]/30 rounded-xl">
                      <p className="text-sm text-[#a9abb3] mb-2">20-Year Projected Loss</p>
                      <p className="font-headline text-2xl font-bold text-[#f85149]">
                        {formatCurrency(portfolio.expense_drag.projected_loss_20yr)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#a9abb3]">Average Expense Ratio</span>
                        <span className="text-[#ecedf6] font-bold">{formatPercentage(portfolio.expense_drag.avg_expense_ratio * 100)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#a9abb3]">Low Cost Target</span>
                        <span className="text-[#4af8e3] font-bold">{formatPercentage(0.5)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              <div className="glass-card rounded-2xl p-8">
                <h3 className="font-headline text-xl font-bold text-[#ecedf6] mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#c799ff]">auto_awesome</span>
                  AI Portfolio Insights
                </h3>
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-[#a9abb3] font-body leading-relaxed">
                    {portfolio.ai_insights}
                  </div>
                </div>
              </div>

              {/* Rebalancing Plan */}
              <div className="glass-card rounded-2xl p-8 bg-gradient-to-br from-[#4af8e3]/5 to-transparent">
                <h3 className="font-headline text-xl font-bold text-[#ecedf6] mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#4af8e3]">sync</span>
                  Rebalancing Recommendations
                </h3>
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-[#a9abb3] font-body leading-relaxed">
                    {portfolio.rebalancing_plan}
                  </div>
                </div>
              </div>

              {/* Upload New Statement */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setPortfolio(null);
                    setFile(null);
                  }}
                  className="px-8 py-3 glass-card rounded-full text-[#a9abb3] font-headline font-bold hover:text-[#4af8e3] transition-all"
                >
                  Upload New Statement
                </button>
              </div>

              {/* Finance Chatbot */}
              <div>
                <FinanceChatbot 
                  context={portfolio}
                  page="xray"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}