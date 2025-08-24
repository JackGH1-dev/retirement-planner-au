/**
 * Planner Modules Component - Step 3 of the retirement planner
 * Simplified version for full planner integration
 */

import React from 'react'

interface PlannerModulesProps {
  plannerState: any
  settings: any
  simulationResult: any
  onUpdateState: (updates: any) => void
  onShowResults: () => void
  simulationLoading: boolean
  simulationProgress: number
  onPrevious?: () => void
}

export const PlannerModules: React.FC<PlannerModulesProps> = ({
  plannerState,
  settings,
  simulationResult,
  onUpdateState,
  onShowResults,
  simulationLoading,
  simulationProgress,
  onPrevious
}) => {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Step 3: Investment Strategy</h2>
        
        <div className="space-y-6">
          {/* Super Strategy */}
          <div className="border rounded-lg p-4 bg-blue-50">
            <h3 className="font-semibold text-blue-900 mb-2">🏦 Superannuation Strategy</h3>
            <p className="text-blue-800 text-sm">
              High Growth option selected (8% expected return) with salary packaging optimization.
              Your super will benefit from before-tax contributions up to the annual cap of $27,500.
            </p>
            <div className="mt-3 text-sm text-blue-700">
              <strong>Annual Contribution:</strong> ${Math.round((plannerState?.incomeExpense?.salary || 75000) * 0.11 + 6000).toLocaleString()} (SG + salary packaging)
            </div>
          </div>

          {/* ETF Strategy */}
          <div className="border rounded-lg p-4 bg-green-50">
            <h3 className="font-semibold text-green-900 mb-2">📈 ETF Investment Strategy</h3>
            <p className="text-green-800 text-sm">
              OneETF strategy recommended - single diversified fund (VDHG-style) for maximum simplicity.
              This provides global diversification with minimal management required.
            </p>
            <div className="mt-3 text-sm text-green-700">
              <strong>Monthly Investment:</strong> ${(plannerState?.portfolio?.monthlyInvestment || 1000).toLocaleString()}
            </div>
          </div>

          {/* Property Strategy */}
          <div className="border rounded-lg p-4 bg-purple-50">
            <h3 className="font-semibold text-purple-900 mb-2">🏠 Property Strategy</h3>
            <p className="text-purple-800 text-sm">
              Focus on ETFs and super first - property investment can be considered later when you have
              sufficient capital and stable income for deposit requirements.
            </p>
          </div>

          {/* Loading State */}
          {simulationLoading && (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-2">Running simulation... {Math.round(simulationProgress)}%</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            {onPrevious && (
              <button
                onClick={onPrevious}
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
              >
                ← Previous
              </button>
            )}
            <button
              onClick={onShowResults}
              disabled={simulationLoading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:opacity-50 ml-auto"
            >
              {simulationLoading ? 'Calculating...' : 'View Results →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}