/**
 * Income & Expenses Tab - Simple salary and spending input
 * Progressive disclosure with smart defaults
 */

import React, { useState, useCallback } from 'react'
import type { IncomeExpenseState } from '../../../types/planner'
import { stringToNumber } from '../../../schemas/planner'
import { ProgressiveDisclosure } from '../../ui/ProgressiveDisclosure'
import { CurrencyInput } from '../../ui/CurrencyInput'
import { ErrorMessage } from '../../ui/ErrorMessage'

interface IncomeExpensesTabProps {
  value: IncomeExpenseState
  onChange: (value: IncomeExpenseState) => void
}

export const IncomeExpensesTab: React.FC<IncomeExpensesTabProps> = ({ value, onChange }) => {
  const [showDetails, setShowDetails] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateField = useCallback((field: keyof IncomeExpenseState, fieldValue: any) => {
    const updated = { ...value, [field]: fieldValue }
    onChange(updated)
    
    // Clear error when user updates field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [value, onChange, errors])

  // Calculate estimated savings rate
  const monthlySalary = value.salary / 12
  const estimatedTax = monthlySalary * 0.25 // Rough tax estimate
  const afterTaxMonthly = monthlySalary - estimatedTax
  const estimatedSavingsRate = Math.max(0, afterTaxMonthly - value.expensesMonthly)

  return (
    <div className="space-y-6">
      {/* Primary Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-lg font-semibold text-gray-700">
            Annual gross salary <span className="text-red-500">*</span>
          </label>
          <CurrencyInput
            value={value.salary}
            onChange={(amount) => updateField('salary', amount)}
            placeholder="100,000"
            min={30000}
            max={2000000}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg focus:border-blue-500 focus:outline-none transition-colors"
          />
          <p className="text-sm text-gray-500">Before tax, including super guarantee</p>
          {errors.salary && <ErrorMessage message={errors.salary} />}
        </div>

        <div className="space-y-2">
          <label className="block text-lg font-semibold text-gray-700">
            Monthly spending <span className="text-red-500">*</span>
          </label>
          <CurrencyInput
            value={value.expensesMonthly}
            onChange={(amount) => updateField('expensesMonthly', amount)}
            placeholder="4,000"
            min={1000}
            max={50000}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg focus:border-blue-500 focus:outline-none transition-colors"
          />
          <p className="text-sm text-gray-500">All expenses including rent, food, transport</p>
          {errors.expensesMonthly && <ErrorMessage message={errors.expensesMonthly} />}
        </div>
      </div>

      {/* Savings Rate Indicator */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-blue-800 mb-1">Estimated available for investing</h4>
            <p className="text-sm text-blue-600">
              After tax and expenses (rough estimate)
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-700">
              ${estimatedSavingsRate.toLocaleString()}/mo
            </div>
            <div className="text-sm text-blue-600">
              ~{((estimatedSavingsRate / afterTaxMonthly) * 100).toFixed(0)}% savings rate
            </div>
          </div>
        </div>
        
        {estimatedSavingsRate < 500 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              💡 <strong>Tip:</strong> A higher savings rate accelerates your retirement timeline. 
              Consider reviewing expenses or exploring income growth opportunities.
            </p>
          </div>
        )}
      </div>

      {/* Progressive Disclosure for Advanced Fields */}
      <ProgressiveDisclosure
        title="Show more details"
        subtitle="Bonus income and wage growth assumptions"
        isExpanded={showDetails}
        onToggle={setShowDetails}
      >
        <div className="space-y-6 pt-4 border-t border-gray-200">
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-gray-700">
              Annual bonus (optional)
            </label>
            <CurrencyInput
              value={value.bonus || 0}
              onChange={(amount) => updateField('bonus', amount || undefined)}
              placeholder="10,000"
              min={0}
              max={500000}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg focus:border-blue-500 focus:outline-none transition-colors"
            />
            <p className="text-sm text-gray-500">
              Variable income like bonuses, commissions, or overtime
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-lg font-semibold text-gray-700">
              Expected wage growth per year
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="15"
                step="0.5"
                value={(value.wageGrowthPct * 100).toFixed(1)}
                onChange={(e) => updateField('wageGrowthPct', parseFloat(e.target.value) / 100)}
                className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg text-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
              <span className="absolute right-4 top-3 text-lg text-gray-500">%</span>
            </div>
            <p className="text-sm text-gray-500">
              Typical range is 2-5% per year including promotions and inflation adjustments
            </p>
            <div className="flex space-x-2 text-xs">
              {[2, 3, 4, 5].map(rate => (
                <button
                  key={rate}
                  onClick={() => updateField('wageGrowthPct', rate / 100)}
                  className={`px-3 py-1 rounded border transition-colors ${
                    Math.abs(value.wageGrowthPct - rate / 100) < 0.001
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {rate}%
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-semibold text-gray-700 mb-2">Income Projection</h5>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Salary in 5 years:</span>
                <span className="font-semibold">
                  ${Math.round(value.salary * Math.pow(1 + value.wageGrowthPct, 5)).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Salary in 10 years:</span>
                <span className="font-semibold">
                  ${Math.round(value.salary * Math.pow(1 + value.wageGrowthPct, 10)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </ProgressiveDisclosure>

      {/* Quick Tips */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-2">💡 Quick Tips</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Include all income sources in your salary (base + regular overtime)</li>
          <li>• Be realistic with expenses—underestimating makes the plan less reliable</li>
          <li>• Wage growth compounds over time, so even small increases matter</li>
        </ul>
      </div>
    </div>
  )
}