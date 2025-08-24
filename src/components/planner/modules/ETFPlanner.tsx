/**
 * ETF Planner Module - ETF investment strategy and allocation planning
 * Handles OneETF vs TwoETF strategy selection and portfolio optimization
 */

import React, { useState, useMemo } from 'react'
import { CurrencyInput } from '../../ui/CurrencyInput'
import { ProgressiveDisclosure } from '../../ui/ProgressiveDisclosure'
import { ErrorMessage } from '../../ui/ErrorMessage'
import type { PlannerState, ETFOption } from '../../../types/planner'

interface ETFPlannerProps {
  data: PlannerState
  onChange: (data: PlannerState) => void
  errors?: Record<string, string>
}

const ETF_STRATEGIES = [
  {
    id: 'OneETF' as ETFOption,
    label: 'OneETF Strategy (Recommended for Beginners)',
    description: 'Single diversified ETF - maximum simplicity',
    allocation: '100% Diversified Growth ETF (e.g., VDHG)',
    expectedReturn: 0.08,
    complexity: 'Very Simple',
    management: 'Set and forget',
    pros: [
      'Maximum simplicity - one fund only',
      'Automatically diversified globally',
      'No rebalancing required',
      'Perfect for beginners',
      'Very low fees (0.27%)'
    ],
    cons: [
      'Less control over allocation',
      'Single fund concentration risk',
      'Fixed allocation (not customizable)'
    ],
    suitableFor: 'New investors who want simplicity and don\'t want to manage multiple holdings'
  },
  {
    id: 'TwoETF' as ETFOption,
    label: 'TwoETF Strategy',
    description: 'Australian + International split for better control',
    allocation: '40% Australian ETF (VAS) + 60% International ETF (VGS)',
    expectedReturn: 0.08,
    complexity: 'Simple',
    management: 'Annual rebalancing',
    pros: [
      'Better geographic diversification',
      'More control over allocation',
      'Can customize weighting',
      'Still relatively simple',
      'Lower fees (0.10-0.18%)'
    ],
    cons: [
      'Requires periodic rebalancing',
      'Slightly more complex',
      'Need to manage two positions'
    ],
    suitableFor: 'Investors comfortable with basic portfolio management and want more control'
  }
] as const

const INVESTMENT_AMOUNTS = [
  { amount: 500, label: '$500/month - Starting out' },
  { amount: 1000, label: '$1,000/month - Building wealth' },
  { amount: 1500, label: '$1,500/month - Accelerating' },
  { amount: 2000, label: '$2,000/month - Aggressive saving' },
  { amount: 3000, label: '$3,000/month - High earner strategy' }
]

