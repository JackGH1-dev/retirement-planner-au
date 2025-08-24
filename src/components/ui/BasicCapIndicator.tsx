/**
 * Basic Cap Indicator - Beginner-friendly concessional cap awareness
 * Shows usage level without overwhelming technical details
 */

import React from 'react'
import type { CapBarProps } from '../../types/planner'

interface BasicCapIndicatorProps extends Omit<CapBarProps, 'suggestedMonthly'> {
  currentMonthly: number
  suggestedMonthly: number
}

export const BasicCapIndicator: React.FC<BasicCapIndicatorProps> = ({
  usagePct,
  capLabel,
  currentMonthly,
  suggestedMonthly
}) => {
  // Determine status based on usage
  const getStatus = () => {
    if (usagePct < 0.9) return 'good'
    if (usagePct < 1.0) return 'caution'
    return 'over'
  }

  const status = getStatus()
  const usagePercent = Math.min(usagePct * 100, 100)

  const getStatusConfig = () => {
    switch (status) {
      case 'good':
        return {
          color: 'bg-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700',
          icon: '✓',
          message: 'You\'re comfortably under this year\'s cap'
        }
      case 'caution':
        return {
          color: 'bg-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          icon: '⚠️',
          message: `${usagePercent.toFixed(0)}% of cap used. Consider reducing to $${suggestedMonthly}/month to stay safely under.`
        }
      case 'over':
        return {
          color: 'bg-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
          icon: '🚨',
          message: `Over the cap. Reduce salary sacrifice to $${suggestedMonthly}/month to avoid excess contributions tax.`
        }
    }
  }

  const config = getStatusConfig()

  return (
    <div className={`rounded-lg p-4 border ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-700 mb-1">
            {capLabel}
          </h4>
          <p className="text-sm text-gray-600">
            Yearly limit for before-tax super contributions
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-700">
            {usagePercent.toFixed(0)}%
          </div>
          <div className="text-sm text-gray-500">used</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${config.color}`}
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Status Message */}
      <div className={`flex items-center space-x-2 ${config.textColor}`}>
        <span className="text-sm">{config.icon}</span>
        <span className="text-sm font-medium">{config.message}</span>
      </div>

      {/* Learn More Link */}
      <div className="mt-3">
        <button 
          className="text-blue-600 hover:text-blue-700 text-sm underline"
          onClick={() => {
            // Could open a modal or tooltip with more explanation
            alert('The concessional contributions cap is the maximum amount you can contribute to super before tax each year. Contributions above this limit are taxed at 47% instead of 15%.')
          }}
        >
          Why is this important?
        </button>
      </div>
    </div>
  )
}