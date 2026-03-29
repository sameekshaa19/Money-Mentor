import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Wallet, 
  TrendingUp, 
  Target, 
  Shield, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Save,
  RotateCcw
} from 'lucide-react';
import useUserProfileStore from '../store/useUserProfileStore';

const STEPS = [
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'income', label: 'Income', icon: Wallet },
  { id: 'expenses', label: 'Expenses', icon: Wallet },
  { id: 'investments', label: 'Investments', icon: TrendingUp },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'review', label: 'Review', icon: Shield }
];

const RISK_PROFILES = [
  { value: 'conservative', label: 'Conservative', desc: 'Capital preservation priority' },
  { value: 'moderate', label: 'Moderate', desc: 'Balanced growth and safety' },
  { value: 'aggressive', label: 'Aggressive', desc: 'Maximum growth potential' }
];

const EXPENSE_CATEGORIES = [
  { key: 'housing', label: 'Housing (Rent/EMI)' },
  { key: 'food', label: 'Food & Groceries' },
  { key: 'transport', label: 'Transportation' },
  { key: 'utilities', label: 'Utilities & Bills' },
  { key: 'healthcare', label: 'Healthcare' },
  { key: 'education', label: 'Education' },
  { key: 'entertainment', label: 'Entertainment' },
  { key: 'others', label: 'Others' }
];