export const ETFPlanner: React.FC<ETFPlannerProps> = ({
  data,
  onChange,
  errors = {}
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updatePortfolioField = <K extends keyof PlannerState['portfolio']>(
    field: K,
    value: PlannerState['portfolio'][K]
  ) => {
    onChange({
      ...data,
      portfolio: { ...data.portfolio, [field]: value }
    })
  }

  const selectedStrategy = ETF_STRATEGIES.find(s => s.id === data.portfolio.etfStrategy)

  // Calculate portfolio projections
  const projectedPortfolio = useMemo(() => {
    const yearsToRetirement = data.goalSetter.retirementAge - (data.goalSetter.currentAge || 30)
    const currentValue = data.portfolio.currentValue
    const monthlyInvestment = data.portfolio.monthlyInvestment
    const returnRate = selectedStrategy?.expectedReturn || 0.08
    const annualFees = data.portfolio.annualFees
    const netReturn = returnRate - annualFees
    
    if (yearsToRetirement <= 0) return { total: currentValue, contributions: 0, growth: currentValue }
    
    // Future value of current portfolio
    const currentFV = currentValue * Math.pow(1 + netReturn, yearsToRetirement)
    
    // Future value of monthly contributions
    const annualContribution = monthlyInvestment * 12
    const contributionsFV = annualContribution * ((Math.pow(1 + netReturn, yearsToRetirement) - 1) / netReturn)
    
    return {
      total: currentFV + contributionsFV,
      contributions: annualContribution * yearsToRetirement,
      growth: (currentFV + contributionsFV) - currentValue - (annualContribution * yearsToRetirement)
    }
  }, [data.portfolio.currentValue, data.portfolio.monthlyInvestment, data.goalSetter.retirementAge, data.goalSetter.currentAge, selectedStrategy, data.portfolio.annualFees])

  // Calculate if buffer policy would affect investments
  const wouldTriggerBufferPause = useMemo(() => {
    const monthsOfCoverage = data.buffers.currentAmount / (data.income.monthlyExpenses || 5000)
    return monthsOfCoverage < data.buffers.triggerLevel
  }, [data.buffers.currentAmount, data.income.monthlyExpenses, data.buffers.triggerLevel])

  return (
    <div className="space-y-6">
      {/* Current ETF Position */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current ETF Portfolio Value
          </label>
          <CurrencyInput
            value={data.portfolio.currentValue}
            onChange={(value) => updatePortfolioField('currentValue', value)}
            placeholder="Enter current portfolio value"
            className="w-full"
          />
          {errors['portfolio.currentValue'] && (
            <ErrorMessage message={errors['portfolio.currentValue']} />
          )}
          <p className="text-xs text-gray-500 mt-1">
            Current market value of all ETF investments
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly ETF Investment
          </label>
          <CurrencyInput
            value={data.portfolio.monthlyInvestment}
            onChange={(value) => updatePortfolioField('monthlyInvestment', value)}
            placeholder="Enter monthly investment"
            className="w-full"
          />
          {errors['portfolio.monthlyInvestment'] && (
            <ErrorMessage message={errors['portfolio.monthlyInvestment']} />
          )}
          <p className="text-xs text-gray-500 mt-1">
            Regular monthly ETF investment amount
          </p>
        </div>
      </div>

      {/* Quick Amount Selection */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Quick amount selection:</p>
        <div className="flex flex-wrap gap-2">
          {INVESTMENT_AMOUNTS.map(suggestion => (
            <button
              key={suggestion.amount}
              type="button"
              onClick={() => updatePortfolioField('monthlyInvestment', suggestion.amount)}
              className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                data.portfolio.monthlyInvestment === suggestion.amount
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400 text-gray-700'
              }`}
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      </div>

      {/* Buffer Pause Warning */}
      {wouldTriggerBufferPause && data.portfolio.monthlyInvestment > 0 && (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-medium text-yellow-900 mb-2">⚠️ Buffer Policy Impact</h4>
          <p className="text-sm text-yellow-800">
            Your current emergency fund is below your trigger level ({data.buffers.triggerLevel} months). 
            ETF investments would be paused until your buffer reaches {data.buffers.recoveryTarget} months coverage.
          </p>
        </div>
      )}

      {/* ETF Strategy Selection */}
      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            ETF Investment Strategy
          </h4>
          <p className="text-sm text-gray-600">
            Choose your ETF allocation approach
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {ETF_STRATEGIES.map(strategy => (
            <div
              key={strategy.id}
              className={`border rounded-lg p-5 cursor-pointer transition-all ${
                data.portfolio.etfStrategy === strategy.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => updatePortfolioField('etfStrategy', strategy.id)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <input
                    type="radio"
                    checked={data.portfolio.etfStrategy === strategy.id}
                    onChange={() => updatePortfolioField('etfStrategy', strategy.id)}
                    className="h-4 w-4 text-green-600"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-700">
                      {strategy.label}
                    </h5>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        {(strategy.expectedReturn * 100).toFixed(1)}% return
                      </div>
                      <div className="text-xs text-gray-500">
                        {strategy.complexity}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {strategy.description}
                  </p>

                  <div className="bg-gray-50 p-3 rounded mb-3">
                    <div className="text-xs text-gray-600 mb-1">
                      <strong>Allocation:</strong> {strategy.allocation}
                    </div>
                    <div className="text-xs text-gray-600 mb-1">
                      <strong>Management:</strong> {strategy.management}
                    </div>
                    <div className="text-xs text-gray-600">
                      <strong>Best for:</strong> {strategy.suitableFor}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="font-medium text-green-600 mb-2">Advantages:</div>
                      <ul className="space-y-1 text-green-700">
                        {strategy.pros.map((pro, i) => (
                          <li key={i}>• {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="font-medium text-orange-600 mb-2">Considerations:</div>
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

        {errors['portfolio.etfStrategy'] && (
          <ErrorMessage message={errors['portfolio.etfStrategy']} />
        )}
      </div>

      {/* Portfolio Projection */}
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <h5 className="font-medium text-green-900 mb-3">📈 ETF Portfolio Projection</h5>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-green-700">Current Value:</div>
            <div className="text-lg font-bold text-green-900">
              ${data.portfolio.currentValue.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-green-700">Annual Investment:</div>
            <div className="text-lg font-bold text-green-900">
              ${(data.portfolio.monthlyInvestment * 12).toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-green-700">Total Contributions:</div>
            <div className="text-lg font-bold text-green-900">
              ${projectedPortfolio.contributions.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-green-700">Projected at {data.goalSetter.retirementAge || 65}:</div>
            <div className="text-xl font-bold text-green-900">
              ${projectedPortfolio.total.toLocaleString()}
            </div>
            <div className="text-xs text-green-600">
              Including ${projectedPortfolio.growth.toLocaleString()} growth
            </div>
          </div>
        </div>
      </div>

      {/* Strategy-Specific Details */}
      {selectedStrategy && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h5 className="font-medium text-blue-900 mb-2">
            Your Selected Strategy: {selectedStrategy.label}
          </h5>
          <div className="text-sm text-blue-800 space-y-2">
            {selectedStrategy.id === 'OneETF' ? (
              <>
                <p><strong>Recommended ETF:</strong> VDHG (Vanguard Diversified High Growth Index ETF)</p>
                <p><strong>Allocation:</strong> 90% Growth (36% Aus shares, 54% International shares), 10% Bonds</p>
                <p><strong>Management:</strong> Simply buy VDHG monthly - no other action required</p>
                <p><strong>Fees:</strong> 0.27% per year (very reasonable for a diversified fund)</p>
              </>
            ) : (
              <>
                <p><strong>Recommended ETFs:</strong></p>
                <ul className="ml-4 space-y-1">
                  <li>• 40% VAS (Vanguard Australian Shares Index ETF) - 0.10% fees</li>
                  <li>• 60% VGS (Vanguard International Shares Index ETF) - 0.18% fees</li>
                </ul>
                <p><strong>Management:</strong> Buy both ETFs monthly in 40/60 ratio, rebalance annually</p>
                <p><strong>Blended Fees:</strong> ~0.15% per year (lower than OneETF)</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Advanced ETF Settings */}
      <ProgressiveDisclosure
        title="Advanced ETF Settings"
        subtitle="Fees, rebalancing, and tax optimization"
        isExpanded={showAdvanced}
        onToggle={setShowAdvanced}
      >
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Annual Management Fees (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="2"
                value={data.portfolio.annualFees * 100}
                onChange={(e) => updatePortfolioField('annualFees', parseFloat(e.target.value) / 100 || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.15"
              />
              <p className="text-xs text-gray-500 mt-1">
                Blended management expense ratio
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Annual Return (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="15"
                value={data.portfolio.expectedReturn * 100}
                onChange={(e) => updatePortfolioField('expectedReturn', parseFloat(e.target.value) / 100 || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="8.0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Expected return before fees
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rebalancing Frequency
              </label>
              <select
                value={data.portfolio.rebalancingFrequency}
                onChange={(e) => updatePortfolioField('rebalancingFrequency', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="never">Never (OneETF or buy & hold)</option>
                <option value="annual">Annual</option>
                <option value="biannual">Twice per year</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capital Gains Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="50"
                value={data.portfolio.capitalGainsTaxRate * 100}
                onChange={(e) => updatePortfolioField('capitalGainsTaxRate', parseFloat(e.target.value) / 100 || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="23.5"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your marginal tax rate (with 50% CGT discount)
              </p>
            </div>
          </div>

          {/* Cost Analysis */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h6 className="font-medium text-gray-700 mb-2">Annual Cost Analysis</h6>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Management Fees:</div>
                <div className="font-medium text-red-600">
                  ${((data.portfolio.currentValue + (data.portfolio.monthlyInvestment * 6)) * data.portfolio.annualFees).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Brokerage (Est):</div>
                <div className="font-medium text-red-600">
                  ${(data.portfolio.monthlyInvestment > 0 ? 120 : 0)} {/* $10/month estimate */}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Total Cost:</div>
                <div className="font-medium text-red-600">
                  ${(((data.portfolio.currentValue + (data.portfolio.monthlyInvestment * 6)) * data.portfolio.annualFees) + (data.portfolio.monthlyInvestment > 0 ? 120 : 0)).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProgressiveDisclosure>

      {/* ETF Education */}
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <h5 className="font-medium text-purple-900 mb-2">🎓 ETF Investment Principles</h5>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• <strong>Dollar Cost Averaging:</strong> Regular monthly investments smooth out market volatility</li>
          <li>• <strong>Low Fees:</strong> Keep total fees under 0.5% per year for better long-term returns</li>
          <li>• <strong>Diversification:</strong> ETFs provide instant diversification across hundreds of companies</li>
          <li>• <strong>Long-term Focus:</strong> Best results come from investing for 7+ years</li>
          <li>• <strong>Tax Efficiency:</strong> ETFs are generally more tax-efficient than managed funds</li>
          <li>• <strong>Liquidity:</strong> ETFs can be bought/sold on the stock exchange during trading hours</li>
        </ul>
      </div>
    </div>
  )
}