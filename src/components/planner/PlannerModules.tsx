/**
 * Planner Modules - Step 3 of the retirement planner wizard
 * Contains SuperPlanner, ETFPlanner, and PropertyPlanner modules
 */

import React from 'react'
import { SuperPlanner } from './modules/SuperPlanner'
import { ETFPlanner } from './modules/ETFPlanner'
import { PropertyPlanner } from './modules/PropertyPlanner'
import type { PlannerState } from '../../types/planner'

interface PlannerModulesProps {
  data: PlannerState
  onChange: (data: PlannerState) => void
  errors?: Record<string, string>
}

export const PlannerModules: React.FC<PlannerModulesProps> = ({
  data,
  onChange,
  errors = {}
}) => {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Step 3: Investment Planning
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Configure your investment strategy across super, ETFs, and property. 
          Each module provides recommendations based on your goals and current situation.
        </p>
      </div>

      {/* Super Planning Module */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 flex items-center">
            🏦 Superannuation Planning
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            Optimize your before-tax super strategy and investment options
          </p>
        </div>
        <div className="p-6">
          <SuperPlanner
            data={data}
            onChange={onChange}
            errors={errors}
          />
        </div>
      </div>

      {/* ETF Planning Module */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-green-50 px-6 py-4 border-b border-green-200">
          <h3 className="text-lg font-semibold text-green-900 flex items-center">
            📈 ETF Investment Planning
          </h3>
          <p className="text-sm text-green-700 mt-1">
            Plan your ETF portfolio allocation and investment timeline
          </p>
        </div>
        <div className="p-6">
          <ETFPlanner
            data={data}
            onChange={onChange}
            errors={errors}
          />
        </div>
      </div>

      {/* Property Planning Module */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-purple-50 px-6 py-4 border-b border-purple-200">
          <h3 className="text-lg font-semibold text-purple-900 flex items-center">
            🏠 Property Investment Planning
          </h3>
          <p className="text-sm text-purple-700 mt-1">
            Model property investments and growth scenarios
          </p>
        </div>
        <div className="p-6">
          <PropertyPlanner
            data={data}
            onChange={onChange}
            errors={errors}
          />
        </div>
      </div>

      {/* Planning Summary */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          📋 Investment Allocation Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-100 p-4 rounded-lg">
            <div className="text-sm font-medium text-blue-800 mb-1">Superannuation</div>
            <div className="text-xl font-bold text-blue-900">
              ${(data.super.currentBalance + (data.super.salaryPackaging * 12)).toLocaleString()}
            </div>
            <div className="text-xs text-blue-700">
              ${data.super.salaryPackaging}/month contributions
            </div>
          </div>
          
          <div className="bg-green-100 p-4 rounded-lg">
            <div className="text-sm font-medium text-green-800 mb-1">ETF Portfolio</div>
            <div className="text-xl font-bold text-green-900">
              ${(data.portfolio.currentValue + (data.portfolio.monthlyInvestment * 12)).toLocaleString()}
            </div>
            <div className="text-xs text-green-700">
              ${data.portfolio.monthlyInvestment}/month investments
            </div>
          </div>

          <div className="bg-purple-100 p-4 rounded-lg">
            <div className="text-sm font-medium text-purple-800 mb-1">Property</div>
            <div className="text-xl font-bold text-purple-900">
              ${data.property.currentValue.toLocaleString()}
            </div>
            <div className="text-xs text-purple-700">
              {data.property.plannedInvestmentAmount > 0 
                ? `$${data.property.plannedInvestmentAmount.toLocaleString()} planned`
                : 'No new investment planned'
              }
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">💡 Key Recommendations</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Balance your investments across super, ETFs, and property for diversification</li>
            <li>• Maximize before-tax super contributions up to the annual cap</li>
            <li>• Use ETFs for flexible investments with lower entry costs</li>
            <li>• Consider property when you have sufficient deposit and stable income</li>
            <li>• Maintain emergency fund before increasing investment allocations</li>
          </ul>
        </div>
      </div>
    </div>
  )
}