const INVESTMENT_CATEGORIES = [
  { key: 'equity', label: 'Direct Equity/Stocks' },
  { key: 'debt', label: 'Fixed Deposits/Bonds' },
  { key: 'mutualFunds', label: 'Mutual Funds' },
  { key: 'realEstate', label: 'Real Estate' },
  { key: 'gold', label: 'Gold' },
  { key: 'crypto', label: 'Cryptocurrency' },
  { key: 'others', label: 'Others (PPF, NPS, etc.)' }
];

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { profile, setProfile, updateField, updateFields, markProfileComplete, resetProfile } = useUserProfileStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tempGoal, setTempGoal] = useState({ name: '', targetAmount: '', targetDate: '', priority: 'medium' });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.name && !profile.name) {
        updateFields({ name: user.name, email: user.email });
      }
    }
  }, []);

  const validateStep = (stepIndex) => {
    const newErrors = {};
    
    switch (stepIndex) {
      case 0:
        if (!profile.age || profile.age < 18) newErrors.age = 'Age must be 18 or above';
        if (!profile.riskProfile) newErrors.riskProfile = 'Please select a risk profile';
        if (profile.dependents === null || profile.dependents === undefined) {
          newErrors.dependents = 'Please enter number of dependents';
        }
        break;
      case 1:
        if (!profile.monthlyIncome || profile.monthlyIncome <= 0) {
          newErrors.monthlyIncome = 'Please enter a valid monthly income';
        }
        break;
      case 2:
        if (!profile.monthlyExpenses || profile.monthlyExpenses <= 0) {
          newErrors.monthlyExpenses = 'Please enter a valid monthly expense';
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleInputChange = (field, value) => {
    updateField(field, value);
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleExpenseChange = (category, value) => {
    const numValue = value === '' ? null : parseFloat(value);
    updateField(`expenseBreakdown.${category}`, numValue);
  };

  const handleInvestmentChange = (category, value) => {
    const numValue = value === '' ? null : parseFloat(value);
    updateField(`investments.${category}`, numValue);
  };

  const addGoal = () => {
    if (tempGoal.name && tempGoal.targetAmount) {
      const newGoal = {
        id: Date.now(),
        name: tempGoal.name,
        targetAmount: parseFloat(tempGoal.targetAmount),
        targetDate: tempGoal.targetDate,
        priority: tempGoal.priority
      };
      updateField('goals', [...profile.goals, newGoal]);
      setTempGoal({ name: '', targetAmount: '', targetDate: '', priority: 'medium' });
    }
  };

  const removeGoal = (goalId) => {
    updateField('goals', profile.goals.filter(g => g.id !== goalId));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    markProfileComplete();
    setIsSubmitting(false);
    navigate('/');
  };

  const calculateTotalExpenses = () => {
    return Object.values(profile.expenseBreakdown || {})
      .reduce((sum, val) => sum + (val || 0), 0);
  };

  const calculateTotalInvestments = () => {
    return Object.values(profile.investments || {})
      .reduce((sum, val) => sum + (val || 0), 0);
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        
        return (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                isActive
                  ? 'bg-[#c799ff]/20 border border-[#c799ff]/40'
                  : isCompleted
                  ? 'bg-[#4af8e3]/10 border border-[#4af8e3]/30'
                  : 'bg-[#0d1117] border border-[#22262f]'
              }`}
            >
              {isCompleted ? (
                <CheckCircle className="w-4 h-4 text-[#4af8e3]" />
              ) : (
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#c799ff]' : 'text-[#a9abb3]'}`} />
              )}
              <span className={`text-xs font-label uppercase tracking-wider ${
                isActive ? 'text-[#c799ff]' : isCompleted ? 'text-[#4af8e3]' : 'text-[#a9abb3]'
              }`}>
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <ChevronRight className="w-4 h-4 text-[#30363d] mx-1" />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderPersonalStep = () => (
    <div className="space-y-6">
      <h3 className="font-headline text-2xl font-bold text-[#ecedf6] mb-6">Personal Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-label text-[#a9abb3] uppercase tracking-widest block pl-1">
            Full Name
          </label>
          <input
            type="text"
            value={profile.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full bg-[#0d1117]/80 border border-[#22262f] rounded-xl px-4 py-3.5 text-[#ecedf6] font-body focus:border-[#c799ff]/50 outline-none transition-colors"
            placeholder="Enter your name"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] font-label text-[#a9abb3] uppercase tracking-widest block pl-1">
            Email Address
          </label>
          <input
            type="email"
            value={profile.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full bg-[#0d1117]/80 border border-[#22262f] rounded-xl px-4 py-3.5 text-[#ecedf6] font-body focus:border-[#c799ff]/50 outline-none transition-colors"
            placeholder="your@email.com"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] font-label text-[#a9abb3] uppercase tracking-widest block pl-1">
            Age <span className="text-[#c799ff]">*</span>
          </label>
          <input
            type="number"
            min="18"
            max="100"
            value={profile.age || ''}
            onChange={(e) => handleInputChange('age', e.target.value ? parseInt(e.target.value) : null)}
            className={`w-full bg-[#0d1117]/80 border rounded-xl px-4 py-3.5 text-[#ecedf6] font-body focus:border-[#c799ff]/50 outline-none transition-colors ${
              errors.age ? 'border-[#ff6e84]' : 'border-[#22262f]'
            }`}
            placeholder="25"
          />
          {errors.age && <p className="text-[#ff6e84] text-xs">{errors.age}</p>}
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] font-label text-[#a9abb3] uppercase tracking-widest block pl-1">
            Number of Dependents <span className="text-[#c799ff]">*</span>
          </label>
          <input
            type="number"
            min="0"
            max="20"
            value={profile.dependents !== null ? profile.dependents : ''}
            onChange={(e) => handleInputChange('dependents', e.target.value !== '' ? parseInt(e.target.value) : null)}
            className={`w-full bg-[#0d1117]/80 border rounded-xl px-4 py-3.5 text-[#ecedf6] font-body focus:border-[#c799ff]/50 outline-none transition-colors ${
              errors.dependents ? 'border-[#ff6e84]' : 'border-[#22262f]'
            }`}
            placeholder="0"
          />
          {errors.dependents && <p className="text-[#ff6e84] text-xs">{errors.dependents}</p>}
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] font-label text-[#a9abb3] uppercase tracking-widest block pl-1">
            City
          </label>
          <input
            type="text"
            value={profile.city || ''}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className="w-full bg-[#0d1117]/80 border border-[#22262f] rounded-xl px-4 py-3.5 text-[#ecedf6] font-body focus:border-[#c799ff]/50 outline-none transition-colors"
            placeholder="Mumbai"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] font-label text-[#a9abb3] uppercase tracking-widest block pl-1">
            Tax Bracket
          </label>
          <select
            value={profile.taxBracket || ''}
            onChange={(e) => handleInputChange('taxBracket', e.target.value || null)}
            className="w-full bg-[#0d1117]/80 border border-[#22262f] rounded-xl px-4 py-3.5 text-[#ecedf6] font-body focus:border-[#c799ff]/50 outline-none transition-colors"
          >
            <option value="">Select tax bracket</option>
            <option value="0%">0% (Up to ₹3 Lakh)</option>
            <option value="5%">5% (₹3-6 Lakh)</option>
            <option value="10%">10% (₹6-9 Lakh)</option>
            <option value="15%">15% (₹9-12 Lakh)</option>
            <option value="20%">20% (₹12-15 Lakh)</option>
            <option value="30%">30% (Above ₹15 Lakh)</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-3 pt-4">
        <label className="text-[10px] font-label text-[#a9abb3] uppercase tracking-widest block pl-1">
          Risk Profile <span className="text-[#c799ff]">*</span>
        </label>
        {errors.riskProfile && <p className="text-[#ff6e84] text-xs">{errors.riskProfile}</p>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {RISK_PROFILES.map((risk) => (
            <button
              key={risk.value}
              onClick={() => handleInputChange('riskProfile', risk.value)}
              className={`p-4 rounded-xl border text-left transition-all ${
                profile.riskProfile === risk.value
                  ? 'border-[#c799ff] bg-[#c799ff]/10'
                  : 'border-[#22262f] bg-[#0d1117]/80 hover:border-[#c799ff]/30'
              }`}
            >
              <p className="font-headline font-bold text-[#ecedf6] mb-1">{risk.label}</p>
              <p className="text-xs text-[#a9abb3]">{risk.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderIncomeStep = () => (
    <div className="space-y-6">
      <h3 className="font-headline text-2xl font-bold text-[#ecedf6] mb-6">Income Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-label text-[#a9abb3] uppercase tracking-widest block pl-1">
            Monthly Income <span className="text-[#c799ff]">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a9abb3]">₹</span>
            <input
              type="number"
              min="0"
              value={profile.monthlyIncome || ''}
              onChange={(e) => handleInputChange('monthlyIncome', e.target.value ? parseFloat(e.target.value) : null)}
              className={`w-full bg-[#0d1117]/80 border rounded-xl pl-10 pr-4 py-3.5 text-[#ecedf6] font-body focus:border-[#c799ff]/50 outline-none transition-colors ${
                errors.monthlyIncome ? 'border-[#ff6e84]' : 'border-[#22262f]'
              }`}
              placeholder="50000"
            />
          </div>
          {errors.monthlyIncome && <p className="text-[#ff6e84] text-xs">{errors.monthlyIncome}</p>}
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] font-label text-[#a9abb3] uppercase tracking-widest block pl-1">
            Annual Income (Auto-calculated)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a9abb3]">₹</span>
            <input
              type="text"
              readOnly
              value={profile.monthlyIncome ? (profile.monthlyIncome * 12).toLocaleString('en-IN') : ''}
              className="w-full bg-[#0d1117]/50 border border-[#22262f] rounded-xl pl-10 pr-4 py-3.5 text-[#a9abb3] font-body cursor-not-allowed"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] font-label text-[#a9abb3] uppercase tracking-widest block pl-1">
            Total Savings
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a9abb3]">₹</span>
            <input
              type="number"
              min="0"
              value={profile.totalSavings || ''}
              onChange={(e) => handleInputChange('totalSavings', e.target.value ? parseFloat(e.target.value) : null)}
              className="w-full bg-[#0d1117]/80 border border-[#22262f] rounded-xl pl-10 pr-4 py-3.5 text-[#ecedf6] font-body focus:border-[#c799ff]/50 outline-none transition-colors"
              placeholder="100000"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] font-label text-[#a9abb3] uppercase tracking-widest block pl-1">
            Emergency Fund (Months of Expenses)
          </label>
          <input
            type="number"
            min="0"
            value={profile.emergencyFund || ''}
            onChange={(e) => handleInputChange('emergencyFund', e.target.value ? parseFloat(e.target.value) : null)}
            className="w-full bg-[#0d1117]/80 border border-[#22262f] rounded-xl px-4 py-3.5 text-[#ecedf6] font-body focus:border-[#c799ff]/50 outline-none transition-colors"
            placeholder="6"
          />
        </div>
      </div>
    </div>
  );

  const renderExpensesStep = () => (
    <div className="space-y-6">
      <h3 className="font-headline text-2xl font-bold text-[#ecedf6] mb-6">Monthly Expenses</h3>
      
      <div className="space-y-2">
        <label className="text-[10px] font-label text-[#a9abb3] uppercase tracking-widest block pl-1">
          Total Monthly Expenses <span className="text-[#c799ff]">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a9abb3]">₹</span>
          <input
            type="number"
            min="0"
            value={profile.monthlyExpenses || ''}
            onChange={(e) => handleInputChange('monthlyExpenses', e.target.value ? parseFloat(e.target.value) : null)}
            className={`w-full bg-[#0d1117]/80 border rounded-xl pl-10 pr-4 py-3.5 text-[#ecedf6] font-body focus:border-[#c799ff]/50 outline-none transition-colors ${
              errors.monthlyExpenses ? 'border-[#ff6e84]' : 'border-[#22262f]'
            }`}
            placeholder="30000"
          />
        </div>
        {errors.monthlyExpenses && <p className="text-[#ff6e84] text-xs">{errors.monthlyExpenses}</p>}
      </div>
      
      <div className="pt-4">
        <h4 className="text-sm font-label text-[#a9abb3] uppercase tracking-widest mb-4">Expense Breakdown (Optional)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EXPENSE_CATEGORIES.map((cat) => (
            <div key={cat.key} className="space-y-2">
              <label className="text-[10px] font-label text-[#a9abb3] block pl-1">{cat.label}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a9abb3]">₹</span>
                <input
                  type="number"
                  min="0"
                  value={profile.expenseBreakdown?.[cat.key] || ''}
                  onChange={(e) => handleExpenseChange(cat.key, e.target.value)}
                  className="w-full bg-[#0d1117]/80 border border-[#22262f] rounded-xl pl-10 pr-4 py-2.5 text-[#ecedf6] font-body focus:border-[#c799ff]/50 outline-none transition-colors text-sm"
                  placeholder="0"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {calculateTotalExpenses() > 0 && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-[#4af8e3]/5 border border-[#4af8e3]/20">
          <span className="text-sm text-[#a9abb3]">Calculated Total from Breakdown:</span>
          <span className="font-headline font-bold text-[#4af8e3]">{formatCurrency(calculateTotalExpenses())}</span>
        </div>
      )}
    </div>
  );

  const renderInvestmentsStep = () => (
    <div className="space-y-6">
      <h3 className="font-headline text-2xl font-bold text-[#ecedf6] mb-6">Investment Portfolio</h3>
      
      <p className="text-sm text-[#a9abb3] mb-4">Enter your current investment values (all fields optional)</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INVESTMENT_CATEGORIES.map((inv) => (
          <div key={inv.key} className="space-y-2">
            <label className="text-[10px] font-label text-[#a9abb3] block pl-1">{inv.label}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a9abb3]">₹</span>
              <input
                type="number"
                min="0"
                value={profile.investments?.[inv.key] || ''}
                onChange={(e) => handleInvestmentChange(inv.key, e.target.value)}
                className="w-full bg-[#0d1117]/80 border border-[#22262f] rounded-xl pl-10 pr-4 py-2.5 text-[#ecedf6] font-body focus:border-[#c799ff]/50 outline-none transition-colors text-sm"
                placeholder="0"
              />
            </div>
          </div>
        ))}
      </div>
      
      {calculateTotalInvestments() > 0 && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-[#c799ff]/5 border border-[#c799ff]/20">
          <span className="text-sm text-[#a9abb3]">Total Investment Value:</span>
          <span className="font-headline font-bold text-[#c799ff]">{formatCurrency(calculateTotalInvestments())}</span>
        </div>
      )}
    </div>
  );

  const renderGoalsStep = () => (
    <div className="space-y-6">
      <h3 className="font-headline text-2xl font-bold text-[#ecedf6] mb-6">Financial Goals</h3>
      
      <div className="glass-card-static rounded-2xl p-6 border border-[#22262f]">
        <h4 className="text-sm font-label text-[#a9abb3] uppercase tracking-widest mb-4">Add New Goal</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              value={tempGoal.name}
              onChange={(e) => setTempGoal(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-[#0d1117]/80 border border-[#22262f] rounded-xl px-4 py-2.5 text-[#ecedf6] font-body focus:border-[#c799ff]/50 outline-none transition-colors text-sm"
              placeholder="Goal name (e.g., Buy a house)"
            />
          </div>
          <div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a9abb3]">₹</span>
              <input
                type="number"
                min="0"
                value={tempGoal.targetAmount}
                onChange={(e) => setTempGoal(prev => ({ ...prev, targetAmount: e.target.value }))}
                className="w-full bg-[#0d1117]/80 border border-[#22262f] rounded-xl pl-10 pr-4 py-2.5 text-[#ecedf6] font-body focus:border-[#c799ff]/50 outline-none transition-colors text-sm"
                placeholder="Target amount"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={tempGoal.targetDate}
              onChange={(e) => setTempGoal(prev => ({ ...prev, targetDate: e.target.value }))}
              className="flex-1 bg-[#0d1117]/80 border border-[#22262f] rounded-xl px-4 py-2.5 text-[#ecedf6] font-body focus:border-[#c799ff]/50 outline-none transition-colors text-sm"
            />
            <button
              onClick={addGoal}
              disabled={!tempGoal.name || !tempGoal.targetAmount}
              className="px-4 py-2.5 rounded-xl bg-[#c799ff]/20 border border-[#c799ff]/40 text-[#c799ff] hover:bg-[#c799ff]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {profile.goals.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-label text-[#a9abb3] uppercase tracking-widest">Your Goals</h4>
          {profile.goals.map((goal) => (
            <div key={goal.id} className="flex items-center justify-between p-4 rounded-xl bg-[#0d1117]/50 border border-[#22262f]">
              <div className="flex-1">
                <p className="font-headline font-bold text-[#ecedf6]">{goal.name}</p>
                <p className="text-xs text-[#a9abb3]">
                  Target: {formatCurrency(goal.targetAmount)}
                  {goal.targetDate && ` by ${new Date(goal.targetDate).toLocaleDateString()}`}
                </p>
              </div>
              <button
                onClick={() => removeGoal(goal.id)}
                className="p-2 rounded-lg text-[#ff6e84] hover:bg-[#ff6e84]/10 transition-colors"
              >
                <AlertCircle className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <h3 className="font-headline text-2xl font-bold text-[#ecedf6] mb-6">Review Your Profile</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card-static rounded-2xl p-6 border border-[#22262f]">
          <h4 className="text-sm font-label text-[#a9abb3] uppercase tracking-widest mb-4">Personal</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#a9abb3]">Name:</span>
              <span className="text-[#ecedf6]">{profile.name || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#a9abb3]">Age:</span>
              <span className="text-[#ecedf6]">{profile.age || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#a9abb3]">Dependents:</span>
              <span className="text-[#ecedf6]">{profile.dependents !== null ? profile.dependents : 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#a9abb3]">Risk Profile:</span>
              <span className="text-[#c799ff] capitalize">{profile.riskProfile || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#a9abb3]">City:</span>
              <span className="text-[#ecedf6]">{profile.city || 'Not set'}</span>
            </div>
          </div>
        </div>
        
        <div className="glass-card-static rounded-2xl p-6 border border-[#22262f]">
          <h4 className="text-sm font-label text-[#a9abb3] uppercase tracking-widest mb-4">Finances</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#a9abb3]">Monthly Income:</span>
              <span className="text-[#4af8e3]">{formatCurrency(profile.monthlyIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#a9abb3]">Monthly Expenses:</span>
              <span className="text-[#ff6e84]">{formatCurrency(profile.monthlyExpenses)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#a9abb3]">Total Savings:</span>
              <span className="text-[#ecedf6]">{formatCurrency(profile.totalSavings)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#a9abb3]">Total Investments:</span>
              <span className="text-[#c799ff]">{formatCurrency(calculateTotalInvestments())}</span>
            </div>
            <div className="flex justify-between border-t border-[#22262f] pt-2 mt-2">
              <span className="text-[#a9abb3] font-bold">Net Worth:</span>
              <span className="text-[#4af8e3] font-bold">
                {formatCurrency((profile.totalSavings || 0) + calculateTotalInvestments())}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {profile.goals.length > 0 && (
        <div className="glass-card-static rounded-2xl p-6 border border-[#22262f]">
          <h4 className="text-sm font-label text-[#a9abb3] uppercase tracking-widest mb-4">Goals ({profile.goals.length})</h4>
          <div className="space-y-2">
            {profile.goals.slice(0, 3).map(goal => (
              <div key={goal.id} className="flex justify-between text-sm">
                <span className="text-[#ecedf6]">{goal.name}</span>
                <span className="text-[#c799ff]">{formatCurrency(goal.targetAmount)}</span>
              </div>
            ))}
            {profile.goals.length > 3 && (
              <p className="text-xs text-[#a9abb3]">+{profile.goals.length - 3} more goals</p>
            )}
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-4 p-4 rounded-xl bg-[#4af8e3]/5 border border-[#4af8e3]/20">
        <CheckCircle className="w-6 h-6 text-[#4af8e3]" />
        <div>
          <p className="font-headline font-bold text-[#4af8e3]">Profile Ready</p>
          <p className="text-xs text-[#a9abb3]">Your profile will be saved locally and synced across all features.</p>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderPersonalStep();
      case 1: return renderIncomeStep();
      case 2: return renderExpensesStep();
      case 3: return renderInvestmentsStep();
      case 4: return renderGoalsStep();
      case 5: return renderReviewStep();
      default: return null;
    }
  };

  return (
    <div className="section-page active">
      <div className="relative min-h-screen pt-10 pb-32">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-8 fade-up">
            <h1 className="font-headline text-4xl md:text-6xl font-black tracking-tighter text-[#ecedf6] leading-none mb-4">
              Profile <span className="text-[#c799ff]">Setup</span>
            </h1>
            <p className="text-[#a9abb3] text-lg font-body">Create your financial profile to unlock personalized insights across all features.</p>
          </div>

          {renderStepIndicator()}

          <div className="glass-card-static rounded-3xl p-8 md:p-12 fade-up relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#c799ff]/10 blur-[80px] rounded-full"></div>
            
            <div className="relative z-10">
              {renderStepContent()}
            </div>

            <div className="mt-12 pt-8 border-t border-[#22262f] flex justify-between items-center relative z-10">
              <div className="flex gap-4">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrev}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[#22262f] text-[#a9abb3] hover:border-[#c799ff]/40 hover:text-[#c799ff] transition-all font-label text-xs tracking-widest uppercase"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm('Reset all profile data? This cannot be undone.')) {
                      resetProfile();
                      setCurrentStep(0);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-[#a9abb3] hover:text-[#ff6e84] transition-colors"
                  title="Reset Profile"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {currentStep < STEPS.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#c799ff] to-[#bc87fe] text-[#340064] font-label text-xs tracking-widest uppercase font-bold hover:shadow-[0_0_30px_rgba(199,153,255,0.4)] transition-all"
                >
                  Next Step
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#4af8e3] to-[#33e9d5] text-[#004d40] font-label text-xs tracking-widest uppercase font-bold hover:shadow-[0_0_30px_rgba(74,248,227,0.4)] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#004d40]/30 border-t-[#004d40] rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Complete Setup
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
