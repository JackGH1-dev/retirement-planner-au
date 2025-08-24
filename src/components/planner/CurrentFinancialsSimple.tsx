/**
 * Current Financials Component - Step 2 of the retirement planner
 * Beginner-friendly with progressive disclosure and Australian terminology
 */

import React, { useState } from 'react'
import { calculateNetIncome, getTaxBracket, calculateSuperGuarantee } from '../../utils/taxCalculations'

interface CurrentFinancialsProps {
  incomeExpense: any
  superState: any
  property: any
  portfolio: any
  buffers: any
  settings: any
  onChangeIncomeExpense: (data: any) => void
  onChangeSuper: (data: any) => void
  onChangeProperty: (data: any) => void
  onChangePortfolio: (data: any) => void
  onChangeBuffers: (data: any) => void
  onComplete: () => void
  onPrevious?: () => void
}

export const CurrentFinancials: React.FC<CurrentFinancialsProps> = ({
  incomeExpense,
  superState,
  property,
  portfolio,
  buffers,
  settings,
  onChangeIncomeExpense,
  onChangeSuper,
  onChangeProperty,
  onChangePortfolio,
  onChangeBuffers,
  onComplete,
  onPrevious
}) => {
  // Main inputs (always visible)
  const [salary, setSalary] = useState(incomeExpense?.salary || 75000)
  const [monthlySpending, setMonthlySpending] = useState(4000)
  const [superBalance, setSuperBalance] = useState(superState?.currentBalance || 50000)
  const [monthlyInvesting, setMonthlyInvesting] = useState(portfolio?.monthlyInvestment || 1000)
  
  // Advanced inputs (progressive disclosure)
  const [showMoreDetails, setShowMoreDetails] = useState(false)
  const [salarySacrifice, setSalarySacrifice] = useState(superState?.salaryPackaging || 500)
  const [superOption, setSuperOption] = useState(superState?.option || 'HighGrowth')
  const [etfStrategy, setEtfStrategy] = useState(portfolio?.allocationPreset || 'OneETF')
  const [emergencyMonths, setEmergencyMonths] = useState(buffers?.emergencyMonths || 6)

  // Calculate accurate tax breakdown
  const superContributions = (salarySacrifice * 12) + calculateSuperGuarantee(salary)
  const taxBreakdown = calculateNetIncome(salary, salarySacrifice * 12)
  const taxBracket = getTaxBracket(salary)
  
  // Calculate helpful indicators
  const savingsRate = ((monthlyInvesting + salarySacrifice) * 12 / salary * 100).toFixed(0)
  const superCapUsage = ((salarySacrifice * 12) / 27500 * 100).toFixed(0)
  const takehome = taxBreakdown.monthlyNet // Accurate after-tax monthly

  const handleComplete = () => {
    onChangeIncomeExpense({ 
      ...incomeExpense, 
      salary, 
      monthlyExpenses: monthlySpending,
      wageGrowthPct: 0.03 
    })
    onChangeSuper({ 
      ...superState, 
      currentBalance: superBalance, 
      salaryPackaging: salarySacrifice,
      option: superOption,
      SGRate: 0.115
    })
    onChangePortfolio({ 
      ...portfolio, 
      currentValue: 0, 
      monthlyInvestment: monthlyInvesting,
      allocationPreset: etfStrategy
    })
    // Property details handled in separate step now
    onChangeBuffers({
      ...buffers,
      emergencyMonths
    })
    onComplete()
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">What's your current situation?</h2>
      <p className="text-gray-600 mb-6">Just the essentials first—we'll keep it simple.</p>
      
      <div className="space-y-8">
        {/* Income Section */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-4">💰 Income & Spending</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Annual income (before tax)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(parseInt(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg text-lg bg-white text-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="75,000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Monthly spending
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="range"
                  min="2000"
                  max="8000"
                  step="250"
                  value={monthlySpending}
                  onChange={(e) => setMonthlySpending(parseInt(e.target.value))}
                  className="hidden"
                />
                <input
                  type="number"
                  value={monthlySpending}
                  onChange={(e) => setMonthlySpending(parseInt(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg text-lg bg-white text-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="4,000"
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Housing, food, transport, fun—everything
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-100 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-800">
                  💰 Your take-home is <strong>${takehome.toLocaleString()}/month</strong>
                </p>
                <p className="text-blue-700 text-xs mt-1">
                  After {taxBreakdown.effectiveTaxRate.toFixed(1)}% effective tax rate
                </p>
              </div>
              <div>
                <p className="text-blue-800">
                  💡 You have <strong>${(takehome - monthlySpending).toLocaleString()}/month</strong> left over
                </p>
                <p className="text-blue-700 text-xs mt-1">
                  Tax bracket: {taxBracket?.range} ({taxBracket?.marginalRate} marginal)
                </p>
              </div>
            </div>
            
            {showMoreDetails && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <h5 className="font-medium text-blue-900 mb-2">Tax breakdown (annual):</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-blue-700">
                  <div>Income tax: <strong>${taxBreakdown.incomeTax.toLocaleString()}</strong></div>
                  <div>Medicare levy: <strong>${taxBreakdown.medicareLevy.toLocaleString()}</strong></div>
                  <div>Tax offsets: <strong>-${taxBreakdown.lito.toLocaleString()}</strong></div>
                  <div>Total tax: <strong>${taxBreakdown.totalTax.toLocaleString()}</strong></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Super Section */}
        <div className="bg-green-50 rounded-xl p-6">
          <h3 className="font-semibold text-green-900 mb-4">🏦 Superannuation</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Current super balance
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={superBalance}
                  onChange={(e) => setSuperBalance(parseInt(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg text-lg bg-white text-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="50,000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Extra super per month (optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={salarySacrifice}
                  onChange={(e) => setSalarySacrifice(parseInt(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg text-lg bg-white text-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="500"
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Salary packaging—saves tax
              </div>
            </div>
          </div>

          {salarySacrifice > 0 && (
            <div className={`mt-4 p-3 rounded-lg ${parseInt(superCapUsage) > 85 ? 'bg-yellow-100' : 'bg-green-100'}`}>
              <p className={`text-sm ${parseInt(superCapUsage) > 85 ? 'text-yellow-800' : 'text-green-800'}`}>
                {parseInt(superCapUsage) > 85 ? '⚠️' : '✅'} Using <strong>{superCapUsage}%</strong> of your before-tax super cap.
                {parseInt(superCapUsage) > 85 ? ' Consider reducing to stay under the limit.' : ' Great—plenty of room left!'}
              </p>
            </div>
          )}
        </div>

        {/* Investment Section */}
        <div className="bg-purple-50 rounded-xl p-6">
          <h3 className="font-semibold text-purple-900 mb-4">📈 Regular investing (outside super)</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              How much can you invest each month?
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={monthlyInvesting}
                onChange={(e) => setMonthlyInvesting(parseInt(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg text-lg bg-white text-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="1,000"
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              ETFs, shares—invested after-tax money
            </div>
          </div>

          <div className="mt-4 p-3 bg-purple-100 rounded-lg">
            <p className="text-sm text-purple-800">
              💡 Your total savings rate is <strong>{savingsRate}%</strong> of income
              {parseInt(savingsRate) < 15 && " (consider boosting this if possible)"}
              {parseInt(savingsRate) >= 15 && " (excellent work!)"}
            </p>
          </div>
        </div>

        {/* Progressive Disclosure Toggle */}
        <div className="text-center">
          <button
            onClick={() => setShowMoreDetails(!showMoreDetails)}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm underline"
          >
            {showMoreDetails ? '↑ Hide details' : '↓ Show more details'}
          </button>
        </div>

        {/* Advanced Details (Collapsible) */}
        {showMoreDetails && (
          <div className="space-y-6 pt-4 border-t border-gray-200">
            {/* Super Details */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Super investment option</h4>
              <div className="grid grid-cols-3 gap-3">
                {['Balanced', 'Growth', 'HighGrowth'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setSuperOption(option)}
                    className={`p-3 rounded-lg border-2 text-center transition-colors ${
                      superOption === option
                        ? 'border-green-500 bg-green-50 text-green-900'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{option}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {option === 'HighGrowth' && 'Higher returns, long-term'}
                      {option === 'Growth' && 'Good growth, balanced risk'}
                      {option === 'Balanced' && 'Conservative approach'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ETF Strategy */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Investment approach</h4>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setEtfStrategy('OneETF')}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    etfStrategy === 'OneETF'
                      ? 'border-purple-500 bg-purple-50 text-purple-900'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold">One-ETF</div>
                  <div className="text-sm text-gray-600 mt-1">Simple, diversified fund (like VDHG)</div>
                </button>
                <button
                  onClick={() => setEtfStrategy('TwoETF')}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    etfStrategy === 'TwoETF'
                      ? 'border-purple-500 bg-purple-50 text-purple-900'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold">Two-ETF</div>
                  <div className="text-sm text-gray-600 mt-1">Australian + International mix</div>
                </button>
              </div>
            </div>


            {/* Emergency Buffer */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Safety buffer</h4>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Emergency fund (months of expenses)
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="3"
                    max="12"
                    value={emergencyMonths}
                    onChange={(e) => setEmergencyMonths(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>3 months</span>
                    <span className="font-medium text-blue-600">{emergencyMonths} months</span>
                    <span>12 months</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  6 months is typical—we'll pause investing to rebuild this if needed
                </p>
              </div>
            </div>
          </div>
        )}

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
            onClick={handleComplete}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors ml-auto"
          >
            Next: Tell us about property →
          </button>
        </div>
      </div>
    </div>
  )
}