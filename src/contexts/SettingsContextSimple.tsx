/**
 * Simplified Settings Context for Demo
 */

import React, { createContext, useContext, useState } from 'react'

interface AppSettings {
  concessionalCap: number
  preservationAge: number
  sgRate: number
}

interface SettingsContextType {
  settings: AppSettings
  loading: boolean
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | null>(null)

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
  const [settings] = useState<AppSettings>({
    concessionalCap: 27500,
    preservationAge: 60,
    sgRate: 0.11
  })
  const [loading] = useState(false)

  const updateSettings = async (updates: Partial<AppSettings>) => {
    console.log('Updating settings:', updates)
    // In demo mode, we just log the updates
  }

  const value = {
    settings,
    loading,
    updateSettings
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}