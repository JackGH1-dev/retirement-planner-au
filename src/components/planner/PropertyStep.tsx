/**
 * Property Step Component - Dedicated step for property planning
 * Handles both owner-occupied and investment properties
 */

import React, { useState } from 'react'

interface PropertyStepProps {
  propertyData: any
  onChange: (data: any) => void
  onComplete: () => void
  onPrevious?: () => void
}

export const PropertyStep: React.FC<PropertyStepProps> = ({
  propertyData,
  onChange,
  onComplete,
  onPrevious
}) => {
  const [hasProperty, setHasProperty] = useState(propertyData?.hasProperty || false)
  const [propertyType, setPropertyType] = useState(propertyData?.propertyType || 'investment')
  const [propertyValue, setPropertyValue] = useState(propertyData?.value || 800000)
  const [loanBalance, setLoanBalance] = useState(propertyData?.loanBalance || 600000)
  const [interestRate, setInterestRate] = useState(propertyData?.interestRate || 6.5)
  const [loanType, setLoanType] = useState(propertyData?.loanType || 'PI') // PI or IO
  const [monthlyRepayment, setMonthlyRepayment] = useState(propertyData?.monthlyRepayment || 4200)
  
  // Investment property specific
  const [weeklyRent, setWeeklyRent] = useState(propertyData?.weeklyRent || 650)
  const [managementFee, setManagementFee] = useState(propertyData?.managementFee || 7)
  const [councilRates, setCouncilRates] = useState(propertyData?.councilRates || 2500)
  const [insurance, setInsurance] = useState(propertyData?.insurance || 800)
  const [maintenance, setMaintenance] = useState(propertyData?.maintenance || 2000)
  const [vacancy, setVacancy] = useState(propertyData?.vacancy || 4) // weeks per year

  // Calculate property metrics
  const currentEquity = Math.max(0, propertyValue - loanBalance)
  const loanToValue = loanBalance > 0 ? (loanBalance / propertyValue * 100) : 0
  const annualRent = weeklyRent * 52
  const grossYield = propertyValue > 0 ? (annualRent / propertyValue * 100) : 0
  
  // Annual expenses
  const annualManagementFee = annualRent * (managementFee / 100)
  const annualVacancyLoss = annualRent * (vacancy / 52)
  const totalAnnualExpenses = annualManagementFee + councilRates + insurance + maintenance + annualVacancyLoss
  const netAnnualIncome = annualRent - totalAnnualExpenses
  const netYield = propertyValue > 0 ? (netAnnualIncome / propertyValue * 100) : 0

  // Annual loan cost
  const annualInterest = loanBalance * (interestRate / 100)
  const annualCashFlow = netAnnualIncome - annualInterest
  const monthlyCashFlow = annualCashFlow / 12

  const handleComplete = () => {
    const propertyData = {
      hasProperty,
      propertyType,
      value: propertyValue,
      loanBalance,
      interestRate,
      loanType,
      monthlyRepayment,
      weeklyRent: hasProperty && propertyType === 'investment' ? weeklyRent : 0,
      managementFee,
      councilRates,
      insurance,
      maintenance,
      vacancy,
      currentEquity,
      grossYield,
      netYield,
      monthlyCashFlow: hasProperty && propertyType === 'investment' ? monthlyCashFlow : 0
    }
    
    onChange(propertyData)
    onComplete()
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Property in your retirement plan</h2>
      <p className="text-gray-600 mb-6">Property can be a significant part of your wealth—let's get the details right.</p>
      
      <div className="space-y-8">
        {/* Property Ownership Question */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Do you own any property?
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setHasProperty(false)}
              className={`flex-1 p-4 rounded-lg border-2 text-center transition-colors ${
                !hasProperty
                  ? 'border-gray-500 bg-gray-50 text-gray-900'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="font-semibold">No property</div>
              <div className="text-sm text-gray-600 mt-1">Focus on super and ETFs for now</div>
            </button>
            <button
              onClick={() => setHasProperty(true)}
              className={`flex-1 p-4 rounded-lg border-2 text-center transition-colors ${
                hasProperty
                  ? 'border-orange-500 bg-orange-50 text-orange-900'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="font-semibold">I own property</div>
              <div className="text-sm text-gray-600 mt-1">Include in my retirement planning</div>
            </button>
          </div>
        </div>

        {/* Property Details */}
        {hasProperty && (
          <div className="space-y-6">
            {/* Property Type */}
            <div className="bg-orange-50 rounded-xl p-6">
              <h3 className="font-semibold text-orange-900 mb-4">Property type</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPropertyType('owner-occupied')}
                  className={`p-4 rounded-lg border-2 text-center transition-colors ${
                    propertyType === 'owner-occupied'
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold">🏠 Own home</div>
                  <div className="text-sm text-gray-600 mt-1">Where you live</div>
                </button>
                <button
                  onClick={() => setPropertyType('investment')}
                  className={`p-4 rounded-lg border-2 text-center transition-colors ${
                    propertyType === 'investment'
                      ? 'border-green-500 bg-green-50 text-green-900'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold">🏘️ Investment</div>
                  <div className="text-sm text-gray-600 mt-1">Rental property</div>
                </button>
              </div>
            </div>

            {/* Property Value and Loan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Current property value
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={propertyValue}
                    onChange={(e) => setPropertyValue(parseInt(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg text-lg bg-white text-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="800,000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Remaining loan balance
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={loanBalance}
                    onChange={(e) => setLoanBalance(parseInt(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg text-lg bg-white text-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="600,000"
                  />
                </div>
              </div>
            </div>

            {/* Loan Details */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Loan details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Interest rate
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="6.5"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Loan type
                  </label>
                  <select
                    value={loanType}
                    onChange={(e) => setLoanType(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="PI">Principal & Interest</option>
                    <option value="IO">Interest Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Monthly repayment
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={monthlyRepayment}
                      onChange={(e) => setMonthlyRepayment(parseInt(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="4,200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Property Income & Expenses */}
            {propertyType === 'investment' && (
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="font-semibold text-green-900 mb-4">🏘️ Investment property income & costs</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Weekly rent
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={weeklyRent}
                        onChange={(e) => setWeeklyRent(parseInt(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="650"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Annual: ${(weeklyRent * 52).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Management fee
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={managementFee}
                        onChange={(e) => setManagementFee(parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="7"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Annual: ${Math.round(annualManagementFee).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Council rates
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={councilRates}
                        onChange={(e) => setCouncilRates(parseInt(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="2,500"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Per year</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Insurance
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={insurance}
                        onChange={(e) => setInsurance(parseInt(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="800"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Per year</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Maintenance
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={maintenance}
                        onChange={(e) => setMaintenance(parseInt(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="2,000"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Per year</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Vacancy
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={vacancy}
                        onChange={(e) => setVacancy(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="4"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">weeks</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Per year</p>
                  </div>
                </div>

                {/* Property Summary */}
                <div className="mt-6 p-4 bg-white rounded-lg border-2 border-green-200">
                  <h4 className="font-medium text-green-900 mb-3">Property investment summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Current equity</div>
                      <div className="font-bold text-green-700">${currentEquity.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">LVR</div>
                      <div className="font-bold text-green-700">{loanToValue.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Gross yield</div>
                      <div className="font-bold text-green-700">{grossYield.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Net yield</div>
                      <div className="font-bold text-green-700">{netYield.toFixed(1)}%</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Monthly cash flow:</span>
                      <span className={`font-bold ${monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {monthlyCashFlow >= 0 ? '+' : ''}${monthlyCashFlow.toFixed(0)}/month
                      </span>
                    </div>
                    {monthlyCashFlow < 0 && (
                      <p className="text-xs text-red-600 mt-1">
                        This property requires ${Math.abs(monthlyCashFlow).toFixed(0)}/month contribution
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
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
            {hasProperty ? 'Next: Review your strategy →' : 'Next: Review your strategy →'}
          </button>
        </div>
      </div>
    </div>
  )
}