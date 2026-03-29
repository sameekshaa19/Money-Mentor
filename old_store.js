import { create } from 'zustand';

const useStore = create((set) => ({
  user: {
    name: 'Sameekshaa',
    age: 28,
    monthly_income: 150000,
    monthly_expenses: 60000,
    total_debt: 0,
    emergency_fund: 200000,
    total_investments: 800000,
    insurance_cover: 5000000,
    savings_rate: 60,
  },
  setUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } })),
  
  portfolio: null,
  setPortfolio: (data) => set({ portfolio: data }),
  
  healthScore: null,
  setHealthScore: (data) => set({ healthScore: data }),
  
  firePlan: null,
  setFirePlan: (data) => set({ firePlan: data }),
  
  goals: [],
  setGoals: (data) => set({ goals: data }),
  
  lifeEventAdvice: null,
  setLifeEventAdvice: (data) => set({ lifeEventAdvice: data }),
  
  couplePlan: null,
  setCouplePlan: (data) => set({ couplePlan: data }),
}));

export default useStore;
