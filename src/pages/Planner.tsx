/**
 * Main Planner Page - MVP 6-Approach Retirement Planning
 * Route: /app/planner (Primary authenticated route)
 */

import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSettings } from '../contexts/SettingsContextSimple'
import { GoalSetter } from '../components/planner/GoalSetterSimple'
import { CurrentFinancials } from '../components/planner/CurrentFinancialsSimple'
import { PropertyStep } from '../components/planner/PropertyStep'
import { PlannerModules } from '../components/planner/PlannerModulesSimple'
import { Results } from '../components/planner/ResultsSimple'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorBoundary } from '../components/ui/ErrorBoundary'
import { useSimulation } from '../hooks/useSimulation.js'
import { usePlannerState } from '../hooks/usePlannerState.js'
import type { PlannerState, ScenarioResult } from '../types/planner'

type PlannerStep = 'goal' | 'financials' | 'property' | 'modules' | 'results'

const Planner: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const { settings, loading: settingsLoading } = useSettings()
  const [currentStep, setCurrentStep] = useState<PlannerStep>('goal')
  const [showResults, setShowResults] = useState(false)
  const [stepTimer, setStepTimer] = useState<any | null>(null)
  
  // Custom hooks for state management and simulation
  const {
    plannerState,
    updatePlannerState,
    savePlannerState,
    loading: stateLoading,
    error: stateError
  } = usePlannerState()
  
  const {
    runSimulation,
    result,
    loading: simulationLoading,
    progress,
    error: simulationError
  } = useSimulation()

  // Initialize app
  useEffect(() => {
    console.log('Full Planner initialized')
  }, [])

  // Auto-run simulation when state changes (debounced)
  useEffect(() => {
    if (currentStep === 'modules' || showResults) {
      if (plannerState && settings) {
        const timer = setTimeout(() => {
          runSimulation(plannerState, settings)
        }, 500)
        return () => clearTimeout(timer)
      }
    }
  }, [plannerState, currentStep, showResults, settings, runSimulation])

  // Step navigation handlers
  const handleGoalComplete = (goalData: any) => {
    updatePlannerState({ goal: goalData })
    setCurrentStep('financials')
    
    // Analytics (simplified for demo)
    console.log('Goal completed:', goalData)
    
    console.log('Goal setting completed')
  }

  const handleFinancialsComplete = () => {
    setCurrentStep('property')
    
    // Analytics (simplified for demo)
    console.log('Salary entered:', plannerState.incomeExpense?.salary || 0)
    
    console.log('Financial details completed')
  }

  const handlePropertyComplete = () => {
    setCurrentStep('modules')
    
    // Analytics (simplified for demo)
    console.log('Property details completed')
  }

  // Navigation handlers
  const handlePrevious = () => {
    switch (currentStep) {
      case 'financials':
        setCurrentStep('goal')
        break
      case 'property':
        setCurrentStep('financials')
        break
      case 'modules':
        setCurrentStep('property')
        break
      case 'results':
        setCurrentStep('modules')
        break
    }
  }
  
  const getSalaryRange = (salary: number): string => {
    if (salary < 50000) return '0-50k'
    if (salary < 75000) return '50k-75k' 
    if (salary < 100000) return '75k-100k'
    if (salary < 150000) return '100k-150k'
    return '150k+'
  }

  const handleShowResults = () => {
    setShowResults(true)
    setCurrentStep('results')
    
    // Analytics (simplified for demo)
    if (result) {
      console.log('Simulation completed:', result.kpis)
    }
    
    console.log('Simulation complete')
  }

  const handleSaveScenario = async (name?: string) => {
    try {
      await savePlannerState(name || plannerState.scenarioName || 'My Retirement Plan')
      
      // Show success toast (implement toast context)
      console.log('Scenario saved successfully!')
      
      // Analytics (simplified for demo)
      console.log('Scenario saved:', plannerState.scenarioName)
    } catch (error) {
      console.error('Failed to save scenario:', error)
      // Show error toast
    }
  }

  const handleExportCSV = () => {
    if (!result) return
    
    try {
      // Generate CSV from simulation result
      const csvData = generateCSVFromResult(result)
      downloadCSV(csvData, `${plannerState.scenarioName || 'retirement-plan'}.csv`)
      
      // Analytics (simplified for demo)
      console.log('CSV exported:', plannerState.scenarioName)
    } catch (error) {
      console.error('Failed to export CSV:', error)
    }
  }

  // Step progress calculation
  const stepProgress = useMemo(() => {
    switch (currentStep) {
      case 'goal': return 20
      case 'financials': return 40
      case 'property': return 60
      case 'modules': return 80
      case 'results': return 100
      default: return 0
    }
  }, [currentStep])

  // Step titles for UI
  const stepTitles = {
    goal: 'Your Goals',
    financials: 'Current Situation',
    property: 'Property Details', 
    modules: 'Investment Strategy',
    results: 'Your Plan Results'
  }

  // Loading states
  if (authLoading || settingsLoading || stateLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading your planner..." />
      </div>
    )
  }

  // Error states
  if (stateError || simulationError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md">
          <div className="text-red-600 text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              {stateError || simulationError || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Build Your Retirement Plan
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple, Australian-focused planning. Keep it flexible—you can change details anytime.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep === 'goal' ? 1 : currentStep === 'financials' ? 2 : currentStep === 'property' ? 3 : currentStep === 'modules' ? 4 : 5} of 5</span>
              <span>{stepTitles[currentStep]}</span>
            </div>
            <div className="w-full bg-white/50 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stepProgress}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="space-y-8">
            {currentStep === 'goal' && (
              <GoalSetter
                value={plannerState.goal}
                onChange={(goal) => updatePlannerState({ goal })}
                presets={['Conservative', 'Base', 'Optimistic']}
                onComplete={handleGoalComplete}
              />
            )}

            {currentStep === 'financials' && (
              <CurrentFinancials
                incomeExpense={plannerState.incomeExpense}
                superState={plannerState.super}
                property={plannerState.property}
                portfolio={plannerState.portfolio}
                buffers={plannerState.buffers}
                settings={settings}
                onChangeIncomeExpense={(incomeExpense) => updatePlannerState({ incomeExpense })}
                onChangeSuper={(superState) => updatePlannerState({ super: superState })}
                onChangeProperty={(property) => updatePlannerState({ property })}
                onChangePortfolio={(portfolio) => updatePlannerState({ portfolio })}
                onChangeBuffers={(buffers) => updatePlannerState({ buffers })}
                onComplete={handleFinancialsComplete}
                onPrevious={handlePrevious}
              />
            )}

            {currentStep === 'property' && (
              <PropertyStep
                propertyData={plannerState.property}
                onChange={(property) => updatePlannerState({ property })}
                onComplete={handlePropertyComplete}
                onPrevious={handlePrevious}
              />
            )}

            {currentStep === 'modules' && (
              <PlannerModules
                plannerState={plannerState}
                settings={settings}
                simulationResult={result}
                onUpdateState={updatePlannerState}
                onShowResults={handleShowResults}
                simulationLoading={simulationLoading}
                simulationProgress={progress}
                onPrevious={handlePrevious}
              />
            )}

            {currentStep === 'results' && result && (
              <Results
                kpis={result.kpis}
                series={result.series}
                plannerState={plannerState}
                onExportCSV={handleExportCSV}
                onSave={handleSaveScenario}
                quickWin={generateQuickWin(result, plannerState)}
                onPrevious={handlePrevious}
              />
            )}
          </div>

          {/* Simulation Loading Overlay */}
          {simulationLoading && currentStep === 'modules' && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm mx-4">
                <LoadingSpinner size="medium" />
                <h3 className="text-xl font-semibold mt-4 mb-2">Running simulation...</h3>
                <p className="text-gray-600 mb-4">Calculating your retirement outlook</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">{Math.round(progress)}% complete</p>
              </div>
            </div>
          )}

          {/* Version Information */}
          <div className="text-center mt-8 py-4">
            <p className="text-xs text-gray-400">
              Retirement Planner v1.01 • Australian-focused • Built with Claude Code
            </p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

