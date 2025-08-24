/**
 * Web Worker Simulation Engine
 * Pure client-side retirement calculations with modular architecture
 * 
 * Based on 6-approach framework - MVP implementation ready
 */

import type { PlannerInput, ScenarioResult, MonthlyData, KPIs, AppSettings } from './planner-schemas'

// =============================================================================
// WEB WORKER MESSAGE TYPES
// =============================================================================

export interface SimulationMessage {
  type: 'SIMULATE'
  payload: {
    input: PlannerInput
    settings: AppSettings
  }
  requestId: string
}

export interface SimulationResponse {
  type: 'SIMULATION_COMPLETE' | 'SIMULATION_ERROR'
  payload: ScenarioResult | { error: string, details?: any }
  requestId: string
}

export interface ProgressMessage {
  type: 'SIMULATION_PROGRESS'
  payload: {
    progress: number // 0-100
    currentMonth: number
    totalMonths: number
  }
  requestId: string
}

// =============================================================================
// CALCULATION MODULES (PURE FUNCTIONS)
// =============================================================================

export interface CalculationContext {
  currentMonth: number
  userAge: number
  settings: AppSettings
  assumptions: {
    superReturns: number
    etfReturns: number
    propertyGrowth: number
    inflation: number
    wageGrowth: number
  }
}

// Super calculation module
export interface SuperState {
  balance: number
  monthlyContributions: number
  yearToDateContributions: number
  capUtilization: number
  preservationReached: boolean
}

export const calculateSuperProgression = (
  input: PlannerInput['super'],
  incomeExpense: PlannerInput['incomeExpense'],
  context: CalculationContext,
  previousState: SuperState
): SuperState => {
  // Implementation would go here
  // Key logic: SG + salary sacrifice, cap enforcement, 15% contributions tax, growth
  return {
    balance: 0, // Calculate monthly super balance
    monthlyContributions: 0, // SG + salary sacrifice 
    yearToDateContributions: 0, // Track against concessional cap
    capUtilization: 0, // % of cap used this FY
    preservationReached: context.userAge >= context.settings.preservationAge
  }
}

// ETF/Portfolio calculation module  
export interface PortfolioState {
  balance: number
  monthlyContribution: number
  dcaPaused: boolean
  pauseReason: 'buffers' | 'none'
}

export const calculatePortfolioProgression = (
  input: PlannerInput['portfolio'],
  buffers: PlannerInput['buffers'],
  cashAvailable: number,
  context: CalculationContext,
  previousState: PortfolioState
): PortfolioState => {
  // Implementation would go here
  // Key logic: DCA monthly, OneETF vs TwoETF allocation, buffer policy
  return {
    balance: 0, // Monthly portfolio balance with returns
    monthlyContribution: 0, // Actual contribution (may be 0 if paused)
    dcaPaused: false, // Whether DCA is paused due to low buffers
    pauseReason: 'none'
  }
}

// Property calculation module
export interface PropertyState {
  value: number
  loanBalance: number
  equity: number
  lvr: number
  monthlyNetCashflow: number
  monthlyPrincipalPayment: number
  monthlyInterest: number
  totalPropertyCosts: number
  stressTestPasses: boolean
}

export const calculatePropertyProgression = (
  input: PlannerInput['property'],
  context: CalculationContext,
  previousState: PropertyState
): PropertyState => {
  // Implementation would go here
  // Key logic: rent income, vacancy, costs, loan amortization, extra repayments
  return {
    value: 0, // Property value with growth
    loanBalance: 0, // Remaining loan after payments
    equity: 0, // value - loanBalance
    lvr: 0, // loanBalance / value
    monthlyNetCashflow: 0, // Rent - costs - loan payments
    monthlyPrincipalPayment: 0,
    monthlyInterest: 0,
    totalPropertyCosts: 0,
    stressTestPasses: true // Can service at +2% rate
  }
}

// Buffers & Cash Flow management
export interface CashState {
  totalCash: number
  emergencyBuffer: number
  propertyBuffer: number
  excessCash: number
  buffersAdequate: boolean
}

