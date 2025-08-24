/**
 * Zod Schemas & TypeScript Interfaces for MVP Planner
 * Ready for immediate Claude Code implementation
 * 
 * Based on 6-approach framework with exact defaults from CLAUDE.md files
 */

import { z } from 'zod'

// =============================================================================
// CORE TYPES & ENUMS
// =============================================================================

export const MaritalStatusEnum = z.enum(['single', 'married', 'defacto'])
export const RiskProfileEnum = z.enum(['conservative', 'moderate', 'aggressive'])  
export const AssumptionPresetEnum = z.enum(['Conservative', 'Base', 'Optimistic'])
export const SuperOptionEnum = z.enum(['Balanced', 'Growth', 'HighGrowth'])
export const PropertyTypeEnum = z.enum(['IO', 'PI']) // Interest Only | Principal & Interest
export const AllocationPresetEnum = z.enum(['OneETF', 'TwoETF'])
export const AustralianStateEnum = z.enum(['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'])

// =============================================================================
// STEP 1: GOAL SETTER
// =============================================================================

export const GoalSetterSchema = z.object({
  // Personal details
  currentAge: z.number().int().min(18).max(100),
  retireAge: z.number().int().min(25).max(100),
  state: AustralianStateEnum,
  maritalStatus: MaritalStatusEnum.default('single'),
  dependentsCount: z.number().int().min(0).max(10).default(0),
  
  // Retirement target (either income OR capital, not both)
  targetIncomeYearly: z.number().min(20000).max(500000).optional(),
  targetCapital: z.number().min(100000).max(50000000).optional(),
  
  // Preferences  
  riskProfile: RiskProfileEnum.default('moderate'),
  assumptionPreset: AssumptionPresetEnum.default('Base'),
  
  // Time preference for future phases
  timePreference: z.enum(['set-and-forget', 'hands-on']).default('set-and-forget')
}).refine(
  (data) => data.retireAge > data.currentAge,
  { message: "Retirement age must be greater than current age", path: ['retireAge'] }
).refine(
  (data) => !!(data.targetIncomeYearly || data.targetCapital),
  { message: "Must specify either target income or target capital", path: ['targetIncomeYearly'] }
)

export type GoalSetter = z.infer<typeof GoalSetterSchema>

// =============================================================================
// STEP 2: CURRENT FINANCIALS (TABBED)
// =============================================================================

// Income & Expenses Tab
export const IncomeExpenseSchema = z.object({
  salary: z.number().min(30000).max(2000000), // Annual gross salary
  bonus: z.number().min(0).max(500000).optional().default(0),
  wageGrowthPct: z.number().min(0).max(0.15).default(0.03), // 3% default
  expensesMonthly: z.number().min(1000).max(50000)
})

export type IncomeExpense = z.infer<typeof IncomeExpenseSchema>

// Super Tab  
export const SuperSchema = z.object({
  balance: z.number().min(0).max(10000000),
  SGRate: z.number().min(0.09).max(0.15).default(0.115), // Current AU SG rate (11.5%)
  salarySacrificeMonthly: z.number().min(0).max(20000).default(0),
  option: SuperOptionEnum.default('HighGrowth'), // MVP default
  feePct: z.number().min(0).max(0.03).default(0.007), // 0.7% default
  concessionalCapYearly: z.number().min(25000).max(35000).default(27500) // From Settings
})

export type Super = z.infer<typeof SuperSchema>

// Property Tab (existing property optimization)
export const PropertySchema = z.object({
  value: z.number().min(100000).max(20000000),
  loanBalance: z.number().min(0).max(20000000),
  ratePct: z.number().min(0.01).max(0.15), // Interest rate
  ioOrPi: PropertyTypeEnum.default('PI'),
  termMonths: z.number().int().min(12).max(600).default(300), // 25 years default
  offsetBalance: z.number().min(0).default(0),
  
  // Rental income & costs (weekly rent converted to annual)
  rentPerWeek: z.number().min(0).max(5000),
  mgmtFeePct: z.number().min(0).max(0.15).default(0.07), // 7% default
  insuranceYearly: z.number().min(0).max(10000).default(500), // $500 default  
  councilRatesYearly: z.number().min(0).max(20000).default(1800), // $1,800 default
  maintenancePctOfRent: z.number().min(0).max(0.2).default(0.05), // 5% of rent default
  vacancyPct: z.number().min(0).max(0.5).default(0.02), // 2% default
  
  // Extra repayments (MVP feature)
  extraRepaymentMonthly: z.number().min(0).max(10000).default(0)
}).refine(
  (data) => data.loanBalance <= data.value,
  { message: "Loan balance cannot exceed property value", path: ['loanBalance'] }
)

export type Property = z.infer<typeof PropertySchema>

