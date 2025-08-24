/**
 * Planner State Hook - Demo implementation
 */

import { useState, useCallback } from 'react'
import { createDefaultPlannerState } from '../types/planner'
import type { PlannerState } from '../types/planner'

export const usePlannerState = () => {
  const [plannerState, setPlannerState] = useState<PlannerState>(createDefaultPlannerState())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updatePlannerState = useCallback((updates: Partial<PlannerState>) => {
    setPlannerState(prev => ({ ...prev, ...updates }))
  }, [])

  const savePlannerState = useCallback(async (name?: string) => {
    setLoading(true)
    try {
      // Simulate save
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('Saving planner state:', name)
    } catch (err) {
      setError('Failed to save')
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    plannerState,
    updatePlannerState,
    savePlannerState,
    loading,
    error
  }
}