export const calculateCashProgression = (
  netIncome: number,
  expenses: number,
  superContributions: number,
  etfContributions: number,
  propertyNetCashflow: number,
  buffers: PlannerInput['buffers'],
  incomeExpense: PlannerInput['incomeExpense'],
  context: CalculationContext,
  previousState: CashState
): CashState => {
  // Implementation would go here
  // Key logic: cash flow, buffer targets, excess cash routing
  return {
    totalCash: 0,
    emergencyBuffer: 0, // Target: buffers.emergencyMonths * expenses
    propertyBuffer: 0, // Target: buffers.propertyMonths * property costs
    excessCash: 0, // Cash above buffer targets
    buffersAdequate: true // Whether buffers meet targets
  }
}

// =============================================================================
// MAIN SIMULATION RUNNER
// =============================================================================

/**
 * Main simulation function - runs monthly projections from current age to 100
 * Pure function: no side effects, deterministic output for given input
 */
export const runScenario = async (
  input: PlannerInput, 
  settings: AppSettings,
  progressCallback?: (progress: number, month: number) => void
): Promise<ScenarioResult> => {
  const startTime = performance.now()
  
  // Validate input
  if (!input.goal.currentAge || !input.goal.retireAge) {
    throw new Error('Invalid input: missing required age fields')
  }
  
  // Get assumption preset
  const assumptions = settings.assumptionPresets[input.goal.assumptionPreset]
  
  // Calculate simulation bounds
  const startAge = input.goal.currentAge
  const endAge = 100 // Project to age 100
  const totalMonths = (endAge - startAge) * 12
  const monthlyData: MonthlyData[] = []
  
  // Initialize state
  let superState: SuperState = {
    balance: input.super.balance,
    monthlyContributions: 0,
    yearToDateContributions: 0,
    capUtilization: 0,
    preservationReached: false
  }
  
  let portfolioState: PortfolioState = {
    balance: input.portfolio.startingBalance,
    monthlyContribution: input.portfolio.dcaMonthly,
    dcaPaused: false,
    pauseReason: 'none'
  }
  
  let propertyState: PropertyState | null = input.property ? {
    value: input.property.value,
    loanBalance: input.property.loanBalance,
    equity: input.property.value - input.property.loanBalance,
    lvr: input.property.loanBalance / input.property.value,
    monthlyNetCashflow: 0,
    monthlyPrincipalPayment: 0,
    monthlyInterest: 0,
    totalPropertyCosts: 0,
    stressTestPasses: true
  } : null
  
  let cashState: CashState = {
    totalCash: 0,
    emergencyBuffer: input.buffers.emergencyMonths * input.incomeExpense.expensesMonthly,
    propertyBuffer: input.buffers.propertyMonths * input.incomeExpense.expensesMonthly,
    excessCash: 0,
    buffersAdequate: false
  }
  
  // Monthly simulation loop
  for (let month = 0; month < totalMonths; month++) {
    const currentAge = startAge + (month / 12)
    
    // Create calculation context
    const context: CalculationContext = {
      currentMonth: month,
      userAge: currentAge,
      settings,
      assumptions
    }
    
    // Progress callback for UI updates
    if (progressCallback && month % 12 === 0) { // Update yearly
      progressCallback((month / totalMonths) * 100, month)
    }
    
    // Calculate monthly progressions
    superState = calculateSuperProgression(
      input.super, 
      input.incomeExpense, 
      context, 
      superState
    )
    
    portfolioState = calculatePortfolioProgression(
      input.portfolio,
      input.buffers,
      cashState.excessCash,
      context,
      portfolioState
    )
    
    if (propertyState && input.property) {
      propertyState = calculatePropertyProgression(
        input.property,
        context,
        propertyState
      )
    }
    
    // Calculate cash flow and buffers
    const monthlyGrossIncome = (input.incomeExpense.salary * Math.pow(1 + assumptions.wageGrowth, month / 12)) / 12
    const propertyNetCashflow = propertyState?.monthlyNetCashflow || 0
    
    cashState = calculateCashProgression(
      monthlyGrossIncome,
      input.incomeExpense.expensesMonthly,
      superState.monthlyContributions,
      portfolioState.monthlyContribution,
      propertyNetCashflow,
      input.buffers,
      input.incomeExpense,
      context,
      cashState
    )
    
    // Store monthly data point
    const monthlyDataPoint: MonthlyData = {
      month,
      age: currentAge,
      superBalance: superState.balance,
      outsideSuperBalance: portfolioState.balance,
      propertyValue: propertyState?.value || 0,
      loanBalance: propertyState?.loanBalance || 0,
      cashBalance: cashState.totalCash,
      netWorth: superState.balance + portfolioState.balance + (propertyState?.equity || 0) + cashState.totalCash,
      grossIncome: monthlyGrossIncome,
      superContributions: superState.monthlyContributions,
      etfContributions: portfolioState.monthlyContribution,
      propertyEquity: propertyState?.equity || 0,
      lvr: propertyState?.lvr || 0,
      propertyNetCashflow: propertyNetCashflow,
      dcaPaused: portfolioState.dcaPaused,
      capWarning: superState.capUtilization > 0.9,
      buffersBelowTarget: !cashState.buffersAdequate
    }
    
    monthlyData.push(monthlyDataPoint)
  }
  
  // Calculate KPIs
  const retirementMonth = (input.goal.retireAge - startAge) * 12
  const preservationMonth = (settings.preservationAge - startAge) * 12
  const retirementData = monthlyData[retirementMonth] || monthlyData[monthlyData.length - 1]
  
  const kpis: KPIs = {
    netWorthAtRetirement: retirementData.netWorth,
    superBalanceAtRetirement: retirementData.superBalance,
    outsideSuperBalanceAtRetirement: retirementData.outsideSuperBalance,
    
    // Bridge analysis
    bridgeYearsRequired: Math.max(0, settings.preservationAge - input.goal.retireAge),
    bridgeYearsCovered: retirementData.outsideSuperBalance / (input.goal.targetIncomeYearly || 80000),
    bridgeCoverageRatio: 0, // Calculate: bridgeYearsCovered / bridgeYearsRequired
    
    // Property outcomes
    propertyEquityAtRetirement: retirementData.propertyEquity,
    finalLVR: retirementData.lvr,
    loanPaidOffAge: undefined, // Find month where loanBalance = 0
    
    // Gaps and efficiency
    monthlyGapToCloseTarget: 0, // Calculate required additional savings
    totalTaxSavedViaSuperContributions: 0, // Sum of tax benefits
    averageCapUtilization: 0 // Average superState.capUtilization
  }
  
  // Calculate final metrics
  kpis.bridgeCoverageRatio = kpis.bridgeYearsRequired > 0 ? 
    kpis.bridgeYearsCovered / kpis.bridgeYearsRequired : 1
  
  // Generate CSV data
  const csvData = generateCSV(monthlyData)
  
  const result: ScenarioResult = {
    input,
    kpis,
    monthlyData,
    simulationDurationMs: performance.now() - startTime,
    dataPoints: monthlyData.length,
    warnings: [], // Add validation warnings
    csvData
  }
  
  return result
}

