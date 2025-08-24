/**
 * Zod schemas for MVP Planner validation
 * Beginner-friendly with sensible defaults and helpful error messages
 */

import { z } from 'zod'

// Core enums
export const AssumptionPresetEnum = z.enum(['Conservative', 'Base', 'Optimistic'])
export const RiskProfileEnum = z.enum(['conservative', 'balanced', 'growth'])
export const SuperOptionEnum = z.enum(['Balanced', 'Growth', 'HighGrowth'])
export const LoanTypeEnum = z.enum(['IO', 'PI'])
export const AllocationPresetEnum = z.enum(['OneETF', 'TwoETF'])
export const MaritalStatusEnum = z.enum(['single', 'couple', 'family'])
export const AustralianStateEnum = z.enum(['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'])

// Goal setting schema
export const goalSchema = z.object({
  currentAge: z.number()
    .int('Age must be a whole number')
    .min(18, 'Must be at least 18 years old')
    .max(80, 'Must be under 80 years old'),
    
  retireAge: z.number()
    .int('Retirement age must be a whole number')
    .min(40, 'Retirement age must be at least 40')
    .max(80, 'Retirement age must be under 80'),
    
  targetIncomeYearly: z.number()
    .min(20000, 'Income target should be at least $20,000')
    .max(500000, 'Income target should be under $500,000')
    .optional(),
    
  targetCapital: z.number()
    .min(100000, 'Capital target should be at least $100,000')
    .max(10000000, 'Capital target should be under $10 million')
    .optional(),
    
  riskProfile: RiskProfileEnum.default('balanced'),
  assumptionPreset: AssumptionPresetEnum.default('Base'),
  
  state: AustralianStateEnum.optional(),
  maritalStatus: MaritalStatusEnum.default('single'),
  dependentsCount: z.number()
    .int('Number of dependents must be a whole number')
    .min(0, 'Cannot have negative dependents')
    .max(10, 'Maximum 10 dependents supported')
    .default(0)
}).refine(
  (data) => data.retireAge > data.currentAge,
  {
    message: 'Retirement age must be greater than current age',
    path: ['retireAge']
  }
).refine(
  (data) => !!(data.targetIncomeYearly || data.targetCapital),
  {
    message: 'Please specify either target income or target capital (not both)',
    path: ['targetIncomeYearly']
  }
)

// Income and expenses schema
export const incomeExpenseSchema = z.object({
  salary: z.number()
    .min(30000, 'Salary should be at least $30,000')
    .max(2000000, 'Salary should be under $2 million'),
    
  bonus: z.number()
    .min(0, 'Bonus cannot be negative')
    .max(500000, 'Bonus should be under $500,000')
    .optional(),
    
  wageGrowthPct: z.number()
    .min(0, 'Wage growth cannot be negative')
    .max(0.15, 'Wage growth should be under 15% per year')
    .default(0.03),
    
  expensesMonthly: z.number()
    .min(1000, 'Monthly expenses should be at least $1,000')
    .max(50000, 'Monthly expenses should be under $50,000')
})

// Super schema
export const superSchema = z.object({
  balance: z.number()
    .min(0, 'Super balance cannot be negative')
    .max(10000000, 'Super balance should be under $10 million'),
    
  SGRate: z.number()
    .min(0.09, 'SG rate should be at least 9%')
    .max(0.15, 'SG rate should be under 15%')
    .default(0.115),
    
  salarySacrificeMonthly: z.number()
    .min(0, 'Salary sacrifice cannot be negative')
    .max(20000, 'Monthly salary sacrifice should be under $20,000')
    .default(0),
    
  option: SuperOptionEnum.default('HighGrowth'),
  
  feePct: z.number()
    .min(0, 'Fees cannot be negative')
    .max(0.03, 'Super fees should be under 3%')
    .default(0.007),
    
  concessionalCapYearly: z.number()
    .min(25000, 'Concessional cap should be at least $25,000')
    .max(35000, 'Concessional cap should be under $35,000')
    .default(27500),
    
  contributionsTaxPct: z.literal(0.15, {
    errorMap: () => ({ message: 'Contributions tax is fixed at 15% in MVP' })
  })
})

