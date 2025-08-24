/**
 * Implementation Examples for Claude Code
 * Ready-to-use React patterns for MVP Planner
 * 
 * Copy-paste examples following exact design system and requirements
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { z } from 'zod'
import { 
  PlannerInputSchema, 
  GoalSetterSchema, 
  SuperSchema,
  validatePlannerInput,
  createDefaultPlannerInput,
  type PlannerInput,
  type ScenarioResult,
  type AppSettings
} from './planner-schemas'
import { SimulationWorker } from './simulation-worker'

// =============================================================================
// SETTINGS CONTEXT (EDITABLE DEFAULTS)
// =============================================================================

interface SettingsContextValue {
  settings: AppSettings
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>
  loading: boolean
}

export const SettingsContext = React.createContext<SettingsContextValue | null>(null)

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>({
    // Editable defaults from CLAUDE.md specs
    concessionalCapYearly: 27500,
    capLabel: "Concessional cap (FY 2025–26)",
    defaultSuperOption: 'HighGrowth',
    twoETFDefaultWeights: { aus: 0.4, global: 0.6 },
    
    // Fixed in MVP
    preservationAge: 60,
    defaultBuffers: { emergencyMonths: 6, propertyMonths: 6 },
    
    // Property defaults
    defaultPropertyCosts: {
      mgmtFeePct: 0.07,
      insuranceYearly: 500,
      councilRatesYearly: 1800,
      maintenancePctOfRent: 0.05,
      vacancyPct: 0.02
    },
    
    // Assumption presets
    assumptionPresets: {
      Conservative: { superReturns: 0.06, etfReturns: 0.065, propertyGrowth: 0.04, inflation: 0.025, wageGrowth: 0.025 },
      Base: { superReturns: 0.07, etfReturns: 0.075, propertyGrowth: 0.05, inflation: 0.03, wageGrowth: 0.03 },
      Optimistic: { superReturns: 0.08, etfReturns: 0.085, propertyGrowth: 0.06, inflation: 0.035, wageGrowth: 0.035 }
    },
    
    currencySymbol: '$',
    dateFormat: 'DD/MM/YYYY',
    createdAt: new Date(),
    updatedAt: new Date()
  })
  
  const [loading, setLoading] = useState(false)
  
  // Load settings from Firestore on mount
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true)
      try {
        // Load from Firestore: users/{uid}/settings
        // const userSettings = await getDoc(doc(db, 'users', user.uid, 'settings'))
        // if (userSettings.exists()) {
        //   setSettings(prev => ({ ...prev, ...userSettings.data() }))
        // }
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadSettings()
  }, [])
  
  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    setLoading(true)
    try {
      const updatedSettings = { 
        ...settings, 
        ...updates, 
        updatedAt: new Date() 
      }
      
      // Save to Firestore: users/{uid}/settings  
      // await setDoc(doc(db, 'users', user.uid, 'settings'), updatedSettings, { merge: true })
      
      setSettings(updatedSettings)
    } catch (error) {
      console.error('Failed to update settings:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [settings])
  
  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = React.useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

// =============================================================================
// STEP 1: GOAL SETTER COMPONENT
// =============================================================================

interface GoalSetterProps {
  onComplete: (goalData: z.infer<typeof GoalSetterSchema>) => void
  initialData?: Partial<z.infer<typeof GoalSetterSchema>>
}

export const GoalSetter: React.FC<GoalSetterProps> = ({ onComplete, initialData }) => {
  const [formData, setFormData] = useState(() => 
    createDefaultPlannerInput({ goal: initialData }).goal
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const validated = GoalSetterSchema.parse(formData)
      setErrors({})
      onComplete(validated)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMap: Record<string, string> = {}
        error.errors.forEach(err => {
          if (err.path.length > 0) {
            errorMap[err.path[0] as string] = err.message
          }
        })
        setErrors(errorMap)
      }
    }
  }, [formData, onComplete])
  
  const updateField = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])
  
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-500/10 p-8 border border-white/20">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Your Retirement Goals
        </h2>
        <p className="text-lg text-gray-600">
          Let's start by understanding what you want to achieve and when.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-gray-700">
              Current Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="18"
              max="100"
              value={formData.currentAge}
              onChange={(e) => updateField('currentAge', parseInt(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="30"
            />
            {errors.currentAge && <p className="text-red-500 text-sm">{errors.currentAge}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-gray-700">
              Target Retirement Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="25"
              max="100"
              value={formData.retireAge}
              onChange={(e) => updateField('retireAge', parseInt(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="65"
            />
            {errors.retireAge && <p className="text-red-500 text-sm">{errors.retireAge}</p>}
          </div>
        </div>
        
        {/* State Selection */}
        <div className="space-y-2">
          <label className="block text-lg font-semibold text-gray-700">
            Australian State <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.state}
            onChange={(e) => updateField('state', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg focus:border-blue-500 focus:outline-none transition-colors"
          >
            <option value="NSW">New South Wales</option>
            <option value="VIC">Victoria</option>
            <option value="QLD">Queensland</option>
            <option value="WA">Western Australia</option>
            <option value="SA">South Australia</option>
            <option value="TAS">Tasmania</option>
            <option value="ACT">Australian Capital Territory</option>
            <option value="NT">Northern Territory</option>
          </select>
        </div>
        
        {/* Target Income */}
        <div className="space-y-2">
          <label className="block text-lg font-semibold text-gray-700">
            Target Retirement Income (Annual) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-lg text-gray-500">$</span>
            <input
              type="number"
              min="20000"
              max="500000"
              step="1000"
              value={formData.targetIncomeYearly || ''}
              onChange={(e) => updateField('targetIncomeYearly', parseInt(e.target.value))}
              className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg text-lg focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="80,000"
            />
          </div>
          <p className="text-sm text-gray-500">In today's dollars - we'll adjust for inflation</p>
          {errors.targetIncomeYearly && <p className="text-red-500 text-sm">{errors.targetIncomeYearly}</p>}
        </div>
        
        {/* Assumption Preset */}
        <div className="space-y-2">
          <label className="block text-lg font-semibold text-gray-700">Planning Approach</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['Conservative', 'Base', 'Optimistic'] as const).map((preset) => (
              <label key={preset} className="cursor-pointer">
                <input
                  type="radio"
                  name="assumptionPreset"
                  value={preset}
                  checked={formData.assumptionPreset === preset}
                  onChange={(e) => updateField('assumptionPreset', e.target.value)}
                  className="sr-only"
                />
                <div className={`p-4 border-2 rounded-lg transition-all ${
                  formData.assumptionPreset === preset
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}>
                  <div className="font-semibold text-gray-800">{preset}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {preset === 'Conservative' && 'Lower returns, higher safety margin'}
                    {preset === 'Base' && 'Balanced assumptions (recommended)'}
                    {preset === 'Optimistic' && 'Higher returns, more aggressive'}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95"
        >
          Continue to Financial Details →
        </button>
      </form>
    </div>
  )
}

// =============================================================================
// SUPER PLANNER MODULE
// =============================================================================

interface SuperPlannerProps {
  input: PlannerInput['super']
  incomeExpense: PlannerInput['incomeExpense']
  onUpdate: (superData: PlannerInput['super']) => void
  settings: AppSettings
}

export const SuperPlanner: React.FC<SuperPlannerProps> = ({ input, incomeExpense, onUpdate, settings }) => {
  const [localData, setLocalData] = useState(input)
  
  // Debounced update to parent
  useEffect(() => {
    const timer = setTimeout(() => {
      onUpdate(localData)
    }, 300) // 300ms debounce for slider interactions
    
    return () => clearTimeout(timer)
  }, [localData, onUpdate])
  
  // Cap calculations
  const annualSalarySacrifice = localData.salarySacrificeMonthly * 12
  const annualSG = incomeExpense.salary * localData.SGRate
  const totalAnnualContributions = annualSalarySacrifice + annualSG
  const capUtilization = totalAnnualContributions / localData.concessionalCapYearly
  const capUsagePercent = Math.min(capUtilization * 100, 100)
  
  // Cap bar state (traffic light system)
  const getCapBarState = () => {
    if (capUsagePercent < 90) return 'success'
    if (capUsagePercent < 100) return 'warning'  
    return 'error'
  }
  
  const getCapBarColor = () => {
    const state = getCapBarState()
    if (state === 'success') return 'bg-green-500'
    if (state === 'warning') return 'bg-yellow-500'
    return 'bg-red-500'
  }
  
  // Helper text for staying under cap
  const getSafeMonthlyAmount = () => {
    const remainingCap = Math.max(0, localData.concessionalCapYearly - annualSG)
    return Math.floor(remainingCap / 12)
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Superannuation Strategy</h3>
        <p className="text-gray-600">Maximize your super with tax-effective contributions</p>
      </div>
      
      {/* Current Balance Display */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-blue-600 font-semibold">Current Super Balance</p>
            <p className="text-3xl font-bold text-blue-700">
              ${localData.balance.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-600">Investment Option</p>
            <select
              value={localData.option}
              onChange={(e) => setLocalData(prev => ({ ...prev, option: e.target.value as any }))}
              className="mt-1 border border-blue-200 rounded px-3 py-2 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Balanced">Balanced (Conservative)</option>
              <option value="Growth">Growth (Moderate)</option>
              <option value="HighGrowth">High Growth (Aggressive)</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Salary Sacrifice Slider */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <label className="text-lg font-semibold text-gray-700">
            Extra Salary Sacrifice (Monthly)
          </label>
          <div className="text-right">
            <span className="text-2xl font-bold text-indigo-600">
              ${localData.salarySacrificeMonthly.toLocaleString()}/mo
            </span>
            <p className="text-sm text-gray-500">
              ${annualSalarySacrifice.toLocaleString()}/year
            </p>
          </div>
        </div>
        
        <input
          type="range"
          min="0"
          max="5000"
          step="50"
          value={localData.salarySacrificeMonthly}
          onChange={(e) => setLocalData(prev => ({ ...prev, salarySacrificeMonthly: parseInt(e.target.value) }))}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        
        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span>$0</span>
          <span>$5,000</span>
        </div>
      </div>
      
      {/* Concessional Cap Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-semibold text-gray-700">
            {settings.capLabel}
          </span>
          <span className="text-lg font-bold" style={{ color: getCapBarState() === 'error' ? '#ef4444' : '#374151' }}>
            {capUsagePercent.toFixed(1)}% used
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${getCapBarColor()}`}
            style={{ width: `${Math.min(capUsagePercent, 100)}%` }}
          />
        </div>
        
        <div className="mt-3 text-sm">
          {getCapBarState() === 'success' && (
            <p className="text-green-700">
              ✓ Good utilization. You could add up to ${(getSafeMonthlyAmount() - localData.salarySacrificeMonthly).toLocaleString()}/mo more.
            </p>
          )}
          {getCapBarState() === 'warning' && (
            <p className="text-yellow-700">
              ⚠️ Approaching cap limit. Consider reducing to ${getSafeMonthlyAmount().toLocaleString()}/mo to stay under by FY-end.
            </p>
          )}
          {getCapBarState() === 'error' && (
            <p className="text-red-700">
              🚨 Over cap limit! Reduce to ${getSafeMonthlyAmount().toLocaleString()}/mo to avoid excess contributions tax.
            </p>
          )}
        </div>
      </div>
      
      {/* Contribution Breakdown */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div>
          <p className="text-sm text-gray-600">Super Guarantee (11.5%)</p>
          <p className="text-xl font-bold text-gray-800">
            ${annualSG.toLocaleString()}/year
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Extra Salary Sacrifice</p>
          <p className="text-xl font-bold text-indigo-600">
            ${annualSalarySacrifice.toLocaleString()}/year
          </p>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// ETF PLANNER MODULE
// =============================================================================

interface ETFPlannerProps {
  input: PlannerInput['portfolio']
  buffers: PlannerInput['buffers']
  goal: PlannerInput['goal']
  onUpdate: (portfolioData: PlannerInput['portfolio']) => void
  settings: AppSettings
  dcaPaused?: boolean
}

export const ETFPlanner: React.FC<ETFPlannerProps> = ({ 
  input, 
  buffers, 
  goal, 
  onUpdate, 
  settings, 
  dcaPaused = false 
}) => {
  const [localData, setLocalData] = useState(input)
  
  // Debounced update
  useEffect(() => {
    const timer = setTimeout(() => onUpdate(localData), 300)
    return () => clearTimeout(timer)
  }, [localData, onUpdate])
  
  // Bridge years calculation (retirement age → preservation age 60)
  const bridgeYears = Math.max(0, settings.preservationAge - goal.retireAge)
  const targetIncomeYearly = goal.targetIncomeYearly || 80000
  const bridgeYearsCovered = localData.startingBalance / targetIncomeYearly // Simplified calculation
  
  const getBridgeChipColor = () => {
    if (bridgeYearsCovered >= 3) return 'bg-green-500 text-white'
    if (bridgeYearsCovered >= 1) return 'bg-yellow-500 text-white'
    return 'bg-red-500 text-white'
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">ETF Investment Strategy</h3>
        <p className="text-gray-600">Build your bridge fund for early retirement</p>
      </div>
      
      {/* DCA Paused Banner */}
      {dcaPaused && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-yellow-600">⚠️</div>
            <div className="ml-3">
              <p className="text-yellow-800 font-semibold">ETF investing paused</p>
              <p className="text-yellow-700 text-sm">
                DCA will resume when your emergency buffers reach {buffers.emergencyMonths} months
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Allocation Toggle */}
      <div className="mb-6">
        <label className="block text-lg font-semibold text-gray-700 mb-4">
          Investment Allocation
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="cursor-pointer">
            <input
              type="radio"
              name="allocation"
              value="OneETF"
              checked={localData.allocationPreset === 'OneETF'}
              onChange={(e) => setLocalData(prev => ({ ...prev, allocationPreset: e.target.value as any }))}
              className="sr-only"
            />
            <div className={`p-4 border-2 rounded-lg transition-all ${
              localData.allocationPreset === 'OneETF'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}>
              <div className="font-semibold text-gray-800">One ETF (Simple)</div>
              <div className="text-sm text-gray-600 mt-1">
                Diversified global fund - set and forget
              </div>
            </div>
          </label>
          
          <label className="cursor-pointer">
            <input
              type="radio"
              name="allocation"
              value="TwoETF"
              checked={localData.allocationPreset === 'TwoETF'}
              onChange={(e) => setLocalData(prev => ({ ...prev, allocationPreset: e.target.value as any }))}
              className="sr-only"
            />
            <div className={`p-4 border-2 rounded-lg transition-all ${
              localData.allocationPreset === 'TwoETF'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}>
              <div className="font-semibold text-gray-800">Two ETF (Balanced)</div>
              <div className="text-sm text-gray-600 mt-1">
                Australian + Global split for diversification
              </div>
            </div>
          </label>
        </div>
      </div>
      
      {/* Weight Sliders for TwoETF */}
      {localData.allocationPreset === 'TwoETF' && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-4">Allocation Weights</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Australian ETFs</span>
                <span className="font-semibold">{(localData.weights.aus * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={localData.weights.aus}
                onChange={(e) => {
                  const aus = parseFloat(e.target.value)
                  setLocalData(prev => ({
                    ...prev,
                    weights: { aus, global: 1 - aus }
                  }))
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Global ETFs</span>
                <span className="font-semibold">{(localData.weights.global * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full h-2 bg-blue-500 rounded-lg" style={{ 
                width: `${localData.weights.global * 100}%` 
              }} />
            </div>
          </div>
        </div>
      )}
      
      {/* Monthly DCA Slider */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <label className="text-lg font-semibold text-gray-700">
            Monthly Investment (DCA)
          </label>
          <span className="text-2xl font-bold text-indigo-600">
            ${localData.dcaMonthly.toLocaleString()}/mo
          </span>
        </div>
        
        <input
          type="range"
          min="0"
          max="10000"
          step="100"
          value={localData.dcaMonthly}
          onChange={(e) => setLocalData(prev => ({ ...prev, dcaMonthly: parseInt(e.target.value) }))}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          disabled={dcaPaused}
        />
      </div>
      
      {/* Bridge Coverage Chip */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
        <div>
          <p className="text-sm text-gray-600">Bridge Coverage (Age {goal.retireAge} → 60)</p>
          <p className="font-semibold text-gray-800">
            {bridgeYears > 0 ? `${bridgeYears} years needed` : 'No bridge period required'}
          </p>
        </div>
        {bridgeYears > 0 && (
          <div className={`px-4 py-2 rounded-full font-semibold ${getBridgeChipColor()}`}>
            {bridgeYearsCovered.toFixed(1)} years covered
          </div>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// SIMULATION HOOK
// =============================================================================

export const useSimulation = () => {
  const [worker] = useState(() => new SimulationWorker())
  const [result, setResult] = useState<ScenarioResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const { settings } = useSettings()
  
  const runSimulation = useCallback(async (input: PlannerInput) => {
    if (!input || !settings) return
    
    setLoading(true)
    setError(null)
    setProgress(0)
    
    try {
      const result = await worker.simulate(
        input,
        settings,
        (progress, month) => setProgress(progress)
      )
      
      setResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed')
    } finally {
      setLoading(false)
    }
  }, [worker, settings])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => worker.terminate()
  }, [worker])
  
  return {
    runSimulation,
    result,
    loading,
    progress,
    error
  }
}

// =============================================================================
// COMPLETE PLANNER COMPONENT
// =============================================================================

export const PlannerApp: React.FC = () => {
  const [step, setStep] = useState<'goal' | 'financials' | 'modules' | 'results'>('goal')
  const [plannerData, setPlannerData] = useState<PlannerInput>(() => createDefaultPlannerInput())
  const { runSimulation, result, loading, progress } = useSimulation()
  const { settings } = useSettings()
  
  // Auto-run simulation when data changes (debounced)
  useEffect(() => {
    if (step === 'modules' || step === 'results') {
      const timer = setTimeout(() => {
        runSimulation(plannerData)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [plannerData, step, runSimulation])
  
  const handleGoalComplete = useCallback((goalData: PlannerInput['goal']) => {
    setPlannerData(prev => ({ ...prev, goal: goalData }))
    setStep('financials')
  }, [])
  
  const handleModuleUpdate = useCallback((field: keyof PlannerInput, data: any) => {
    setPlannerData(prev => ({ ...prev, [field]: data }))
  }, [])
  
  return (
    <SettingsProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {step === 'goal' ? 1 : step === 'financials' ? 2 : step === 'modules' ? 3 : 4} of 4</span>
              <span>{step === 'goal' ? 'Goals' : step === 'financials' ? 'Financials' : step === 'modules' ? 'Strategy' : 'Results'}</span>
            </div>
            <div className="w-full bg-white/50 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${step === 'goal' ? 25 : step === 'financials' ? 50 : step === 'modules' ? 75 : 100}%` }}
              />
            </div>
          </div>
          
          {/* Step Content */}
          {step === 'goal' && (
            <GoalSetter
              onComplete={handleGoalComplete}
              initialData={plannerData.goal}
            />
          )}
          
          {step === 'modules' && (
            <div className="space-y-8">
              <SuperPlanner
                input={plannerData.super}
                incomeExpense={plannerData.incomeExpense}
                onUpdate={(data) => handleModuleUpdate('super', data)}
                settings={settings}
              />
              
              <ETFPlanner
                input={plannerData.portfolio}
                buffers={plannerData.buffers}
                goal={plannerData.goal}
                onUpdate={(data) => handleModuleUpdate('portfolio', data)}
                settings={settings}
                dcaPaused={result?.monthlyData[result.monthlyData.length - 1]?.dcaPaused}
              />
            </div>
          )}
          
          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Running simulation... {progress.toFixed(0)}%</p>
            </div>
          )}
          
          {/* Results Display */}
          {result && (
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold mb-6">Your Retirement Outlook</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Net Worth at Retirement</p>
                  <p className="text-3xl font-bold text-green-600">
                    ${result.kpis.netWorthAtRetirement.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Bridge Coverage</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {result.kpis.bridgeYearsCovered.toFixed(1)} years
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Super Balance</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    ${result.kpis.superBalanceAtRetirement.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SettingsProvider>
  )
}

// =============================================================================
// ROUTE SETUP FOR CLAUDE CODE
// =============================================================================

export const PlannerRoute = () => (
  <div>
    {/* Add to your React Router setup: */}
    {/* <Route path="/app/planner" element={<PlannerApp />} /> */}
    <PlannerApp />
  </div>
)

export default PlannerApp