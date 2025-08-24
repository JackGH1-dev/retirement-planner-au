/**
 * Property Planner Module - Property investment planning and strategy
 * Handles property investment timing, financing, and growth modeling
 */

import React, { useState, useMemo } from 'react'
import { CurrencyInput } from '../../ui/CurrencyInput'
import { ProgressiveDisclosure } from '../../ui/ProgressiveDisclosure'
import { ErrorMessage } from '../../ui/ErrorMessage'
import type { PlannerState } from '../../../types/planner'

interface PropertyPlannerProps {
  data: PlannerState
  onChange: (data: PlannerState) => void
  errors?: Record<string, string>
}

const PROPERTY_STRATEGIES = [
  {
    id: 'none',
    label: 'No Property Investment',
    description: 'Focus on super and ETFs only',
    depositRequired: 0,
    complexity: 'N/A',
    pros: [
      'Maximum simplicity',
      'Higher liquidity',
      'Lower entry costs',
      'No property management'
    ],
    cons: [
      'Miss property growth potential',
      'No rental income',
      'Less diversification'
    ]
  },
  {
    id: 'owner-occupier',
    label: 'Owner-Occupier Only',
    description: 'Buy your own home, no investment properties',
    depositRequired: 0.20,
    complexity: 'Low',
    pros: [
      'No rent payments',
      'Capital gains tax free',
      'Emotional security',
      'Forced savings'
    ],
    cons: [
      'Large deposit required',
      'Illiquid investment',
      'Maintenance costs',
      'Location locked-in'
    ]
  },
  {
    id: 'investment-first',
    label: 'Investment Property First',
    description: 'Buy investment property while renting personally',
    depositRequired: 0.20,
    complexity: 'Medium',
    pros: [
      'Tax deductions available',
      'Rental income',
      'Location flexibility',
      'Professional investment'
    ],
    cons: [
      'Still paying rent',
      'Higher complexity',
      'Property management needed',
      'Market risk'
    ]
  },
  {
    id: 'multiple-properties',
    label: 'Property Portfolio Strategy',
    description: 'Build a portfolio of investment properties',
    depositRequired: 0.20,
    complexity: 'High',
    pros: [
      'Maximum property exposure',
      'Multiple income streams',
      'Leverage opportunities',
      'Scale economies'
    ],
    cons: [
      'Very high complexity',
      'Large capital requirements',
      'Concentration risk',
      'Management intensive'
    ]
  }
] as const

const FINANCING_STRATEGIES = [
  { id: 'traditional', label: 'Traditional Mortgage (Principal & Interest)', rate: 0.06 },
  { id: 'interest-only', label: 'Interest Only (Investment)', rate: 0.065 },
  { id: 'line-of-credit', label: 'Line of Credit', rate: 0.07 },
  { id: 'equity-release', label: 'Equity Release from Existing Property', rate: 0.06 }
] as const