// =============================================================================
// CSV EXPORT HELPER
// =============================================================================

export const generateCSV = (monthlyData: MonthlyData[]): string => {
  const headers = [
    'Month',
    'Age', 
    'Super Balance',
    'Outside Super Balance',
    'Property Value',
    'Loan Balance',
    'Cash Balance',
    'Net Worth',
    'Gross Income',
    'Super Contributions',
    'ETF Contributions',
    'Property Equity',
    'LVR',
    'Property Net Cashflow',
    'DCA Paused',
    'Cap Warning',
    'Buffers Below Target'
  ]
  
  const rows = monthlyData.map(data => [
    data.month,
    data.age.toFixed(1),
    data.superBalance.toFixed(0),
    data.outsideSuperBalance.toFixed(0),
    data.propertyValue.toFixed(0),
    data.loanBalance.toFixed(0),
    data.cashBalance.toFixed(0),
    data.netWorth.toFixed(0),
    data.grossIncome.toFixed(0),
    data.superContributions.toFixed(0),
    data.etfContributions.toFixed(0),
    data.propertyEquity.toFixed(0),
    (data.lvr * 100).toFixed(1) + '%',
    data.propertyNetCashflow.toFixed(0),
    data.dcaPaused ? 'Yes' : 'No',
    data.capWarning ? 'Yes' : 'No',
    data.buffersBelowTarget ? 'Yes' : 'No'
  ])
  
  return [headers, ...rows]
    .map(row => row.join(','))
    .join('\n')
}

