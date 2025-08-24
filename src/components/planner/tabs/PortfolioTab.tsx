/**
 * Portfolio ETF Tab - Current investments and ETF allocation management
 * Handles existing portfolio values and ETF investment strategy selection
 */

import React, { useState } from 'react'
import { CurrencyInput } from '../../ui/CurrencyInput'
import { ProgressiveDisclosure } from '../../ui/ProgressiveDisclosure'
import { ErrorMessage } from '../../ui/ErrorMessage'
import type { PortfolioData, ETFOption } from '../../../types/planner'

interface PortfolioTabProps {
  data: PortfolioData
  onChange: (data: PortfolioData) => void
  errors?: Record<string, string>
}

const ETF_STRATEGIES = [
  {
    id: 'OneETF' as ETFOption,
    label: 'Simple Strategy (OneETF)',
    description: 'Single diversified ETF - perfect for beginners',
    allocation: '100% Diversified Growth ETF',
    pros: ['Simplest approach', 'Auto-diversified', 'Low maintenance'],
    cons: ['Less control', 'Single fund risk']
  },
  {
    id: 'TwoETF' as ETFOption,
    label: 'Balanced Strategy (TwoETF)', 
    description: 'Australian + International split for better diversification',
    allocation: '40% Australian ETF + 60% International ETF',
    pros: ['More diversified', 'Geographic balance', 'Still simple'],
    cons: ['Requires rebalancing', 'More complex']
  }
] as const

const ACCOUNT_TYPES = [
  { id: 'taxable', label: 'Taxable Account', description: 'Regular investment account' },
  { id: 'isa', label: 'Investment Account', description: 'Tax-advantaged investment account' },
  { id: 'smsf', label: 'SMSF', description: 'Self-managed super fund' },
  { id: 'trust', label: 'Trust', description: 'Family or investment trust' }
] as const

