/**
 * Planner State Hook - Simplified version for full planner integration
 * Manages planner state and persistence
 */

import { useState, useCallback } from 'react'

const initialPlannerState = {
  goal: {
    currentAge: 30,
    retirementAge: 65,
    targetIncome: 80000,
    goalType: 'income'
  },
  incomeExpense: {
    salary: 75000,
    monthlyExpenses: 2850  // Default to HEM single household estimate instead of generic $4000
  },
  super: {
    currentBalance: 50000,
    salaryPackaging: 0  // Changed from 500 to 0 - no default extra super contributions
  },
  portfolio: {
    currentValue: 0,
    monthlyInvestment: 0  // Changed from 1000 to 0 - no default monthly investment
  },
  property: {
    hasProperty: false
  },
  buffers: {
    emergencyFund: 10000
  },
  scenarioName: 'My Retirement Plan'
}

export const usePlannerState = () => {
  const [plannerState, setPlannerState] = useState(initialPlannerState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const updatePlannerState = useCallback((updates) => {
    setPlannerState(prevState => ({
      ...prevState,
      ...updates
    }))
  }, [])

  const savePlannerState = useCallback(async (name) => {
    setLoading(true)
    setError(null)
    
    try {
      // Simulate saving to storage
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const stateToSave = {
        ...plannerState,
        scenarioName: name || plannerState.scenarioName,
        lastSaved: new Date().toISOString()
      }
      
      // Store in localStorage for demo
      localStorage.setItem('plannerState', JSON.stringify(stateToSave))
      
      setPlannerState(stateToSave)
      setLoading(false)
      
      return stateToSave
    } catch (err) {
      setError(err.message || 'Failed to save planner state')
      setLoading(false)
      throw err
    }
  }, [plannerState])

  const loadPlannerState = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Try to load from localStorage
      const saved = localStorage.getItem('plannerState')
      if (saved) {
        const parsedState = JSON.parse(saved)
        setPlannerState(parsedState)
      }
      setLoading(false)
    } catch (err) {
      setError(err.message || 'Failed to load planner state')
      setLoading(false)
    }
  }, [])

  return {
    plannerState,
    updatePlannerState,
    savePlannerState,
    loadPlannerState,
    loading,
    error
  }
}