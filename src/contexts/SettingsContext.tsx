/**
 * Settings Context for MVP Planner
 * Manages editable defaults with Firestore persistence
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { useAuth } from './AuthContext' // Assuming existing auth context
import { db } from '../firebase/config' // Assuming existing Firebase config
import type { AppSettings } from '../types/planner'
import { createDefaultSettings, appSettingsSchema } from '../schemas/planner'

interface SettingsContextValue {
  settings: AppSettings
  loading: boolean
  error: string | null
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>
  resetToDefaults: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

interface SettingsProviderProps {
  children: React.ReactNode
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const { user } = useAuth()
  const [settings, setSettings] = useState<AppSettings>(createDefaultSettings())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load settings from Firestore on mount or user change
  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.uid) {
        // Guest user - use defaults
        setSettings(createDefaultSettings())
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const settingsRef = doc(db, 'users', user.uid, 'settings', 'planner')
        const settingsSnap = await getDoc(settingsRef)
        
        if (settingsSnap.exists()) {
          const data = settingsSnap.data()
          
          // Validate and merge with defaults
          const result = appSettingsSchema.safeParse(data)
          if (result.success) {
            setSettings(result.data)
          } else {
            console.warn('Invalid settings data, using defaults:', result.error)
            setSettings(createDefaultSettings())
          }
        } else {
          // No settings document exists, create with defaults
          const defaultSettings = createDefaultSettings()
          await setDoc(settingsRef, {
            ...defaultSettings,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
          setSettings(defaultSettings)
        }
      } catch (err) {
        console.error('Failed to load settings:', err)
        setError(err instanceof Error ? err.message : 'Failed to load settings')
        setSettings(createDefaultSettings()) // Fallback to defaults
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [user?.uid])

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    if (!user?.uid) {
      // Guest user - update local state only
      setSettings(prev => ({ ...prev, ...updates }))
      return
    }

    try {
      setError(null)
      
      const updatedSettings = { ...settings, ...updates }
      
      // Validate before saving
      const result = appSettingsSchema.safeParse(updatedSettings)
      if (!result.success) {
        throw new Error('Invalid settings data: ' + result.error.message)
      }

      // Update Firestore
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'planner')
      await updateDoc(settingsRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      })

      // Update local state
      setSettings(result.data)
      
      // Analytics event
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'settings_updated', {
          user_id: user.uid,
          updated_fields: Object.keys(updates)
        })
      }

    } catch (err) {
      console.error('Failed to update settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to update settings')
      throw err
    }
  }, [user?.uid, settings])

  const resetToDefaults = useCallback(async () => {
    const defaults = createDefaultSettings()
    await updateSettings(defaults)
  }, [updateSettings])

  const contextValue: SettingsContextValue = {
    settings,
    loading,
    error,
    updateSettings,
    resetToDefaults
  }

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  )
}

// Helper hooks for specific settings
export const useConcessionalCap = () => {
  const { settings, updateSettings } = useSettings()
  
  return {
    cap: settings.concessionalCapYearly,
    label: settings.concessionalCapLabel,
    updateCap: (newCap: number) => updateSettings({ concessionalCapYearly: newCap }),
    updateLabel: (newLabel: string) => updateSettings({ concessionalCapLabel: newLabel })
  }
}

export const useSuperDefaults = () => {
  const { settings, updateSettings } = useSettings()
  
  return {
    defaultOption: settings.defaultSuperOption,
    setDefaultOption: (option: AppSettings['defaultSuperOption']) => 
      updateSettings({ defaultSuperOption: option })
  }
}

export const useETFDefaults = () => {
  const { settings, updateSettings } = useSettings()
  
  return {
    weights: settings.twoETFDefaultWeights,
    setWeights: (weights: { aus: number; global: number }) => 
      updateSettings({ twoETFDefaultWeights: weights })
  }
}

export const useAssumptionPresets = () => {
  const { settings } = useSettings()
  return settings.assumptionPresets
}

// Default settings for new installations
export const DEFAULT_SETTINGS: AppSettings = {
  // Editable defaults
  concessionalCapYearly: 27500,
  concessionalCapLabel: 'Concessional cap (FY 2025–26)',
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
    Conservative: {
      superReturns: 0.06,
      etfReturns: 0.065,
      propertyGrowth: 0.04,
      inflation: 0.025,
      wageGrowth: 0.025
    },
    Base: {
      superReturns: 0.07,
      etfReturns: 0.075,
      propertyGrowth: 0.05,
      inflation: 0.03,
      wageGrowth: 0.03
    },
    Optimistic: {
      superReturns: 0.08,
      etfReturns: 0.085,
      propertyGrowth: 0.06,
      inflation: 0.035,
      wageGrowth: 0.035
    }
  },
  
  // UI preferences
  currencySymbol: '$',
  dateFormat: 'DD/MM/YYYY'
}