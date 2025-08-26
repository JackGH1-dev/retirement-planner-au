/**
 * Planner Modules Component - Step 4 of the retirement planner
 * Simplified version with personalized property analysis
 */

import React from 'react'

interface PlannerModulesProps {
  plannerState: any
  settings: any
  simulationResult: any
  onUpdateState: (updates: any) => void
  onShowResults: () => void
  simulationLoading: boolean
  simulationProgress: number
  onPrevious?: () => void
}

export const PlannerModules: React.FC<PlannerModulesProps> = ({
  plannerState,
  settings,
  simulationResult,
  onUpdateState,
  onShowResults,
  simulationLoading,
  simulationProgress,
  onPrevious
}) => {
  // Extract property data for personalized analysis
  const propertyData = plannerState?.property || {}
  const hasAnyProperty = propertyData?.hasProperty || false
  const properties = propertyData?.properties || []
  
  // Analyze property portfolio
  const ownerOccupiedProperties = properties.filter(p => p.propertyType === 'owner-occupied')
  const investmentProperties = properties.filter(p => p.propertyType === 'investment')
  const hasOwnHome = ownerOccupiedProperties.length > 0
  const hasInvestmentProperties = investmentProperties.length > 0
  
  // Calculate investment property performance
  const totalInvestmentCashFlow = investmentProperties.reduce((sum, prop) => sum + (prop.monthlyCashFlow || 0), 0)
  const totalInvestmentEquity = investmentProperties.reduce((sum, prop) => sum + (prop.currentEquity || 0), 0)
  const averageNetYield = investmentProperties.length > 0 
    ? investmentProperties.reduce((sum, prop) => sum + (prop.netYield || 0), 0) / investmentProperties.length
    : 0

  // Home ownership retirement impact
  const totalHomeEquity = ownerOccupiedProperties.reduce((sum, prop) => sum + (prop.currentEquity || 0), 0)
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Step 4: Your Personalized Strategy</h2>
        
        <div className="space-y-6">
          {/* Super Strategy */}
          <div className="border rounded-lg p-4 bg-blue-50">
            <h3 className="font-semibold text-blue-900 mb-2">🏦 Superannuation Strategy</h3>
            <p className="text-blue-800 text-sm">
              High Growth option selected (8% expected return) with salary packaging optimization.
              Your super will benefit from before-tax contributions up to the annual cap of $27,500.
            </p>
            <div className="mt-3 text-sm text-blue-700">
              <strong>Annual Contribution:</strong> ${Math.round((plannerState?.incomeExpense?.salary || 75000) * 0.11 + 6000).toLocaleString()} (SG + salary packaging)
            </div>
          </div>

          {/* ETF Strategy */}
          <div className="border rounded-lg p-4 bg-green-50">
            <h3 className="font-semibold text-green-900 mb-2">📈 ETF Investment Strategy</h3>
            <p className="text-green-800 text-sm">
              OneETF strategy recommended - single diversified fund (VDHG-style) for maximum simplicity.
              This provides global diversification with minimal management required.
            </p>
            <div className="mt-3 text-sm text-green-700">
              <strong>Monthly Investment:</strong> ${(plannerState?.portfolio?.monthlyInvestment || 1000).toLocaleString()}
            </div>
          </div>

          {/* Personalized Property Strategy */}
          <div className="border rounded-lg p-4 bg-purple-50">
            <h3 className="font-semibold text-purple-900 mb-2">🏠 Your Property Strategy</h3>
            
            {/* No Property Situation */}
            {!hasAnyProperty && (
              <div className="space-y-3">
                <p className="text-purple-800 text-sm">
                  <strong>Current situation:</strong> No property owned - focusing on super and ETFs first is an excellent strategy.
                </p>
                <p className="text-purple-800 text-sm">
                  <strong>Retirement impact:</strong> Without property ownership, you'll have ongoing rental costs in retirement.
                  However, your liquid investments (super + ETFs) will provide flexibility to relocate or downsize as needed.
                </p>
                <p className="text-purple-800 text-sm">
                  <strong>Future consideration:</strong> Once you've built substantial ETF wealth, you may consider
                  purchasing a home for stability and potential capital growth.
                </p>
              </div>
            )}

            {/* Property Portfolio Analysis */}
            {hasAnyProperty && (
              <div className="space-y-3">
                {/* Home Ownership Impact */}
                {hasOwnHome && (
                  <div className="bg-blue-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🏠</span>
                      <h4 className="font-semibold text-blue-900">Home Ownership Advantage</h4>
                    </div>
                    <p className="text-blue-800 text-sm mb-2">
                      <strong>Excellent foundation!</strong> You own {ownerOccupiedProperties.length} home{ownerOccupiedProperties.length > 1 ? 's' : ''} 
                      with ${totalHomeEquity.toLocaleString()} in equity.
                    </p>
                    <p className="text-blue-800 text-sm">
                      <strong>Retirement benefit:</strong> Owning your home eliminates rental costs in retirement, 
                      significantly reducing your required income. This equity can also provide downsizing options for additional retirement funds.
                    </p>
                  </div>
                )}

                {/* Investment Property Performance */}
                {hasInvestmentProperties && (
                  <div className="bg-green-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🏘️</span>
                      <h4 className="font-semibold text-green-900">Investment Property Performance</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2 text-sm">
                      <div className="bg-white rounded p-2">
                        <div className="text-gray-600">Portfolio</div>
                        <div className="font-bold text-green-700">{investmentProperties.length} propert{investmentProperties.length > 1 ? 'ies' : 'y'}</div>
                      </div>
                      <div className="bg-white rounded p-2">
                        <div className="text-gray-600">Net Yield</div>
                        <div className={`font-bold ${averageNetYield >= 4 ? 'text-green-600' : averageNetYield >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {averageNetYield.toFixed(1)}%
                        </div>
                      </div>
                      <div className="bg-white rounded p-2">
                        <div className="text-gray-600">Cash Flow</div>
                        <div className={`font-bold ${totalInvestmentCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {totalInvestmentCashFlow >= 0 ? '+' : ''}${totalInvestmentCashFlow.toFixed(0)}/month
                        </div>
                      </div>
                    </div>
                    
                    {/* Performance Commentary */}
                    <div className="text-green-800 text-sm">
                      {averageNetYield >= 4 && totalInvestmentCashFlow >= 0 && (
                        <p><strong>Excellent performance!</strong> Your properties are generating strong positive cash flow with good net yields. This provides excellent passive income for retirement.</p>
                      )}
                      {averageNetYield >= 2 && averageNetYield < 4 && totalInvestmentCashFlow >= 0 && (
                        <p><strong>Solid performance.</strong> Your properties are cash flow positive with reasonable yields. The capital growth potential supports your long-term retirement strategy.</p>
                      )}
                      {totalInvestmentCashFlow < 0 && (
                        <p><strong>Negative gearing strategy.</strong> While requiring ${Math.abs(totalInvestmentCashFlow).toFixed(0)}/month contribution, the tax benefits and capital growth potential can support retirement wealth building.</p>
                      )}
                      {averageNetYield < 2 && (
                        <p><strong>Focus on capital growth.</strong> Low yields suggest this is a capital growth strategy. Monitor performance and consider if better opportunities exist in ETFs or higher-yielding properties.</p>
                      )}
                    </div>

                    <p className="text-green-800 text-sm mt-2">
                      <strong>Retirement strategy:</strong> Your ${totalInvestmentEquity.toLocaleString()} in property equity provides portfolio diversification alongside super and ETFs.
                    </p>
                  </div>
                )}

                {/* Overall Property Strategy Conclusion */}
                <p className="text-purple-800 text-sm font-medium">
                  {hasOwnHome && hasInvestmentProperties 
                    ? "🎯 Balanced approach: Home ownership provides security while investment properties add growth and income diversification."
                    : hasOwnHome 
                    ? "🎯 Security-focused: Home ownership provides excellent retirement foundation. Consider ETFs for growth diversification."
                    : hasInvestmentProperties 
                    ? "🎯 Growth-focused: Investment properties provide income and growth. Consider home ownership for security when financially ready."
                    : "🎯 Liquid wealth strategy: Building super and ETF wealth first provides flexibility for future property decisions."
                  }
                </p>
              </div>
            )}
          </div>

          {/* Loading State */}
          {simulationLoading && (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-2">Running simulation... {Math.round(simulationProgress)}%</p>
            </div>
          )}

          {/* Navigation Buttons */}
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
              onClick={onShowResults}
              disabled={simulationLoading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:opacity-50 ml-auto"
            >
              {simulationLoading ? 'Calculating...' : 'View Results →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}