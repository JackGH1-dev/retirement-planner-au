/**
 * Super Planner Module - Superannuation optimization and planning
 * Handles salary packaging recommendations, cap management, and investment options
 */

import React, { useState, useMemo } from 'react'
import { CurrencyInput } from '../../ui/CurrencyInput'
import { BasicCapIndicator } from '../../ui/BasicCapIndicator'
import { ProgressiveDisclosure } from '../../ui/ProgressiveDisclosure'
import { ErrorMessage } from '../../ui/ErrorMessage'
import type { PlannerState, SuperOption } from '../../../types/planner'

interface SuperPlannerProps {
  data: PlannerState
  onChange: (data: PlannerState) => void
  errors?: Record<string, string>
}

const SUPER_OPTIONS = [
  {
    id: 'HighGrowth' as SuperOption,
    label: 'High Growth (Recommended)',
    description: 'Maximum growth potential for long-term wealth building',
    allocation: '85% Growth Assets, 15% Defensive',
    expectedReturn: 0.08,
    volatility: 'High',
    timeHorizon: '10+ years',
    pros: ['Highest long-term returns', 'Best for young investors', 'Inflation protection'],
    cons: ['Higher volatility', 'Short-term fluctuations']
  },
  {
    id: 'Growth' as SuperOption,
    label: 'Growth',
    description: 'Strong growth with slightly less volatility',
    allocation: '70% Growth Assets, 30% Defensive',
    expectedReturn: 0.075,
    volatility: 'Medium-High',
    timeHorizon: '7+ years',
    pros: ['Good long-term returns', 'Moderate volatility', 'Balanced approach'],
    cons: ['Lower returns than High Growth', 'Still some volatility']
  },
  {
    id: 'Balanced' as SuperOption,
    label: 'Balanced',
    description: 'Equal mix of growth and defensive assets',
    allocation: '50% Growth Assets, 50% Defensive',
    expectedReturn: 0.065,
    volatility: 'Medium',
    timeHorizon: '5+ years',
    pros: ['Moderate volatility', 'Steady returns', 'Less stress'],
    cons: ['Lower long-term returns', 'May not keep up with inflation']
  },
  {
    id: 'Conservative' as SuperOption,
    label: 'Conservative',
    description: 'Lower risk, steady returns',
    allocation: '30% Growth Assets, 70% Defensive',
    expectedReturn: 0.05,
    volatility: 'Low',
    timeHorizon: '3+ years',
    pros: ['Low volatility', 'Stable returns', 'Capital protection'],
    cons: ['Lower returns', 'Inflation risk', 'Not ideal for young investors']
  }
] as const

const SALARY_PACKAGING_SUGGESTIONS = [
  { amount: 0, label: 'None - Keep cash flow' },
  { amount: 500, label: '$500/month - Modest boost' },
  { amount: 1000, label: '$1,000/month - Strong strategy' },
  { amount: 1500, label: '$1,500/month - Aggressive approach' },
  { amount: 2291, label: '$2,291/month - Maximum allowed' }
]

