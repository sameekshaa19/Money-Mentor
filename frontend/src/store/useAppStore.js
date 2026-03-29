import { create } from 'zustand'

const useAppStore = create((set) => ({

  // --- User Profile (everyone reads this) ---
  userProfile: {
    name: '', age: 0, monthlyIncome: 0,
    monthlyExpenses: 0, city: '', taxBracket: ''
  },
  setUserProfile: (data) => set({ userProfile: data }),

  // --- P1: Portfolio X-Ray ---
  portfolio: null,
  setPortfolio: (data) => set({ portfolio: data }),

  // --- P1: Couple's Planner ---
  coupleData: {
    partner1: { name: '', income: 0, taxBracket: '', investments: [] },
    partner2: { name: '', income: 0, taxBracket: '', investments: [] },
  },
  setCoupleData: (data) => set({ coupleData: data }),

  // --- P2: Health Score ---
  healthScore: null,
  setHealthScore: (data) => set({ healthScore: data }),

  // --- P2: FIRE Planner ---
  fireData: null,
  setFireData: (data) => set({ fireData: data }),

  // --- P3: Zindagi Goals ---
  goals: [],
  setGoals: (goals) => set({ goals }),

  // --- P3: Life Event ---
  lifeEvent: null,
  setLifeEvent: (data) => set({ lifeEvent: data }),

}))

export default useAppStore
