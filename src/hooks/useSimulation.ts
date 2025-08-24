/**
 * Simulation Hook - Demo implementation
 */

import { useState, useCallback } from 'react'

export interface ScenarioResult {
  kpis: {
    canRetire?: boolean
    netWorthAtRetirement?: number
    incomeReplacementRatio?: number
    monthlySavingsRequired?: number
  }
  series: {
    month: number[]
    age?: number[]
    netWorth: number[]
    superBalance: number[]
    outsideSuperBalance: number[]
    cashBalance?: number[]
    propertyValue?: number[]
    loanBalance?: number[]
    dcaPaused?: boolean[]
  }
  timestamp?: number
}

export const useSimulation = () => {
  const [result, setResult] = useState<ScenarioResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const runSimulation = useCallback(async (plannerState: any, settings: any) => {
    setLoading(true)
    setError(null)
    setProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      // Simulate calculation time
      await new Promise(resolve => setTimeout(resolve, 1500))
      clearInterval(progressInterval)
      setProgress(100)

      // Mock result
      const mockResult: ScenarioResult = {
        kpis: {
          canRetire: true,
          netWorthAtRetirement: 1250000,
          incomeReplacementRatio: 75,
          monthlySavingsRequired: 0
        },
        series: {
          month: Array.from({ length: 300 }, (_, i) => i),
          netWorth: Array.from({ length: 300 }, (_, i) => 50000 + (i * 2000) + Math.random() * 10000),
          superBalance: Array.from({ length: 300 }, (_, i) => 30000 + (i * 1200)),
          outsideSuperBalance: Array.from({ length: 300 }, (_, i) => 20000 + (i * 800)),
        },
        timestamp: Date.now()
      }

      setResult(mockResult)
    } catch (err) {
      setError('Simulation failed')
    } finally {
      setLoading(false)
      setProgress(0)
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