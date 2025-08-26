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
      
      // Realistic super projection calculations (aligned with ResultsSimple.tsx)
      const sgRate = 0.12 // Correct 12% SG rate
      const salarySacrifice = plannerState?.super?.salaryPackaging || 0
      const totalAnnualSuperContributions = (salary * sgRate) + (salarySacrifice * 12)
      
      // Realistic super return assumptions (after tax and fees)
      const grossReturn = 0.075 // 7.5% gross return
      const superTaxRate = 0.15 // 15% tax on earnings within super
      const investmentFeeRate = 0.008 // 0.8% investment fees
      const adminFeeAnnual = 80 // Admin fee per year
      const netReturn = grossReturn * (1 - superTaxRate) - investmentFeeRate // ~5.575%
      
      const currentSuperGrowth = superBalance * Math.pow(1 + netReturn, yearsToRetirement)
      const superContributionGrowth = totalAnnualSuperContributions * ((Math.pow(1 + netReturn, yearsToRetirement) - 1) / netReturn)
      
      // Subtract cumulative admin fees
      const inflationRate = 0.025
      let totalAdminFees = 0
      for (let year = 1; year <= yearsToRetirement; year++) {
        totalAdminFees += adminFeeAnnual * Math.pow(1 + inflationRate, year - 1)
      }
      
      const superProjection = Math.max(0, currentSuperGrowth + superContributionGrowth - totalAdminFees)
      
      // Realistic ETF projection calculation (aligned with ResultsSimple.tsx)
      const etfGrossReturn = 0.08 // 8% gross market return
      const etfManagementFee = 0.0018 // ~0.18% average management fees
      const etfPlatformFee = 0.0005 // Platform/brokerage fees
      const etfTaxDrag = 0.005 // ~0.5% tax drag during accumulation
      const etfNetReturn = etfGrossReturn - etfManagementFee - etfPlatformFee - etfTaxDrag // ~7.15%
      
      const etfProjection = (monthlyInvestment * 12) * ((Math.pow(1 + etfNetReturn, yearsToRetirement) - 1) / etfNetReturn)
      
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
          
          // Use realistic super returns and contributions
          const currentBalance = superBalance * Math.pow(1 + netReturn, yearsElapsed)
          const contributionsGrowth = yearsElapsed > 0 
            ? totalAnnualSuperContributions * ((Math.pow(1 + netReturn, yearsElapsed) - 1) / netReturn)
            : 0
          const cumulativeFees = yearsElapsed > 0 
            ? (adminFeeAnnual * ((Math.pow(1 + inflationRate, yearsElapsed) - 1) / inflationRate))
            : 0
            
          return Math.max(0, currentBalance + contributionsGrowth - cumulativeFees)
        }),
        outsideSuperBalance: Array.from({ length: yearsToRetirement * 12 }, (_, i) => {
          const monthsElapsed = i + 1
          const yearsElapsed = monthsElapsed / 12
          return (monthlyInvestment * monthsElapsed) * Math.pow(1 + etfNetReturn, yearsElapsed)
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