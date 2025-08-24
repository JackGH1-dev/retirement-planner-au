/**
 * Current Financials Component - Step 2 of Planner Wizard
 * Tabbed interface with progressive disclosure for beginner-friendly input
 */

import React, { useState, useCallback } from 'react'
import type { CurrentFinancialsProps } from '../../types/planner'
import { IncomeExpensesTab } from './tabs/IncomeExpensesTab'
import { SuperTab } from './tabs/SuperTab'
import { PropertyTab } from './tabs/PropertyTab'
import { PortfolioTab } from './tabs/PortfolioTab'
import { BuffersTab } from './tabs/BuffersTab'

type TabKey = 'income' | 'super' | 'property' | 'portfolio' | 'buffers'

interface Tab {
  key: TabKey
  label: string
  subtitle: string
  icon: string
}

const tabs: Tab[] = [
  {
    key: 'income',
    label: 'Income & Spending',
    subtitle: 'Your salary and monthly expenses',
    icon: '💰'
  },
  {
    key: 'super',
    label: 'Super',
    subtitle: 'Current balance and contributions',
    icon: '🏦'
  },
  {
    key: 'property',
    label: 'Property',
    subtitle: 'Investment property (optional)',
    icon: '🏠'
  },
  {
    key: 'portfolio',
    label: 'Regular Investing',
    subtitle: 'ETFs and other investments',
    icon: '📈'
  },
  {
    key: 'buffers',
    label: 'Safety Buffers',
    subtitle: 'Emergency funds',
    icon: '🛡️'
  }
]

export const CurrentFinancials: React.FC<CurrentFinancialsProps & { onComplete: () => void }> = ({
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
  onComplete
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('income')
  const [completedTabs, setCompletedTabs] = useState<Set<TabKey>>(new Set())

  // Mark tab as completed when user moves to next tab
  const handleTabChange = useCallback((tabKey: TabKey) => {
    if (activeTab !== tabKey) {
      setCompletedTabs(prev => new Set(prev).add(activeTab))
    }
    setActiveTab(tabKey)
  }, [activeTab])

  // Check if all essential tabs are completed
  const canProceed = completedTabs.has('income') && completedTabs.has('super')

  const handleNext = useCallback(() => {
    // Mark current tab as completed
    setCompletedTabs(prev => new Set(prev).add(activeTab))
    onComplete()
  }, [activeTab, onComplete])

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-500/10 p-8 border border-white/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full -translate-y-32 translate-x-32" />
      
      <div className="relative">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Your Current Situation
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We only need the basics—smart defaults handle the details. You can fine-tune later.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex overflow-x-auto pb-2 space-x-2 md:space-x-4">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key
              const isCompleted = completedTabs.has(tab.key)
              
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex-shrink-0 px-4 py-3 rounded-xl font-semibold text-sm md:text-base transition-all min-w-[120px] ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : isCompleted
                      ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg mb-1">{tab.icon}</div>
                    <div className="font-semibold">{tab.label}</div>
                    {isCompleted && <div className="text-xs mt-1">✓ Done</div>}
                  </div>
                </button>
              )
            })}
          </div>
          
          {/* Active tab subtitle */}
          <div className="mt-4 text-center">
            <p className="text-gray-600">
              {tabs.find(tab => tab.key === activeTab)?.subtitle}
            </p>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'income' && (
            <IncomeExpensesTab
              value={incomeExpense}
              onChange={onChangeIncomeExpense}
            />
          )}

          {activeTab === 'super' && (
            <SuperTab
              value={superState}
              settings={settings}
              onChange={onChangeSuper}
            />
          )}

          {activeTab === 'property' && (
            <PropertyTab
              value={property}
              settings={settings}
              onChange={onChangeProperty}
            />
          )}

          {activeTab === 'portfolio' && (
            <PortfolioTab
              value={portfolio}
              settings={settings}
              onChange={onChangePortfolio}
            />
          )}

          {activeTab === 'buffers' && (
            <BuffersTab
              value={buffers}
              incomeExpense={incomeExpense}
              settings={settings}
              onChange={onChangeBuffers}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-8 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            {Array.from(completedTabs).length > 0 && (
              <div className="text-sm text-green-600 font-medium">
                ✓ {Array.from(completedTabs).length} of {tabs.length} sections completed
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            {/* Previous/Next tab buttons */}
            {activeTab !== 'income' && (
              <button
                onClick={() => {
                  const currentIndex = tabs.findIndex(t => t.key === activeTab)
                  if (currentIndex > 0) {
                    setActiveTab(tabs[currentIndex - 1].key)
                  }
                }}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                ← Previous
              </button>
            )}

            {activeTab !== 'buffers' ? (
              <button
                onClick={() => {
                  const currentIndex = tabs.findIndex(t => t.key === activeTab)
                  if (currentIndex < tabs.length - 1) {
                    handleTabChange(tabs[currentIndex + 1].key)
                  }
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed}
                className={`px-8 py-3 rounded-lg font-semibold transition-all shadow-lg ${
                  canProceed
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                See My Plan →
              </button>
            )}
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Progress</span>
            <span>{Math.round((Array.from(completedTabs).length / tabs.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(Array.from(completedTabs).length / tabs.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}