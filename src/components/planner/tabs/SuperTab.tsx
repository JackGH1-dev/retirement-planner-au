/**
 * Super Tab - Current balance and contribution strategy
 * Includes basic cap awareness without overwhelming beginners
 */

import React, { useState, useCallback, useMemo } from 'react'
import type { SuperState, AppSettings } from '../../../types/planner'
import { CurrencyInput } from '../../ui/CurrencyInput'
import { ProgressiveDisclosure } from '../../ui/ProgressiveDisclosure'
import { BasicCapIndicator } from '../../ui/BasicCapIndicator'
import { ErrorMessage } from '../../ui/ErrorMessage'

interface SuperTabProps {
  value: SuperState
  settings: AppSettings
  onChange: (value: SuperState) => void
}

const superOptions = [
  {
    key: 'Balanced' as const,
    title: 'Balanced',
    description: 'Mix of growth and defensive assets',
    expectedReturn: '6-7% per year'
  },
  {
    key: 'Growth' as const,
    title: 'Growth',
    description: 'Higher allocation to shares',
    expectedReturn: '7-8% per year'
  },
  {
    key: 'HighGrowth' as const,
    title: 'High Growth',
    description: 'Mostly shares for long-term growth',
    expectedReturn: '8-9% per year'
  }
]

export const SuperTab: React.FC<SuperTabProps> = ({ value, settings, onChange }) => {
  const [showDetails, setShowDetails] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateField = useCallback((field: keyof SuperState, fieldValue: any) => {
    const updated = { ...value, [field]: fieldValue }
    onChange(updated)
    
    // Clear error when user updates field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [value, onChange, errors])

  // Calculate cap usage for basic indicator
  const annualSG = value.balance * value.SGRate // Rough estimate based on current balance
  const annualSalarySacrifice = value.salarySacrificeMonthly * 12
  const totalAnnualContributions = annualSG + annualSalarySacrifice
  const capUsagePct = totalAnnualContributions / value.concessionalCapYearly

  // Estimate super balance growth
  const estimatedGrowthRate = useMemo(() => {
    switch (value.option) {
      case 'Balanced': return 0.065
      case 'Growth': return 0.075
      case 'HighGrowth': return 0.085
      default: return 0.075
    }
  }, [value.option])

  const projectedBalance = (years: number) => {
    return value.balance * Math.pow(1 + estimatedGrowthRate - value.feePct, years)
  }

  return (
    <div className="space-y-6">
      {/* Current Balance */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <div className="mb-4">
          <label className="block text-lg font-semibold text-green-800 mb-2">
            Current super balance <span className="text-red-500">*</span>
          </label>
          <CurrencyInput
            value={value.balance}
            onChange={(amount) => updateField('balance', amount)}
            placeholder="150,000"
            min={0}
            max={10000000}
            className="text-2xl font-bold bg-white/80 border-2 border-green-300 focus:border-green-500"
          />
          {errors.balance && <ErrorMessage message={errors.balance} />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-green-600 font-medium">Projected in 10 years:</p>
            <p className="text-xl font-bold text-green-700">
              ${projectedBalance(10).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-green-600 font-medium">Projected in 20 years:</p>
            <p className="text-xl font-bold text-green-700">
              ${projectedBalance(20).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Investment Option */}
      <div className="space-y-4">
        <label className="block text-lg font-semibold text-gray-700">
          Super investment option
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {superOptions.map((option) => (
            <label key={option.key} className="cursor-pointer">
              <input
                type="radio"
                name="superOption"
                value={option.key}
                checked={value.option === option.key}
                onChange={(e) => updateField('option', e.target.value)}
                className="sr-only"
              />
              <div className={`p-4 border-2 rounded-xl transition-all ${
                value.option === option.key
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
              }`}>
                <div className="font-semibold text-gray-800 mb-1">{option.title}</div>
                <div className="text-sm text-gray-600 mb-2">{option.description}</div>
                <div className="text-xs text-blue-600 font-medium">
                  {option.expectedReturn}
                </div>
              </div>
            </label>
          ))}
        </div>
        <p className="text-sm text-gray-500">
          High Growth is often recommended for younger investors with long time horizons
        </p>
      </div>

      {/* Basic Salary Sacrifice */}
      <div className="space-y-4">
        <label className="block text-lg font-semibold text-gray-700">
          Extra salary sacrifice (monthly)
        </label>
        <div className="space-y-3">
          <div className="flex items-center space-x-4">
            <CurrencyInput
              value={value.salarySacrificeMonthly}
              onChange={(amount) => updateField('salarySacrificeMonthly', amount)}
              placeholder="500"
              min={0}
              max={20000}
              className="flex-1"
            />
            <div className="text-right min-w-[120px]">
              <div className="font-semibold text-indigo-600">
                ${(value.salarySacrificeMonthly * 12).toLocaleString()}/year
              </div>
            </div>
          </div>

          {/* Quick amount buttons */}
          <div className="flex flex-wrap gap-2">
            {[0, 200, 500, 1000, 1500, 2000].map(amount => (
              <button
                key={amount}
                onClick={() => updateField('salarySacrificeMonthly', amount)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  value.salarySacrificeMonthly === amount
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ${amount}/mo
              </button>
            ))}
          </div>
        </div>

        {/* Basic cap indicator */}
        <BasicCapIndicator
          usagePct={capUsagePct}
          capLabel={settings.concessionalCapLabel}
          currentMonthly={value.salarySacrificeMonthly}
          suggestedMonthly={Math.floor((settings.concessionalCapYearly * 0.9 - annualSG) / 12)}
        />

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Why salary sacrifice?</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Pay 15% tax instead of your marginal rate (often 32-45%)</li>
            <li>• Automatic and consistent contributions</li>
            <li>• Compound growth over decades makes a big difference</li>
          </ul>
        </div>
      </div>

      {/* Progressive Disclosure for Advanced Settings */}
      <ProgressiveDisclosure
        title="Show more details"
        subtitle="SG rate, fees, and advanced settings"
        isExpanded={showDetails}
        onToggle={setShowDetails}
      >
        <div className="space-y-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-gray-700">
                Employer super guarantee rate
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0.09"
                  max="0.15"
                  step="0.005"
                  value={(value.SGRate * 100).toFixed(1)}
                  onChange={(e) => updateField('SGRate', parseFloat(e.target.value) / 100)}
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg text-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
                <span className="absolute right-4 top-3 text-lg text-gray-500">%</span>
              </div>
              <p className="text-sm text-gray-500">
                Currently 12% as of 2025-26
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-gray-700">
                Super fund fees
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="3"
                  step="0.01"
                  value={(value.feePct * 100).toFixed(2)}
                  onChange={(e) => updateField('feePct', parseFloat(e.target.value) / 100)}
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg text-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
                <span className="absolute right-4 top-3 text-lg text-gray-500">%</span>
              </div>
              <p className="text-sm text-gray-500">
                Total annual fees as percentage of balance
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-lg font-semibold text-gray-700">
              Before-tax super cap (annual)
            </label>
            <CurrencyInput
              value={value.concessionalCapYearly}
              onChange={(amount) => updateField('concessionalCapYearly', amount)}
              placeholder="27,500"
              min={25000}
              max={35000}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg focus:border-blue-500 focus:outline-none transition-colors"
            />
            <p className="text-sm text-gray-500">
              Maximum before-tax contributions per financial year
            </p>
          </div>

          {/* Fee Impact Calculator */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-semibold text-gray-700 mb-3">Fee Impact Over Time</h5>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Low fees (0.5%):</p>
                <p className="font-bold text-green-600">
                  ${(value.balance * Math.pow(1.075, 20)).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Your fees ({(value.feePct * 100).toFixed(1)}%):</p>
                <p className="font-bold">
                  ${projectedBalance(20).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">High fees (1.5%):</p>
                <p className="font-bold text-red-600">
                  ${(value.balance * Math.pow(1.06, 20)).toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * 20-year projection assuming 7.5% gross returns
            </p>
          </div>
        </div>
      </ProgressiveDisclosure>
    </div>
  )
}