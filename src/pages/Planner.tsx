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
      // Use our robust ScenarioManager save system instead of savePlannerState
      const { saveScenario } = await import('../utils/scenarioManager')
      
      let scenarioName = name
      if (!scenarioName) {
        // Prompt user for scenario name
        scenarioName = prompt(
          'Enter a name for your retirement plan:',
          plannerState.scenarioName || 'My Retirement Plan'
        )
        
        if (!scenarioName || !scenarioName.trim()) {
          return // User cancelled or entered empty name
        }
      }
      
      await saveScenario(scenarioName.trim(), plannerState)
      
      // Show success message
      alert(`Retirement plan "${scenarioName}" saved successfully!`)
      console.log('Scenario saved successfully:', scenarioName)
      
      // Analytics (simplified for demo)
      console.log('Scenario saved:', scenarioName)
    } catch (error) {
      console.error('Failed to save scenario:', error)
      alert(`Failed to save retirement plan: ${error.message || 'Please try again.'}`)
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

  // Track auto-save scenario ID to ensure single auto-save
  const [autoSaveId, setAutoSaveId] = useState<string | null>(null)
  
  // Auto-save function when changing tabs - maintains single auto-save
  const handleTabChange = async (newTab: PlannerStep) => {
    if (newTab === currentStep) return
    
    try {
      // Auto-save current state before switching
      console.log(`[Planner] Auto-saving before switching from ${currentStep} to ${newTab}`)
      
      // Import and use our robust scenario manager for auto-save
      const { saveScenario, getSavedScenarios } = await import('../utils/scenarioManager')
      
      // Find existing auto-save scenario or create new one
      let existingAutoSaveId = autoSaveId
      if (!existingAutoSaveId) {
        const existingScenarios = getSavedScenarios()
        const existingAutoSave = existingScenarios.find(s => s.name === 'Auto-save (Current Session)')
        if (existingAutoSave) {
          existingAutoSaveId = existingAutoSave.id
          setAutoSaveId(existingAutoSave.id)
        }
      }
      
      const scenario = await saveScenario(
        'Auto-save (Current Session)', 
        plannerState, 
        `Auto-saved while working on ${tabConfig[currentStep].title}`,
        existingAutoSaveId || undefined // Update existing or create new
      )
      
      // Store the auto-save ID for future updates
      if (!autoSaveId) {
        setAutoSaveId(scenario.id)
      }
      
      console.log(`[Planner] Auto-save successful (${existingAutoSaveId ? 'updated' : 'created'}), switching to ${newTab}`)
    } catch (error) {
      console.warn(`[Planner] Auto-save failed:`, error)
      // Continue with tab switch even if auto-save fails
    }
    
    setCurrentStep(newTab)
    
    // If switching to results, trigger calculation
    if (newTab === 'results') {
      setShowResults(true)
    }
  }
  
  // Calculate completion status for each tab
  const getTabCompletionStatus = (tabKey: PlannerStep) => {
    switch (tabKey) {
      case 'goal':
        return plannerState?.goal?.currentAge && plannerState?.goal?.retirementAge ? 'complete' : 'incomplete'
      case 'financials':
        return plannerState?.incomeExpense?.salary && plannerState?.super?.currentBalance ? 'complete' : 'incomplete'
      case 'property':
        return 'optional' // Property is always optional
      case 'modules':
        return plannerState?.portfolio?.monthlyInvestment !== undefined ? 'complete' : 'incomplete'
      case 'results':
        return result ? 'complete' : 'pending'
      default:
        return 'incomplete'
    }
  }
  
  // Track visited tabs to ensure progress reaches 100%
  const [visitedTabs, setVisitedTabs] = useState<Set<PlannerStep>>(new Set(['goal']))
  
  // Update visited tabs when changing steps
  useEffect(() => {
    setVisitedTabs(prev => new Set([...prev, currentStep]))
  }, [currentStep])
  
  // Calculate overall progress percentage
  const calculateOverallProgress = () => {
    const tabs = Object.keys(tabConfig) as PlannerStep[]
    const totalTabs = tabs.length
    
    // Simple calculation: percentage of tabs visited
    const visitedCount = visitedTabs.size
    const progressPercent = Math.min(100, (visitedCount / totalTabs) * 100)
    
    // If all tabs have been visited, ensure we show 100%
    if (visitedTabs.size >= totalTabs) {
      return 100
    }
    
    return Math.round(progressPercent)
  }

  // Tab configuration with descriptive names and descriptions
  const tabConfig = {
    goal: {
      title: 'Retirement Goals',
      description: 'Define your retirement vision',
      icon: '🎯',
      shortDesc: 'When & how much you want to retire with'
    },
    financials: {
      title: 'Current Finances', 
      description: 'Your income, expenses & super',
      icon: '💰',
      shortDesc: 'Salary, super balance, and monthly expenses'
    },
    property: {
      title: 'Property Portfolio',
      description: 'Existing properties & future plans',
      icon: '🏠',
      shortDesc: 'Properties you own or plan to buy'
    },
    modules: {
      title: 'Investment Strategy',
      description: 'ETFs, contributions & emergency funds',
      icon: '📈', 
      shortDesc: 'How you\'ll invest outside of super and property'
    },
    results: {
      title: 'Your Retirement Plan',
      description: 'Complete analysis & projections',
      icon: '🚀',
      shortDesc: 'See if you\'re on track and get recommendations'
    }
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

          {/* Compact Card-based Navigation */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              {Object.entries(tabConfig).map(([tabKey, config]) => {
                const isActive = currentStep === tabKey
                const status = getTabCompletionStatus(tabKey as PlannerStep)
                const hasVisited = visitedTabs.has(tabKey as PlannerStep)
                
                return (
                  <button
                    key={tabKey}
                    onClick={() => handleTabChange(tabKey as PlannerStep)}
                    className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 bg-white shadow-md hover:shadow-lg border-2 min-w-[120px] max-w-[160px] ${
                      isActive 
                        ? 'border-blue-500 bg-gradient-to-b from-blue-50 to-blue-100'
                        : hasVisited
                        ? 'border-green-200 hover:border-green-300'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Icon and Status */}
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{config.icon}</span>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        status === 'complete' ? 'bg-green-400' :
                        status === 'optional' ? 'bg-yellow-400' :
                        hasVisited ? 'bg-blue-400' : 'bg-gray-300'
                      }`} />
                    </div>
                    
                    {/* Title */}
                    <span className={`text-center leading-tight ${
                      isActive ? 'text-blue-700 font-semibold' : 'text-gray-700'
                    }`}>
                      {config.title}
                    </span>
                    
                    {/* Optional subtitle for current step */}
                    {isActive && (
                      <span className="text-xs text-blue-600 text-center leading-tight opacity-80">
                        {config.description}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Completion Progress</span>
                <span>{Math.round(calculateOverallProgress())}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${calculateOverallProgress()}%` }}
                />
              </div>
            </div>
            
            {/* Current tab description */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {tabConfig[currentStep].icon} {tabConfig[currentStep].title}
              </h2>
              <p className="text-gray-600">{tabConfig[currentStep].description}</p>
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
                plannerState={plannerState}
                onLoadScenario={(loadedState) => {
                  console.log('[Planner] Loading scenario from Stage 1:', loadedState)
                  updatePlannerState(loadedState)
                }}
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
                plannerState={plannerState}
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
                quickWin={generateQuickWin(result, plannerState)}
                onPrevious={handlePrevious}
                onLoadScenario={(loadedState) => {
                  console.log('[Planner] Loading scenario from Results:', loadedState)
                  updatePlannerState(loadedState)
                }}
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
              Retirement Planner v1.1.0 • Australian-focused • Built with Claude Code
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