/**
 * Web Worker for Retirement Planning Simulation
 * Handles complex calculations in separate thread to keep UI responsive
 */

// Simulation configuration
const SIMULATION_YEARS = 50
const MONTHS_PER_YEAR = 12
const SG_RATE = 0.11 // Superannuation Guarantee rate

/**
 * Main simulation function
 * @param {Object} plannerState - Complete planner state
 * @returns {Object} Simulation results
 */
function runRetirementSimulation(plannerState) {
  try {
    const {
      goalSetter,
      income,
      super: superData,
      portfolio,
      property,
      buffers
    } = plannerState

    // Validate required data
    if (!goalSetter || !income || !superData || !portfolio || !property || !buffers) {
      throw new Error('Missing required planner data')
    }

    const currentAge = goalSetter.currentAge || 30
    const retirementAge = goalSetter.retirementAge || 65
    const yearsToRetirement = retirementAge - currentAge
    
    if (yearsToRetirement <= 0) {
      return {
        error: 'Already at or past retirement age',
        canRetire: true,
        currentAssets: calculateCurrentAssets(superData, portfolio, property, buffers)
      }
    }

    // Initialize simulation arrays
    const simulation = {
      years: [],
      superBalance: [],
      etfPortfolio: [],
      propertyValue: [],
      totalAssets: [],
      annualIncome: [], // For income goal
      monthlyIncome: [], // For income goal
      bufferBalance: []
    }

    // Run year-by-year simulation
    let currentSuperBalance = superData.currentBalance
    let currentETFBalance = portfolio.currentValue
    let currentPropertyValue = property.currentValue
    let currentBufferBalance = buffers.currentAmount
    let propertyMortgage = property.outstandingMortgage

    for (let year = 0; year <= yearsToRetirement; year++) {
      const currentSimAge = currentAge + year
      const isRetired = currentSimAge >= retirementAge

      // Calculate annual contributions and returns
      const yearData = simulateYear({
        year,
        currentSimAge,
        isRetired,
        superBalance: currentSuperBalance,
        etfBalance: currentETFBalance,
        propertyValue: currentPropertyValue,
        bufferBalance: currentBufferBalance,
        propertyMortgage,
        plannerState
      })

      // Update balances
      currentSuperBalance = yearData.endSuperBalance
      currentETFBalance = yearData.endETFBalance
      currentPropertyValue = yearData.endPropertyValue
      currentBufferBalance = yearData.endBufferBalance
      propertyMortgage = yearData.endPropertyMortgage

      // Store simulation data
      simulation.years.push(currentAge + year)
      simulation.superBalance.push(currentSuperBalance)
      simulation.etfPortfolio.push(currentETFBalance)
      simulation.propertyValue.push(currentPropertyValue)
      simulation.bufferBalance.push(currentBufferBalance)
      
      const totalAssets = currentSuperBalance + currentETFBalance + 
                         Math.max(0, currentPropertyValue - propertyMortgage) + currentBufferBalance
      simulation.totalAssets.push(totalAssets)
      
      // Calculate retirement income capacity
      const annualDrawdown = totalAssets * 0.04 // 4% rule
      simulation.annualIncome.push(annualDrawdown)
      simulation.monthlyIncome.push(annualDrawdown / 12)
    }

    // Calculate key metrics
    const results = calculateRetirementMetrics({
      simulation,
      goalSetter,
      income,
      yearsToRetirement
    })

    return {
      success: true,
      simulation,
      metrics: results,
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    return {
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Simulate a single year of investments and growth
 */
function simulateYear({
  year,
  currentSimAge,
  isRetired,
  superBalance,
  etfBalance,
  propertyValue,
  bufferBalance,
  propertyMortgage,
  plannerState
}) {
  const { income, super: superData, portfolio, property, buffers } = plannerState

  // Annual salary (with growth)
  const currentSalary = income.salary * Math.pow(1 + (income.salaryGrowthRate || 0.03), year)
  
  // Check if buffer policy would pause investments
  const monthsOfCoverage = bufferBalance / (income.monthlyExpenses || 5000)
  const pauseInvestments = monthsOfCoverage < buffers.triggerLevel

  let annualSuperContribution = 0
  let annualETFInvestment = 0
  let annualBufferContribution = 0

  if (!isRetired) {
    // Super contributions
    const sgContribution = currentSalary * SG_RATE
    const salaryPackaging = Math.min(superData.salaryPackaging * 12, 27500 - sgContribution) // Respect cap
    annualSuperContribution = sgContribution + salaryPackaging

    // ETF and buffer contributions
    if (pauseInvestments) {
      // Redirect ETF money to buffer
      annualBufferContribution = (portfolio.monthlyInvestment * 12) + (buffers.monthlyContribution * 12)
    } else {
      annualETFInvestment = portfolio.monthlyInvestment * 12
      annualBufferContribution = buffers.monthlyContribution * 12
    }
  }

  // Investment returns
  const superReturn = getSuperReturn(superData.investmentOption, year)
  const etfReturn = getETFReturn(portfolio.etfStrategy, year)
  const propertyGrowthReturn = property.growthRate || 0.07

  // Apply returns and contributions
  const newSuperBalance = (superBalance + annualSuperContribution) * (1 + superReturn) - 
                          (superData.annualFees + (superBalance * superData.investmentFees))
  
  const newETFBalance = (etfBalance + annualETFInvestment) * (1 + etfReturn) - 
                        (etfBalance * portfolio.annualFees)

  const newPropertyValue = propertyValue * (1 + propertyGrowthReturn)

  // Property mortgage reduction (if exists)
  let newPropertyMortgage = propertyMortgage
  if (propertyMortgage > 0 && !isRetired) {
    const monthlyPayment = calculateMortgagePayment(propertyMortgage, 0.06, 25) // Assume 6%, 25yr remaining
    const annualPayment = monthlyPayment * 12
    const interestPaid = propertyMortgage * 0.06
    const principalPaid = annualPayment - interestPaid
    newPropertyMortgage = Math.max(0, propertyMortgage - principalPaid)
  }

  // Buffer with interest
  const bufferInterestRate = getBufferInterestRate(buffers.accountType)
  const newBufferBalance = (bufferBalance + annualBufferContribution) * (1 + bufferInterestRate)

  return {
    endSuperBalance: Math.max(0, newSuperBalance),
    endETFBalance: Math.max(0, newETFBalance),
    endPropertyValue: newPropertyValue,
    endBufferBalance: newBufferBalance,
    endPropertyMortgage: newPropertyMortgage,
    contributions: {
      super: annualSuperContribution,
      etf: annualETFInvestment,
      buffer: annualBufferContribution
    },
    returns: {
      super: superReturn,
      etf: etfReturn,
      property: propertyGrowthReturn
    }
  }
}

/**
 * Get expected super return based on investment option
 */
function getSuperReturn(investmentOption, year) {
  const returns = {
    'HighGrowth': 0.08,
    'Growth': 0.075,
    'Balanced': 0.065,
    'Conservative': 0.05
  }
  
  const baseReturn = returns[investmentOption] || 0.08
  
  // Add some volatility (simplified model)
  const volatility = investmentOption === 'HighGrowth' ? 0.15 : 
                    investmentOption === 'Growth' ? 0.12 : 
                    investmentOption === 'Balanced' ? 0.08 : 0.05
  
  const randomFactor = (Math.random() - 0.5) * volatility
  return Math.max(-0.3, Math.min(0.5, baseReturn + randomFactor))
}

/**
 * Get expected ETF return based on strategy
 */
function getETFReturn(etfStrategy, year) {
  const baseReturn = etfStrategy === 'OneETF' ? 0.08 : 0.08 // Both similar
  const volatility = 0.15 // ETFs are volatile
  
  const randomFactor = (Math.random() - 0.5) * volatility
  return Math.max(-0.4, Math.min(0.6, baseReturn + randomFactor))
}

/**
 * Get buffer account interest rate
 */
function getBufferInterestRate(accountType) {
  const rates = {
    'high-interest': 0.045,
    'term-deposit': 0.05,
    'transaction': 0.01,
    'offset': 0.06
  }
  return rates[accountType] || 0.025
}

/**
 * Calculate mortgage payment (simplified)
 */
function calculateMortgagePayment(principal, annualRate, years) {
  const monthlyRate = annualRate / 12
  const numPayments = years * 12
  
  if (monthlyRate === 0) return principal / numPayments
  
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
         (Math.pow(1 + monthlyRate, numPayments) - 1)
}

/**
 * Calculate current total assets
 */
function calculateCurrentAssets(superData, portfolio, property, buffers) {
  const superBalance = superData.currentBalance
  const etfBalance = portfolio.currentValue
  const propertyEquity = Math.max(0, property.currentValue - property.outstandingMortgage)
  const bufferBalance = buffers.currentAmount
  
  return superBalance + etfBalance + propertyEquity + bufferBalance
}

/**
 * Calculate key retirement metrics
 */
function calculateRetirementMetrics({ simulation, goalSetter, income, yearsToRetirement }) {
  const finalAssets = simulation.totalAssets[simulation.totalAssets.length - 1]
  const finalAnnualIncome = simulation.annualIncome[simulation.annualIncome.length - 1]
  const finalMonthlyIncome = simulation.monthlyIncome[simulation.monthlyIncome.length - 1]
  
  const currentExpenses = (income.monthlyExpenses || 5000) * 12
  const targetIncome = goalSetter.goalType === 'income' 
    ? (goalSetter.targetIncome || currentExpenses)
    : finalAnnualIncome

  const incomeReplacement = (finalAnnualIncome / currentExpenses) * 100
  
  // Calculate if retirement goals are met
  const canRetire = goalSetter.goalType === 'income' 
    ? finalAnnualIncome >= targetIncome
    : finalAssets >= (goalSetter.targetAmount || 1000000)

  // Calculate asset breakdown at retirement
  const retirementIndex = simulation.years.length - 1
  const assetBreakdown = {
    super: simulation.superBalance[retirementIndex],
    etf: simulation.etfPortfolio[retirementIndex],
    property: simulation.propertyValue[retirementIndex],
    buffer: simulation.bufferBalance[retirementIndex]
  }

  // Calculate total contributions made
  const totalContributions = {
    super: 0,
    etf: 0,
    property: 0,
    buffer: 0
  }

  // Simple approximation of total contributions
  totalContributions.super = (income.salary * SG_RATE + (12 * 12)) * yearsToRetirement // Rough estimate
  totalContributions.etf = 12 * 12 * yearsToRetirement // Rough estimate
  
  return {
    canRetire,
    finalAssets,
    finalAnnualIncome,
    finalMonthlyIncome,
    incomeReplacement,
    targetIncome,
    shortfall: Math.max(0, targetIncome - finalAnnualIncome),
    assetBreakdown,
    totalContributions,
    yearsToRetirement,
    projectedRetirementAge: goalSetter.currentAge + yearsToRetirement
  }
}

// Web Worker message handling
self.addEventListener('message', function(e) {
  const { type, payload, id } = e.data
  
  try {
    switch (type) {
      case 'SIMULATE_RETIREMENT':
        const results = runRetirementSimulation(payload)
        self.postMessage({
          type: 'SIMULATION_COMPLETE',
          payload: results,
          id
        })
        break
        
      case 'PING':
        self.postMessage({
          type: 'PONG',
          payload: { status: 'ready' },
          id
        })
        break
        
      default:
        self.postMessage({
          type: 'ERROR',
          payload: { error: `Unknown message type: ${type}` },
          id
        })
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      payload: { error: error.message },
      id
    })
  }
})

// Signal that worker is ready
self.postMessage({
  type: 'WORKER_READY',
  payload: { status: 'initialized' }
})