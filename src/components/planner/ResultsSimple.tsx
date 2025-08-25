/**
 * Results Component - Step 4 of the retirement planner
 * Beginner-friendly with plain-English explanations and actionable guidance
 */

import React from 'react'

interface ResultsProps {
  kpis: any
  series: any
  plannerState: any
  onExportCSV: () => void
  onSave: () => void
  quickWin?: any
  onPrevious?: () => void
}

export const Results: React.FC<ResultsProps> = ({
  kpis,
  series,
  plannerState,
  onExportCSV,
  onSave,
  quickWin,
  onPrevious
}) => {
  // Calculate results from planner state
  const currentAge = plannerState?.goal?.currentAge || 30
  const retirementAge = plannerState?.goal?.retirementAge || 65
  const yearsToRetirement = retirementAge - currentAge
  const goalType = plannerState?.goal?.goalType || 'income'
  const targetIncome = plannerState?.goal?.targetIncome || 80000
  const targetCapital = goalType === 'capital' ? targetIncome : null // When capital mode, targetIncome holds the nest egg amount
  
  const salary = plannerState?.incomeExpense?.salary || 75000
  const superBalance = plannerState?.super?.currentBalance || 50000
  const monthlyInvestment = plannerState?.portfolio?.monthlyInvestment || 1000
  const salarySacrifice = plannerState?.super?.salaryPackaging || 0
  
  // Property details
  const hasProperty = plannerState?.property?.hasProperty || false
  const propertyValue = plannerState?.property?.value || 0
  const propertyLoan = plannerState?.property?.loanBalance || 0
  
  // Corrected super projection calculation
  const sgRate = 0.115 // Correct 11.5% SG rate
  const annualSGContribution = salary * sgRate
  const annualSalarySacrifice = salarySacrifice * 12
  const totalAnnualSuperContributions = annualSGContribution + annualSalarySacrifice
  
  const currentSuperGrowth = superBalance * Math.pow(1.08, yearsToRetirement)
  const superContributionGrowth = totalAnnualSuperContributions * ((Math.pow(1.08, yearsToRetirement) - 1) / 0.08)
  const superProjection = currentSuperGrowth + superContributionGrowth
  
  const etfProjection = (monthlyInvestment * 12) * ((Math.pow(1.08, yearsToRetirement) - 1) / 0.08)
  
  // Property projection (if applicable)
  let propertyEquity = 0
  if (hasProperty && propertyValue > 0) {
    const propertyGrowthRate = 0.05 // 5% annual property growth
    const futurePropertyValue = propertyValue * Math.pow(1 + propertyGrowthRate, yearsToRetirement)
    propertyEquity = Math.max(0, futurePropertyValue - propertyLoan) // Assume loan stays same
  }
  
  const totalAssets = superProjection + etfProjection + propertyEquity
  const monthlyRetirementIncome = (totalAssets * 0.04) / 12
  const annualRetirementIncome = monthlyRetirementIncome * 12

  // Handle different goal types
  let canRetire, gap, gapPercentage, actualTarget

  if (goalType === 'capital') {
    // Nest egg goal: Compare total assets to target capital
    actualTarget = targetCapital
    canRetire = totalAssets >= targetCapital
    gap = Math.max(0, targetCapital - totalAssets)
    gapPercentage = gap > 0 ? ((gap / targetCapital) * 100).toFixed(0) : 0
  } else {
    // Income goal: Compare annual income to target income
    actualTarget = targetIncome
    canRetire = monthlyRetirementIncome >= (targetIncome / 12)
    gap = Math.max(0, targetIncome - annualRetirementIncome)
    gapPercentage = gap > 0 ? ((gap / targetIncome) * 100).toFixed(0) : 0
  }

  // Smart suggestions
  const monthlyGap = gap / 12
  const extraMonthlyNeeded = monthlyGap > 0 ? Math.round(monthlyGap / 0.04 / 12) : 0

  // Super access and bridge years
  const superAccessAge = 60
  const bridgeYears = Math.max(0, superAccessAge - retirementAge)
  
  // Calculate bridge need based on goal type
  let bridgeNeedMonthly = 0
  if (bridgeYears > 0) {
    if (goalType === 'capital') {
      // For capital goals, use the 4% withdrawal rule to get monthly income needed
      bridgeNeedMonthly = (targetCapital * 0.04) / 12
    } else {
      // For income goals, use the target income directly
      bridgeNeedMonthly = targetIncome / 12
    }
  }
  const bridgeNeedTotal = bridgeNeedMonthly * bridgeYears * 12

  // Asset allocation percentages
  const superPercentage = ((superProjection / totalAssets) * 100).toFixed(0)
  const etfPercentage = ((etfProjection / totalAssets) * 100).toFixed(0)
  const propertyPercentage = propertyEquity > 0 ? ((propertyEquity / totalAssets) * 100).toFixed(0) : 0

  // Generate plain-English headline
  const getHeadline = () => {
    if (canRetire) {
      if (goalType === 'capital') {
        return `Excellent! You'll have ${(totalAssets / 1000000).toFixed(1)}M by age ${retirementAge}, exceeding your ${(targetCapital / 1000000).toFixed(1)}M goal.`
      } else {
        return `Great news! Retirement at ${retirementAge} looks achievable with ${monthlyInvestment > 1500 ? 'solid' : 'consistent'} investing.`
      }
    } else if (gap < actualTarget * 0.2) {
      return `You're close! A small boost to investing could get you to your ${retirementAge} retirement goal.`
    } else if (gap < actualTarget * 0.4) {
      return `On track for a good retirement, but you'll need to increase savings to hit your full goal.`
    } else {
      return `Let's work on this together—there are several ways to improve your retirement outlook.`
    }
  }

  const getQuickWin = () => {
    if (canRetire) return null
    
    if (extraMonthlyNeeded < 300) {
      return {
        message: `Add $${extraMonthlyNeeded}/month to regular investing to close the gap`,
        action: 'Apply this suggestion',
        type: 'investing'
      }
    }
    
    if (plannerState?.super?.salaryPackaging < 1000) {
      const extraSuper = Math.min(500, extraMonthlyNeeded)
      return {
        message: `Add $${extraSuper}/month to salary packaging for tax-effective savings`,
        action: 'Boost super contributions',
        type: 'super'
      }
    }
    
    if (retirementAge > 60) {
      return {
        message: `Consider retiring at ${retirementAge - 2} with a smaller gap to close`,
        action: 'Adjust retirement age',
        type: 'timing'
      }
    }
    
    return null
  }

  const quickWinSuggestion = getQuickWin()

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Plain-English Headline */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            {getHeadline()}
          </h2>
          {canRetire ? (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <div className="text-6xl mb-2">🎉</div>
              {goalType === 'capital' ? (
                <>
                  <p className="text-green-800 text-lg font-medium">
                    Your plan works! You'll have <strong>${(totalAssets / 1000000).toFixed(1)}M</strong> by age {retirementAge}.
                  </p>
                  <p className="text-green-600 text-sm mt-2">
                    This is {((totalAssets / targetCapital) * 100).toFixed(0)}% of your ${(targetCapital / 1000000).toFixed(1)}M target nest egg.
                  </p>
                  <p className="text-green-600 text-xs mt-1">
                    That generates <strong>${Math.round(monthlyRetirementIncome).toLocaleString()}/month</strong> income (4% withdrawal rule).
                  </p>
                </>
              ) : (
                <>
                  <p className="text-green-800 text-lg font-medium">
                    Your plan works! You'll have <strong>${Math.round(monthlyRetirementIncome).toLocaleString()}/month</strong> to live on.
                  </p>
                  <p className="text-green-600 text-sm mt-2">
                    This is {((annualRetirementIncome / targetIncome) * 100).toFixed(0)}% of your target income.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
              <div className="text-4xl mb-2">💪</div>
              {goalType === 'capital' ? (
                <>
                  <p className="text-yellow-800 text-lg font-medium">
                    You're {gapPercentage}% short of your ${(targetCapital / 1000000).toFixed(1)}M goal, but that's totally fixable.
                  </p>
                  <p className="text-yellow-600 text-sm mt-2">
                    You'll have <strong>${(totalAssets / 1000000).toFixed(1)}M</strong>, 
                    need <strong>${(targetCapital / 1000000).toFixed(1)}M</strong>.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-yellow-800 text-lg font-medium">
                    You're {gapPercentage}% short of your goal, but that's totally fixable.
                  </p>
                  <p className="text-yellow-600 text-sm mt-2">
                    You'll have <strong>${Math.round(monthlyRetirementIncome).toLocaleString()}/month</strong>, 
                    need <strong>${Math.round(targetIncome / 12).toLocaleString()}/month</strong>.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Key Numbers (Simple) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-xl text-center">
            <div className="text-3xl font-bold text-blue-600">
              ${(totalAssets / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm font-medium text-gray-600 mt-2">
              Total nest egg at {retirementAge}
            </div>
            <div className="text-xs text-blue-700 mt-1">
              That's ${totalAssets.toLocaleString()}
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-xl text-center">
            <div className="text-3xl font-bold text-green-600">
              ${Math.round(monthlyRetirementIncome).toLocaleString()}
            </div>
            <div className="text-sm font-medium text-gray-600 mt-2">
              Monthly income from age {retirementAge}
            </div>
            <div className="text-xs text-green-700 mt-1">
              ${Math.round(annualRetirementIncome).toLocaleString()} per year
            </div>
          </div>

          <div className={`p-6 rounded-xl text-center ${bridgeYears > 0 ? 'bg-orange-50' : 'bg-gray-50'}`}>
            <div className={`text-3xl font-bold ${bridgeYears > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
              {bridgeYears > 0 ? `${bridgeYears} years` : 'None needed'}
            </div>
            <div className="text-sm font-medium text-gray-600 mt-2">
              Bridge to super access age
            </div>
            <div className={`text-xs mt-1 ${bridgeYears > 0 ? 'text-orange-700' : 'text-gray-500'}`}>
              {bridgeYears > 0 ? `From ${retirementAge} to ${superAccessAge}` : 'Retiring after 60'}
            </div>
          </div>
        </div>

        {/* Quick Win Suggestion */}
        {quickWinSuggestion && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-2xl">💡</div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">Quick win suggestion</h3>
                <p className="text-blue-800 mb-3">{quickWinSuggestion.message}</p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  {quickWinSuggestion.action}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Where Your Money Comes From */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Where your retirement money comes from</h3>
          <div className={`grid grid-cols-1 ${hasProperty ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏦</span>
              </div>
              <div>
                <div className="font-medium text-gray-800">Super fund</div>
                <div className="text-xl font-bold text-green-600">
                  ${(superProjection / 1000000).toFixed(1)}M ({superPercentage}%)
                </div>
                <div className="text-sm text-gray-600">
                  Employer + your extra super contributions
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
              <div>
                <div className="font-medium text-gray-800">Your investments</div>
                <div className="text-xl font-bold text-purple-600">
                  ${(etfProjection / 1000000).toFixed(1)}M ({etfPercentage}%)
                </div>
                <div className="text-sm text-gray-600">
                  ETFs and shares you buy regularly
                </div>
              </div>
            </div>

            {hasProperty && propertyEquity > 0 && (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🏠</span>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Property equity</div>
                  <div className="text-xl font-bold text-orange-600">
                    ${(propertyEquity / 1000000).toFixed(1)}M ({propertyPercentage}%)
                  </div>
                  <div className="text-sm text-gray-600">
                    Growth in property value less loan
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Guardrails & Important Notes */}
        <div className="space-y-4 mb-8">
          {bridgeYears > 0 && (
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-orange-500 text-lg">⚠️</span>
                <div>
                  <h4 className="font-medium text-orange-800">Bridge years to consider</h4>
                  <p className="text-orange-700 text-sm mt-1">
                    You want to retire at {retirementAge}, but can't access super until 60. 
                    You'll need ${bridgeNeedMonthly.toLocaleString()}/month from your investments for {bridgeYears} years.
                  </p>
                  <button className="text-orange-600 text-xs underline mt-2 hover:text-orange-700">
                    Why am I seeing this? →
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-blue-500 text-lg">ℹ️</span>
              <div>
                <h4 className="font-medium text-blue-800">Keep it simple</h4>
                <p className="text-blue-700 text-sm mt-1">
                  Regular investing beats trying to time the market. 
                  Set up automatic transfers and let compound interest do the work.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-yellow-50 rounded-xl border-2 border-yellow-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-yellow-900 mb-4">
            🎯 Your next steps
          </h3>
          <div className="space-y-3">
            {!canRetire && (
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <div className="font-medium text-gray-800">Boost your savings</div>
                  <div className="text-sm text-gray-600">
                    Try adding ${extraMonthlyNeeded < 300 ? extraMonthlyNeeded : '200-500'}/month to close most of the gap.
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {canRetire ? '1' : '2'}
              </div>
              <div>
                <div className="font-medium text-gray-800">Max out your super tax benefits</div>
                <div className="text-sm text-gray-600">
                  Use salary packaging up to the $27,500 yearly cap—it's like getting a tax discount on investing.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {canRetire ? '2' : '3'}
              </div>
              <div>
                <div className="font-medium text-gray-800">Set up automatic investing</div>
                <div className="text-sm text-gray-600">
                  Consider VDHG or similar for simple, effective investing. Auto-transfer makes it effortless.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation and Actions */}
        <div className="flex justify-between items-center mb-8">
          {onPrevious && (
            <button
              onClick={onPrevious}
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
            >
              ← Previous
            </button>
          )}
          
          <div className="flex space-x-4 ml-auto">
            <button
              onClick={onExportCSV}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
            >
              📄 Download your plan
            </button>
            <button
              onClick={onSave}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              💾 Save this scenario
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-gray-100 p-4 rounded-lg text-sm text-gray-600 text-center mt-8">
          <strong>Remember:</strong> This is a projection based on assumptions about future returns. 
          Markets go up and down—the key is staying consistent with your plan over time. 
          Consider chatting with a financial adviser for personalized guidance.
        </div>
      </div>
    </div>
  )
}