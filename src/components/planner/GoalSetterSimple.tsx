/**
 * Goal Setter Component - Step 1 of the retirement planner
 * Beginner-friendly version with presets and plain-English copy
 */

import React, { useState, useEffect } from 'react'
import { ScenarioManager } from './ScenarioManager'

interface GoalSetterProps {
  value: any
  onChange: (value: any) => void
  presets: string[]
  onComplete: (data: any) => void
  plannerState?: any
  onLoadScenario?: (plannerState: any) => void
}

export const GoalSetter: React.FC<GoalSetterProps> = ({
  value,
  onChange,
  presets,
  onComplete,
  plannerState,
  onLoadScenario
}) => {
  const [goalType, setGoalType] = useState(value?.goalType || 'income')
  const [currentAge, setCurrentAge] = useState(value?.currentAge || 30)
  const [retirementAge, setRetirementAge] = useState(value?.retirementAge || 65)
  const [targetIncome, setTargetIncome] = useState(value?.targetIncome || 80000)
  const [riskProfile, setRiskProfile] = useState(value?.riskProfile || 'balanced')
  const [marketOutlook, setMarketOutlook] = useState(value?.marketOutlook || 0)

  // Update state when value prop changes (e.g., when loading a scenario)
  useEffect(() => {
    if (value) {
      setGoalType(value.goalType || 'income')
      setCurrentAge(value.currentAge || 30)
      setRetirementAge(value.retirementAge || 65)
      setTargetIncome(value.targetIncome || 80000)
      setRiskProfile(value.riskProfile || 'balanced')
      setMarketOutlook(value.marketOutlook || 0)
    }
  }, [value])

  const handleComplete = () => {
    const goalData = {
      goalType,
      currentAge,
      retirementAge,
      targetIncome,
      riskProfile,
      marketOutlook
    }
    onChange(goalData)
    onComplete(goalData)
  }

  // Market outlook helper function
  const getMarketOutlookLabel = (value) => {
    if (value <= -1) return 'Weak Markets'
    if (value < 0) return 'Below Average'
    if (value === 0) return 'Neutral'
    if (value < 1) return 'Above Average'
    return 'Strong Markets'
  }

  const riskProfiles = {
    conservative: { label: 'Conservative', desc: '4.5-5.5% avg returns' },
    balanced: { label: 'Balanced', desc: '5.5-6.5% avg returns' },
    growth: { label: 'Growth', desc: '6.5-7.5% avg returns' }
  }

  // Smart retirement age suggestion
  const suggestedRetirementAge = goalType === 'income' && targetIncome < 60000 ? 60 : 65

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">What's your retirement goal?</h2>
      <p className="text-gray-600 mb-6">Pick what feels right—you can change this later.</p>
      
      {/* Scenario Management */}
      {plannerState && onLoadScenario && (
        <ScenarioManager
          plannerState={plannerState}
          onLoadScenario={onLoadScenario}
          onScenarioSaved={() => {
            // Could add notification logic here
          }}
          className="mb-6"
        />
      )}
      
      <div className="space-y-8">
        {/* Goal Type Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            I want to retire with:
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setGoalType('income')}
              className={`flex-1 p-4 rounded-lg border-2 text-left transition-colors ${
                goalType === 'income'
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="font-semibold">$ per year to live on</div>
              <div className="text-sm text-gray-600 mt-1">Tell me how much income you want</div>
            </button>
            <button
              onClick={() => setGoalType('capital')}
              className={`flex-1 p-4 rounded-lg border-2 text-left transition-colors ${
                goalType === 'capital'
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="font-semibold">$ nest egg total</div>
              <div className="text-sm text-gray-600 mt-1">Tell me the total amount you want</div>
            </button>
          </div>
        </div>

        {/* Age Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Your current age
            </label>
            <input
              type="number"
              value={currentAge}
              onChange={(e) => setCurrentAge(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg bg-white text-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              When do you want to retire?
            </label>
            <div className="relative">
              <input
                type="range"
                min="55"
                max="70"
                value={retirementAge}
                onChange={(e) => setRetirementAge(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>55</span>
                <span className="font-medium text-blue-600">{retirementAge} years old</span>
                <span>70</span>
              </div>
            </div>
            {retirementAge !== suggestedRetirementAge && (
              <p className="text-xs text-blue-600 mt-1">
                💡 Consider age {suggestedRetirementAge} based on your income goal
              </p>
            )}
          </div>
        </div>

        {/* Target Income/Capital */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {goalType === 'income' ? 'How much per year do you want to live on?' : 'What total nest egg do you want?'}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
            <input
              type="number"
              value={targetIncome}
              onChange={(e) => setTargetIncome(parseInt(e.target.value) || 0)}
              className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg text-lg bg-white text-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder={goalType === 'income' ? '80,000' : '2,000,000'}
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {goalType === 'income' ? 'This is your annual living expenses in today\'s dollars' : 'This is your total savings goal'}
          </p>
        </div>

        {/* Risk Profile Pills */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            How do you feel about investment risk?
          </label>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(riskProfiles).map(([key, profile]) => (
              <button
                key={key}
                onClick={() => setRiskProfile(key)}
                className={`p-3 rounded-lg border-2 text-center transition-colors ${
                  riskProfile === key
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="font-medium">{profile.label}</div>
                <div className="text-xs text-gray-600 mt-1">{profile.desc}</div>
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">Balanced is a good choice if you're unsure.</p>
        </div>

        {/* Market Outlook Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            What's your market outlook?
          </label>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="relative">
              <input
                type="range"
                min="-1.5"
                max="1.5"
                step="0.1"
                value={marketOutlook}
                onChange={(e) => setMarketOutlook(parseFloat(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-red-200 via-gray-200 to-green-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Weak Markets<br/>-1.5%</span>
                <span className="text-center">Neutral<br/>0%</span>
                <span className="text-right">Strong Markets<br/>+1.5%</span>
              </div>
            </div>
            <div className="text-center mt-4">
              <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border">
                <span className="font-medium text-gray-900">{getMarketOutlookLabel(marketOutlook)}</span>
                <span className="text-sm text-gray-600">
                  ({marketOutlook > 0 ? '+' : ''}{marketOutlook.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Adjust based on your view of future market conditions. 0% uses historical averages.</p>
        </div>

        <div className="flex justify-end pt-6 border-t">
          <button
            onClick={handleComplete}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
          >
            Next: Tell us your current situation →
          </button>
        </div>
      </div>
    </div>
  )
}