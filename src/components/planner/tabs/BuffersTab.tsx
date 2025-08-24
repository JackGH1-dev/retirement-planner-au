/**
 * Emergency Buffers Tab - Cash reserves and emergency fund management
 * Handles emergency fund strategy and cash buffer planning
 */

import React, { useState } from 'react'
import { CurrencyInput } from '../../ui/CurrencyInput'
import { ProgressiveDisclosure } from '../../ui/ProgressiveDisclosure'
import { ErrorMessage } from '../../ui/ErrorMessage'
import type { BuffersData } from '../../../types/planner'

interface BuffersTabProps {
  data: BuffersData
  onChange: (data: BuffersData) => void
  errors?: Record<string, string>
  monthlyExpenses?: number // From Income tab for calculations
}

const BUFFER_STRATEGIES = [
  {
    id: 'conservative',
    label: 'Conservative (6 months)',
    description: 'Maximum security with 6 months of expenses saved',
    multiplier: 6,
    pros: ['Maximum peace of mind', 'Covers extended job loss', 'Very safe approach'],
    cons: ['Lower investment returns', 'Higher opportunity cost']
  },
  {
    id: 'balanced',
    label: 'Balanced (3-4 months)', 
    description: 'Balanced approach with 3-4 months coverage',
    multiplier: 3.5,
    pros: ['Good security level', 'Reasonable opportunity cost', 'Most popular choice'],
    cons: ['May need additional income sources', 'Less coverage than conservative']
  },
  {
    id: 'aggressive',
    label: 'Aggressive (1-2 months)',
    description: 'Minimal cash, maximize investments',
    multiplier: 1.5,
    pros: ['Maximum investment exposure', 'Higher potential returns', 'Good for stable income'],
    cons: ['Higher risk', 'Requires stable income', 'May need credit access']
  }
] as const

const ACCOUNT_TYPES = [
  { id: 'high-interest', label: 'High Interest Savings', rate: 0.045, description: 'Best rate, easy access' },
  { id: 'term-deposit', label: 'Term Deposit', rate: 0.05, description: 'Fixed rate, locked in' },
  { id: 'transaction', label: 'Transaction Account', rate: 0.01, description: 'Immediate access' },
  { id: 'offset', label: 'Mortgage Offset', rate: 0.06, description: 'Reduces mortgage interest' }
] as const

