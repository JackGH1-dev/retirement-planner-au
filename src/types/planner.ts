/**
 * TypeScript types for MVP Planner
 * Beginner-friendly retirement planning with 6-approach framework
 */

// Core enums
export type AssumptionPreset = 'Conservative' | 'Base' | 'Optimistic'
export type RiskProfile = 'conservative' | 'balanced' | 'growth'
export type SuperOption = 'Balanced' | 'Growth' | 'HighGrowth'
export type LoanType = 'IO' | 'PI'
export type AllocationPreset = 'OneETF' | 'TwoETF'
export type MaritalStatus = 'single' | 'couple' | 'family'

// Settings type (editable defaults)
export type AppSettings = {
  // Editable in Settings UI
  concessionalCapYearly: number              // default 27500
  concessionalCapLabel: string               // "Concessional cap (FY 2025–26)"
  defaultSuperOption: SuperOption            // 'HighGrowth'
  twoETFDefaultWeights: { aus: number; global: number } // {0.4, 0.6}
  
  // Read-only in MVP
  preservationAge: number                    // 60 (fixed)
  defaultBuffers: { emergencyMonths: number; propertyMonths: number } // {6, 6}
  
  // Property defaults
  defaultPropertyCosts: {
    mgmtFeePct: number                       // 0.07
    insuranceYearly: number                  // 500
    councilRatesYearly: number               // 1800
    maintenancePctOfRent: number             // 0.05
    vacancyPct: number                       // 0.02
  }
  
  // Assumption presets (returns, inflation, fees)
  assumptionPresets: {
    Conservative: {
      superReturns: number                   // 0.06
      etfReturns: number                     // 0.065
      propertyGrowth: number                 // 0.04
      inflation: number                      // 0.025
      wageGrowth: number                     // 0.025
    }
    Base: {
      superReturns: number                   // 0.07
      etfReturns: number                     // 0.075
      propertyGrowth: number                 // 0.05
      inflation: number                      // 0.03
      wageGrowth: number                     // 0.03
    }
    Optimistic: {
      superReturns: number                   // 0.08
      etfReturns: number                     // 0.085
      propertyGrowth: number                 // 0.06
      inflation: number                      // 0.035
      wageGrowth: number                     // 0.035
    }
  }
  
  // UI preferences
  currencySymbol: string                     // '$'
  dateFormat: string                         // 'DD/MM/YYYY'
}

// Planner state components
export type GoalState = {
  currentAge: number
  retireAge: number
  targetIncomeYearly?: number               // choose OR targetCapital
  targetCapital?: number
  riskProfile: RiskProfile                  // default 'balanced'
  assumptionPreset: AssumptionPreset        // default 'Base'
  state?: string                           // AU state/territory code
  maritalStatus?: MaritalStatus
  dependentsCount?: number
}

export type IncomeExpenseState = {
  salary: number                           // annual gross
  bonus?: number                           // annual
  wageGrowthPct: number                    // default 0.03
  expensesMonthly: number
}

export type SuperState = {
  balance: number
  SGRate: number                           // employer SG rate (e.g., 0.12)
  salarySacrificeMonthly: number           // optional
  option: SuperOption                      // default: 'HighGrowth'
  feePct: number                          // e.g., 0.007
  concessionalCapYearly: number           // from settings
  contributionsTaxPct: number             // 0.15 (fixed MVP)
}

export type PropertyState = {
  enabled: boolean                        // toggles visibility
  value: number
  loanBalance: number
  ratePct: number                        // nominal annual
  ioOrPi: LoanType
  termMonths: number
  offsetBalance: number
  rentPerWeek?: number
  mgmtFeePct: number                     // default 0.07
  insuranceYearly: number                // default 500
  councilRatesYearly: number             // default 1800
  maintenancePctOfRent: number           // default 0.05
  vacancyPct: number                     // default 0.02
  extraRepaymentMonthly: number
}

export type PortfolioState = {
  startingBalance: number
  dcaMonthly: number
  allocationPreset: AllocationPreset      // 'OneETF' | 'TwoETF'
  weights?: { aus: number; global: number } // set when TwoETF
  feePct: number                         // e.g., 0.0015
}

export type BuffersState = {
  emergencyMonths: number                // default 6
  propertyMonths: number                 // default 6
}

export type PreservationState = {
  preservationAge: number                // 60 (fixed MVP)
}

// Complete planner state
export type PlannerState = {
  goal: GoalState
  incomeExpense: IncomeExpenseState
  super: SuperState
  property: PropertyState
  portfolio: PortfolioState
  buffers: BuffersState
  preservation: PreservationState
  
  // Metadata
  scenarioName?: string
  createdAt?: string
  updatedAt?: string
}