export const SuperPlanner: React.FC<SuperPlannerProps> = ({
  data,
  onChange,
  errors = {}
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateSuperField = <K extends keyof PlannerState['super']>(
    field: K,
    value: PlannerState['super'][K]
  ) => {
    onChange({
      ...data,
      super: { ...data.super, [field]: value }
    })
  }

  // Calculate contribution cap usage
  const capCalculations = useMemo(() => {
    const annualSalaryPackaging = data.super.salaryPackaging * 12
    const annualEmployerContrib = data.income.salary * 0.11 // SG rate
    const totalAnnualContrib = annualSalaryPackaging + annualEmployerContrib
    const usagePct = totalAnnualContrib / 27500 // Default cap
    
    return {
      totalAnnualContrib,
      usagePct,
      remainingCapacity: Math.max(0, 27500 - totalAnnualContrib),
      suggestedMonthly: Math.max(0, (27500 - annualEmployerContrib) / 12)
    }
  }, [data.super.salaryPackaging, data.income.salary])

  const selectedOption = SUPER_OPTIONS.find(opt => opt.id === data.super.investmentOption)

  // Calculate projected balance
  const projectedBalance = useMemo(() => {
    const yearsToRetirement = data.goalSetter.retirementAge - (data.goalSetter.currentAge || 30)
    const currentBalance = data.super.currentBalance
    const annualContrib = capCalculations.totalAnnualContrib
    const returnRate = selectedOption?.expectedReturn || 0.08
    
    if (yearsToRetirement <= 0) return currentBalance
    
    // Compound existing balance
    const futureValue = currentBalance * Math.pow(1 + returnRate, yearsToRetirement)
    
    // Future value of annual contributions
    const contributionFV = annualContrib * ((Math.pow(1 + returnRate, yearsToRetirement) - 1) / returnRate)
    
    return futureValue + contributionFV
  }, [data.super.currentBalance, capCalculations.totalAnnualContrib, data.goalSetter.retirementAge, data.goalSetter.currentAge, selectedOption])

  return (
    <div className="space-y-6">
      {/* Cap Usage Indicator */}
      <BasicCapIndicator
        usagePct={capCalculations.usagePct}
        capLabel="Before-tax Super Cap"
        currentMonthly={data.super.salaryPackaging}
        suggestedMonthly={Math.round(capCalculations.suggestedMonthly)}
      />

      {/* Salary Packaging Optimization */}
      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            Salary Packaging Optimization
          </h4>
          <p className="text-sm text-gray-600">
            Before-tax super contributions reduce your taxable income and boost your retirement savings
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Salary Packaging Amount
          </label>
          <CurrencyInput
            value={data.super.salaryPackaging}
            onChange={(value) => updateSuperField('salaryPackaging', value)}
            placeholder="Enter monthly amount"
            className="w-full md:w-1/2"
          />
          {errors['super.salaryPackaging'] && (
            <ErrorMessage message={errors['super.salaryPackaging']} />
          )}
        </div>

        {/* Quick Amount Buttons */}
        <div className="flex flex-wrap gap-2">
          {SALARY_PACKAGING_SUGGESTIONS.map(suggestion => (
            <button
              key={suggestion.amount}
              type="button"
              onClick={() => updateSuperField('salaryPackaging', suggestion.amount)}
              className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                data.super.salaryPackaging === suggestion.amount
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400 text-gray-700'
              }`}
            >
              {suggestion.label}
            </button>
          ))}
        </div>

        {/* Tax Savings Display */}
        {data.super.salaryPackaging > 0 && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h5 className="font-medium text-green-900 mb-2">💰 Tax Savings Estimate</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-green-700">Annual Tax Saving:</div>
                <div className="text-lg font-bold text-green-900">
                  ${Math.round(data.super.salaryPackaging * 12 * 0.32).toLocaleString()}
                </div>
                <div className="text-xs text-green-600">
                  Assumes 32% marginal tax rate
                </div>
              </div>
              <div>
                <div className="text-green-700">Super Tax Rate:</div>
                <div className="text-lg font-bold text-green-900">15%</div>
                <div className="text-xs text-green-600">
                  vs {32}% personal tax rate
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Investment Option Selection */}
      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            Super Investment Option
          </h4>
          <p className="text-sm text-gray-600">
            Choose how your super fund invests your money
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {SUPER_OPTIONS.map(option => (
            <div
              key={option.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                data.super.investmentOption === option.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => updateSuperField('investmentOption', option.id)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <input
                    type="radio"
                    checked={data.super.investmentOption === option.id}
                    onChange={() => updateSuperField('investmentOption', option.id)}
                    className="h-4 w-4 text-blue-600"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-700">
                      {option.label}
                    </h5>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        {(option.expectedReturn * 100).toFixed(1)}% return
                      </div>
                      <div className="text-xs text-gray-500">
                        {option.volatility} risk
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {option.description}
                  </p>
                  <div className="text-xs text-gray-500 mb-2">
                    <strong>Allocation:</strong> {option.allocation} • <strong>Time horizon:</strong> {option.timeHorizon}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="font-medium text-green-600 mb-1">Pros:</div>
                      <ul className="space-y-1 text-green-700">
                        {option.pros.map((pro, i) => (
                          <li key={i}>• {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="font-medium text-orange-600 mb-1">Considerations:</div>
                      <ul className="space-y-1 text-orange-700">
                        {option.cons.map((con, i) => (
                          <li key={i}>• {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {errors['super.investmentOption'] && (
          <ErrorMessage message={errors['super.investmentOption']} />
        )}
      </div>

      {/* Super Projection */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h5 className="font-medium text-blue-900 mb-3">🎯 Super Projection at Retirement</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-blue-700">Current Balance:</div>
            <div className="text-lg font-bold text-blue-900">
              ${data.super.currentBalance.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-blue-700">Annual Contributions:</div>
            <div className="text-lg font-bold text-blue-900">
              ${capCalculations.totalAnnualContrib.toLocaleString()}
            </div>
            <div className="text-xs text-blue-600">
              Employer + Salary packaging
            </div>
          </div>
          <div>
            <div className="text-blue-700">Projected at {data.goalSetter.retirementAge || 65}:</div>
            <div className="text-xl font-bold text-blue-900">
              ${projectedBalance.toLocaleString()}
            </div>
            <div className="text-xs text-blue-600">
              {selectedOption ? `${(selectedOption.expectedReturn * 100).toFixed(1)}% annual return` : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Super Settings */}
      <ProgressiveDisclosure
        title="Advanced Super Settings"
        subtitle="Fees, insurance, and contribution strategies"
        isExpanded={showAdvanced}
        onToggle={setShowAdvanced}
      >
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Annual Admin Fees ($)
              </label>
              <CurrencyInput
                value={data.super.annualFees}
                onChange={(value) => updateSuperField('annualFees', value)}
                placeholder="Enter annual fees"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Total annual administration and investment fees
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Fee (% per year)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="3"
                value={data.super.investmentFees * 100}
                onChange={(e) => updateSuperField('investmentFees', parseFloat(e.target.value) / 100 || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.65"
              />
              <p className="text-xs text-gray-500 mt-1">
                Investment management fee as percentage
              </p>
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={data.super.insuranceInSuper}
                onChange={(e) => updateSuperField('insuranceInSuper', e.target.checked)}
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">
                Include insurance premiums in super
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Life and TPD insurance through your super fund
            </p>
          </div>

          {data.super.insuranceInSuper && (
            <div className="ml-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Annual Insurance Premiums ($)
              </label>
              <CurrencyInput
                value={data.super.annualInsurancePremiums}
                onChange={(value) => updateSuperField('annualInsurancePremiums', value)}
                placeholder="Enter insurance premiums"
                className="w-full md:w-1/2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Total annual cost of insurance through super
              </p>
            </div>
          )}

          {/* Fee Impact Calculation */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h6 className="font-medium text-gray-700 mb-2">Fee Impact Analysis</h6>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Total Annual Fees:</div>
                <div className="font-medium text-red-600">
                  ${(data.super.annualFees + (data.super.currentBalance * data.super.investmentFees) + (data.super.insuranceInSuper ? data.super.annualInsurancePremiums : 0)).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Fee as % of Balance:</div>
                <div className="font-medium text-red-600">
                  {data.super.currentBalance > 0 
                    ? ((data.super.annualFees + (data.super.currentBalance * data.super.investmentFees) + (data.super.insuranceInSuper ? data.super.annualInsurancePremiums : 0)) / data.super.currentBalance * 100).toFixed(2)
                    : 0
                  }%
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              Lower fees mean more money working for your retirement
            </div>
          </div>
        </div>
      </ProgressiveDisclosure>

      {/* Super Education */}
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h5 className="font-medium text-yellow-900 mb-2">🎓 Super Strategy Tips</h5>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• <strong>Salary packaging:</strong> Reduces taxable income and boosts super</li>
          <li>• <strong>High Growth:</strong> Best option for investors under 50</li>
          <li>• <strong>Tax advantage:</strong> 15% tax vs up to 47% personal tax</li>
          <li>• <strong>Compound growth:</strong> Small increases have big long-term impact</li>
          <li>• <strong>Annual cap:</strong> Make sure you don't exceed $27,500 per year</li>
          <li>• <strong>Low fees:</strong> Choose funds with total fees under 1% per year</li>
        </ul>
      </div>
    </div>
  )
}