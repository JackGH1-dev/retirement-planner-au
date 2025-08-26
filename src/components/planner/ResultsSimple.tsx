/**
 * Results Component - Step 5 of the retirement planner
 * Beginner-friendly with accumulation charts and plain-English explanations
 */

import React, { useState } from 'react'

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
  const monthlyInvestment = plannerState?.portfolio?.monthlyInvestment || 0
  const salarySacrifice = plannerState?.super?.salaryPackaging || 0
  
  // Property details
  const hasProperty = plannerState?.property?.hasProperty || false
  const propertyValue = plannerState?.property?.value || 0
  const propertyLoan = plannerState?.property?.loanBalance || 0
  
  // Realistic super projection calculation (aligned with MoneySmart methodology)
  const sgRate = 0.12 // Current 12% SG rate
  const annualSGContribution = salary * sgRate
  const annualSalarySacrifice = salarySacrifice * 12
  const totalAnnualSuperContributions = annualSGContribution + annualSalarySacrifice
  
  // Realistic super return assumptions (after tax and fees)
  const grossReturn = 0.075 // 7.5% gross return (industry standard)
  const superTaxRate = 0.15 // 15% tax on earnings within super
  const investmentFeeRate = 0.008 // 0.8% average investment fees
  const adminFeeAnnual = 80 // Average admin fee per year
  const netReturn = grossReturn * (1 - superTaxRate) - investmentFeeRate // ~5.575%
  
  // Calculate super growth with realistic returns
  const currentSuperGrowth = superBalance * Math.pow(1 + netReturn, yearsToRetirement)
  const superContributionGrowth = totalAnnualSuperContributions * ((Math.pow(1 + netReturn, yearsToRetirement) - 1) / netReturn)
  
  // Subtract cumulative admin fees (with inflation)
  const inflationRate = 0.025
  let totalAdminFees = 0
  for (let year = 1; year <= yearsToRetirement; year++) {
    totalAdminFees += adminFeeAnnual * Math.pow(1 + inflationRate, year - 1)
  }
  
  const superProjection = Math.max(0, currentSuperGrowth + superContributionGrowth - totalAdminFees)
  
  // Realistic ETF projection calculation (updated with fees and tax considerations)
  const etfGrossReturn = 0.08 // 8% gross market return assumption
  const etfManagementFee = 0.0018 // Weighted average: VDHG 0.27%, VAS 0.07%, VGS 0.18% ≈ 0.18%
  const etfPlatformFee = 0.0005 // Typical brokerage platform fees annualized
  const etfTaxDrag = 0.005 // ~0.5% tax drag from distributions and capital gains in accumulation phase
  
  // Net ETF return after all costs
  const etfNetReturn = etfGrossReturn - etfManagementFee - etfPlatformFee - etfTaxDrag // ~7.15%
  
  // Calculate ETF projection with more realistic returns
  // Handle zero monthly investment case properly
  const currentETFBalance = plannerState?.portfolio?.currentBalance || 0
  
  // Future value of current balance (compound growth)
  const currentBalanceGrowth = currentETFBalance > 0 
    ? currentETFBalance * Math.pow(1 + etfNetReturn, yearsToRetirement)
    : 0
  
  // Future value of monthly contributions (annuity)
  const futureContributions = monthlyInvestment > 0 
    ? (monthlyInvestment * 12) * ((Math.pow(1 + etfNetReturn, yearsToRetirement) - 1) / etfNetReturn)
    : 0
  
  const etfProjection = currentBalanceGrowth + futureContributions
  
  // Debug logging for ETF calculations
  console.log('[ResultsSimple] ETF Calculations:', {
    currentETFBalance,
    monthlyInvestment,
    yearsToRetirement,
    etfNetReturn,
    currentBalanceGrowth,
    futureContributions,
    etfProjection
  })
  
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

  // Generate accumulation data for charts
  const generateAccumulationData = () => {
    const data = []
    const currentYear = new Date().getFullYear()
    
    for (let year = 0; year <= yearsToRetirement; year++) {
      const age = currentAge + year
      
      // Super accumulation (using same realistic returns as main calculation)
      const yearlyAdminFee = adminFeeAnnual * Math.pow(1 + inflationRate, year)
      const cumulativeAdminFees = year > 0 ? (adminFeeAnnual * ((Math.pow(1 + inflationRate, year) - 1) / inflationRate)) : 0
      
      const superCurrentGrowth = superBalance * Math.pow(1 + netReturn, year)
      const superContributionGrowth = year > 0 
        ? totalAnnualSuperContributions * ((Math.pow(1 + netReturn, year) - 1) / netReturn) 
        : 0
      const superTotal = Math.max(0, superCurrentGrowth + superContributionGrowth - cumulativeAdminFees)
      
      // ETF accumulation (using same realistic returns as main calculation)
      // Current balance growth + contribution growth
      const etfCurrentGrowth = currentETFBalance > 0 && year > 0
        ? currentETFBalance * Math.pow(1 + etfNetReturn, year)
        : 0
      
      const etfContributionGrowth = (year > 0 && monthlyInvestment > 0) 
        ? (monthlyInvestment * 12) * ((Math.pow(1 + etfNetReturn, year) - 1) / etfNetReturn)
        : 0
        
      const etfTotal = etfCurrentGrowth + etfContributionGrowth
      
      // Property accumulation (if applicable)
      let propertyTotal = 0
      if (hasProperty && propertyValue > 0) {
        const propertyGrowthRate = 0.05
        const futurePropertyValue = propertyValue * Math.pow(1 + propertyGrowthRate, year)
        propertyTotal = Math.max(0, futurePropertyValue - propertyLoan)
      }
      
      const totalWealth = superTotal + etfTotal + propertyTotal
      
      data.push({
        year: currentYear + year,
        age,
        super: superTotal,
        etf: etfTotal,
        property: propertyTotal,
        total: totalWealth
      })
    }
    
    return data
  }

  const chartData = generateAccumulationData()
  const maxValue = Math.max(...chartData.map(d => d.total))

  // Chart component for individual buckets
  // Expanded Chart Modal Component
  const ExpandedChartModal = ({ 
    isOpen, 
    onClose, 
    title, 
    data, 
    valueKey, 
    color, 
    icon, 
    formatValue 
  }: { 
    isOpen: boolean
    onClose: () => void
    title: string
    data: any[]
    valueKey: string
    color: string
    icon: string
    formatValue: (value: number) => string
  }) => {
    if (!isOpen) return null

    const maxChartValue = Math.max(...data.map(d => d[valueKey]))
    const colorClass = color.includes('blue') ? 'bg-blue-500' :
                      color.includes('green') ? 'bg-green-500' :
                      color.includes('purple') ? 'bg-purple-500' :
                      'bg-orange-500'

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
                <span className="text-2xl">{icon}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{title} - Year by Year</h2>
                <p className="text-gray-600">Final value: {formatValue(data[data.length - 1][valueKey])}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="p-6">
            {/* Large Chart Visualization */}
            <div className="mb-8">
              <div className="relative h-80 bg-gray-50 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-end justify-center px-2">
                  {data.map((point, index) => {
                    const height = maxChartValue > 0 ? (point[valueKey] / maxChartValue) * 100 : 0
                    return (
                      <div
                        key={index}
                        className={`flex-1 mx-px rounded-t transition-all duration-300 hover:opacity-80 ${colorClass} group relative`}
                        style={{ height: `${height}%` }}
                        title={`Age ${point.age}: ${formatValue(point[valueKey])}`}
                      >
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                          Age {point.age}: {formatValue(point[valueKey])}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>Age {data[0].age}</span>
                <span>Age {data[data.length - 1].age}</span>
              </div>
            </div>

            {/* Year-by-Year Table */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-4">📊 Year-by-Year Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                {data.map((point, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="font-medium text-gray-700 text-sm">Age {point.age}</div>
                    <div className="text-lg font-bold text-gray-900">{formatValue(point[valueKey])}</div>
                    {index > 0 && (
                      <div className="text-xs text-green-600">
                        +{formatValue(point[valueKey] - data[index - 1][valueKey])} from last year
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Key Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{formatValue(data[0][valueKey])}</div>
                <div className="text-sm text-gray-600">Starting Value</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatValue((data[data.length - 1][valueKey] - data[0][valueKey]) / data.length)}
                </div>
                <div className="text-sm text-gray-600">Average Annual Growth</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{formatValue(data[data.length - 1][valueKey])}</div>
                <div className="text-sm text-gray-600">Final Value</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const AccumulationChart = ({ 
    title, 
    data, 
    valueKey, 
    color, 
    icon, 
    formatValue 
  }: { 
    title: string
    data: any[]
    valueKey: string
    color: string
    icon: string
    formatValue: (value: number) => string
  }) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const maxChartValue = Math.max(...data.map(d => d[valueKey]))
    
    return (
      <>
        <div 
          className="bg-white rounded-xl border-2 border-gray-100 p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-gray-200"
          onClick={() => setIsExpanded(true)}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
              <span className="text-xl">{icon}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{title}</h3>
              <div className="text-2xl font-bold text-gray-900">
                {formatValue(data[data.length - 1][valueKey])}
              </div>
            </div>
            <div className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
          
          {/* Chart visualization */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Age {data[0].age}</span>
              <span>Age {data[data.length - 1].age}</span>
            </div>
            
            {/* Chart bars */}
            <div className="relative h-24 bg-gray-50 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-end justify-center">
                {data.filter((_, i) => i % Math.ceil(data.length / 15) === 0).map((point, index) => {
                  const height = maxChartValue > 0 ? (point[valueKey] / maxChartValue) * 100 : 0
                  return (
                    <div
                      key={index}
                      className={`w-1 mx-0.5 rounded-t transition-all duration-300 ${
                        color.includes('blue') ? 'bg-blue-500' :
                        color.includes('green') ? 'bg-green-500' :
                        color.includes('purple') ? 'bg-purple-500' :
                        'bg-orange-500'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  )
                })}
              </div>
            </div>
            
            {/* Key milestones */}
            <div className="grid grid-cols-3 gap-2 text-xs mt-3">
              <div className="text-center">
                <div className="font-medium text-gray-600">Year 5</div>
                <div className="text-gray-800">
                  {data.length > 5 ? formatValue(data[5][valueKey]) : formatValue(0)}
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-600">Year 15</div>
                <div className="text-gray-800">
                  {data.length > 15 ? formatValue(data[15][valueKey]) : formatValue(data[Math.floor(data.length/2)][valueKey])}
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-600">Retirement</div>
                <div className="text-gray-800">
                  {formatValue(data[data.length - 1][valueKey])}
                </div>
              </div>
            </div>
            
            {/* Click hint */}
            <div className="text-center text-xs text-gray-500 mt-2 bg-gray-100 rounded-lg py-1">
              Click to expand for year-by-year details
            </div>
          </div>
        </div>

        <ExpandedChartModal
          isOpen={isExpanded}
          onClose={() => setIsExpanded(false)}
          title={title}
          data={data}
          valueKey={valueKey}
          color={color}
          icon={icon}
          formatValue={formatValue}
        />
      </>
    )
  }

  // Combined portfolio chart
  const CombinedChart = ({ data }: { data: any[] }) => {
    const maxTotal = Math.max(...data.map(d => d.total))
    
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-2xl">💰</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">Total Wealth Accumulation</h3>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ${(data[data.length - 1].total / 1000000).toFixed(1)}M
            </div>
          </div>
        </div>
        
        {/* Stacked area chart */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Age {data[0].age}</span>
            <span>Retirement at {data[data.length - 1].age}</span>
          </div>
          
          <div className="relative h-32 bg-white rounded-lg border overflow-hidden">
            {data.filter((_, i) => i % Math.ceil(data.length / 20) === 0).map((point, index) => {
              const totalHeight = maxTotal > 0 ? 100 : 0
              const superHeight = point.total > 0 ? (point.super / point.total) * totalHeight : 0
              const etfHeight = point.total > 0 ? (point.etf / point.total) * totalHeight : 0
              const propertyHeight = point.total > 0 ? (point.property / point.total) * totalHeight : 0
              
              return (
                <div
                  key={index}
                  className="absolute bottom-0 w-1.5"
                  style={{ 
                    left: `${(index / 19) * 100}%`,
                    height: `${(point.total / maxTotal) * 100}%`
                  }}
                >
                  {/* Super (bottom layer) */}
                  <div
                    className="bg-blue-500 w-full absolute bottom-0"
                    style={{ height: `${(point.super / point.total) * 100}%` }}
                  />
                  {/* ETF (middle layer) */}
                  <div
                    className="bg-purple-500 w-full absolute"
                    style={{ 
                      bottom: `${(point.super / point.total) * 100}%`,
                      height: `${(point.etf / point.total) * 100}%`
                    }}
                  />
                  {/* Property (top layer) */}
                  {point.property > 0 && (
                    <div
                      className="bg-orange-500 w-full absolute"
                      style={{ 
                        bottom: `${((point.super + point.etf) / point.total) * 100}%`,
                        height: `${(point.property / point.total) * 100}%`
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
          
          {/* Legend */}
          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Super</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span>ETFs</span>
            </div>
            {hasProperty && propertyEquity > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span>Property</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    return `$${Math.round(value).toLocaleString()}`
  }

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

        {/* Combined Portfolio Visualization */}
        <div className="mb-8">
          <CombinedChart data={chartData} />
        </div>

        {/* Individual Investment Bucket Charts */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            📊 How Each Investment Grows Over Time
          </h3>
          <div className={`grid grid-cols-1 ${hasProperty && propertyEquity > 0 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
            <AccumulationChart
              title="Super Growth"
              data={chartData}
              valueKey="super"
              color="bg-blue-100"
              icon="🏦"
              formatValue={formatCurrency}
            />
            <AccumulationChart
              title="ETF Investment"
              data={chartData}
              valueKey="etf"
              color="bg-purple-100"
              icon="📈"
              formatValue={formatCurrency}
            />
            {hasProperty && propertyEquity > 0 && (
              <AccumulationChart
                title="Property Equity"
                data={chartData}
                valueKey="property"
                color="bg-orange-100"
                icon="🏠"
                formatValue={formatCurrency}
              />
            )}
          </div>
          
          {/* Chart insights */}
          <div className="mt-6 bg-gray-50 rounded-xl p-4">
            <h4 className="font-medium text-gray-800 mb-3">💡 Key Insights from Your Charts:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <div>
                  <strong>Super growth:</strong> Your super grows to {superPercentage}% of total wealth using realistic returns 
                  (~5.6% after tax and fees) with consistent contributions.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-500 font-bold">•</span>
                <div>
                  <strong>ETF growth:</strong> Regular ${monthlyInvestment.toLocaleString()}/month investing compounds 
                  to {etfPercentage}% of your retirement wealth.
                </div>
              </div>
              {hasProperty && propertyEquity > 0 && (
                <div className="flex items-start gap-2 md:col-span-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <div>
                    <strong>Property contribution:</strong> Property equity makes up {propertyPercentage}% of your wealth,
                    providing diversification from shares and super.
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2 md:col-span-2">
                <span className="text-gray-500 font-bold">•</span>
                <div>
                  <strong>Compound power:</strong> Notice how growth accelerates in later years - that's compound interest 
                  working harder as your balances get larger.
                </div>
              </div>
            </div>
          </div>
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

        {/* Property Strategy Analysis */}
        {hasProperty && propertyEquity > 0 && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="text-2xl">🏠</div>
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 mb-2">Property Strategy at Retirement</h3>
                <p className="text-orange-800 text-sm mb-4">
                  Your property will be worth an estimated ${(propertyEquity / 1000000).toFixed(1)}M at retirement. 
                  Here are your main options for accessing this wealth.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option A: Keep Properties */}
              <div className="bg-white rounded-lg border border-orange-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🔄</span>
                  <h4 className="font-semibold text-orange-900">Option A: Keep Properties</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly rental income:</span>
                    <span className="font-medium text-green-600">+${Math.round(propertyEquity * 0.04 / 12).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property expenses:</span>
                    <span className="font-medium text-red-600">-${Math.round(propertyEquity * 0.02 / 12).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-800 font-medium">Net monthly income:</span>
                    <span className="font-bold text-blue-600">+${Math.round(propertyEquity * 0.02 / 12).toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    ✓ Ongoing income stream<br/>
                    ✓ Inflation protection<br/>
                    ⚠️ Property management required
                  </div>
                </div>
              </div>

              {/* Option B: Sell Properties */}
              <div className="bg-white rounded-lg border border-orange-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">💰</span>
                  <h4 className="font-semibold text-orange-900">Option B: Sell Properties</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gross sale proceeds:</span>
                    <span className="font-medium text-green-600">${(propertyEquity / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capital gains tax:</span>
                    <span className="font-medium text-red-600">-${(propertyEquity * 0.15 / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-800 font-medium">Net lump sum:</span>
                    <span className="font-bold text-blue-600">${(propertyEquity * 0.85 / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly income (4% rule):</span>
                    <span className="font-bold text-blue-600">${Math.round(propertyEquity * 0.85 * 0.04 / 12).toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    ✓ Liquidity and flexibility<br/>
                    ✓ Diversification options<br/>
                    ⚠️ Capital gains tax impact
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-orange-100 rounded-lg">
              <div className="text-sm text-orange-800">
                <strong>💡 Strategy Insight:</strong> 
                {Math.round(propertyEquity * 0.85 * 0.04 / 12) > Math.round(propertyEquity * 0.02 / 12) 
                  ? ` Selling and reinvesting could provide ${Math.round((propertyEquity * 0.85 * 0.04 / 12) - (propertyEquity * 0.02 / 12)).toLocaleString()} more monthly income due to better liquidity and diversification.`
                  : ` Keeping properties provides better long-term cash flow, assuming consistent rental income and property management.`
                }
                {" "}Consider your preference for hands-on property management vs passive investing.
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
                  Consider low-cost ETFs like VDHG (0.27% fees) for simple, diversified investing. Auto-transfer makes it effortless.
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
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
              title="Go back to adjust properties and manage scenarios"
            >
              🏠 Edit Properties
            </button>
          </div>
        </div>

        {/* Enhanced Disclaimer */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-gray-700 mt-8">
          <div className="font-semibold text-blue-900 mb-2">💡 About These Projections</div>
          <div className="space-y-2">
            <div><strong>Super assumptions:</strong> 7.5% gross returns, 15% tax on earnings, 0.8% investment fees, $80/year admin fees (≈5.6% net)</div>
            <div><strong>ETF assumptions:</strong> 8% gross market returns, 0.18% management fees, 0.05% platform fees, 0.5% tax drag (≈7.2% net)</div>
            <div><strong>Property assumptions:</strong> 5% annual capital growth</div>
            <div className="pt-2 border-t border-blue-200">
              <strong>Important:</strong> These are estimates based on long-term averages. Actual returns will vary. 
              Markets fluctuate, but consistency with your plan over decades is key to success. 
              Compare with the <a href="https://moneysmart.gov.au/how-super-works/superannuation-calculator" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">official MoneySmart calculator</a> 
              and consider professional financial advice.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}