// Simulation outputs
export type ScenarioKPIs = {
  netWorthAtRetire: number
  superAtRetire: number
  outsideSuperAtRetire: number
  bridgeYears: number
  bridgeYearsCovered: number
  propertyEquityAtRetire?: number
  lvrAtRetire?: number                   // 0-1
  monthlySavingsRequired?: number        // to close gap
  capUsagePct?: number                  // 0-1 of concessional cap
  buffersPausedDCA?: boolean
  totalTaxSaved?: number
}

export type ScenarioSeries = {
  // Minimal series for CSV and charts
  month: number[]                       // 0..N
  age: number[]                         // User age at each month
  netWorth: number[]
  superBalance: number[]
  outsideSuperBalance: number[]
  cashBalance: number[]
  loanBalance?: number[]
  lvr?: number[]
  propertyValue?: number[]
  dcaPaused?: boolean[]                 // Track when DCA is paused
}

export type ScenarioResult = {
  kpis: ScenarioKPIs
  series: ScenarioSeries
  simulationDurationMs: number
  warnings?: string[]
}

// Component prop types
export type PlannerProps = {
  initialState?: Partial<PlannerState>
  settings: AppSettings
  onSaveScenario: (state: PlannerState, name: string) => Promise<void>
}

export type GoalSetterProps = {
  value: GoalState
  onChange: (next: GoalState) => void
  presets: AssumptionPreset[]
}

export type CurrentFinancialsProps = {
  incomeExpense: IncomeExpenseState
  superState: SuperState
  property: PropertyState
  portfolio: PortfolioState
  buffers: BuffersState
  settings: AppSettings
  onChangeIncomeExpense: (next: IncomeExpenseState) => void
  onChangeSuper: (next: SuperState) => void
  onChangeProperty: (next: PropertyState) => void
  onChangePortfolio: (next: PortfolioState) => void
  onChangeBuffers: (next: BuffersState) => void
}

export type SuperPlannerProps = {
  state: PlannerState
  settings: AppSettings
  capUsagePct?: number                  // from last sim
  onChange: (next: PlannerState) => void
}

export type ETFPlannerProps = {
  state: PlannerState
  settings: AppSettings
  bridgeYears?: number                  // from last sim
  dcaPaused?: boolean                   // from last sim
  onChange: (next: PlannerState) => void
}

export type PropertyPlannerProps = {
  state: PlannerState
  settings: AppSettings
  stressCashflow?: { base: number; plus2: number; plus3: number }
  lvr?: number
  onChange: (next: PlannerState) => void
}

export type ResultsProps = {
  kpis: ScenarioKPIs
  series: ScenarioSeries
  plannerState: PlannerState
  onExportCSV: () => void
  onSave: (name: string) => Promise<void>
  quickWin?: {
    message: string
    actionLabel: string
    onApply: () => void
  }
}

// UI component props
export type CapBarProps = {
  usagePct: number                      // 0..1
  capLabel: string                      // "Concessional cap (FY 2025–26)"
  suggestedMonthly?: number            // dollars
}

export type BridgeChipProps = {
  years: number
  required?: number
}

export type BufferBannerProps = {
  requiredMonths: number
  currentMonths: number
  type: 'emergency' | 'property'
}

// Default values for creating new planner state
export const createDefaultPlannerState = (settings: AppSettings): PlannerState => ({
  goal: {
    currentAge: 30,
    retireAge: 65,
    targetIncomeYearly: 80000,
    riskProfile: 'balanced',
    assumptionPreset: 'Base',
    maritalStatus: 'single',
    dependentsCount: 0
  },
  incomeExpense: {
    salary: 100000,
    wageGrowthPct: 0.03,
    expensesMonthly: 4000
  },
  super: {
    balance: 150000,
    SGRate: 0.12,
    salarySacrificeMonthly: 0,
    option: settings.defaultSuperOption,
    feePct: 0.007,
    concessionalCapYearly: settings.concessionalCapYearly,
    contributionsTaxPct: 0.15
  },
  property: {
    enabled: false,
    value: 0,
    loanBalance: 0,
    ratePct: 0.065,
    ioOrPi: 'PI',
    termMonths: 300,
    offsetBalance: 0,
    mgmtFeePct: settings.defaultPropertyCosts.mgmtFeePct,
    insuranceYearly: settings.defaultPropertyCosts.insuranceYearly,
    councilRatesYearly: settings.defaultPropertyCosts.councilRatesYearly,
    maintenancePctOfRent: settings.defaultPropertyCosts.maintenancePctOfRent,
    vacancyPct: settings.defaultPropertyCosts.vacancyPct,
    extraRepaymentMonthly: 0
  },
  portfolio: {
    startingBalance: 10000,
    dcaMonthly: 1000,
    allocationPreset: 'TwoETF',
    weights: settings.twoETFDefaultWeights,
    feePct: 0.0015
  },
  buffers: {
    emergencyMonths: settings.defaultBuffers.emergencyMonths,
    propertyMonths: settings.defaultBuffers.propertyMonths
  },
  preservation: {
    preservationAge: settings.preservationAge
  },
  scenarioName: 'My Retirement Plan'
})