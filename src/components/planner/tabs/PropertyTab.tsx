/**
 * Property Investment Tab - Current property portfolio management
 * Handles existing property values, rental income, and new property investment planning
 */

import React, { useState } from 'react'
import { CurrencyInput } from '../../ui/CurrencyInput'
import { ProgressiveDisclosure } from '../../ui/ProgressiveDisclosure'
import { ErrorMessage } from '../../ui/ErrorMessage'
import type { PropertyData } from '../../../types/planner'

interface PropertyTabProps {
  data: PropertyData
  onChange: (data: PropertyData) => void
  errors?: Record<string, string>
}

const PROPERTY_TYPES = [
  { id: 'house', label: 'House', description: 'Standalone house' },
  { id: 'unit', label: 'Unit/Apartment', description: 'Apartment or unit' },
  { id: 'townhouse', label: 'Townhouse', description: 'Attached townhouse' },
  { id: 'land', label: 'Vacant Land', description: 'Investment land' }
] as const

const INVESTMENT_STRATEGIES = [
  { 
    id: 'cashflow-positive', 
    label: 'Cash Flow Positive', 
    description: 'Rental income exceeds all property costs' 
  },
  { 
    id: 'neutral', 
    label: 'Neutral Gearing', 
    description: 'Rental income equals property costs' 
  },
  { 
    id: 'negative', 
    label: 'Negative Gearing', 
    description: 'Property costs exceed rental income (tax benefits)' 
  }
] as const