export const PortfolioTab: React.FC<PortfolioTabProps> = ({
  data,
  onChange,
  errors = {}
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateField = <K extends keyof PortfolioData>(
    field: K, 
    value: PortfolioData[K]
  ) => {
    onChange({ ...data, [field]: value })
  }

  const selectedStrategy = ETF_STRATEGIES.find(s => s.id === data.etfStrategy)
  const hasExistingPortfolio = data.currentValue > 0

  return (
    <div className="space-y-6">
      {/* Current Portfolio Holdings */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Current Investment Portfolio
          </h3>
          <p className="text-sm text-gray-600">
            Include ETFs, shares, managed funds, and other investments (excluding super and property)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Portfolio Value
            </label>
            <CurrencyInput
              value={data.currentValue}
              onChange={(value) => updateField('currentValue', value)}
              placeholder="Enter total portfolio value"
              className="w-full"
            />
            {errors.currentValue && (
              <ErrorMessage message={errors.currentValue} />
            )}
            <p className="text-xs text-gray-500 mt-1">
              Current market value of all investments
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Investment Amount
            </label>
            <CurrencyInput
              value={data.monthlyInvestment}
              onChange={(value) => updateField('monthlyInvestment', value)}
              placeholder="Enter monthly investment"
              className="w-full"
            />
            {errors.monthlyInvestment && (
              <ErrorMessage message={errors.monthlyInvestment} />
            )}
            <p className="text-xs text-gray-500 mt-1">
              Regular monthly investment (beyond super)
            </p>
          </div>
        </div>

        {hasExistingPortfolio && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Account Type
            </label>
            <select
              value={data.accountType}
              onChange={(e) => updateField('accountType', e.target.value as any)}
              className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select account type</option>
              {ACCOUNT_TYPES.map(type => (
                <option key={type.id} value={type.id}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
            {errors.accountType && (
              <ErrorMessage message={errors.accountType} />
            )}
          </div>
        )}
      </div>

      {/* ETF Strategy Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            ETF Investment Strategy
          </h3>
          <p className="text-sm text-gray-600">
            Choose your approach for future ETF investments
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {ETF_STRATEGIES.map(strategy => (
            <div
              key={strategy.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                data.etfStrategy === strategy.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => updateField('etfStrategy', strategy.id)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <input
                    type="radio"
                    checked={data.etfStrategy === strategy.id}
                    onChange={() => updateField('etfStrategy', strategy.id)}
                    className="h-4 w-4 text-blue-600"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-700">
                      {strategy.label}
                    </h4>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {strategy.allocation}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {strategy.description}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="font-medium text-green-600 mb-1">Pros:</div>
                      <ul className="space-y-1 text-green-700">
                        {strategy.pros.map((pro, i) => (
                          <li key={i}>• {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="font-medium text-orange-600 mb-1">Considerations:</div>
                      <ul className="space-y-1 text-orange-700">
                        {strategy.cons.map((con, i) => (
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

        {errors.etfStrategy && (
          <ErrorMessage message={errors.etfStrategy} />
        )}
      </div>

      {/* Strategy Details */}
      {selectedStrategy && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">
            Your Selected Strategy: {selectedStrategy.label}
          </h4>
          <div className="text-sm text-blue-800">
            <div className="mb-2">
              <strong>Allocation:</strong> {selectedStrategy.allocation}
            </div>
            <div className="mb-2">
              <strong>Best for:</strong> {
                selectedStrategy.id === 'OneETF' 
                  ? 'Beginners who want simplicity and don\'t want to manage multiple funds'
                  : 'Investors who want better diversification and don\'t mind occasional rebalancing'
              }
            </div>
            <div>
              <strong>Expected return:</strong> 7-9% per year over the long term
            </div>
          </div>
        </div>
      )}

      {/* Advanced Portfolio Settings */}
      <ProgressiveDisclosure
        title="Advanced Portfolio Settings"
        subtitle="Expected returns, fees, and tax considerations"
        isExpanded={showAdvanced}
        onToggle={setShowAdvanced}
      >
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Return (% per year)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="20"
                value={data.expectedReturn * 100}
                onChange={(e) => updateField('expectedReturn', parseFloat(e.target.value) / 100 || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="8.0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Expected annual return before fees (default: 8%)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Annual Management Fees (% per year)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="3"
                value={data.annualFees * 100}
                onChange={(e) => updateField('annualFees', parseFloat(e.target.value) / 100 || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.15"
              />
              <p className="text-xs text-gray-500 mt-1">
                Total management fees across your portfolio
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rebalancing Frequency
              </label>
              <select
                value={data.rebalancingFrequency}
                onChange={(e) => updateField('rebalancingFrequency', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="quarterly">Quarterly</option>
                <option value="biannual">Twice per year</option>
                <option value="annual">Annual</option>
                <option value="never">Never (buy and hold)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                How often to rebalance your portfolio
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax Rate on Capital Gains (%)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="50"
                value={data.capitalGainsTaxRate * 100}
                onChange={(e) => updateField('capitalGainsTaxRate', parseFloat(e.target.value) / 100 || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="15.0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your marginal tax rate on capital gains
              </p>
            </div>
          </div>

          {/* Portfolio Performance Estimate */}
          {(data.currentValue > 0 || data.monthlyInvestment > 0) && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-medium text-gray-700 mb-2">Performance Estimate</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Annual Fee Cost:</div>
                  <div className="font-medium text-red-600">
                    -${(data.currentValue * data.annualFees).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Net Expected Return:</div>
                  <div className="font-medium text-green-600">
                    {((data.expectedReturn - data.annualFees) * 100).toFixed(1)}% p.a.
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Annual Investment:</div>
                  <div className="font-medium">
                    ${(data.monthlyInvestment * 12).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">10-Year Projection:</div>
                  <div className="font-medium text-blue-600">
                    ${Math.round(
                      data.currentValue * Math.pow(1 + (data.expectedReturn - data.annualFees), 10) +
                      (data.monthlyInvestment * 12) * (Math.pow(1 + (data.expectedReturn - data.annualFees), 10) - 1) / (data.expectedReturn - data.annualFees)
                    ).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ProgressiveDisclosure>

      {/* ETF Education */}
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <h4 className="font-medium text-green-900 mb-2">💡 ETF Investment Basics</h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• <strong>OneETF:</strong> Perfect for beginners - one fund, fully diversified</li>
          <li>• <strong>TwoETF:</strong> 40% Australian, 60% International for better balance</li>
          <li>• ETFs typically have very low fees (0.05% - 0.30% per year)</li>
          <li>• Dollar cost averaging: invest regularly regardless of market timing</li>
          <li>• Long-term focus: ETFs work best over 7+ years</li>
          <li>• Rebalancing keeps your allocation on track</li>
        </ul>
      </div>
    </div>
  )
}