// =============================================================================
// WEB WORKER SETUP
// =============================================================================

/**
 * Web Worker message handler
 * Usage: new Worker('/src/simulation/simulation-worker.js')
 */
export const setupWorker = () => {
  if (typeof importScripts !== 'undefined') {
    // We're running in a Web Worker
    self.onmessage = async (event: MessageEvent<SimulationMessage>) => {
      const { type, payload, requestId } = event.data
      
      if (type === 'SIMULATE') {
        try {
          // Progress callback sends updates to main thread
          const progressCallback = (progress: number, month: number) => {
            const progressMessage: ProgressMessage = {
              type: 'SIMULATION_PROGRESS',
              payload: {
                progress,
                currentMonth: month,
                totalMonths: (100 - payload.input.goal.currentAge) * 12
              },
              requestId
            }
            self.postMessage(progressMessage)
          }
          
          const result = await runScenario(
            payload.input, 
            payload.settings,
            progressCallback
          )
          
          const response: SimulationResponse = {
            type: 'SIMULATION_COMPLETE',
            payload: result,
            requestId
          }
          
          self.postMessage(response)
          
        } catch (error) {
          const errorResponse: SimulationResponse = {
            type: 'SIMULATION_ERROR',
            payload: {
              error: error instanceof Error ? error.message : 'Unknown simulation error',
              details: error
            },
            requestId
          }
          
          self.postMessage(errorResponse)
        }
      }
    }
  }
}

// =============================================================================
// MAIN THREAD HELPER
// =============================================================================

/**
 * Type-safe Web Worker wrapper for main thread usage
 */
export class SimulationWorker {
  private worker: Worker
  private requestCallbacks = new Map<string, {
    resolve: (result: ScenarioResult) => void
    reject: (error: Error) => void
    onProgress?: (progress: number, month: number) => void
  }>()
  
  constructor(workerPath: string = '/src/simulation/simulation-worker.js') {
    this.worker = new Worker(workerPath)
    this.worker.onmessage = this.handleWorkerMessage.bind(this)
  }
  
  private handleWorkerMessage(event: MessageEvent<SimulationResponse | ProgressMessage>) {
    const { type, payload, requestId } = event.data
    const callback = this.requestCallbacks.get(requestId)
    
    if (!callback) return
    
    if (type === 'SIMULATION_COMPLETE') {
      callback.resolve(payload as ScenarioResult)
      this.requestCallbacks.delete(requestId)
    } else if (type === 'SIMULATION_ERROR') {
      const errorPayload = payload as { error: string, details?: any }
      callback.reject(new Error(errorPayload.error))
      this.requestCallbacks.delete(requestId)
    } else if (type === 'SIMULATION_PROGRESS') {
      const progressPayload = payload as { progress: number, currentMonth: number, totalMonths: number }
      callback.onProgress?.(progressPayload.progress, progressPayload.currentMonth)
    }
  }
  
  simulate(
    input: PlannerInput, 
    settings: AppSettings,
    onProgress?: (progress: number, month: number) => void
  ): Promise<ScenarioResult> {
    return new Promise((resolve, reject) => {
      const requestId = Math.random().toString(36).substring(7)
      
      this.requestCallbacks.set(requestId, { resolve, reject, onProgress })
      
      const message: SimulationMessage = {
        type: 'SIMULATE',
        payload: { input, settings },
        requestId
      }
      
      this.worker.postMessage(message)
    })
  }
  
  terminate() {
    this.worker.terminate()
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  // Main simulation function
  runScenario,
  
  // Calculation modules (for unit testing)
  calculateSuperProgression,
  calculatePortfolioProgression,
  calculatePropertyProgression,
  calculateCashProgression,
  
  // Helpers
  generateCSV,
  setupWorker,
  
  // Types
  type SimulationMessage,
  type SimulationResponse,
  type ProgressMessage,
  type CalculationContext,
  type SuperState,
  type PortfolioState,
  type PropertyState,
  type CashState
}