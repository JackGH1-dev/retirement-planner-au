/**
 * Local Scenario Management System
 * Handles save/load/export/import of property planning scenarios
 */

const SCENARIO_STORAGE_KEY = 'optimise_property_scenarios'

// Sanitize data for JSON serialization by removing circular references and non-serializable objects
const sanitizeForJSON = (obj: any): any => {
  const seen = new WeakSet()
  
  const sanitize = (value: any): any => {
    // Handle null and primitive types
    if (value === null || typeof value !== 'object') {
      return value
    }
    
    // Handle circular references
    if (seen.has(value)) {
      return '[Circular Reference]'
    }
    seen.add(value)
    
    // Handle arrays
    if (Array.isArray(value)) {
      return value.map(sanitize)
    }
    
    // Handle DOM elements, functions, and other non-serializable objects
    if (typeof value === 'function' || 
        value instanceof Element || 
        value instanceof Window || 
        value instanceof Document ||
        value instanceof HTMLElement ||
        value instanceof Node ||
        (typeof window !== 'undefined' && value === window) ||
        (typeof document !== 'undefined' && value === document) ||
        (value && typeof value === 'object' && value.constructor && value.constructor.name === 'Window')) {
      return '[Non-serializable Object]'
    }
    
    // Handle regular objects
    const sanitized: any = {}
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        try {
          sanitized[key] = sanitize(value[key])
        } catch (error) {
          // Skip properties that can't be serialized
          sanitized[key] = '[Unserializable Property]'
        }
      }
    }
    
    return sanitized
  }
  
  return sanitize(obj)
}

export interface PropertyScenario {
  id: string
  name: string
  description?: string
  createdAt: string
  lastModified: string
  plannerState: any
  version: string
}

// Get all saved scenarios from localStorage
export const getSavedScenarios = (): PropertyScenario[] => {
  try {
    const saved = localStorage.getItem(SCENARIO_STORAGE_KEY)
    if (!saved) return []
    
    const scenarios = JSON.parse(saved)
    // Sort by last modified (newest first)
    return scenarios.sort((a: PropertyScenario, b: PropertyScenario) => 
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    )
  } catch (error) {
    console.error('Error loading scenarios:', error)
    return []
  }
}

