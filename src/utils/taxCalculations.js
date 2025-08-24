/**
 * Australian Tax Calculations - 2024-25 Tax Year
 * Based on ATO official tax brackets and Medicare levy
 */

// 2024-25 Tax Brackets for Australian Residents
const TAX_BRACKETS_2024_25 = [
  { min: 0, max: 18200, rate: 0, baseAmount: 0 },
  { min: 18201, max: 45000, rate: 0.16, baseAmount: 0 },
  { min: 45001, max: 135000, rate: 0.30, baseAmount: 4288 },
  { min: 135001, max: 190000, rate: 0.37, baseAmount: 31288 },
  { min: 190001, max: Infinity, rate: 0.45, baseAmount: 51638 }
]

// Medicare Levy
const MEDICARE_LEVY_RATE = 0.02 // 2%
const MEDICARE_LEVY_THRESHOLD = 29207 // 2024-25 threshold for singles
const MEDICARE_LEVY_SHADE_OUT_THRESHOLD = 36457 // Shade-out threshold

// Low Income Tax Offset (LITO) - 2024-25
const LITO_MAX = 700
const LITO_THRESHOLD = 37500
const LITO_PHASE_OUT_RATE = 0.05

/**
 * Calculate income tax for a given annual salary
 * @param {number} annualIncome - Annual gross income
 * @returns {number} Annual income tax amount
 */
export function calculateIncomeTax(annualIncome) {
  if (annualIncome <= 0) return 0

  // Find the appropriate tax bracket
  const bracket = TAX_BRACKETS_2024_25.find(
    b => annualIncome >= b.min && annualIncome <= b.max
  )

  if (!bracket) return 0

  // Calculate tax
  const taxableAmount = annualIncome - bracket.min
  const tax = bracket.baseAmount + (taxableAmount * bracket.rate)
  
  return Math.max(0, tax)
}

/**
 * Calculate Medicare levy
 * @param {number} annualIncome - Annual gross income
 * @returns {number} Annual Medicare levy amount
 */
export function calculateMedicareLevy(annualIncome) {
  if (annualIncome <= MEDICARE_LEVY_THRESHOLD) {
    return 0
  }
  
  if (annualIncome <= MEDICARE_LEVY_SHADE_OUT_THRESHOLD) {
    // Shade-in rate: 10c for each $1 over threshold
    const shadeInAmount = (annualIncome - MEDICARE_LEVY_THRESHOLD) * 0.10
    const fullLevy = annualIncome * MEDICARE_LEVY_RATE
    return Math.min(shadeInAmount, fullLevy)
  }
  
  return annualIncome * MEDICARE_LEVY_RATE
}

/**
 * Calculate Low Income Tax Offset (LITO)
 * @param {number} annualIncome - Annual gross income
 * @returns {number} Annual LITO offset amount
 */
export function calculateLITO(annualIncome) {
  if (annualIncome <= LITO_THRESHOLD) {
    return LITO_MAX
  }
  
  // Phase out at 5c per dollar over $37,500
  const phaseOut = (annualIncome - LITO_THRESHOLD) * LITO_PHASE_OUT_RATE
  return Math.max(0, LITO_MAX - phaseOut)
}

/**
 * Calculate net (take-home) income after all taxes and offsets
 * @param {number} annualIncome - Annual gross income
 * @param {number} superContributions - Annual super contributions (pre-tax)
 * @returns {object} Breakdown of tax calculations
 */
export function calculateNetIncome(annualIncome, superContributions = 0) {
  if (annualIncome <= 0) {
    return {
      grossIncome: 0,
      taxableIncome: 0,
      incomeTax: 0,
      medicareLevy: 0,
      lito: 0,
      totalTax: 0,
      netIncome: 0,
      monthlyNet: 0,
      effectiveTaxRate: 0
    }
  }

  // Calculate taxable income (gross minus super contributions)
  const taxableIncome = Math.max(0, annualIncome - superContributions)
  
  // Calculate components
  const incomeTax = calculateIncomeTax(taxableIncome)
  const medicareLevy = calculateMedicareLevy(taxableIncome)
  const lito = calculateLITO(taxableIncome)
  
  // Total tax (income tax + Medicare levy - offsets)
  const totalTax = Math.max(0, incomeTax + medicareLevy - lito)
  
  // Net income
  const netIncome = taxableIncome - totalTax
  const monthlyNet = netIncome / 12
  
  // Effective tax rate
  const effectiveTaxRate = taxableIncome > 0 ? (totalTax / taxableIncome) : 0

  return {
    grossIncome: annualIncome,
    taxableIncome,
    incomeTax,
    medicareLevy,
    lito,
    totalTax,
    netIncome,
    monthlyNet: Math.round(monthlyNet),
    effectiveTaxRate: effectiveTaxRate * 100 // As percentage
  }
}

/**
 * Get tax bracket information for a given income
 * @param {number} annualIncome - Annual gross income
 * @returns {object} Tax bracket information
 */
export function getTaxBracket(annualIncome) {
  const bracket = TAX_BRACKETS_2024_25.find(
    b => annualIncome >= b.min && annualIncome <= b.max
  )
  
  if (!bracket) return null
  
  return {
    range: bracket.max === Infinity 
      ? `$${bracket.min.toLocaleString()}+`
      : `$${bracket.min.toLocaleString()} - $${bracket.max.toLocaleString()}`,
    marginalRate: (bracket.rate * 100).toFixed(0) + '%',
    effectiveRate: annualIncome > 0 
      ? (((calculateIncomeTax(annualIncome) + calculateMedicareLevy(annualIncome) - calculateLITO(annualIncome)) / annualIncome) * 100).toFixed(1) + '%'
      : '0%'
  }
}

/**
 * Calculate super guarantee contributions
 * @param {number} annualIncome - Annual gross income
 * @param {number} sgRate - Super guarantee rate (default 11.5% for 2024-25)
 * @returns {number} Annual SG contributions
 */
export function calculateSuperGuarantee(annualIncome, sgRate = 0.115) {
  return annualIncome * sgRate
}