export const PropertyPlanner: React.FC<PropertyPlannerProps> = ({
  data,
  onChange,
  errors = {}
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState<string>(
    data.property.plannedInvestmentAmount > 0 ? 'investment-first' : 'none'
  )

  const updatePropertyField = <K extends keyof PlannerState['property']>(
    field: K,
    value: PlannerState['property'][K]
  ) => {
    onChange({
      ...data,
      property: { ...data.property, [field]: value }
    })
  }

  const strategyConfig = PROPERTY_STRATEGIES.find(s => s.id === selectedStrategy)

  // Calculate property affordability
  const affordabilityAnalysis = useMemo(() => {
    const annualIncome = data.income.salary
    const monthlyIncome = annualIncome / 12
    const monthlyExpenses = data.income.monthlyExpenses
    const monthlyDebt = 0 // Could add existing debt field
    const availableIncome = monthlyIncome - monthlyExpenses - monthlyDebt
    
    // Serviceability calculation (simplified)
    const maxMonthlyRepayment = availableIncome * 0.3 // 30% of available income
    const interestRate = 0.06 / 12 // Monthly rate
    const loanTerm = 30 * 12 // 30 years in months
    
    const maxLoanAmount = maxMonthlyRepayment * ((1 - Math.pow(1 + interestRate, -loanTerm)) / interestRate)
    const maxPropertyPrice = maxLoanAmount / 0.8 // Assuming 20% deposit
    const requiredDeposit = maxPropertyPrice * 0.2
    
    const currentEquity = data.property.currentValue - data.property.outstandingMortgage
    const totalAvailableDeposit = currentEquity + data.portfolio.currentValue + data.buffers.currentAmount
    
    return {
      maxPropertyPrice,
      requiredDeposit,
      maxLoanAmount,
      maxMonthlyRepayment,
      currentEquity,
      totalAvailableDeposit,
      affordabilityGap: Math.max(0, requiredDeposit - totalAvailableDeposit)
    }
  }, [data.income.salary, data.income.monthlyExpenses, data.property.currentValue, data.property.outstandingMortgage, data.portfolio.currentValue, data.buffers.currentAmount])

  // Calculate investment returns
  const propertyProjection = useMemo(() => {
    if (!data.property.plannedInvestmentAmount) return null
    
    const yearsToRetirement = data.goalSetter.retirementAge - (data.goalSetter.currentAge || 30)
    const purchasePrice = data.property.plannedInvestmentAmount
    const growthRate = data.property.growthRate
    const weeklyRent = data.property.expectedWeeklyRent
    const annualRent = weeklyRent * 52
    const rentalGrowthRate = data.property.rentalGrowthRate
    
    if (yearsToRetirement <= 0) return null
    
    // Property value growth
    const futureValue = purchasePrice * Math.pow(1 + growthRate, yearsToRetirement)
    
    // Rental income growth (simplified)
    const finalRent = annualRent * Math.pow(1 + rentalGrowthRate, yearsToRetirement)
    const averageAnnualRent = (annualRent + finalRent) / 2
    const totalRentalIncome = averageAnnualRent * yearsToRetirement
    
    // Costs
    const annualCosts = purchasePrice * data.property.annualCostsPercentage
    const totalCosts = annualCosts * yearsToRetirement
    const vacancyCosts = totalRentalIncome * data.property.vacancyRate
    
    const netRentalIncome = totalRentalIncome - totalCosts - vacancyCosts
    const totalReturn = (futureValue - purchasePrice) + netRentalIncome
    
    return {
      futureValue,
      totalRentalIncome,
      netRentalIncome,
      totalCosts: totalCosts + vacancyCosts,
      totalReturn,
      annualizedReturn: Math.pow(totalReturn / purchasePrice + 1, 1 / yearsToRetirement) - 1
    }
  }, [data.property, data.goalSetter.retirementAge, data.goalSetter.currentAge])

  return (
    <div className="space-y-6">
      {/* Property Strategy Selection */}
      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            Property Investment Strategy
          </h4>
          <p className="text-sm text-gray-600">
            Choose your approach to property investment
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {PROPERTY_STRATEGIES.map(strategy => (
            <div
              key={strategy.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedStrategy === strategy.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => {
                setSelectedStrategy(strategy.id)
                if (strategy.id === 'none') {
                  updatePropertyField('plannedInvestmentAmount', 0)
                }
              }}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <input
                    type="radio"
                    checked={selectedStrategy === strategy.id}
                    onChange={() => setSelectedStrategy(strategy.id)}
                    className="h-4 w-4 text-purple-600"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-700">
                      {strategy.label}
                    </h5>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {strategy.depositRequired > 0 
                          ? `${(strategy.depositRequired * 100)}% deposit`
                          : strategy.complexity
                        }
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {strategy.description}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="font-medium text-green-600 mb-1">Advantages:</div>
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
      </div>

      {/* Property Investment Details */}
      {selectedStrategy !== 'none' && (
        <>
          <div className="border-t border-gray-200 pt-6 space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">
                Property Investment Details
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Property Value
                </label>
                <CurrencyInput
                  value={data.property.plannedInvestmentAmount}
                  onChange={(value) => updatePropertyField('plannedInvestmentAmount', value)}
                  placeholder="Enter target property value"
                  className="w-full"
                />
                {errors['property.plannedInvestmentAmount'] && (
                  <ErrorMessage message={errors['property.plannedInvestmentAmount']} />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Weekly Rent
                </label>
                <CurrencyInput
                  value={data.property.expectedWeeklyRent}
                  onChange={(value) => updatePropertyField('expectedWeeklyRent', value)}
                  placeholder="Enter weekly rent"
                  className="w-full"
                />
                {errors['property.expectedWeeklyRent'] && (
                  <ErrorMessage message={errors['property.expectedWeeklyRent']} />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  value={data.property.propertyType}
                  onChange={(e) => updatePropertyField('propertyType', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select property type</option>
                  <option value="house">House</option>
                  <option value="unit">Unit/Apartment</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="land">Vacant Land</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Investment Strategy
                </label>
                <select
                  value={data.property.investmentStrategy}
                  onChange={(e) => updatePropertyField('investmentStrategy', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select strategy</option>
                  <option value="cashflow-positive">Cash Flow Positive</option>
                  <option value="neutral">Neutral Gearing</option>
                  <option value="negative">Negative Gearing</option>
                </select>
              </div>
            </div>
          </div>

          {/* Affordability Analysis */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h5 className="font-medium text-blue-900 mb-3">💰 Property Affordability Analysis</h5>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-blue-700">Max Property Price:</div>
                <div className="text-lg font-bold text-blue-900">
                  ${affordabilityAnalysis.maxPropertyPrice.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-blue-700">Required Deposit:</div>
                <div className="text-lg font-bold text-blue-900">
                  ${affordabilityAnalysis.requiredDeposit.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-blue-700">Available Deposit:</div>
                <div className="text-lg font-bold text-blue-900">
                  ${affordabilityAnalysis.totalAvailableDeposit.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-blue-700">Affordability Status:</div>
                <div className={`text-lg font-bold ${
                  affordabilityAnalysis.affordabilityGap > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {affordabilityAnalysis.affordabilityGap > 0 
                    ? `Gap: $${affordabilityAnalysis.affordabilityGap.toLocaleString()}`
                    : 'Affordable ✓'
                  }
                </div>
              </div>
            </div>
            
            {affordabilityAnalysis.affordabilityGap > 0 && (
              <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Deposit Shortfall:</strong> You need an additional ${affordabilityAnalysis.affordabilityGap.toLocaleString()} 
                  for the deposit. Consider a lower-priced property or save more before purchasing.
                </p>
              </div>
            )}
          </div>

          {/* Property Projection */}
          {propertyProjection && (
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h5 className="font-medium text-purple-900 mb-3">🏠 Property Investment Projection</h5>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-purple-700">Property Value at {data.goalSetter.retirementAge}:</div>
                  <div className="text-lg font-bold text-purple-900">
                    ${propertyProjection.futureValue.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-purple-700">Total Rental Income:</div>
                  <div className="text-lg font-bold text-purple-900">
                    ${propertyProjection.netRentalIncome.toLocaleString()}
                  </div>
                  <div className="text-xs text-purple-600">After costs</div>
                </div>
                <div>
                  <div className="text-purple-700">Total Return:</div>
                  <div className="text-lg font-bold text-purple-900">
                    ${propertyProjection.totalReturn.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-purple-700">Annualized Return:</div>
                  <div className="text-lg font-bold text-purple-900">
                    {(propertyProjection.annualizedReturn * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-purple-600">Per year</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Advanced Property Settings */}
      <ProgressiveDisclosure
        title="Advanced Property Settings"
        subtitle="Growth rates, costs, financing, and tax considerations"
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
                max="15"
                value={data.property.growthRate * 100}
                onChange={(e) => updatePropertyField('growthRate', parseFloat(e.target.value) / 100 || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="7.0"
              />
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
                value={data.property.rentalGrowthRate * 100}
                onChange={(e) => updatePropertyField('rentalGrowthRate', parseFloat(e.target.value) / 100 || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="3.0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Annual Costs (% of property value)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={data.property.annualCostsPercentage * 100}
                onChange={(e) => updatePropertyField('annualCostsPercentage', parseFloat(e.target.value) / 100 || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1.5"
              />
              <p className="text-xs text-gray-500 mt-1">
                Rates, insurance, maintenance, property management
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
                value={data.property.vacancyRate * 100}
                onChange={(e) => updatePropertyField('vacancyRate', parseFloat(e.target.value) / 100 || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="4.0"
              />
            </div>
          </div>

          {/* Financing Options */}
          <div>
            <h6 className="font-medium text-gray-700 mb-2">Financing Strategy</h6>
            <div className="grid grid-cols-1 gap-2">
              {FINANCING_STRATEGIES.map(strategy => (
                <label key={strategy.id} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="financing"
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">
                    {strategy.label} ({(strategy.rate * 100).toFixed(1)}% indicative rate)
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Risk Analysis */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h6 className="font-medium text-gray-700 mb-2">Property Investment Risks</h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-red-600 mb-1">Key Risks:</div>
                <ul className="space-y-1 text-red-700">
                  <li>• Interest rate changes</li>
                  <li>• Property market downturns</li>
                  <li>• Extended vacancy periods</li>
                  <li>• Unexpected maintenance costs</li>
                  <li>• Illiquidity (hard to sell quickly)</li>
                </ul>
              </div>
              <div>
                <div className="font-medium text-blue-600 mb-1">Risk Mitigation:</div>
                <ul className="space-y-1 text-blue-700">
                  <li>• Maintain adequate emergency funds</li>
                  <li>• Research location fundamentals</li>
                  <li>• Professional property management</li>
                  <li>• Comprehensive insurance coverage</li>
                  <li>• Conservative borrowing ratios</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </ProgressiveDisclosure>

      {/* Property Strategy Summary */}
      {strategyConfig && (
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <h5 className="font-medium text-orange-900 mb-2">
            📋 Your Property Strategy: {strategyConfig.label}
          </h5>
          <div className="text-sm text-orange-800">
            {selectedStrategy === 'none' && (
              <p>Focusing on super and ETF investments provides simplicity and liquidity. Property can be added later when you have more capital and experience.</p>
            )}
            {selectedStrategy === 'owner-occupier' && (
              <p>Buying your own home eliminates rent and provides security. Consider the First Home Owner Grant and other government schemes to help with the deposit.</p>
            )}
            {selectedStrategy === 'investment-first' && (
              <p>Investment property while renting provides tax benefits and maintains flexibility. Ensure you can service the loan and have adequate emergency funds.</p>
            )}
            {selectedStrategy === 'multiple-properties' && (
              <p>Building a property portfolio requires significant capital and expertise. Consider starting with one property and gaining experience before expanding.</p>
            )}
          </div>
        </div>
      )}

      {/* Property Education */}
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <h5 className="font-medium text-red-900 mb-2">🏠 Property Investment Fundamentals</h5>
        <ul className="text-sm text-red-800 space-y-1">
          <li>• <strong>Location matters most:</strong> Research jobs, transport, schools, development plans</li>
          <li>• <strong>Buy below market:</strong> Negotiate hard and look for value-add opportunities</li>
          <li>• <strong>Cash flow is king:</strong> Ensure rental income covers most or all costs</li>
          <li>• <strong>Leverage amplifies both gains and losses:</strong> Borrow conservatively</li>
          <li>• <strong>Diversification:</strong> Don't put all your money into one property or location</li>
          <li>• <strong>Professional help:</strong> Use buyers agents, accountants, and property managers</li>
        </ul>
      </div>
    </div>
  )
}