/**
 * Goal Setter Component - Step 1 of Planner Wizard
 * Beginner-friendly retirement goal collection with presets
 */

import React, { useState, useCallback } from 'react'
import type { GoalSetterProps, AssumptionPreset, RiskProfile } from '../../types/planner'
import { validateGoal } from '../../schemas/planner'
import { ErrorMessage } from '../ui/ErrorMessage'

interface GoalToggle {
  type: 'income' | 'capital'
  title: string
  subtitle: string
}

const goalToggles: GoalToggle[] = [
  {
    type: 'income',
    title: 'I want $X per year to live on',
    subtitle: 'Tell us your lifestyle needs and we\'ll calculate the capital required'
  },
  {
    type: 'capital', 
    title: 'I want a $Y nest egg',
    subtitle: 'You have a specific wealth target in mind'
  }
]

const assumptionPresets: Array<{
  key: AssumptionPreset
  title: string
  description: string
}> = [
  {
    key: 'Conservative',
    title: 'Conservative',
    description: 'Lower growth, smoother ride'
  },
  {
    key: 'Base',
    title: 'Base',
    description: 'Typical long-term returns'
  },
  {
    key: 'Optimistic', 
    title: 'Optimistic',
    description: 'Higher growth, more ups and downs'
  }
]

const riskProfiles: Array<{
  key: RiskProfile
  title: string
  description: string
}> = [
  {
    key: 'conservative',
    title: 'Conservative',
    description: 'Prefer stability over high returns'
  },
  {
    key: 'balanced',
    title: 'Balanced', 
    description: 'Comfortable with moderate ups and downs'
  },
  {
    key: 'growth',
    title: 'Growth',
    description: 'Happy with volatility for higher potential returns'
  }
]