// Save a new scenario or update existing one
export const saveScenario = (
  name: string, 
  plannerState: any, 
  description?: string, 
  existingId?: string
): PropertyScenario => {
  try {
    console.log('[ScenarioManager] Saving scenario:', { name, hasState: !!plannerState, keys: Object.keys(plannerState || {}) })
    
    const scenarios = getSavedScenarios()
    const now = new Date().toISOString()
    
    // Sanitize the planner state to avoid circular references
    const sanitizedState = sanitizeForJSON(plannerState)
    console.log('[ScenarioManager] State sanitized successfully')
    
    const scenario: PropertyScenario = {
      id: existingId || `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      description: description?.trim(),
      createdAt: existingId ? scenarios.find(s => s.id === existingId)?.createdAt || now : now,
      lastModified: now,
      plannerState: sanitizedState,
      version: '1.0'
    }
    
    // Update existing or add new
    const updatedScenarios = existingId 
      ? scenarios.map(s => s.id === existingId ? scenario : s)
      : [...scenarios, scenario]
    
    localStorage.setItem(SCENARIO_STORAGE_KEY, JSON.stringify(updatedScenarios))
    return scenario
  } catch (error) {
    console.error('[ScenarioManager] Error saving scenario:', error)
    if (error instanceof Error && error.message.includes('circular')) {
      throw new Error('Unable to save plan due to data structure issues. Please try refreshing the page.')
    }
    throw new Error('Failed to save retirement plan. Please try again.')
  }
}

// Load a specific scenario
export const loadScenario = (scenarioId: string): PropertyScenario | null => {
  try {
    const scenarios = getSavedScenarios()
    return scenarios.find(s => s.id === scenarioId) || null
  } catch (error) {
    console.error('Error loading scenario:', error)
    return null
  }
}

// Delete a scenario
export const deleteScenario = (scenarioId: string): boolean => {
  try {
    const scenarios = getSavedScenarios()
    const updated = scenarios.filter(s => s.id !== scenarioId)
    localStorage.setItem(SCENARIO_STORAGE_KEY, JSON.stringify(updated))
    return true
  } catch (error) {
    console.error('Error deleting scenario:', error)
    return false
  }
}

// Duplicate a scenario with new name
export const duplicateScenario = (scenarioId: string, newName: string): PropertyScenario | null => {
  try {
    const original = loadScenario(scenarioId)
    if (!original) return null
    
    return saveScenario(
      newName,
      original.plannerState,
      `Copy of: ${original.description || original.name}`
    )
  } catch (error) {
    console.error('Error duplicating scenario:', error)
    return null
  }
}

// Export scenarios as JSON file
export const exportScenarios = (scenarioIds?: string[]): string => {
  try {
    const allScenarios = getSavedScenarios()
    const toExport = scenarioIds 
      ? allScenarios.filter(s => scenarioIds.includes(s.id))
      : allScenarios
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      scenarios: toExport,
      metadata: {
        totalScenarios: toExport.length,
        application: 'Optimise Property Planner'
      }
    }
    
    return JSON.stringify(exportData, null, 2)
  } catch (error) {
    console.error('Error exporting scenarios:', error)
    throw new Error('Failed to export scenarios')
  }
}

// Import scenarios from JSON
export const importScenarios = (jsonData: string, overwriteExisting = false): {
  imported: number
  skipped: number
  errors: string[]
} => {
  try {
    const importData = JSON.parse(jsonData)
    
    if (!importData.scenarios || !Array.isArray(importData.scenarios)) {
      throw new Error('Invalid import file format')
    }
    
    const existingScenarios = getSavedScenarios()
    const existingIds = new Set(existingScenarios.map(s => s.id))
    
    let imported = 0
    let skipped = 0
    const errors: string[] = []
    
    const validScenarios = importData.scenarios.filter((scenario: any) => {
      // Validate required fields
      if (!scenario.id || !scenario.name || !scenario.plannerState) {
        errors.push(`Scenario "${scenario.name || 'unnamed'}" missing required fields`)
        return false
      }
      
      if (existingIds.has(scenario.id) && !overwriteExisting) {
        skipped++
        return false
      }
      
      return true
    })
    
    if (validScenarios.length > 0) {
      const newScenarios = overwriteExisting 
        ? [...existingScenarios.filter(s => !validScenarios.find((v: any) => v.id === s.id)), ...validScenarios]
        : [...existingScenarios, ...validScenarios]
      
      localStorage.setItem(SCENARIO_STORAGE_KEY, JSON.stringify(newScenarios))
      imported = validScenarios.length
    }
    
    return { imported, skipped, errors }
  } catch (error) {
    console.error('Error importing scenarios:', error)
    throw new Error('Failed to import scenarios. Please check the file format.')
  }
}

// Get scenario summary for display
export const getScenarioSummary = (scenario: PropertyScenario): {
  propertyCount: number
  totalEquity: number
  totalLoanBalance: number
  monthlyRentalIncome: number
} => {
  try {
    const properties = scenario.plannerState?.property?.properties || []
    
    let totalEquity = 0
    let totalLoanBalance = 0
    let monthlyRentalIncome = 0
    
    properties.forEach((prop: any) => {
      totalEquity += (prop.value || 0) - (prop.loanBalance || 0)
      totalLoanBalance += prop.loanBalance || 0
      if (prop.propertyType === 'investment' && prop.weeklyRent) {
        monthlyRentalIncome += (prop.weeklyRent * 52) / 12
      }
    })
    
    return {
      propertyCount: properties.length,
      totalEquity: Math.max(0, totalEquity),
      totalLoanBalance,
      monthlyRentalIncome
    }
  } catch (error) {
    return {
      propertyCount: 0,
      totalEquity: 0,
      totalLoanBalance: 0,
      monthlyRentalIncome: 0
    }
  }
}

// Auto-save current state (debounced)
export const createAutoSaver = (plannerState: any, updateCallback: () => void) => {
  let timeoutId: NodeJS.Timeout | null = null
  
  return (enabled = true) => {
    if (!enabled) return
    
    if (timeoutId) clearTimeout(timeoutId)
    
    timeoutId = setTimeout(() => {
      try {
        const autoSaveKey = 'optimise_autosave_scenario'
        const autoSave = {
          id: 'autosave',
          name: 'Auto-saved (Current Session)',
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          plannerState: JSON.parse(JSON.stringify(plannerState)),
          version: '1.0'
        }
        localStorage.setItem(autoSaveKey, JSON.stringify(autoSave))
        updateCallback?.()
      } catch (error) {
        console.warn('Auto-save failed:', error)
      }
    }, 2000) // 2 second delay
  }
}

// Get auto-saved scenario
export const getAutoSavedScenario = (): PropertyScenario | null => {
  try {
    const saved = localStorage.getItem('optimise_autosave_scenario')
    return saved ? JSON.parse(saved) : null
  } catch (error) {
    return null
  }
}

// Clear all scenarios (with confirmation)
export const clearAllScenarios = (): boolean => {
  try {
    localStorage.removeItem(SCENARIO_STORAGE_KEY)
    localStorage.removeItem('optimise_autosave_scenario')
    return true
  } catch (error) {
    console.error('Error clearing scenarios:', error)
    return false
  }
}