// Helper functions
function generateCSVFromResult(result: ScenarioResult): string {
  const headers = [
    'Month', 'Age', 'Net Worth', 'Super Balance', 'Outside Super Balance', 
    'Cash Balance', 'Property Value', 'Loan Balance', 'DCA Paused'
  ]
  
  const rows = result.series.month.map((month, i) => [
    month,
    result.series.age?.[i]?.toFixed(1) || '',
    result.series.netWorth[i]?.toFixed(0) || '',
    result.series.superBalance[i]?.toFixed(0) || '',
    result.series.outsideSuperBalance[i]?.toFixed(0) || '',
    result.series.cashBalance?.[i]?.toFixed(0) || '',
    result.series.propertyValue?.[i]?.toFixed(0) || '',
    result.series.loanBalance?.[i]?.toFixed(0) || '',
    result.series.dcaPaused?.[i] ? 'Yes' : 'No'
  ])
  
  return [headers, ...rows]
    .map(row => row.join(','))
    .join('\n')
}

function downloadCSV(csvData: string, filename: string) {
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

function generateQuickWin(result: ScenarioResult, state: PlannerState) {
  // Simple logic to suggest small improvements
  if (!result.kpis.monthlySavingsRequired) return undefined
  
  const gap = result.kpis.monthlySavingsRequired
  if (gap > 0 && gap < 300) {
    return {
      message: `Add $${Math.round(gap)}/month to ETF investing to reach your goal`,
      actionLabel: 'Apply suggestion',
      onApply: () => {
        // Update portfolio DCA
        console.log('Applying quick win suggestion')
      }
    }
  }
  
  return undefined
}

export default Planner