import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useFinance from '../hooks/useFinance';
import FinanceChatbot from './FinanceChatbot';

export default function Home() {
  const navigate = useNavigate();
  const { 
    income, 
    expenses, 
    surplus, 
    goals, 
    portfolio, 
    coupleAnalysis, 
    lifeEvent 
  } = useFinance();

  const [animatedValues, setAnimatedValues] = useState({
    totalSIP: 0,
    netWorth: 0,
    savingsRate: 0,
    goalProgress: 0
  });

  // Calculate metrics
  const totalSIP = goals.reduce((sum, goal) => sum + (goal.monthlySIP || 0), 0);
  const portfolioValue = portfolio?.total_value || 0;
  const combinedNetWorth = coupleAnalysis?.net_worth?.net_worth || 0;
  const totalNetWorth = portfolioValue + combinedNetWorth + (surplus * 12); // Rough estimate
  const savingsRate = income > 0 ? ((surplus / income) * 100) : 0;
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.completed).length;
  const goalProgress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  // Animate values on mount
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedValues({
        totalSIP: totalSIP * progress,
        netWorth: totalNetWorth * progress,
        savingsRate: savingsRate * progress,
        goalProgress: goalProgress * progress
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [totalSIP, totalNetWorth, savingsRate, goalProgress]);

  const formatCurrency = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;
  const formatPercentage = (n) => `${n.toFixed(1)}%`;

  // Quick actions
  const quickActions = [
    {
      title: "Portfolio X-Ray",
      desc: "Analyze your mutual fund portfolio",
      icon: "radar",
      color: "#4af8e3",
      path: "/xray",
      available: true
    },
    {
      title: "Couple's Planner", 
      desc: "Optimize finances as a couple",
      icon: "favorite",
      color: "#c799ff",
      path: "/couples",
      available: true
    },
    {
      title: "Zindagi Goals",
      desc: "Plan your life goals",
      icon: "stars",
      color: "#c799ff", 
      path: "/goals",
      available: true
    },
    {
      title: "Life Events",
      desc: "Navigate financial crossroads",
      icon: "event",
      color: "#4af8e3",
      path: "/life",
      available: true
    },
    {
      title: "FIRE Planner",
      desc: "Plan financial independence",
      icon: "local_fire_department",
      color: "#ff6e84",
      path: "/fire",
      available: true
    },
    {
      title: "Health Score",
      desc: "Check your financial health",
      icon: "monitoring",
      color: "#33e9d5",
      path: "/health",
      available: false // Coming soon
    }
  ];

  return (
    <div className="section-page active fade-up">
      <div className="relative min-h-screen pt-10 pb-32">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center text-center px-4 pt-10 pb-20">
          <div className="max-w-4xl space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
              <span className="flex h-2 w-2 rounded-full bg-[#4af8e3] animate-pulse"></span>
              <span className="text-[#4af8e3] font-label text-xs font-bold tracking-widest uppercase">Money Mentor AI Active</span>
            </div>
            <h1 className="hero-title font-headline text-7xl md:text-9xl font-black tracking-tighter text-[#ecedf6] leading-none">
              Money <span className="text-[#c799ff]">Mentor</span>
            </h1>
            <p className="font-body text-xl md:text-2xl text-[#a9abb3] max-w-2xl mx-auto leading-relaxed">
              Your intelligent financial companion. Navigate wealth creation, tax optimization, and life goals with AI-powered insights.
            </p>
            <div className="pt-8 flex flex-col md:flex-row gap-6 justify-center">
              <button 
                onClick={() => navigate('/xray')}
                className="px-10 py-5 bg-gradient-to-r from-[#c799ff] to-[#bc87fe] rounded-full text-[#340064] font-headline font-bold text-lg hover:shadow-[0_0_30px_rgba(199,153,255,0.4)] transition-all hover:scale-105 active:scale-95"
              >
                Analyze Portfolio
              </button>
              <button 
                onClick={() => navigate('/goals')}
                className="px-10 py-5 glass-card rounded-full text-[#ecedf6] font-headline font-bold text-lg hover:bg-[#4af8e3]/10 transition-all"
              >
                Plan Goals
              </button>
            </div>
          </div>
          <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center gap-2">
            <span className="text-[#a9abb3] text-[10px] font-label uppercase tracking-widest">Scroll to Dashboard</span>
            <span className="material-symbols-outlined text-[#c799ff]">expand_more</span>
          </div>
        </section>

        {/* Analytics Dashboard */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-32 space-y-16">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#4af8e3]/10 rounded-lg">
                  <span className="material-symbols-outlined text-[#4af8e3]">account_balance</span>
                </div>
                <h3 className="font-headline text-sm font-bold text-[#ecedf6]">Net Worth</h3>
              </div>
              <p className="font-headline text-3xl font-black text-[#4af8e3]">{formatCurrency(animatedValues.netWorth)}</p>
              <p className="text-[#a9abb3] text-xs font-label mt-2">Total assets minus liabilities</p>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#c799ff]/10 rounded-lg">
                  <span className="material-symbols-outlined text-[#c799ff]">savings</span>
                </div>
                <h3 className="font-headline text-sm font-bold text-[#ecedf6]">Monthly SIP</h3>
              </div>
              <p className="font-headline text-3xl font-black text-[#c799ff]">{formatCurrency(animatedValues.totalSIP)}</p>
              <p className="text-[#a9abb3] text-xs font-label mt-2">Across {totalGoals} active goals</p>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#33e9d5]/10 rounded-lg">
                  <span className="material-symbols-outlined text-[#33e9d5]">trending_up</span>
                </div>
                <h3 className="font-headline text-sm font-bold text-[#ecedf6]">Savings Rate</h3>
              </div>
              <p className="font-headline text-3xl font-black text-[#33e9d5]">{formatPercentage(animatedValues.savingsRate)}</p>
              <p className="text-[#a9abb3] text-xs font-label mt-2">Of monthly income</p>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#ff6e84]/10 rounded-lg">
                  <span className="material-symbols-outlined text-[#ff6e84]">flag</span>
                </div>
                <h3 className="font-headline text-sm font-bold text-[#ecedf6]">Goal Progress</h3>
              </div>
              <p className="font-headline text-3xl font-black text-[#ff6e84]">{formatPercentage(animatedValues.goalProgress)}</p>
              <p className="text-[#a9abb3] text-xs font-label mt-2">{completedGoals}/{totalGoals} completed</p>
            </div>
          </div>

          {/* Income vs Expenses Chart */}
          <div className="glass-card rounded-2xl p-8">
            <h3 className="font-headline text-xl font-bold text-[#ecedf6] mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c799ff]">pie_chart</span>
              Monthly Cash Flow
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle 
                      cx="64" 
                      cy="64" 
                      fill="transparent" 
                      r="56" 
                      stroke="#22262f" 
                      strokeWidth="16"
                    />
                    <circle 
                      cx="64" 
                      cy="64" 
                      fill="transparent" 
                      r="56" 
                      stroke="#4af8e3" 
                      strokeWidth="16"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - income / (income + expenses))}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-headline text-2xl font-bold text-[#ecedf6]">{formatPercentage(savingsRate)}</span>
                    <span className="text-xs text-[#a9abb3] font-label">SAVINGS</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#a9abb3]">Income</span>
                    <span className="text-[#4af8e3] font-bold">{formatCurrency(income)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#a9abb3]">Expenses</span>
                    <span className="text-[#f85149] font-bold">{formatCurrency(expenses)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-[#ecedf6]">Surplus</span>
                    <span className="text-[#33e9d5]">{formatCurrency(surplus)}</span>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <h4 className="font-headline text-sm font-bold text-[#ecedf6] mb-4">Financial Health Indicators</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#a9abb3]">Emergency Fund (6 months)</span>
                      <span className="text-[#ecedf6] font-bold">{formatCurrency(expenses * 6)}</span>
                    </div>
                    <div className="w-full bg-[#22262f] rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-[#f85149] to-[#ff6e84] h-2 rounded-full" 
                        style={{ width: `${Math.min((surplus * 12) / (expenses * 6) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#a9abb3]">Investment Ratio</span>
                      <span className="text-[#ecedf6] font-bold">{formatPercentage((totalSIP / income) * 100)}</span>
                    </div>
                    <div className="w-full bg-[#22262f] rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-[#c799ff] to-[#bc87fe] h-2 rounded-full" 
                        style={{ width: `${Math.min((totalSIP / income) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#a9abb3]">Goal Coverage</span>
                      <span className="text-[#ecedf6] font-bold">{formatPercentage((totalSIP / surplus) * 100)}</span>
                    </div>
                    <div className="w-full bg-[#22262f] rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-[#4af8e3] to-[#33e9d5] h-2 rounded-full" 
                        style={{ width: `${Math.min((totalSIP / surplus) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div>
            <h3 className="font-headline text-2xl font-bold text-[#ecedf6] mb-8">Financial Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => action.available && navigate(action.path)}
                  disabled={!action.available}
                  className={`glass-card rounded-2xl p-6 text-left transition-all hover:scale-[1.02] ${
                    action.available 
                      ? 'hover:bg-[#c799ff]/5 cursor-pointer' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  style={{
                    borderLeft: `4px solid ${action.color}`
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="p-3 rounded-xl flex-shrink-0"
                      style={{ backgroundColor: `${action.color}20` }}
                    >
                      <span 
                        className="material-symbols-outlined text-xl"
                        style={{ color: action.color }}
                      >
                        {action.icon}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-headline text-lg font-bold text-[#ecedf6] mb-2">
                        {action.title}
                      </h4>
                      <p className="text-[#a9abb3] text-sm font-body">{action.desc}</p>
                      {!action.available && (
                        <p className="text-[#a9abb3] text-xs font-label mt-2">Coming soon</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card rounded-2xl p-8">
              <h3 className="font-headline text-xl font-bold text-[#ecedf6] mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c799ff]">history</span>
                Recent Goals
              </h3>
              <div className="space-y-4">
                {goals.slice(0, 3).map((goal, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-[#22262f]/20 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-[#c799ff]/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#c799ff] text-sm">stars</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-headline font-bold text-[#ecedf6] text-sm">{goal.name}</p>
                      <p className="text-[#a9abb3] text-xs font-label">
                        SIP: {formatCurrency(goal.monthlySIP)}/mo • {goal.years} years
                      </p>
                    </div>
                  </div>
                ))}
                {goals.length === 0 && (
                  <p className="text-[#a9abb3] text-center py-8">No goals yet. Start planning!</p>
                )}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-8">
              <h3 className="font-headline text-xl font-bold text-[#ecedf6] mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4af8e3]">insights</span>
                AI Insights
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-[#4af8e3]/5 rounded-xl border-l-4 border-[#4af8e3]">
                  <p className="text-[#a9abb3] text-sm font-body leading-relaxed">
                    Your savings rate of {formatPercentage(savingsRate)} is {savingsRate > 20 ? 'excellent!' : 'good, but could be improved.'}
                    {savingsRate < 20 && ` Consider reducing expenses by ${formatCurrency(expenses * 0.1)} to reach 20%.`}
                  </p>
                </div>
                
                {totalSIP > surplus && (
                  <div className="p-4 bg-[#f85149]/5 rounded-xl border-l-4 border-[#f85149]">
                    <p className="text-[#f85149] text-sm font-body leading-relaxed">
                      Your total SIPs exceed your monthly surplus by {formatCurrency(totalSIP - surplus)}. 
                      Consider extending timelines or reducing targets.
                    </p>
                  </div>
                )}
                
                {portfolio && (
                  <div className="p-4 bg-[#c799ff]/5 rounded-xl border-l-4 border-[#c799ff]">
                    <p className="text-[#a9abb3] text-sm font-body leading-relaxed">
                      Your portfolio XIRR is {formatPercentage(portfolio.overall_xirr * 100)}. 
                      {portfolio.overall_xirr > 0.12 ? ' Excellent performance!' : ' Consider reviewing underperformers.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Finance Chatbot */}
          <div>
            <FinanceChatbot 
              context={{
                income,
                expenses,
                surplus,
                totalSIP,
                netWorth: totalNetWorth,
                savingsRate,
                goals,
                portfolio,
                coupleAnalysis
              }}
              page="home"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