// Portfolio Tab (outside super)
export const PortfolioSchema = z.object({
  startingBalance: z.number().min(0).max(10000000).default(0),
  dcaMonthly: z.number().min(0).max(50000).default(0),
  allocationPreset: AllocationPresetEnum.default('TwoETF'),
  
  // Weights for TwoETF (ignored for OneETF)
  weights: z.object({
    aus: z.number().min(0).max(1).default(0.4), // 40% AUS default
    global: z.number().min(0).max(1).default(0.6) // 60% Global default  
  }).refine(
    (data) => Math.abs((data.aus + data.global) - 1) < 0.001,
    { message: "Allocation weights must sum to 100%", path: ['weights'] }
  ),
  
  feePct: z.number().min(0).max(0.01).default(0.0015) // 0.15% default
})

export type Portfolio = z.infer<typeof PortfolioSchema>

// Buffers Tab
export const BuffersSchema = z.object({
  emergencyMonths: z.number().int().min(1).max(24).default(6), // 6 months default
  propertyMonths: z.number().int().min(1).max(24).default(6) // 6 months default
})

export type Buffers = z.infer<typeof BuffersSchema>

// =============================================================================
// COMPLETE PLANNER INPUT (ALL STEPS COMBINED)
// =============================================================================

export const PlannerInputSchema = z.object({
  // Step 1: Goal Setting
  goal: GoalSetterSchema,
  
  // Step 2: Current Financials
  incomeExpense: IncomeExpenseSchema,
  super: SuperSchema,
  property: PropertySchema.optional(), // Optional for users without property
  portfolio: PortfolioSchema,
  buffers: BuffersSchema,
  
  // Metadata
  scenarioName: z.string().min(1).max(100).default('My Retirement Plan'),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
})

export type PlannerInput = z.infer<typeof PlannerInputSchema>

// =============================================================================
// SIMULATION OUTPUT TYPES
// =============================================================================

// Monthly time series data point
export const MonthlyDataSchema = z.object({
  month: z.number().int(), // Months from start (0, 1, 2, ...)
  age: z.number(), // User age (can be fractional)
  
  // Balances
  superBalance: z.number(),
  outsideSuperBalance: z.number(),
  propertyValue: z.number(),
  loanBalance: z.number(),
  cashBalance: z.number(),
  netWorth: z.number(),
  
  // Income & contributions
  grossIncome: z.number(), // Monthly
  superContributions: z.number(), // SG + salary sacrifice
  etfContributions: z.number(), // Monthly DCA (can be 0 if paused)
  
  // Property metrics
  propertyEquity: z.number(),
  lvr: z.number(), // Loan to Value Ratio
  propertyNetCashflow: z.number(), // Monthly
  
  // Flags & states
  dcaPaused: z.boolean(), // ETF DCA paused due to low buffers
  capWarning: z.boolean(), // Approaching concessional cap
  buffersBelowTarget: z.boolean()
})

export type MonthlyData = z.infer<typeof MonthlyDataSchema>

// Key Performance Indicators
export const KPIsSchema = z.object({
  // Retirement outcomes
  netWorthAtRetirement: z.number(),
  superBalanceAtRetirement: z.number(),
  outsideSuperBalanceAtRetirement: z.number(),
  
  // Bridge analysis (retirement age → preservation age)
  bridgeYearsRequired: z.number(), // Years from retire to preservation age
  bridgeYearsCovered: z.number(), // Years covered by outside-super balance
  bridgeCoverageRatio: z.number(), // Covered / Required
  
  // Property outcomes
  propertyEquityAtRetirement: z.number(),
  finalLVR: z.number(),
  loanPaidOffAge: z.number().optional(), // Age when loan fully paid, if ever
  
  // Required savings to meet goals
  monthlyGapToCloseTarget: z.number(), // Additional monthly savings needed
  
  // Tax efficiency
  totalTaxSavedViaSuperContributions: z.number(),
  averageCapUtilization: z.number() // Average % of concessional cap used
})

export type KPIs = z.infer<typeof KPIsSchema>

// Complete simulation result
export const ScenarioResultSchema = z.object({
  input: PlannerInputSchema, // Echo back the input for reference
  kpis: KPIsSchema,
  monthlyData: z.array(MonthlyDataSchema),
  
  // Metadata
  simulationDurationMs: z.number(),
  dataPoints: z.number(),
  warnings: z.array(z.string()), // Validation warnings or calculation notes
  
  // CSV export helper
  csvData: z.string().optional() // Pre-generated CSV string
})

export type ScenarioResult = z.infer<typeof ScenarioResultSchema>

// =============================================================================
// APP SETTINGS (EDITABLE DEFAULTS)
// =============================================================================