// Property schema
export const propertySchema = z.object({
  enabled: z.boolean().default(false),
  
  value: z.number()
    .min(0, 'Property value cannot be negative')
    .max(20000000, 'Property value should be under $20 million')
    .default(0),
    
  loanBalance: z.number()
    .min(0, 'Loan balance cannot be negative')
    .max(20000000, 'Loan balance should be under $20 million')
    .default(0),
    
  ratePct: z.number()
    .min(0.01, 'Interest rate should be at least 1%')
    .max(0.15, 'Interest rate should be under 15%')
    .default(0.065),
    
  ioOrPi: LoanTypeEnum.default('PI'),
  
  termMonths: z.number()
    .int('Loan term must be whole months')
    .min(12, 'Loan term should be at least 1 year')
    .max(600, 'Loan term should be under 50 years')
    .default(300),
    
  offsetBalance: z.number()
    .min(0, 'Offset balance cannot be negative')
    .default(0),
    
  rentPerWeek: z.number()
    .min(0, 'Rent cannot be negative')
    .max(5000, 'Weekly rent should be under $5,000')
    .optional(),
    
  mgmtFeePct: z.number()
    .min(0, 'Management fee cannot be negative')
    .max(0.15, 'Management fee should be under 15%')
    .default(0.07),
    
  insuranceYearly: z.number()
    .min(0, 'Insurance cannot be negative')
    .max(10000, 'Annual insurance should be under $10,000')
    .default(500),
    
  councilRatesYearly: z.number()
    .min(0, 'Council rates cannot be negative')
    .max(20000, 'Annual council rates should be under $20,000')
    .default(1800),
    
  maintenancePctOfRent: z.number()
    .min(0, 'Maintenance percentage cannot be negative')
    .max(0.2, 'Maintenance should be under 20% of rent')
    .default(0.05),
    
  vacancyPct: z.number()
    .min(0, 'Vacancy rate cannot be negative')
    .max(0.5, 'Vacancy rate should be under 50%')
    .default(0.02),
    
  extraRepaymentMonthly: z.number()
    .min(0, 'Extra repayments cannot be negative')
    .max(100000, 'Monthly extra repayments should be under $100,000')
    .default(0)
}).refine(
  (data) => !data.enabled || data.loanBalance <= data.value,
  {
    message: 'Loan balance cannot exceed property value',
    path: ['loanBalance']
  }
)

// Portfolio schema
export const portfolioSchema = z.object({
  startingBalance: z.number()
    .min(0, 'Starting balance cannot be negative')
    .max(10000000, 'Starting balance should be under $10 million')
    .default(0),
    
  dcaMonthly: z.number()
    .min(0, 'Monthly investing cannot be negative')
    .max(100000, 'Monthly investing should be under $100,000')
    .default(0),
    
  allocationPreset: AllocationPresetEnum.default('OneETF'),
  
  weights: z.object({
    aus: z.number().min(0).max(1),
    global: z.number().min(0).max(1)
  }).refine(
    (data) => Math.abs(data.aus + data.global - 1) < 0.001,
    {
      message: 'Allocation weights must sum to 100%',
      path: ['weights']
    }
  ).optional(),
  
  feePct: z.number()
    .min(0, 'Fees cannot be negative')
    .max(0.01, 'ETF fees should be under 1%')
    .default(0.0015)
})

// Buffers schema
export const buffersSchema = z.object({
  emergencyMonths: z.number()
    .int('Emergency buffer must be whole months')
    .min(1, 'Emergency buffer should be at least 1 month')
    .max(24, 'Emergency buffer should be under 24 months')
    .default(6),
    
  propertyMonths: z.number()
    .int('Property buffer must be whole months')
    .min(1, 'Property buffer should be at least 1 month')
    .max(24, 'Property buffer should be under 24 months')
    .default(6)
})

// Complete planner state schema
export const plannerStateSchema = z.object({
  goal: goalSchema,
  incomeExpense: incomeExpenseSchema,
  super: superSchema,
  property: propertySchema,
  portfolio: portfolioSchema,
  buffers: buffersSchema,
  preservation: z.object({
    preservationAge: z.number()
      .int('Preservation age must be a whole number')
      .default(60)
  }),
  
  // Metadata
  scenarioName: z.string()
    .min(1, 'Scenario name is required')
    .max(100, 'Scenario name should be under 100 characters')
    .default('My Retirement Plan'),
    
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
})

