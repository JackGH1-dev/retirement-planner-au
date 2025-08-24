/**
 * Simulation Hook - Simplified version for full planner integration
 * Handles retirement simulation calculations
 */

import { useState, useCallback } from 'react'

export const useSimulation = () => {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  const runSimulation = useCallback(async (plannerState, settings) => {
    setLoading(true)
    setProgress(0)
    setError(null)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      // Simple simulation calculation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      clearInterval(progressInterval)
      setProgress(100)

      // Extract data from planner state
      const currentAge = plannerState?.goal?.currentAge || 30
      const retirementAge = plannerState?.goal?.retirementAge || 65
      const yearsToRetirement = retirementAge - currentAge
      const targetIncome = plannerState?.goal?.targetIncome || 80000
      
      const salary = plannerState?.incomeExpense?.salary || 75000
      const superBalance = plannerState?.super?.currentBalance || 50000
      const monthlyInvestment = plannerState?.portfolio?.monthlyInvestment || 1000
      
      // Simple projection calculations
      const superProjection = superBalance * Math.pow(1.08, yearsToRetirement) + 
                             (salary * 0.11 + 6000) * ((Math.pow(1.08, yearsToRetirement) - 1) / 0.08)
      
      const etfProjection = (monthlyInvestment * 12) * ((Math.pow(1.08, yearsToRetirement) - 1) / 0.08)
      
      const totalAssets = superProjection + etfProjection
      const monthlyRetirementIncome = (totalAssets * 0.04) / 12
      const canRetire = monthlyRetirementIncome >= (targetIncome / 12)

      // Generate monthly series data for charts
      const series = {
        month: Array.from({ length: yearsToRetirement * 12 }, (_, i) => i + 1),
        netWorth: Array.from({ length: yearsToRetirement * 12 }, (_, i) => {
          const monthsElapsed = i + 1
          const yearsElapsed = monthsElapsed / 12
          return (superBalance + (monthlyInvestment * monthsElapsed)) * Math.pow(1.08, yearsElapsed)
        }),
        superBalance: Array.from({ length: yearsToRetirement * 12 }, (_, i) => {
          const monthsElapsed = i + 1
          const yearsElapsed = monthsElapsed / 12
          return superBalance * Math.pow(1.08, yearsElapsed) + 
                 (salary * 0.11 * yearsElapsed)
        }),
        outsideSuperBalance: Array.from({ length: yearsToRetirement * 12 }, (_, i) => {
          const monthsElapsed = i + 1
          const yearsElapsed = monthsElapsed / 12
          return (monthlyInvestment * monthsElapsed) * Math.pow(1.08, yearsElapsed)
        })
      }

      const simulationResult = {
        kpis: {
          canRetire,
          netWorthAtRetirement: totalAssets,
          monthlyRetirementIncome,
          incomeReplacementRatio: (monthlyRetirementIncome * 12) / targetIncome,
          monthlySavingsRequired: Math.max(0, (targetIncome / 12) - monthlyRetirementIncome),
          superProjection,
          etfProjection
        },
        series,
        timestamp: Date.now(),
        plannerState
      }

      setResult(simulationResult)
      setLoading(false)
    } catch (err) {
      setError(err.message || 'Simulation failed')
      setLoading(false)
    }
  }, [])

  return {
    runSimulation,
    result,
    loading,
    progress,
    error
  }
}