export const BuffersTab: React.FC<BuffersTabProps> = ({
  data,
  onChange,
  errors = {},
  monthlyExpenses = 5000
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateField = <K extends keyof BuffersData>(
    field: K, 
    value: BuffersData[K]
  ) => {
    onChange({ ...data, [field]: value })
  }

  const selectedStrategy = BUFFER_STRATEGIES.find(s => s.id === data.strategy)
  const recommendedAmount = selectedStrategy ? monthlyExpenses * selectedStrategy.multiplier : 0
  const currentCoverage = monthlyExpenses > 0 ? data.currentAmount / monthlyExpenses : 0
  const selectedAccount = ACCOUNT_TYPES.find(a => a.id === data.accountType)

  const getBufferStatus = () => {
    if (currentCoverage >= 6) return { color: 'green', text: 'Excellent', icon: '✅' }
    if (currentCoverage >= 3) return { color: 'blue', text: 'Good', icon: '👍' }
    if (currentCoverage >= 1) return { color: 'yellow', text: 'Getting there', icon: '⚠️' }
    return { color: 'red', text: 'Build up needed', icon: '🚨' }
  }

  const bufferStatus = getBufferStatus()

  return (
    <div className="space-y-6">
      {/* Current Buffer Status */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Emergency Fund & Cash Buffers
          </h3>
          <p className="text-sm text-gray-600">
            Money set aside for emergencies, unexpected expenses, and peace of mind
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Emergency Fund
            </label>
            <CurrencyInput
              value={data.currentAmount}
              onChange={(value) => updateField('currentAmount', value)}
              placeholder="Enter current emergency fund"
              className="w-full"
            />
            {errors.currentAmount && (
              <ErrorMessage message={errors.currentAmount} />
            )}
            <p className="text-xs text-gray-500 mt-1">
              Easily accessible cash for emergencies only
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Top-up Amount
            </label>
            <CurrencyInput
              value={data.monthlyContribution}
              onChange={(value) => updateField('monthlyContribution', value)}
              placeholder="Enter monthly contribution"
              className="w-full"
            />
            {errors.monthlyContribution && (
              <ErrorMessage message={errors.monthlyContribution} />
            )}
            <p className="text-xs text-gray-500 mt-1">
              Regular monthly additions to emergency fund
            </p>
          </div>
        </div>
      </div>

      {/* Buffer Status Indicator */}
      <div className={`p-4 rounded-lg border ${
        bufferStatus.color === 'green' ? 'bg-green-50 border-green-200' :
        bufferStatus.color === 'blue' ? 'bg-blue-50 border-blue-200' :
        bufferStatus.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
        'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className={`font-medium ${
              bufferStatus.color === 'green' ? 'text-green-900' :
              bufferStatus.color === 'blue' ? 'text-blue-900' :
              bufferStatus.color === 'yellow' ? 'text-yellow-900' :
              'text-red-900'
            }`}>
              {bufferStatus.icon} Buffer Status: {bufferStatus.text}
            </h4>
            <p className={`text-sm ${
              bufferStatus.color === 'green' ? 'text-green-700' :
              bufferStatus.color === 'blue' ? 'text-blue-700' :
              bufferStatus.color === 'yellow' ? 'text-yellow-800' :
              'text-red-700'
            }`}>
              You have {currentCoverage.toFixed(1)} months of expenses covered
            </p>
          </div>
          <div className="text-right">
            <div className={`text-xl font-bold ${
              bufferStatus.color === 'green' ? 'text-green-900' :
              bufferStatus.color === 'blue' ? 'text-blue-900' :
              bufferStatus.color === 'yellow' ? 'text-yellow-900' :
              'text-red-900'
            }`}>
              {currentCoverage.toFixed(1)}
            </div>
            <div className={`text-sm ${
              bufferStatus.color === 'green' ? 'text-green-700' :
              bufferStatus.color === 'blue' ? 'text-blue-700' :
              bufferStatus.color === 'yellow' ? 'text-yellow-700' :
              'text-red-700'
            }`}>
              months coverage
            </div>
          </div>
        </div>
      </div>

      {/* Buffer Strategy Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Emergency Fund Strategy
          </h3>
          <p className="text-sm text-gray-600">
            Choose how much emergency fund coverage feels right for your situation
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {BUFFER_STRATEGIES.map(strategy => (
            <div
              key={strategy.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                data.strategy === strategy.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => updateField('strategy', strategy.id)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <input
                    type="radio"
                    checked={data.strategy === strategy.id}
                    onChange={() => updateField('strategy', strategy.id)}
                    className="h-4 w-4 text-blue-600"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-700">
                      {strategy.label}
                    </h4>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      ${(monthlyExpenses * strategy.multiplier).toLocaleString()} target
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {strategy.description}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="font-medium text-green-600 mb-1">Pros:</div>
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

        {errors.strategy && (
          <ErrorMessage message={errors.strategy} />
        )}
      </div>

      {/* Target vs Current */}
      {selectedStrategy && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-3">Your Emergency Fund Plan</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-blue-700">Target Amount:</div>
              <div className="text-lg font-bold text-blue-900">
                ${recommendedAmount.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-blue-700">Still Need:</div>
              <div className="text-lg font-bold text-blue-900">
                ${Math.max(0, recommendedAmount - data.currentAmount).toLocaleString()}
              </div>
            </div>
          </div>
          {data.monthlyContribution > 0 && recommendedAmount > data.currentAmount && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="text-sm text-blue-800">
                At ${data.monthlyContribution}/month, you'll reach your target in{' '}
                <strong>
                  {Math.ceil((recommendedAmount - data.currentAmount) / data.monthlyContribution)} months
                </strong>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Account Type for Buffer */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Where to Keep Your Emergency Fund
          </h3>
          <p className="text-sm text-gray-600">
            Choose the account type that balances accessibility with returns
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Type
          </label>
          <select
            value={data.accountType}
            onChange={(e) => updateField('accountType', e.target.value as any)}
            className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select account type</option>
            {ACCOUNT_TYPES.map(type => (
              <option key={type.id} value={type.id}>
                {type.label} ({(type.rate * 100).toFixed(1)}%) - {type.description}
              </option>
            ))}
          </select>
          {errors.accountType && (
            <ErrorMessage message={errors.accountType} />
          )}
        </div>

        {selectedAccount && (
          <div className="bg-gray-50 p-3 rounded-lg border">
            <div className="text-sm">
              <div className="font-medium text-gray-700 mb-1">
                Annual Interest: {(selectedAccount.rate * 100).toFixed(1)}%
              </div>
              <div className="text-gray-600">
                On ${data.currentAmount.toLocaleString()}: <strong>${(data.currentAmount * selectedAccount.rate).toLocaleString()}/year</strong> interest
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Buffer Settings */}
      <ProgressiveDisclosure
        title="Advanced Buffer Settings"
        subtitle="DCA pausing policies and buffer optimization"
        isExpanded={showAdvanced}
        onToggle={setShowAdvanced}
      >
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buffer Trigger Level (months)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="12"
                value={data.triggerLevel}
                onChange={(e) => updateField('triggerLevel', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1.0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Pause investing when buffer falls below this level
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recovery Target (months)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="12"
                value={data.recoveryTarget}
                onChange={(e) => updateField('recoveryTarget', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="3.0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Resume investing when buffer recovers to this level
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border">
            <h4 className="font-medium text-gray-700 mb-2">DCA Pausing Policy</h4>
            <p className="text-sm text-gray-600 mb-2">
              When your emergency fund falls below the trigger level, the planner will:
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Pause regular ETF and property investments</li>
              <li>• Redirect investment money to rebuild emergency fund</li>
              <li>• Resume investing once buffer reaches recovery target</li>
              <li>• Maintain super contributions (they're tax-advantaged)</li>
            </ul>
          </div>
        </div>
      </ProgressiveDisclosure>

      {/* Buffer Education */}
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h4 className="font-medium text-yellow-900 mb-2">🛡️ Emergency Fund Principles</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• <strong>Accessibility:</strong> Money should be available within 1-3 days</li>
          <li>• <strong>Separate:</strong> Keep emergency fund separate from other savings</li>
          <li>• <strong>Purpose:</strong> Only for true emergencies, not planned expenses</li>
          <li>• <strong>Peace of mind:</strong> Reduces stress and enables better investment decisions</li>
          <li>• <strong>Job loss coverage:</strong> Most common use of emergency funds</li>
          <li>• <strong>Medical emergencies:</strong> Unexpected health costs not covered by insurance</li>
        </ul>
      </div>
    </div>
  )
}