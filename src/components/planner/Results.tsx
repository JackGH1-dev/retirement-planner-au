/**
 * Results Component - Step 4 of the retirement planner wizard
 * Displays simulation results, KPIs, charts, and actionable insights
 */

import React, { useEffect, useState } from 'react'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { ErrorMessage } from '../ui/ErrorMessage'
import { useSimulationWorker } from '../../hooks/useSimulationWorker'
import type { PlannerState } from '../../types/planner'

interface ResultsProps {
  data: PlannerState
  onExport?: () => void
}

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
    fill?: boolean
  }[]
}

export const Results: React.FC<ResultsProps> = ({ data, onExport }) => {
  const { runSimulation, isRunning, lastResults, error, workerStatus } = useSimulationWorker()
  const [showFullChart, setShowFullChart] = useState(false)

  // Auto-run simulation when data changes
  useEffect(() => {
    if (workerStatus === 'ready' && data) {
      runSimulation(data).catch(console.error)
    }
  }, [data, runSimulation, workerStatus])

  // Loading state
  if (isRunning || workerStatus === 'initializing') {
    return (
      <div className="text-center py-12">
        <LoadingSpinner size="large" message="Running your retirement simulation..." />
        <p className="text-sm text-gray-500 mt-4">
          This may take a few moments as we calculate your personalized projection
        </p>
      </div>
    )
  }

  // Error state
  if (error || !lastResults?.success) {
    return (
      <div className="text-center py-12">
        <ErrorMessage message={error || lastResults?.error || 'Simulation failed'} />
        <button
          onClick={() => runSimulation(data)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  const { simulation, metrics } = lastResults
  if (!simulation || !metrics) {
    return <ErrorMessage message="No simulation results available" />
  }

  // Prepare chart data
  const chartData: ChartData = {
    labels: simulation.years.map(year => year.toString()),
    datasets: [
      {
        label: 'Super Balance',
        data: simulation.superBalance,
        borderColor: '#3B82F6',
        backgroundColor: '#3B82F680',
        fill: false
      },
      {
        label: 'ETF Portfolio',
        data: simulation.etfPortfolio,
        borderColor: '#10B981',
        backgroundColor: '#10B98180',
        fill: false
      },
      {
        label: 'Property Value',
        data: simulation.propertyValue,
        borderColor: '#8B5CF6',
        backgroundColor: '#8B5CF680',
        fill: false
      },
      {
        label: 'Total Assets',
        data: simulation.totalAssets,
        borderColor: '#F59E0B',
        backgroundColor: '#F59E0B80',
        fill: false
      }
    ]
  }

  const displayYears = showFullChart ? simulation.years : simulation.years.slice(0, 11)
  const displayData = showFullChart ? chartData : {
    ...chartData,
    labels: chartData.labels.slice(0, 11),
    datasets: chartData.datasets.map(dataset => ({
      ...dataset,
      data: dataset.data.slice(0, 11)
    }))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Your Retirement Projection
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Based on your financial goals and investment strategy, here's what your retirement could look like
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`p-6 rounded-xl border-2 ${
          metrics.canRetire ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="text-center">
            <div className={`text-3xl font-bold ${
              metrics.canRetire ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {metrics.canRetire ? '✅' : '⚠️'}
            </div>
            <div className="text-sm font-medium text-gray-600 mt-2">Retirement Goal</div>
            <div className={`text-lg font-bold ${
              metrics.canRetire ? 'text-green-800' : 'text-yellow-800'
            }`}>
              {metrics.canRetire ? 'Achievable' : 'Shortfall'}
            </div>
            {!metrics.canRetire && metrics.shortfall > 0 && (
              <div className="text-xs text-yellow-700 mt-1">
                ${metrics.shortfall.toLocaleString()} annual gap
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              ${(metrics.finalAssets / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm font-medium text-gray-600 mt-2">Total Assets at {metrics.projectedRetirementAge}</div>
            <div className="text-sm text-blue-700">
              ${metrics.finalAssets.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              ${Math.round(metrics.finalMonthlyIncome).toLocaleString()}
            </div>
            <div className="text-sm font-medium text-gray-600 mt-2">Monthly Retirement Income</div>
            <div className="text-sm text-green-700">
              ${Math.round(metrics.finalAnnualIncome).toLocaleString()} per year
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {metrics.incomeReplacement.toFixed(0)}%
            </div>
            <div className="text-sm font-medium text-gray-600 mt-2">Income Replacement</div>
            <div className="text-sm text-purple-700">
              Of current expenses
            </div>
          </div>
        </div>
      </div>

      {/* Asset Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Asset Breakdown at Retirement
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">🏦</span>
            </div>
            <div className="text-sm font-medium text-gray-600">Superannuation</div>
            <div className="text-lg font-bold text-blue-600">
              ${metrics.assetBreakdown.super.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              {((metrics.assetBreakdown.super / metrics.finalAssets) * 100).toFixed(0)}% of total
            </div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">📈</span>
            </div>
            <div className="text-sm font-medium text-gray-600">ETF Portfolio</div>
            <div className="text-lg font-bold text-green-600">
              ${metrics.assetBreakdown.etf.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              {((metrics.assetBreakdown.etf / metrics.finalAssets) * 100).toFixed(0)}% of total
            </div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">🏠</span>
            </div>
            <div className="text-sm font-medium text-gray-600">Property</div>
            <div className="text-lg font-bold text-purple-600">
              ${metrics.assetBreakdown.property.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              {((metrics.assetBreakdown.property / metrics.finalAssets) * 100).toFixed(0)}% of total
            </div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">💰</span>
            </div>
            <div className="text-sm font-medium text-gray-600">Emergency Fund</div>
            <div className="text-lg font-bold text-gray-600">
              ${metrics.assetBreakdown.buffer.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              {((metrics.assetBreakdown.buffer / metrics.finalAssets) * 100).toFixed(0)}% of total
            </div>
          </div>
        </div>
      </div>

      {/* Simple Chart Visualization */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Wealth Growth Over Time
          </h3>
          <button
            onClick={() => setShowFullChart(!showFullChart)}
            className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {showFullChart ? 'Show 10 Years' : 'Show Full Timeline'}
          </button>
        </div>

        {/* Simple chart representation */}
        <div className="space-y-3">
          {displayData.datasets.map((dataset, index) => (
            <div key={dataset.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: dataset.borderColor }}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {dataset.label}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-800">
                  ${dataset.data[dataset.data.length - 1].toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-1000"
                  style={{ 
                    backgroundColor: dataset.backgroundColor,
                    width: `${(dataset.data[dataset.data.length - 1] / Math.max(...displayData.datasets.map(d => Math.max(...d.data)))) * 100}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Timeline: {displayData.labels[0]} - {displayData.labels[displayData.labels.length - 1]}
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-yellow-50 rounded-xl border-2 border-yellow-200 p-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-4">
          🎯 Key Action Items
        </h3>
        <div className="space-y-3">
          {!metrics.canRetire && (
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <div className="font-medium text-gray-800">Increase Your Savings Rate</div>
                <div className="text-sm text-gray-600">
                  You have a ${metrics.shortfall.toLocaleString()} annual income shortfall. 
                  Consider increasing your monthly investments or extending your working years.
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {metrics.canRetire ? '1' : '2'}
            </div>
            <div>
              <div className="font-medium text-gray-800">Maximize Your Before-tax Super</div>
              <div className="text-sm text-gray-600">
                Make sure you're using your full concessional cap of $27,500 per year through salary packaging.
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {metrics.canRetire ? '2' : '3'}
            </div>
            <div>
              <div className="font-medium text-gray-800">Maintain Your Emergency Fund</div>
              <div className="text-sm text-gray-600">
                Keep 3-6 months of expenses in your emergency fund to protect your investment strategy during tough times.
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {metrics.canRetire ? '3' : '4'}
            </div>
            <div>
              <div className="font-medium text-gray-800">Review Annually</div>
              <div className="text-sm text-gray-600">
                Update your plan every year to account for salary increases, life changes, and market performance.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={onExport}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          📄 Export Plan as PDF
        </button>
        <button
          onClick={() => runSimulation(data)}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
        >
          🔄 Re-run Simulation
        </button>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 p-4 rounded-lg border text-sm text-gray-600">
        <h4 className="font-medium text-gray-800 mb-2">⚠️ Important Disclaimer</h4>
        <ul className="space-y-1 text-xs">
          <li>• This projection is based on assumptions about future returns and may not reflect actual results</li>
          <li>• Investment returns are not guaranteed and past performance doesn't predict future results</li>
          <li>• Consider seeking advice from a qualified financial adviser for personalized guidance</li>
          <li>• Government policies, tax rates, and super rules may change over time</li>
          <li>• This tool is for educational purposes and is not personal financial advice</li>
        </ul>
      </div>
    </div>
  )
}