export const PropertyTab: React.FC<PropertyTabProps> = ({
  data,
  onChange,
  errors = {}
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateField = <K extends keyof PropertyData>(
    field: K, 
    value: PropertyData[K]
  ) => {
    onChange({ ...data, [field]: value })
  }

  const hasExistingProperty = data.currentValue > 0
  const hasPlannedInvestment = data.plannedInvestmentAmount > 0

  return (
    <div className="space-y-6">
      {/* Current Property Holdings */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Current Property Portfolio
          </h3>
          <p className="text-sm text-gray-600">
            Include your home and any investment properties you already own
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Property Value
            </label>
            <CurrencyInput
              value={data.currentValue}
              onChange={(value) => updateField('currentValue', value)}
              placeholder="Enter total value"
              className="w-full"
            />
            {errors.currentValue && (
              <ErrorMessage message={errors.currentValue} />
            )}
            <p className="text-xs text-gray-500 mt-1">
              Combined value of home + investment properties
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Outstanding Mortgage
            </label>
            <CurrencyInput
              value={data.outstandingMortgage}
              onChange={(value) => updateField('outstandingMortgage', value)}
              placeholder="Enter mortgage balance"
              className="w-full"
            />
            {errors.outstandingMortgage && (
              <ErrorMessage message={errors.outstandingMortgage} />
            )}
            <p className="text-xs text-gray-500 mt-1">
              Total debt across all properties
            </p>
          </div>
        </div>

        {hasExistingProperty && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Rental Income (after tax)
            </label>
            <CurrencyInput
              value={data.monthlyRentalIncome}
              onChange={(value) => updateField('monthlyRentalIncome', value)}
              placeholder="Enter net rental income"
              className="w-full md:w-1/2"
            />
            {errors.monthlyRentalIncome && (
              <ErrorMessage message={errors.monthlyRentalIncome} />
            )}
            <p className="text-xs text-gray-500 mt-1">
              Rental income minus property management fees and tax
            </p>
          </div>
        )}
      </div>

      {/* Property Equity Display */}
      {hasExistingProperty && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">Property Equity</h4>
              <p className="text-sm text-blue-700">
                Available for future investments
              </p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-blue-900">
                ${(data.currentValue - data.outstandingMortgage).toLocaleString()}
              </div>
              <div className="text-sm text-blue-700">
                {data.currentValue > 0 
                  ? `${(((data.currentValue - data.outstandingMortgage) / data.currentValue) * 100).toFixed(1)}% equity`
                  : ''
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Property Investment Planning */}
      <div className="border-t border-gray-200 pt-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              New Property Investment
            </h3>
            <p className="text-sm text-gray-600">
              Plan your next property purchase (optional)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investment Amount
            </label>
            <CurrencyInput
              value={data.plannedInvestmentAmount}
              onChange={(value) => updateField('plannedInvestmentAmount', value)}
              placeholder="Enter investment amount"
              className="w-full md:w-1/2"
            />
            {errors.plannedInvestmentAmount && (
              <ErrorMessage message={errors.plannedInvestmentAmount} />
            )}
            <p className="text-xs text-gray-500 mt-1">
              Total purchase price for your next property
            </p>
          </div>

          {hasPlannedInvestment && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type
                  </label>
                  <select
                    value={data.propertyType}
                    onChange={(e) => updateField('propertyType', e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select property type</option>
                    {PROPERTY_TYPES.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.label} - {type.description}
                      </option>
                    ))}
                  </select>
                  {errors.propertyType && (
                    <ErrorMessage message={errors.propertyType} />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Strategy
                  </label>
                  <select
                    value={data.investmentStrategy}
                    onChange={(e) => updateField('investmentStrategy', e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select strategy</option>
                    {INVESTMENT_STRATEGIES.map(strategy => (
                      <option key={strategy.id} value={strategy.id}>
                        {strategy.label}
                      </option>
                    ))}
                  </select>
                  {errors.investmentStrategy && (
                    <ErrorMessage message={errors.investmentStrategy} />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Weekly Rent
                </label>
                <CurrencyInput
                  value={data.expectedWeeklyRent}
                  onChange={(value) => updateField('expectedWeeklyRent', value)}
                  placeholder="Enter weekly rent"
                  className="w-full md:w-1/2"
                />
                {errors.expectedWeeklyRent && (
                  <ErrorMessage message={errors.expectedWeeklyRent} />
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Gross rental income per week (before expenses)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Advanced Property Settings */}
      <ProgressiveDisclosure
        title="Advanced Property Settings"
        subtitle="Property growth rates, costs, and tax considerations"
        isExpanded={showAdvanced}
        onToggle={setShowAdvanced}
      >
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Growth Rate (% per year)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="20"
                value={data.growthRate * 100}
                onChange={(e) => updateField('growthRate', parseFloat(e.target.value) / 100 || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="7.0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Expected annual property value growth (default: 7%)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rental Growth Rate (% per year)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={data.rentalGrowthRate * 100}
                onChange={(e) => updateField('rentalGrowthRate', parseFloat(e.target.value) / 100 || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="3.0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Expected annual rental increase (default: 3%)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Annual Property Costs (% of value)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={data.annualCostsPercentage * 100}
                onChange={(e) => updateField('annualCostsPercentage', parseFloat(e.target.value) / 100 || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1.5"
              />
              <p className="text-xs text-gray-500 mt-1">
                Rates, insurance, maintenance as % of property value
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vacancy Rate (% per year)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="20"
                value={data.vacancyRate * 100}
                onChange={(e) => updateField('vacancyRate', parseFloat(e.target.value) / 100 || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="4.0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Expected percentage of time property sits vacant
              </p>
            </div>
          </div>

          {/* Property Investment Summary */}
          {hasPlannedInvestment && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-medium text-gray-700 mb-2">Investment Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Annual Rental Income:</div>
                  <div className="font-medium">
                    ${(data.expectedWeeklyRent * 52).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Gross Yield:</div>
                  <div className="font-medium">
                    {data.plannedInvestmentAmount > 0 
                      ? ((data.expectedWeeklyRent * 52 / data.plannedInvestmentAmount) * 100).toFixed(1)
                      : 0
                    }%
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Annual Costs (Est):</div>
                  <div className="font-medium">
                    ${(data.plannedInvestmentAmount * data.annualCostsPercentage).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Net Yield:</div>
                  <div className="font-medium">
                    {data.plannedInvestmentAmount > 0 
                      ? (((data.expectedWeeklyRent * 52 * (1 - data.vacancyRate)) - (data.plannedInvestmentAmount * data.annualCostsPercentage)) / data.plannedInvestmentAmount * 100).toFixed(1)
                      : 0
                    }%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ProgressiveDisclosure>

      {/* Helpful Tips */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">💡 Property Investment Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Research location fundamentals: jobs, transport, schools</li>
          <li>• Consider all costs: rates, insurance, maintenance, vacancy</li>
          <li>• Property typically grows 7% annually over the long term</li>
          <li>• Rental yields vary by location (2-6% is typical)</li>
          <li>• Use equity from existing properties to fund new purchases</li>
        </ul>
      </div>
    </div>
  )
}