export const AppSettingsSchema = z.object({
  // Editable in Settings UI
  concessionalCapYearly: z.number().min(25000).max(35000).default(27500),
  capLabel: z.string().default("Concessional cap (FY 2025–26)"),
  defaultSuperOption: SuperOptionEnum.default('HighGrowth'),
  twoETFDefaultWeights: z.object({
    aus: z.number().min(0).max(1).default(0.4),
    global: z.number().min(0).max(1).default(0.6)
  }),
  
  // Read-only in MVP
  preservationAge: z.number().int().default(60), // Fixed in MVP
  defaultBuffers: z.object({
    emergencyMonths: z.number().int().default(6),
    propertyMonths: z.number().int().default(6)
  }),
  
  // Property defaults
  defaultPropertyCosts: z.object({
    mgmtFeePct: z.number().default(0.07),
    insuranceYearly: z.number().default(500),
    councilRatesYearly: z.number().default(1800),
    maintenancePctOfRent: z.number().default(0.05),
    vacancyPct: z.number().default(0.02)
  }),
  
  // Assumption presets (returns, inflation, fees)
  assumptionPresets: z.object({
    Conservative: z.object({
      superReturns: z.number().default(0.06), // 6% nominal
      etfReturns: z.number().default(0.065), // 6.5% nominal
      propertyGrowth: z.number().default(0.04), // 4% nominal
      inflation: z.number().default(0.025), // 2.5%
      wageGrowth: z.number().default(0.025) // 2.5%
    }),
    Base: z.object({
      superReturns: z.number().default(0.07), // 7% nominal
      etfReturns: z.number().default(0.075), // 7.5% nominal  
      propertyGrowth: z.number().default(0.05), // 5% nominal
      inflation: z.number().default(0.03), // 3%
      wageGrowth: z.number().default(0.03) // 3%
    }),
    Optimistic: z.object({
      superReturns: z.number().default(0.08), // 8% nominal
      etfReturns: z.number().default(0.085), // 8.5% nominal
      propertyGrowth: z.number().default(0.06), // 6% nominal
      inflation: z.number().default(0.035), // 3.5%
      wageGrowth: z.number().default(0.035) // 3.5%
    })
  }),
  
  // UI preferences
  currencySymbol: z.string().default('$'),
  dateFormat: z.string().default('DD/MM/YYYY'), // Australian format
  
  // Metadata
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
})

export type AppSettings = z.infer<typeof AppSettingsSchema>

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Transform string inputs to numbers with validation
 */
export const stringToNumber = (min: number = 0, max: number = Number.MAX_SAFE_INTEGER) => 
  z.string()
    .transform((val) => {
      const num = parseFloat(val.replace(/[,$]/g, '')) // Remove currency symbols
      if (isNaN(num)) throw new Error('Invalid number')
      return num
    })
    .pipe(z.number().min(min).max(max))

/**
 * Percentage string to decimal (e.g., "7%" -> 0.07)  
 */
export const percentageToDecimal = z.string()
  .transform((val) => {
    const num = parseFloat(val.replace('%', ''))
    if (isNaN(num)) throw new Error('Invalid percentage')
    return num / 100
  })
  .pipe(z.number().min(0).max(1))

/**
 * Weekly rent to annual conversion
 */
export const weeklyToAnnual = (weeklyAmount: number): number => weeklyAmount * 52

/**
 * Validate form data with detailed error messages
 */
export const validatePlannerInput = (data: unknown): { 
  success: boolean
  data?: PlannerInput
  errors?: z.ZodError
} => {
  try {
    const validated = PlannerInputSchema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error }
    }
    throw error
  }
}

/**
 * Create default planner input for new users
 */
export const createDefaultPlannerInput = (partialData?: Partial<PlannerInput>): PlannerInput => {
  const defaults = {
    goal: {
      currentAge: 30,
      retireAge: 65,
      state: 'NSW' as const,
      maritalStatus: 'single' as const,
      dependentsCount: 0,
      targetIncomeYearly: 80000,
      riskProfile: 'moderate' as const,
      assumptionPreset: 'Base' as const,
      timePreference: 'set-and-forget' as const
    },
    incomeExpense: {
      salary: 100000,
      bonus: 0,
      wageGrowthPct: 0.03,
      expensesMonthly: 4000
    },
    super: {
      balance: 150000,
      SGRate: 0.115,
      salarySacrificeMonthly: 0,
      option: 'HighGrowth' as const,
      feePct: 0.007,
      concessionalCapYearly: 27500
    },
    portfolio: {
      startingBalance: 10000,
      dcaMonthly: 1000,
      allocationPreset: 'TwoETF' as const,
      weights: { aus: 0.4, global: 0.6 },
      feePct: 0.0015
    },
    buffers: {
      emergencyMonths: 6,
      propertyMonths: 6
    },
    scenarioName: 'My Retirement Plan'
  } satisfies Partial<PlannerInput>

  return PlannerInputSchema.parse({ ...defaults, ...partialData })
}

// =============================================================================
// EXPORTS FOR CLAUDE CODE IMPLEMENTATION
// =============================================================================

export {
  // Primary schemas for form validation
  PlannerInputSchema,
  GoalSetterSchema,
  IncomeExpenseSchema,
  SuperSchema,
  PropertySchema,
  PortfolioSchema,
  BuffersSchema,
  
  // Output schemas
  ScenarioResultSchema,
  KPIsSchema,
  MonthlyDataSchema,
  
  // Settings
  AppSettingsSchema,
  
  // Enums for dropdowns
  MaritalStatusEnum,
  RiskProfileEnum,
  AssumptionPresetEnum,
  SuperOptionEnum,
  PropertyTypeEnum,
  AllocationPresetEnum,
  AustralianStateEnum,
  
  // Helper functions
  validatePlannerInput,
  createDefaultPlannerInput,
  stringToNumber,
  percentageToDecimal,
  weeklyToAnnual
}