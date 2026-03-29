import { useState, useEffect } from 'react';
import { api } from '../services/api';
import useAppStore from '../store/useAppStore';

export default function useFinance() {
  const { 
    goals, setGoals,
    portfolio, setPortfolio,
    healthScore, setHealthScore,
    fireData, setFireData,
    lifeEvent, setLifeEvent,
    coupleData, setCoupleData,
    coupleAnalysis, setCoupleAnalysis
  } = useAppStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Income / Expenses State
  const [income, setIncomeState] = useState(() => Number(localStorage.getItem('userIncome')) || 120000);
  const [expenses, setExpensesState] = useState(() => Number(localStorage.getItem('userExpenses')) || 55000);
  const surplus = income - expenses;

  useEffect(() => {
    localStorage.setItem('userIncome', income);
    localStorage.setItem('userExpenses', expenses);
  }, [income, expenses]);

  const setIncome = (v) => setIncomeState(v);
  const setExpenses = (v) => setExpensesState(v);

  const addZindagiGoal = async (preset, amount, years) => {
    if (!preset || !amount || !years) return;
    setLoading(true);
    let monthlySIP;
    let aiInsight = null;
    try {
      const res = await api.getGoalsPlan({
        goals: [{ 
          name: preset.name, 
          target_amount: amount, 
          current_savings: 0, 
          timeline_years: years, 
          expected_return: preset.expectedReturn 
        }],
        monthly_surplus: surplus
      });
      monthlySIP = Math.round(res.data.data.goals[0].monthly_sip);
      aiInsight = res.data.data.ai_insights || null;
    } catch(e) {
      console.error('API failed, using estimate', e);
      monthlySIP = Math.round(amount / (years * 12));
    }
    setLoading(false);

    const fundCategory = (y) => y <= 3 ? 'Debt Fund' : y <= 7 ? 'Hybrid Fund' : 'Equity Fund';
    
    const newGoal = { 
      id: Date.now(), 
      name: preset.name, 
      targetAmount: amount, 
      years, 
      monthlySIP, 
      fundCategory: fundCategory(years), 
      conflict: false,
      aiInsight
    };
    
    setGoals([...goals, newGoal]);
  };

  const removeZindagiGoal = (id) => {
    setGoals(goals.filter(g => g.id !== id));
  };
  
  const uploadXRay = async (file, signal = null) => {
    if (!file) return;
    setLoading(true);
    try {
      const response = await api.uploadCAMSStatement(file, signal);
      setPortfolio(response.data);
      return response.data;
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err);
      if (err.name === 'CanceledError' || err.message?.includes('abort')) {
        setError({ message: 'Upload cancelled by user' });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLifeEventAdvice = async (eventType) => {
    setLoading(true);
    try {
      const res = await api.getLifeEventAdvice({
        event_type: eventType,
        monthly_income: income,
        monthly_expenses: expenses,
        total_investments: 500000,
        insurance_cover: 1000000,
        emergency_fund: 200000,
        additional_details: null
      });
      setLifeEvent(res.data.data);
      return res.data.data;
    } catch (err) {
      console.error('API failed', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const analyzeCouple = async (partnerA, partnerB) => {
    setLoading(true);
    try {
      const res = await api.analyzeCouples({
        partner_a: partnerA,
        partner_b: partnerB
      });
      setCoupleAnalysis(res.data);
      return res.data;
    } catch (err) {
      console.error('Couple analysis failed', err);
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    income, setIncome,
    expenses, setExpenses,
    surplus,
    goals, addZindagiGoal, removeZindagiGoal, setGoals,
    portfolio, uploadXRay,
    healthScore, setHealthScore,
    fireData, setFireData,
    lifeEvent, setLifeEvent, fetchLifeEventAdvice,
    coupleData, setCoupleData,
    coupleAnalysis, setCoupleAnalysis,
    analyzeCouple
  };
}