export const GoalSetter: React.FC<GoalSetterProps & { onComplete: (goal: GoalSetterProps['value']) => void }> = ({ 
  value, 
  onChange, 
  presets,
  onComplete 
}) => {
  const [goalType, setGoalType] = useState<'income' | 'capital'>(
    value.targetIncomeYearly ? 'income' : 'capital'
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [localState, setLocalState] = useState(value)

  // Update local state and notify parent
  const updateField = useCallback((field: string, fieldValue: any) => {
    const updated = { ...localState, [field]: fieldValue }
    
    // Clear related fields when switching goal type
    if (field === 'targetIncomeYearly') {
      updated.targetCapital = undefined
    } else if (field === 'targetCapital') {
      updated.targetIncomeYearly = undefined
    }
    
    setLocalState(updated)
    onChange(updated)
    
    // Clear field-specific error
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [localState, onChange, errors])

  // Handle goal type toggle
  const handleGoalTypeChange = useCallback((type: 'income' | 'capital') => {
    setGoalType(type)
    
    if (type === 'income') {
      updateField('targetCapital', undefined)
      if (!localState.targetIncomeYearly) {
        updateField('targetIncomeYearly', 80000)
      }
    } else {
      updateField('targetIncomeYearly', undefined) 
      if (!localState.targetCapital) {
        updateField('targetCapital', 2000000)
      }
    }
  }, [localState, updateField])

  // Form submission with validation
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    const validation = validateGoal(localState)
    if (validation.success) {
      setErrors({})
      onComplete(validation.data)
    } else {
      const errorMap: Record<string, string> = {}
      validation.error.errors.forEach(err => {
        if (err.path.length > 0) {
          errorMap[err.path[0] as string] = err.message
        }
      })
      setErrors(errorMap)
    }
  }, [localState, onComplete])

  // Smart retirement age suggestion
  const suggestedRetireAge = localState.targetIncomeYearly && localState.targetIncomeYearly < 60000 ? 60 : 65

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-500/10 p-8 border border-white/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-full -translate-y-32 translate-x-32" />
      
      <div className="relative">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            What's your retirement goal?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Pick what feels right—you can change this later as your situation evolves.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Goal Type Toggle */}
          <div className="space-y-4">
            <label className="block text-lg font-semibold text-gray-700 text-center">
              How do you think about your goal?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goalToggles.map((toggle) => (
                <label key={toggle.type} className="cursor-pointer">
                  <input
                    type="radio"
                    name="goalType"
                    value={toggle.type}
                    checked={goalType === toggle.type}
                    onChange={(e) => handleGoalTypeChange(e.target.value as 'income' | 'capital')}
                    className="sr-only"
                  />
                  <div className={`p-6 border-2 rounded-2xl transition-all hover:shadow-lg ${
                    goalType === toggle.type
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}>
                    <div className="font-semibold text-gray-800 mb-2">{toggle.title}</div>
                    <div className="text-sm text-gray-600">{toggle.subtitle}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Target Input */}
          <div className="space-y-2">
            {goalType === 'income' ? (
              <>
                <label className="block text-lg font-semibold text-gray-700">
                  Annual retirement income (today's dollars) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-4 text-lg text-gray-500">$</span>
                  <input
                    type="number"
                    min="20000"
                    max="500000"
                    step="1000"
                    value={localState.targetIncomeYearly || ''}
                    onChange={(e) => updateField('targetIncomeYearly', parseInt(e.target.value) || undefined)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-lg focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="80,000"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  This covers your lifestyle—we'll factor in inflation over time
                </p>
              </>
            ) : (
              <>
                <label className="block text-lg font-semibold text-gray-700">
                  Target nest egg <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-4 text-lg text-gray-500">$</span>
                  <input
                    type="number"
                    min="100000"
                    max="10000000"
                    step="10000"
                    value={localState.targetCapital || ''}
                    onChange={(e) => updateField('targetCapital', parseInt(e.target.value) || undefined)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-lg focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="2,000,000"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Your total wealth target at retirement
                </p>
              </>
            )}
            {errors.targetIncomeYearly && <ErrorMessage message={errors.targetIncomeYearly} />}
            {errors.targetCapital && <ErrorMessage message={errors.targetCapital} />}
          </div>

          {/* Age Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-gray-700">
                Your current age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="18"
                max="80"
                value={localState.currentAge}
                onChange={(e) => updateField('currentAge', parseInt(e.target.value))}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-lg focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="30"
              />
              {errors.currentAge && <ErrorMessage message={errors.currentAge} />}
            </div>
            
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-gray-700">
                Target retirement age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="40"
                max="80"
                value={localState.retireAge}
                onChange={(e) => updateField('retireAge', parseInt(e.target.value))}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-lg focus:border-blue-500 focus:outline-none transition-colors"
                placeholder={suggestedRetireAge.toString()}
              />
              <p className="text-sm text-gray-500">
                Super becomes accessible at 60
              </p>
              {errors.retireAge && <ErrorMessage message={errors.retireAge} />}
            </div>
          </div>

          {/* Risk Profile */}
          <div className="space-y-4">
            <label className="block text-lg font-semibold text-gray-700 text-center">
              How comfortable are you with investment ups and downs?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {riskProfiles.map((profile) => (
                <label key={profile.key} className="cursor-pointer">
                  <input
                    type="radio"
                    name="riskProfile"
                    value={profile.key}
                    checked={localState.riskProfile === profile.key}
                    onChange={(e) => updateField('riskProfile', e.target.value)}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-xl transition-all text-center hover:shadow-lg ${
                    localState.riskProfile === profile.key
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}>
                    <div className="font-semibold text-gray-800 mb-1">{profile.title}</div>
                    <div className="text-sm text-gray-600">{profile.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Assumption Preset */}
          <div className="space-y-4">
            <label className="block text-lg font-semibold text-gray-700 text-center">
              Planning approach
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {assumptionPresets.map((preset) => (
                <label key={preset.key} className="cursor-pointer">
                  <input
                    type="radio"
                    name="assumptionPreset"
                    value={preset.key}
                    checked={localState.assumptionPreset === preset.key}
                    onChange={(e) => updateField('assumptionPreset', e.target.value)}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-xl transition-all text-center hover:shadow-lg ${
                    localState.assumptionPreset === preset.key
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}>
                    <div className="font-semibold text-gray-800 mb-1">{preset.title}</div>
                    <div className="text-sm text-gray-600">{preset.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95"
            >
              Next: Tell us about your current situation →
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}