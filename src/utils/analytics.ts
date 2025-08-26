/**
 * Analytics utilities for tracking user interactions in the planner
 * Integrates with Google Analytics and custom event tracking
 */

import { getAnalytics, logEvent as firebaseLogEvent } from 'firebase/analytics'
import { app } from '../firebase/config'

// Initialize Analytics
let analytics: ReturnType<typeof getAnalytics> | null = null

try {
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app)
  }
} catch (error) {
  console.warn('Analytics initialization failed:', error)
}

// Event types for type safety
export interface PlannerAnalyticsEvent {
  // Wizard navigation
  'planner_step_completed': {
    step: number
    step_name: string
    time_spent_seconds: number
  }
  
  // Goal setting events
  'goal_type_selected': {
    goal_type: 'income' | 'capital'
    target_amount?: number
    target_income?: number
  }
  
  'retirement_age_set': {
    retirement_age: number
    current_age: number
    years_to_retirement: number
  }
  
  'risk_profile_selected': {
    risk_profile: string
    assumption_preset: string
  }
  
  // Financial input events
  'salary_entered': {
    salary_range: string // e.g., "50k-75k", "75k-100k"
    has_bonus: boolean
  }
  
  'super_balance_entered': {
    balance_range: string // e.g., "0-25k", "25k-50k"
    investment_option: string
  }
  
  'salary_packaging_set': {
    monthly_amount: number
    annual_amount: number
    cap_usage_percent: number
  }
  
  // Investment strategy events
  'etf_strategy_selected': {
    strategy: 'OneETF' | 'TwoETF'
    monthly_investment: number
    expected_return: number
  }
  
  'property_strategy_selected': {
    strategy: string
    investment_amount?: number
    property_type?: string
  }
  
  'buffer_strategy_selected': {
    strategy: string
    target_months: number
    current_months: number
  }
  
  // Simulation events
  'simulation_started': {
    user_id?: string
    planner_version: string
  }
  
  'simulation_completed': {
    can_retire: boolean
    final_assets: number
    income_replacement_percent: number
    shortfall_amount: number
    simulation_duration_ms: number
  }
  
  'simulation_error': {
    error_type: string
    error_message: string
  }
  
  // Export and save events
  'plan_exported': {
    export_type: 'pdf' | 'csv' | 'json'
    file_size_kb?: number
  }
  
  'settings_saved': {
    settings_count: number
    has_firestore: boolean
  }
  
  // User experience events
  'advanced_settings_opened': {
    component: string
    section: string
  }
  
  'help_tooltip_viewed': {
    tooltip_id: string
    component: string
  }
  
  'error_encountered': {
    component: string
    error_type: string
    user_action: string
  }
}

/**
 * Log an analytics event with type safety
 */
export const logEvent = <T extends keyof PlannerAnalyticsEvent>(
  eventName: T,
  parameters: PlannerAnalyticsEvent[T]
): void => {
  try {
    // Add common parameters
    const enrichedParameters = {
      ...parameters,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight
    }

    // Log to Firebase Analytics
    if (analytics) {
      firebaseLogEvent(analytics, eventName, enrichedParameters)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Analytics Event: ${eventName}`, enrichedParameters)
    }

    // Send to custom analytics endpoint if needed
    if (process.env.REACT_APP_CUSTOM_ANALYTICS_ENDPOINT) {
      fetch(process.env.REACT_APP_CUSTOM_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: eventName,
          parameters: enrichedParameters
        })
      }).catch(error => {
        console.warn('Custom analytics failed:', error)
      })
    }

  } catch (error) {
    console.warn('Analytics logging failed:', error)
  }
}

/**
 * Track time spent on a step/component
 */
export class StepTimer {
  private startTime: number
  private stepName: string

  constructor(stepName: string) {
    this.stepName = stepName
    this.startTime = Date.now()
  }

  complete(stepNumber: number): void {
    const timeSpent = Math.round((Date.now() - this.startTime) / 1000)
    
    logEvent('planner_step_completed', {
      step: stepNumber,
      step_name: this.stepName,
      time_spent_seconds: timeSpent
    })
  }
}

/**
 * Get salary range bucket for privacy
 */
export const getSalaryRange = (salary: number): string => {
  if (salary < 50000) return '0-50k'
  if (salary < 75000) return '50k-75k'
  if (salary < 100000) return '75k-100k'
  if (salary < 150000) return '100k-150k'
  if (salary < 200000) return '150k-200k'
  return '200k+'
}

/**
 * Get balance range bucket for privacy
 */
export const getBalanceRange = (balance: number): string => {
  if (balance === 0) return '0'
  if (balance < 25000) return '0-25k'
  if (balance < 50000) return '25k-50k'
  if (balance < 100000) return '50k-100k'
  if (balance < 250000) return '100k-250k'
  if (balance < 500000) return '250k-500k'
  if (balance < 1000000) return '500k-1M'
  return '1M+'
}

/**
 * Track form field interactions
 */
export const trackFieldInteraction = (
  fieldName: string, 
  component: string, 
  action: 'focus' | 'blur' | 'change' | 'error'
): void => {
  // Only track significant interactions to avoid spam
  if (action === 'focus' || action === 'error') {
    logEvent('help_tooltip_viewed', {
      tooltip_id: fieldName,
      component: component
    })
  }
}

/**
 * Track errors with context
 */
export const trackError = (
  component: string,
  errorType: string,
  userAction: string,
  errorDetails?: any
): void => {
  logEvent('error_encountered', {
    component,
    error_type: errorType,
    user_action: userAction
  })

  // Also log to console for debugging
  console.error(`Error in ${component}:`, {
    type: errorType,
    action: userAction,
    details: errorDetails
  })
}

/**
 * Initialize analytics tracking for the session
 */
export const initializeAnalytics = (): void => {
  // Track page load
  if (analytics) {
    firebaseLogEvent(analytics, 'page_view', {
      page_title: 'Retirement Planner',
      page_location: window.location.href
    })
  }

  // Track browser capabilities
  const capabilities = {
    has_web_workers: typeof Worker !== 'undefined',
    has_local_storage: typeof localStorage !== 'undefined',
    has_indexed_db: 'indexedDB' in window,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    user_agent: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop'
  }

  logEvent('simulation_started', {
    planner_version: '1.1.0',
    ...capabilities
  } as any)
}