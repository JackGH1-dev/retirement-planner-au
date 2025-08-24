/**
 * Demo Planner - Simplified version for testing
 */

import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const PlannerDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    currentAge: 30,
    retirementAge: 65,
    targetIncome: 80000,
    currentSalary: 75000,
    superBalance: 50000,
    monthlyInvestment: 1000
  })

  const updateFormData = (field: string, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const stepTitles = [
    'Set Your Goals',
    'Current Situation', 
    'Investment Strategy',
    'Your Results'
  ]

  const projectedAssets = Math.round(
    formData.superBalance * Math.pow(1.08, formData.retirementAge - formData.currentAge) +
    (formData.monthlyInvestment * 12) * ((Math.pow(1.08, formData.retirementAge - formData.currentAge) - 1) / 0.08)
  )

  const monthlyRetirementIncome = Math.round(projectedAssets * 0.04 / 12)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="px-4 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            Optimise
          </Link>
          <div className="text-sm text-gray-600">
            Demo Version
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Build Your Retirement Plan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Simple, Australian-focused planning. This is a demo showing the core functionality.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep} of 4</span>
            <span>{stepTitles[currentStep - 1]}</span>
          </div>
          <div className="w-full bg-white/50 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Step 1: Set Your Goals</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Current Age
                  </label>
                  <input
                    type="number"
                    value={formData.currentAge}
                    onChange={(e) => updateFormData('currentAge', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg bg-white text-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Retirement Age
                  </label>
                  <input
                    type="number"
                    value={formData.retirementAge}
                    onChange={(e) => updateFormData('retirementAge', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg bg-white text-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Target Annual Income in Retirement ($)
                </label>
                <input
                  type="number"
                  value={formData.targetIncome}
                  onChange={(e) => updateFormData('targetIncome', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg bg-white text-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
                />
                <p className="text-sm text-gray-600 mt-1">
                  How much annual income would you like in retirement?
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Step 2: Current Situation</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Current Annual Salary ($)
                  </label>
                  <input
                    type="number"
                    value={formData.currentSalary}
                    onChange={(e) => updateFormData('currentSalary', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg bg-white text-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Current Super Balance ($)
                  </label>
                  <input
                    type="number"
                    value={formData.superBalance}
                    onChange={(e) => updateFormData('superBalance', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg bg-white text-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Monthly Investment Amount ($)
                </label>
                <input
                  type="number"
                  value={formData.monthlyInvestment}
                  onChange={(e) => updateFormData('monthlyInvestment', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg bg-white text-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
                />
                <p className="text-sm text-gray-600 mt-1">
                  How much can you invest each month (outside of super)?
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Step 3: Investment Strategy</h2>
              
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h3 className="font-semibold text-blue-900 mb-2">🏦 Superannuation Strategy</h3>
                  <p className="text-blue-800 text-sm">
                    High Growth option selected (8% expected return) with salary packaging to maximize before-tax contributions.
                  </p>
                </div>

                <div className="border rounded-lg p-4 bg-green-50">
                  <h3 className="font-semibold text-green-900 mb-2">📈 ETF Investment Strategy</h3>
                  <p className="text-green-800 text-sm">
                    OneETF strategy recommended - single diversified fund (VDHG-style) for maximum simplicity.
                  </p>
                </div>

                <div className="border rounded-lg p-4 bg-purple-50">
                  <h3 className="font-semibold text-purple-900 mb-2">🏠 Property Strategy</h3>
                  <p className="text-purple-800 text-sm">
                    Focus on ETFs first - property can be added later when you have more capital.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Your Investment Summary:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Super contributions: ${Math.round(formData.currentSalary * 0.11).toLocaleString()}/year (11% SG)</li>
                  <li>• ETF investments: ${(formData.monthlyInvestment * 12).toLocaleString()}/year</li>
                  <li>• Expected return: 8% per year (long-term average)</li>
                  <li>• Time to retirement: {formData.retirementAge - formData.currentAge} years</li>
                </ul>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Step 4: Your Results</h2>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200 text-center">
                  <div className="text-3xl font-bold text-green-600">
                    ${(projectedAssets / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-sm font-medium text-gray-600 mt-2">
                    Total Assets at {formData.retirementAge}
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200 text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    ${monthlyRetirementIncome.toLocaleString()}
                  </div>
                  <div className="text-sm font-medium text-gray-600 mt-2">
                    Monthly Retirement Income
                  </div>
                </div>

                <div className={`p-6 rounded-xl border-2 text-center ${
                  monthlyRetirementIncome >= formData.targetIncome / 12
                    ? 'bg-green-50 border-green-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className={`text-3xl font-bold ${
                    monthlyRetirementIncome >= formData.targetIncome / 12
                      ? 'text-green-600'
                      : 'text-yellow-600'
                  }`}>
                    {monthlyRetirementIncome >= formData.targetIncome / 12 ? '✅' : '⚠️'}
                  </div>
                  <div className="text-sm font-medium text-gray-600 mt-2">
                    {monthlyRetirementIncome >= formData.targetIncome / 12 
                      ? 'Goal Achievable'
                      : 'Need More Savings'
                    }
                  </div>
                </div>
              </div>

              {/* Action Items */}
              <div className="bg-yellow-50 rounded-xl border-2 border-yellow-200 p-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-4">
                  🎯 Key Action Items
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Maximize Your Before-tax Super</div>
                      <div className="text-sm text-gray-600">
                        Use salary packaging to contribute up to $27,500 per year before tax.
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Start ETF Investing</div>
                      <div className="text-sm text-gray-600">
                        Consider VDHG or similar diversified fund for simple, effective investing.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Review Annually</div>
                      <div className="text-sm text-gray-600">
                        Update your plan each year to account for salary increases and life changes.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Export/Save Options */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => alert('PDF export would be implemented in the full version')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  📄 Export as PDF
                </button>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                >
                  🔄 Start Over
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Plan Again
              </button>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-gray-100 p-4 rounded-lg text-sm text-gray-600 text-center">
          <strong>Disclaimer:</strong> This is a demo tool for educational purposes only and is not personal financial advice. 
          Projections are based on assumptions and actual results may vary significantly.
        </div>
      </div>
    </div>
  )
}

export default PlannerDemo