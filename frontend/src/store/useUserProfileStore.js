import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * User Profile Store - Single Source of Truth (SSOT)
 * 
 * This store manages all user profile data that will be consumed
 * across all features (Portfolio, FIRE, Goals, Health Score, etc.)
 * 
 * Schema:
 * - income: Monthly income details
 * - expenses: Monthly expense breakdown
 * - savings: Current savings information
 * - investments: Investment portfolio details
 * - goals: Financial goals array
 * - age: User age for calculations
 * - riskProfile: Risk tolerance (conservative/moderate/aggressive)
 * - dependents: Number of financial dependents
 */

const useUserProfileStore = create(
  persist(
    (set, get) => ({
      // ==========================================
      // PROFILE DATA STRUCTURE
      // ==========================================
      profile: {
        // Personal Details
        name: '',
        email: '',
        age: null,
        
        // Income
        monthlyIncome: null,
        annualIncome: null,
        incomeCurrency: 'INR',
        
        // Expenses
        monthlyExpenses: null,
        expenseBreakdown: {
          housing: null,
          food: null,
          transport: null,
          utilities: null,
          healthcare: null,
          education: null,
          entertainment: null,
          others: null
        },
        
        // Savings
        totalSavings: null,
        emergencyFund: null,
        
        // Investments
        investments: {
          equity: null,
          debt: null,
          mutualFunds: null,
          realEstate: null,
          gold: null,
          crypto: null,
          others: null
        },
        
        // Goals
        goals: [],
        
        // Risk & Lifestyle
        riskProfile: null, // 'conservative' | 'moderate' | 'aggressive'
        dependents: null,
        taxBracket: null,
        city: '',
        
        // Metadata
        lastUpdated: null,
        isComplete: false
      },

      // ==========================================
      // ACTIONS
      // ==========================================

      /**
       * Set entire profile (e.g., on initial load or API response)
       * @param {Object} data - Complete profile data
       */
      setProfile: (data) => set((state) => ({
        profile: {
          ...state.profile,
          ...data,
          lastUpdated: new Date().toISOString()
        }
      })),

      /**
       * Update a single field at any depth
       * @param {string} key - Dot-notation key path (e.g., 'investments.equity')
       * @param {*} value - Value to set
       */
      updateField: (key, value) => set((state) => {
        const keys = key.split('.')
        const newProfile = { ...state.profile }
        
        let current = newProfile
        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = { ...current[keys[i]] }
          current = current[keys[i]]
        }
        
        current[keys[keys.length - 1]] = value
        newProfile.lastUpdated = new Date().toISOString()
        
        return { profile: newProfile }
      }),

      /**
       * Update multiple fields at once
       * @param {Object} updates - Object with key-value pairs to update
       */
      updateFields: (updates) => set((state) => ({
        profile: {
          ...state.profile,
          ...updates,
          lastUpdated: new Date().toISOString()
        }
      })),

      /**
       * Add a financial goal
       * @param {Object} goal - Goal object { id, name, targetAmount, targetDate, priority }
       */
      addGoal: (goal) => set((state) => ({
        profile: {
          ...state.profile,
          goals: [...state.profile.goals, { ...goal, id: goal.id || Date.now() }],
          lastUpdated: new Date().toISOString()
        }
      })),

      /**
       * Remove a goal by id
       * @param {number} goalId - Goal ID to remove
       */
      removeGoal: (goalId) => set((state) => ({
        profile: {
          ...state.profile,
          goals: state.profile.goals.filter(g => g.id !== goalId),
          lastUpdated: new Date().toISOString()
        }
      })),

      /**
       * Update a specific goal
       * @param {number} goalId - Goal ID to update
       * @param {Object} updates - Updated goal fields
       */
      updateGoal: (goalId, updates) => set((state) => ({
        profile: {
          ...state.profile,
          goals: state.profile.goals.map(g => 
            g.id === goalId ? { ...g, ...updates } : g
          ),
          lastUpdated: new Date().toISOString()
        }
      })),

      /**
       * Mark profile as complete after setup
       */
      markProfileComplete: () => set((state) => ({
        profile: {
          ...state.profile,
          isComplete: true,
          lastUpdated: new Date().toISOString()
        }
      })),

      /**
       * Reset profile to default state
       */
      resetProfile: () => set({
        profile: {
          name: '',
          email: '',
          age: null,
          monthlyIncome: null,
          annualIncome: null,
          incomeCurrency: 'INR',
          monthlyExpenses: null,
          expenseBreakdown: {
            housing: null,
            food: null,
            transport: null,
            utilities: null,
            healthcare: null,
            education: null,
            entertainment: null,
            others: null
          },
          totalSavings: null,
          emergencyFund: null,
          investments: {
            equity: null,
            debt: null,
            mutualFunds: null,
            realEstate: null,
            gold: null,
            crypto: null,
            others: null
          },
          goals: [],
          riskProfile: null,
          dependents: null,
          taxBracket: null,
          city: '',
          lastUpdated: null,
          isComplete: false
        }
      }),

      // ==========================================
      // GETTERS / COMPUTED
      // ==========================================

      /**
       * Get net worth (savings + investments)
       */
      getNetWorth: () => {
        const { profile } = get()
        const savings = profile.totalSavings || 0
        const investments = Object.values(profile.investments || {})
          .reduce((sum, val) => sum + (val || 0), 0)
        return savings + investments
      },

      /**
       * Get monthly savings rate (%)
       */
      getSavingsRate: () => {
        const { profile } = get()
        const income = profile.monthlyIncome || 0
        const expenses = profile.monthlyExpenses || 0
        if (income === 0) return 0
        return ((income - expenses) / income) * 100
      },

      /**
       * Check if required fields are filled
       */
      isProfileValid: () => {
        const { profile } = get()
        return (
          profile.age &&
          profile.monthlyIncome &&
          profile.monthlyExpenses &&
          profile.riskProfile &&
          profile.dependents !== null
        )
      }
    }),
    {
      name: 'user-profile-storage',
      partialize: (state) => ({ profile: state.profile })
    }
  )
)

export default useUserProfileStore
