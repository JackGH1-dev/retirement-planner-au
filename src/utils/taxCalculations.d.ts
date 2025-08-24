/**
 * TypeScript declarations for Australian Tax Calculations
 */

export interface TaxBreakdown {
  grossIncome: number
  taxableIncome: number
  incomeTax: number
  medicareLevy: number
  lito: number
  totalTax: number
  netIncome: number
  monthlyNet: number
  effectiveTaxRate: number
}

export interface TaxBracket {
  range: string
  marginalRate: string
  effectiveRate: string
}

export function calculateIncomeTax(annualIncome: number): number
export function calculateMedicareLevy(annualIncome: number): number
export function calculateLITO(annualIncome: number): number
export function calculateNetIncome(annualIncome: number, superContributions?: number): TaxBreakdown
export function getTaxBracket(annualIncome: number): TaxBracket | null
export function calculateSuperGuarantee(annualIncome: number, sgRate?: number): number