// Settings schema
export const appSettingsSchema = z.object({
  // Editable settings
  concessionalCapYearly: z.number()
    .min(25000)
    .max(35000)
    .default(27500),
    
  concessionalCapLabel: z.string()
    .default('Concessional cap (FY 2025–26)'),
    
  defaultSuperOption: SuperOptionEnum.default('HighGrowth'),
  
  twoETFDefaultWeights: z.object({
    aus: z.number().min(0).max(1).default(0.4),
    global: z.number().min(0).max(1).default(0.6)
  }),
  
  // Read-only settings
  preservationAge: z.number().default(60),
  
  defaultBuffers: z.object({
    emergencyMonths: z.number().default(6),
    propertyMonths: z.number().default(6)
  }),
  
  defaultPropertyCosts: z.object({
    mgmtFeePct: z.number().default(0.07),
    insuranceYearly: z.number().default(500),
    councilRatesYearly: z.number().default(1800),
    maintenancePctOfRent: z.number().default(0.05),
    vacancyPct: z.number().default(0.02)
  }),
  
  assumptionPresets: z.object({
    Conservative: z.object({
      superReturns: z.number().default(0.06),
      etfReturns: z.number().default(0.065),
      propertyGrowth: z.number().default(0.04),
      inflation: z.number().default(0.025),
      wageGrowth: z.number().default(0.025)
    }),
    Base: z.object({
      superReturns: z.number().default(0.07),
      etfReturns: z.number().default(0.075),
      propertyGrowth: z.number().default(0.05),
      inflation: z.number().default(0.03),
      wageGrowth: z.number().default(0.03)
    }),
    Optimistic: z.object({
      superReturns: z.number().default(0.08),
      etfReturns: z.number().default(0.085),
      propertyGrowth: z.number().default(0.06),
      inflation: z.number().default(0.035),
      wageGrowth: z.number().default(0.035)
    })
  }),
  
  currencySymbol: z.string().default('$'),
  dateFormat: z.string().default('DD/MM/YYYY')
})

// Validation helper functions
export const validatePlannerState = (data: unknown) => {
  return plannerStateSchema.safeParse(data)
}

export const validateGoal = (data: unknown) => {
  return goalSchema.safeParse(data)
}

export const validateSettings = (data: unknown) => {
  return appSettingsSchema.safeParse(data)
}

// Transform helpers for form inputs
export const stringToNumber = (value: string, fallback = 0): number => {
  const parsed = parseFloat(value.replace(/[,$]/g, ''))
  return isNaN(parsed) ? fallback : parsed
}

export const percentageToDecimal = (percentage: string): number => {
  const parsed = parseFloat(percentage.replace('%', ''))
  return isNaN(parsed) ? 0 : parsed / 100
}

export const weeklyToAnnual = (weekly: number): number => weekly * 52

// Create default values
export const createDefaultSettings = (): z.infer<typeof appSettingsSchema> => {
  return appSettingsSchema.parse({})
}

export const createDefaultPlannerState = (settings?: Partial<z.infer<typeof appSettingsSchema>>): z.infer<typeof plannerStateSchema> => {
  const defaultSettings = { ...createDefaultSettings(), ...settings }
  
  return plannerStateSchema.parse({
    goal: {
      currentAge: 30,
      retireAge: 65,
      targetIncomeYearly: 80000,
      riskProfile: 'balanced',
      assumptionPreset: 'Base'
    },
    incomeExpense: {
      salary: 100000,
      wageGrowthPct: 0.03,
      expensesMonthly: 4000
    },
    super: {
      balance: 150000,
      SGRate: 0.115,
      option: defaultSettings.defaultSuperOption,
      concessionalCapYearly: defaultSettings.concessionalCapYearly
    },
    portfolio: {
      startingBalance: 10000,
      dcaMonthly: 1000,
      allocationPreset: 'TwoETF',
      weights: defaultSettings.twoETFDefaultWeights
    }
  })
}