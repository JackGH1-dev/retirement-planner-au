/**
 * Property Step Component - Dedicated step for property planning
 * Supports multiple properties (owner-occupied and investment)
 */

import React, { useState, useEffect } from 'react'
import { createAutoSaver } from '../../utils/scenarioManager'

interface Property {
  id: string
  name: string
  propertyType: 'owner-occupied' | 'investment'
  propertyIntent: 'existing' | 'looking-to-buy'
  value: number
  loanBalance: number
  interestRate: number
  loanType: 'PI' | 'IO'
  remainingLoanTermYears?: number
  monthlyRepayment: number
  purchaseDate?: string
  purchasePrice?: number
  weeklyRent?: number
  managementFee?: number
  councilRates?: number
  insurance?: number
  maintenance?: number
  vacancy?: number
  currentEquity?: number
  grossYield?: number
  netYield?: number
  monthlyCashFlow?: number
  annualGrowthRate?: number
  projectedValue?: number
}

interface PropertyStepProps {
  propertyData: any
  plannerState?: any
  onChange: (data: any) => void
  onComplete: () => void
  onPrevious?: () => void
}

export const PropertyStep: React.FC<PropertyStepProps> = ({
  propertyData,
  plannerState,
  onChange,
  onComplete,
  onPrevious
}) => {
  // Initialize with existing data or create first property
  const initializeProperties = (): Property[] => {
    if (propertyData?.properties && propertyData.properties.length > 0) {
      // Migrate old properties that don't have propertyIntent field
      return propertyData.properties.map((property: any) => ({
        ...property,
        propertyIntent: property.propertyIntent || 'existing' // Default old properties to 'existing'
      }))
    }
    if (propertyData?.hasProperty) {
      // Convert old single property format to new array format
      return [{
        id: '1',
        name: propertyData.propertyType === 'owner-occupied' ? 'Primary Home' : 'Investment Property 1',
        propertyType: propertyData.propertyType || 'investment',
        propertyIntent: 'existing', // Old single property format defaults to existing
        value: propertyData.value || 800000,
        loanBalance: propertyData.loanBalance || 600000,
        interestRate: propertyData.interestRate || 6.5,
        loanType: propertyData.loanType || 'PI',
        monthlyRepayment: propertyData.monthlyRepayment || 4200,
        weeklyRent: propertyData.weeklyRent || 650,
        managementFee: propertyData.managementFee || 7,
        councilRates: propertyData.councilRates || 2500,
        insurance: propertyData.insurance || 800,
        maintenance: propertyData.maintenance || 2000,
        vacancy: propertyData.vacancy || 4
      }]
    }
    return []
  }

  const [properties, setProperties] = useState<Property[]>(initializeProperties())
  const [activePropertyId, setActivePropertyId] = useState<string>(properties.length > 0 ? properties[0].id : '')
  const hasAnyProperty = properties.length > 0

  // Auto-save functionality
  const [autoSaver] = useState(() => createAutoSaver(plannerState, () => {}))
  
  useEffect(() => {
    // Auto-save when planner state changes
    if (plannerState) {
      autoSaver(true)
    }
  }, [plannerState, autoSaver])


  // Generate unique ID for new properties
  const generatePropertyId = () => {
    return `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Add new property
  const addProperty = (type: 'owner-occupied' | 'investment', intent: 'existing' | 'looking-to-buy') => {
    const newId = generatePropertyId()
    const ownerOccupiedCount = properties.filter(p => p.propertyType === 'owner-occupied').length
    const investmentCount = properties.filter(p => p.propertyType === 'investment').length
    
    const defaultName = type === 'owner-occupied' 
      ? (ownerOccupiedCount === 0 ? 'Primary Home' : `Home ${ownerOccupiedCount + 1}`)
      : `Investment Property ${investmentCount + 1}`

    const newProperty: Property = {
      id: newId,
      name: defaultName,
      propertyType: type,
      propertyIntent: intent,
      value: intent === 'existing' ? 800000 : 0, // Existing property has current value, looking-to-buy starts at 0
      loanBalance: intent === 'existing' ? 600000 : 0, // Existing property has loan, looking-to-buy starts at 0
      interestRate: 5.5, // Default to 5.5% as requested
      loanType: 'PI',
      remainingLoanTermYears: intent === 'existing' ? 25 : 30, // Existing has 25 years left, new loan is 30 years
      monthlyRepayment: intent === 'existing' ? Math.round(calculateMonthlyRepayment(600000, 5.5, 25, 'PI')) : 0,
      weeklyRent: type === 'investment' ? (intent === 'existing' ? 650 : 0) : undefined,
      managementFee: type === 'investment' ? 7 : undefined,
      councilRates: type === 'investment' ? 2500 : undefined,
      insurance: type === 'investment' ? 800 : undefined,
      maintenance: type === 'investment' ? 2000 : undefined,
      vacancy: type === 'investment' ? 4 : undefined
    }

    const updatedProperties = [...properties, newProperty]
    setProperties(updatedProperties)
    setActivePropertyId(newId)
  }

  // Remove property
  const removeProperty = (id: string) => {
    const updatedProperties = properties.filter(p => p.id !== id)
    setProperties(updatedProperties)
    
    // Set active property to first remaining property or empty
    if (updatedProperties.length > 0) {
      setActivePropertyId(updatedProperties[0].id)
    } else {
      setActivePropertyId('')
    }
  }

  // Update property
  const updateProperty = (id: string, updates: Partial<Property>) => {
    const updatedProperties = properties.map(p => 
      p.id === id ? { ...p, ...updates } : p
    )
    setProperties(updatedProperties)
  }

  // Get active property
  const activeProperty = properties.find(p => p.id === activePropertyId)

  // Calculate property metrics for active property
  const calculatePropertyMetrics = (property: Property) => {
    if (!property) return {}
    
    const currentEquity = Math.max(0, property.value - property.loanBalance)
    const loanToValue = property.loanBalance > 0 ? (property.loanBalance / property.value * 100) : 0
    
    if (property.propertyType === 'investment' && property.weeklyRent) {
      const annualRent = property.weeklyRent * 52
      const grossYield = property.value > 0 ? (annualRent / property.value * 100) : 0
      
      // Annual expenses
      const annualManagementFee = annualRent * ((property.managementFee || 0) / 100)
      const annualVacancyLoss = annualRent * ((property.vacancy || 0) / 52)
      const totalAnnualExpenses = annualManagementFee + (property.councilRates || 0) + (property.insurance || 0) + (property.maintenance || 0) + annualVacancyLoss
      const netAnnualIncome = annualRent - totalAnnualExpenses
      const netYield = property.value > 0 ? (netAnnualIncome / property.value * 100) : 0

      // Annual loan cost
      const annualInterest = property.loanBalance * (property.interestRate / 100)
      const annualCashFlow = netAnnualIncome - annualInterest
      const monthlyCashFlow = annualCashFlow / 12

      return {
        currentEquity,
        loanToValue,
        annualRent,
        grossYield,
        netYield,
        monthlyCashFlow,
        annualManagementFee,
        annualVacancyLoss,
        totalAnnualExpenses
      }
    }
    
    return { currentEquity, loanToValue }
  }

  const activeMetrics = calculatePropertyMetrics(activeProperty)

  // Calculate total portfolio metrics
  const calculateTotalMetrics = () => {
    let totalEquity = 0
    let totalCashFlow = 0
    let totalPropertyValue = 0
    
    properties.forEach(property => {
      const metrics = calculatePropertyMetrics(property)
      totalEquity += metrics.currentEquity || 0
      totalCashFlow += metrics.monthlyCashFlow || 0
      totalPropertyValue += property.value
    })

    return { totalEquity, totalCashFlow, totalPropertyValue }
  }

  const totalMetrics = calculateTotalMetrics()

  // Borrowing capacity calculation based on Australian serviceability standards
  const calculateBorrowingCapacity = () => {
    if (!plannerState?.incomeExpense || !plannerState?.super) {
      return null
    }

    const salary = plannerState.incomeExpense.salary || 0
    const monthlyExpenses = plannerState.incomeExpense.monthlyExpenses || 0
    const monthlyRent = plannerState.incomeExpense.isRenting ? plannerState.incomeExpense.monthlyRent : 0
    const hasHECS = plannerState.incomeExpense.hasHECS || false
    
    // Calculate net monthly income
    const monthlyGrossIncome = salary / 12
    
    // Correct Australian tax calculation for 2025-26 (ATO rates)
    let annualTax = 0
    if (salary > 18200) {
      if (salary <= 45000) {
        annualTax = (salary - 18200) * 0.16
      } else if (salary <= 135000) {
        annualTax = 4288 + (salary - 45000) * 0.30
      } else if (salary <= 190000) {
        annualTax = 31288 + (salary - 135000) * 0.37
      } else {
        annualTax = 51638 + (salary - 190000) * 0.45
      }
    }
    
    // Add Medicare levy (2%)
    const medicareLevy = salary * 0.02
    const totalAnnualTax = annualTax + medicareLevy
    const monthlyTax = totalAnnualTax / 12
    
    // HECS repayment (simplified - actual rates vary by income)
    const monthlyHECS = hasHECS ? (salary >= 51550 ? monthlyGrossIncome * 0.01 : 0) : 0
    
    // Calculate rental income from investment properties
    let monthlyRentalIncome = 0
    properties.forEach(property => {
      if (property.propertyType === 'investment') {
        if (property.weeklyRent) {
          monthlyRentalIncome += (property.weeklyRent * 52) / 12
        } else {
          // Default assumption: $650/week if no rent specified for investment property
          monthlyRentalIncome += (650 * 52) / 12
        }
      }
    })
    
    // Banks typically assess rental income at 80% (vacancy/management allowance)
    const assessableRentalIncome = monthlyRentalIncome * 0.80
    
    // Net monthly income (including rental income)
    const monthlyNetIncome = monthlyGrossIncome - monthlyTax - monthlyHECS + assessableRentalIncome
    
    // Total monthly expenses (including existing property commitments)
    let totalMonthlyExpenses = monthlyExpenses + monthlyRent
    properties.forEach(property => {
      if (property.monthlyRepayment) {
        totalMonthlyExpenses += property.monthlyRepayment
      }
    })
    
    // Available surplus for new borrowing
    const monthlySurplus = monthlyNetIncome - totalMonthlyExpenses
    
    // Updated serviceability calculations (5.5% current + 3% buffer = 8.5%)
    const currentInterestRate = 0.055  // 5.5% current rate
    const bufferRate = 0.03           // 3% buffer
    const serviceabilityTestRate = currentInterestRate + bufferRate  // 8.5% total
    const maxDebtServiceRatio = 0.35  // Max 35% of net income for all debt service
    
    // Maximum monthly repayment capacity
    const maxMonthlyRepayment = (monthlyNetIncome * maxDebtServiceRatio) - (totalMonthlyExpenses - monthlyRent)
    
    // Convert to borrowing capacity using serviceability rate
    const monthsInYear = 12
    const yearsInLoan = 30
    const monthlyTestRate = serviceabilityTestRate / 12
    const totalPayments = yearsInLoan * monthsInYear
    
    // Calculate loan capacity using standard mortgage formula
    const borrowingCapacity = maxMonthlyRepayment > 0 ? 
      (maxMonthlyRepayment * (1 - Math.pow(1 + monthlyTestRate, -totalPayments))) / monthlyTestRate : 0
    
    // Debt-to-income ratio check (max 6-7x gross income)
    const maxDebtToIncomeRatio = 6.5
    const maxBorrowingByDTI = salary * maxDebtToIncomeRatio
    
    // Use the more conservative of the two calculations
    const finalBorrowingCapacity = Math.min(Math.max(0, borrowingCapacity), maxBorrowingByDTI)
    
    return {
      monthlyNetIncome,
      monthlyRentalIncome,
      assessableRentalIncome,
      monthlySurplus,
      maxMonthlyRepayment,
      borrowingCapacity: finalBorrowingCapacity,
      maxBorrowingByDTI,
      serviceabilityTestRate,
      currentInterestRate,
      bufferRate,
      debtToIncomeRatio: (salary > 0 ? (totalMonthlyExpenses * 12) / salary : 0),
      recommendation: finalBorrowingCapacity > 300000 ? 'Strong' : 
                     finalBorrowingCapacity > 150000 ? 'Moderate' : 'Limited'
    }
  }

  const borrowingCapacity = calculateBorrowingCapacity()

  // Calculate monthly loan repayment
  const calculateMonthlyRepayment = (loanBalance: number, interestRate: number, loanTermYears: number, loanType: 'PI' | 'IO') => {
    if (!loanBalance || !interestRate || !loanTermYears) return 0
    
    const monthlyRate = interestRate / 100 / 12
    const totalPayments = loanTermYears * 12
    
    if (loanType === 'IO') {
      // Interest Only: just the monthly interest
      return loanBalance * monthlyRate
    } else {
      // Principal & Interest: standard mortgage formula
      if (monthlyRate === 0) return loanBalance / totalPayments
      return loanBalance * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1)
    }
  }

  // Auto-update monthly repayment when loan details change
  const updatePropertyWithRepayment = (propertyId: string, updates: Partial<Property>) => {
    const property = properties.find(p => p.id === propertyId)
    if (!property) return

    const updatedProperty = { ...property, ...updates }
    
    // Auto-calculate repayment if we have all required fields
    if (updatedProperty.loanBalance && updatedProperty.interestRate && updatedProperty.remainingLoanTermYears) {
      const calculatedRepayment = calculateMonthlyRepayment(
        updatedProperty.loanBalance,
        updatedProperty.interestRate,
        updatedProperty.remainingLoanTermYears,
        updatedProperty.loanType
      )
      updatedProperty.monthlyRepayment = Math.round(calculatedRepayment)
    }
    
    updateProperty(propertyId, updatedProperty)
  }

  // Calculate historical and projected equity growth
  const calculateEquityGrowth = (property: Property) => {
    if (!property.purchaseDate || !property.purchasePrice) {
      return {
        historicalGrowthRate: 0,
        yearsOwned: 0,
        totalGrowth: 0,
        annualizedGrowthRate: 0,
        projectedRetirementValue: property.value
      }
    }

    const purchaseDate = new Date(property.purchaseDate)
    const currentDate = new Date()
    const retirementAge = plannerState?.goal?.retirementAge || 65
    const currentAge = plannerState?.goal?.currentAge || 30
    const yearsToRetirement = retirementAge - currentAge
    
    // Calculate years owned (in decimal)
    const yearsOwned = (currentDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    
    if (yearsOwned <= 0) {
      return {
        historicalGrowthRate: 0,
        yearsOwned: 0,
        totalGrowth: 0,
        annualizedGrowthRate: 0,
        projectedRetirementValue: property.value
      }
    }

    // Historical growth calculation
    const totalGrowth = property.value - property.purchasePrice
    const totalGrowthPercentage = (totalGrowth / property.purchasePrice) * 100
    const annualizedGrowthRate = Math.pow(property.value / property.purchasePrice, 1 / yearsOwned) - 1

    // Use user-defined growth rate or historical rate (capped at reasonable limits)
    const futureGrowthRate = property.annualGrowthRate || Math.min(Math.max(annualizedGrowthRate, 0.02), 0.08) // 2-8% cap
    
    // Project future value to retirement
    const projectedRetirementValue = property.value * Math.pow(1 + futureGrowthRate, yearsToRetirement)

    return {
      historicalGrowthRate: annualizedGrowthRate,
      yearsOwned,
      totalGrowth,
      totalGrowthPercentage,
      annualizedGrowthRate,
      futureGrowthRate,
      projectedRetirementValue,
      yearsToRetirement
    }
  }

  // Borrowing Capacity Insights Panel Component
  const BorrowingCapacityPanel = () => {
    if (!borrowingCapacity) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💰 Borrowing Capacity</h3>
          <p className="text-blue-700 text-sm">Complete Step 2 (Current Financials) to see your estimated borrowing capacity.</p>
        </div>
      )
    }

    const {
      monthlyNetIncome,
      monthlyRentalIncome,
      assessableRentalIncome,
      monthlySurplus,
      maxMonthlyRepayment,
      borrowingCapacity: capacity,
      recommendation,
      debtToIncomeRatio,
      serviceabilityTestRate,
      currentInterestRate,
      bufferRate
    } = borrowingCapacity

    const recommendationColor = recommendation === 'Strong' ? 'green' : 
                               recommendation === 'Moderate' ? 'yellow' : 'red'

    return (
      <div className={`border border-${recommendationColor}-200 rounded-lg p-4 mb-6`} 
           style={{ backgroundColor: `${recommendationColor === 'green' ? 'rgb(240, 253, 244)' : 
                                      recommendationColor === 'yellow' ? 'rgb(254, 252, 232)' : 'rgb(254, 242, 242)'}` }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">💰</span>
          <h3 className={`font-semibold ${recommendationColor === 'green' ? 'text-green-900' : 
                                         recommendationColor === 'yellow' ? 'text-yellow-900' : 'text-red-900'}`}>
            Estimated Borrowing Capacity
          </h3>
          <span className={`px-2 py-1 text-xs rounded-full ${recommendationColor === 'green' ? 'bg-green-100 text-green-800' : 
                                                             recommendationColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
            {recommendation}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-2xl font-bold text-gray-900">${capacity.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Maximum loan amount</div>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-2xl font-bold text-gray-900">${Math.round(maxMonthlyRepayment).toLocaleString()}</div>
            <div className="text-sm text-gray-600">Max monthly repayment</div>
          </div>
        </div>

        <div className="text-xs text-gray-600 space-y-1">
          <div><strong>Assessment Details:</strong></div>
          <div>• Net monthly income: ${Math.round(monthlyNetIncome).toLocaleString()}</div>
          {monthlyRentalIncome > 0 && (
            <div>• Rental income: ${Math.round(monthlyRentalIncome).toLocaleString()}/month (${Math.round(assessableRentalIncome).toLocaleString()} assessable at 80%)</div>
          )}
          <div>• Monthly surplus: ${Math.round(monthlySurplus).toLocaleString()}</div>
          <div>• Debt-to-income ratio: {(debtToIncomeRatio * 100).toFixed(1)}%</div>
          <div>• Serviceability test: {(currentInterestRate * 100).toFixed(1)}% current + {(bufferRate * 100).toFixed(1)}% buffer = {(serviceabilityTestRate * 100).toFixed(1)}%</div>
        </div>
        
        <div className={`mt-3 p-2 rounded text-xs ${recommendationColor === 'green' ? 'bg-green-50' : 
                                                    recommendationColor === 'yellow' ? 'bg-yellow-50' : 'bg-red-50'}`}>
          <strong>Note:</strong> This is an estimate based on typical Australian bank criteria. 
          Actual borrowing capacity varies by lender and includes credit history, employment stability, 
          and other factors. Consider speaking with a mortgage broker for personalized advice.
        </div>
      </div>
    )
  }

  const handleComplete = () => {
    // Calculate metrics for all properties
    const propertiesWithMetrics = properties.map(property => ({
      ...property,
      ...calculatePropertyMetrics(property)
    }))

    const propertyData = {
      hasProperty: hasAnyProperty,
      properties: propertiesWithMetrics,
      totalEquity: totalMetrics.totalEquity,
      totalMonthlyCashFlow: totalMetrics.totalCashFlow,
      totalPropertyValue: totalMetrics.totalPropertyValue,
      // Backward compatibility - use first property for old single-property format
      ...(propertiesWithMetrics.length > 0 ? {
        propertyType: propertiesWithMetrics[0].propertyType,
        value: propertiesWithMetrics[0].value,
        loanBalance: propertiesWithMetrics[0].loanBalance,
        interestRate: propertiesWithMetrics[0].interestRate,
        loanType: propertiesWithMetrics[0].loanType,
        monthlyRepayment: propertiesWithMetrics[0].monthlyRepayment,
        weeklyRent: propertiesWithMetrics[0].weeklyRent || 0,
        managementFee: propertiesWithMetrics[0].managementFee || 0,
        councilRates: propertiesWithMetrics[0].councilRates || 0,
        insurance: propertiesWithMetrics[0].insurance || 0,
        maintenance: propertiesWithMetrics[0].maintenance || 0,
        vacancy: propertiesWithMetrics[0].vacancy || 0,
        currentEquity: propertiesWithMetrics[0].currentEquity || 0,
        grossYield: propertiesWithMetrics[0].grossYield || 0,
        netYield: propertiesWithMetrics[0].netYield || 0,
        monthlyCashFlow: propertiesWithMetrics[0].monthlyCashFlow || 0
      } : {})
    }
    
    onChange(propertyData)
    onComplete()
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Property in your retirement plan</h2>
      <p className="text-gray-600 mb-6">Property can be a significant part of your wealth. Add multiple properties to get the complete picture.</p>
      
      {/* Add Property Section - Moved to Top */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
        <div className="text-center mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">
            {hasAnyProperty ? 'Add Another Property' : 'Add Your First Property'}
          </h3>
          <p className="text-sm text-gray-600">Choose your property type and whether it's existing or you're looking to buy</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Existing Property */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-center mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🏠</span>
              </div>
              <h4 className="font-medium text-gray-900">Existing Property</h4>
              <p className="text-xs text-gray-600">Property you already own</p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => addProperty('owner-occupied', 'existing')}
                className="w-full py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                + Add Existing Home
              </button>
              <button
                onClick={() => addProperty('investment', 'existing')}
                className="w-full py-2 px-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                + Add Existing Investment
              </button>
            </div>
          </div>

          {/* Looking to Buy */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-center mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🔍</span>
              </div>
              <h4 className="font-medium text-gray-900">Looking to Buy</h4>
              <p className="text-xs text-gray-600">Property you want to purchase</p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => addProperty('owner-occupied', 'looking-to-buy')}
                className="w-full py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                + Plan New Home Purchase
              </button>
              <button
                onClick={() => addProperty('investment', 'looking-to-buy')}
                className="w-full py-2 px-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                + Plan Investment Purchase
              </button>
            </div>
          </div>
        </div>
        
        {!hasAnyProperty && (
          <div className="text-center mt-4">
            <button
              onClick={() => {}}
              className="text-gray-600 hover:text-gray-800 font-medium text-sm underline"
            >
              Skip - I don't own any property
            </button>
          </div>
        )}
      </div>

      {/* Borrowing Capacity Insights - Only for 'looking-to-buy' properties */}
      {properties.some(p => p.propertyIntent === 'looking-to-buy') && <BorrowingCapacityPanel />}
      
      <div className="space-y-8">
        {/* Property Portfolio Overview */}
        {hasAnyProperty && (
          <div className="bg-blue-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-blue-900">Your Property Portfolio</h3>
              <div className="text-sm text-blue-700">
                {properties.length} {properties.length === 1 ? 'property' : 'properties'}
              </div>
            </div>
            
            {/* Portfolio Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <div className="text-sm text-gray-600">Total Property Value</div>
                <div className="text-lg font-bold text-blue-900">${totalMetrics.totalPropertyValue.toLocaleString()}</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <div className="text-sm text-gray-600">Total Equity</div>
                <div className="text-lg font-bold text-blue-900">${totalMetrics.totalEquity.toLocaleString()}</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <div className="text-sm text-gray-600">Monthly Cash Flow</div>
                <div className={`text-lg font-bold ${totalMetrics.totalCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalMetrics.totalCashFlow >= 0 ? '+' : ''}${totalMetrics.totalCashFlow.toFixed(0)}
                </div>
              </div>
            </div>

            {/* Property Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              {properties.map((property) => (
                <button
                  key={property.id}
                  onClick={() => setActivePropertyId(property.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activePropertyId === property.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-100'
                  }`}
                >
                  {property.propertyType === 'owner-occupied' ? '🏠' : '🏘️'} {property.name}
                  <span className="ml-2 text-xs opacity-75">
                    ({property.propertyIntent === 'existing' ? 'Existing' : 'Looking to Buy'})
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}


        {/* Active Property Details */}
        {activeProperty && (
          <div className="space-y-6">
            {/* Property Header with Name and Remove Button */}
            <div className={`rounded-xl p-6 ${activeProperty.propertyType === 'owner-occupied' ? 'bg-blue-50' : 'bg-green-50'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={`font-semibold mb-2 ${activeProperty.propertyType === 'owner-occupied' ? 'text-blue-900' : 'text-green-900'}`}>
                    {activeProperty.propertyType === 'owner-occupied' ? '🏠' : '🏘️'} {activeProperty.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={activeProperty.name}
                      onChange={(e) => updateProperty(activeProperty.id, { name: e.target.value })}
                      className="bg-white border border-gray-300 rounded px-3 py-1 text-sm font-medium"
                      placeholder="Property name"
                    />
                    <span className={`text-xs px-2 py-1 rounded ${
                      activeProperty.propertyType === 'owner-occupied' 
                        ? 'bg-blue-200 text-blue-800' 
                        : 'bg-green-200 text-green-800'
                    }`}>
                      {activeProperty.propertyType === 'owner-occupied' ? 'Home' : 'Investment'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      activeProperty.propertyIntent === 'existing' 
                        ? 'bg-gray-200 text-gray-800' 
                        : 'bg-purple-200 text-purple-800'
                    }`}>
                      {activeProperty.propertyIntent === 'existing' ? '✅ Existing' : '🔍 Looking to Buy'}
                    </span>
                  </div>
                  {activeProperty.propertyIntent === 'looking-to-buy' && (
                    <div className="text-xs text-purple-700 bg-purple-100 px-3 py-2 rounded-lg">
                      💡 This property is for planning purposes. Enter target values to see borrowing requirements and projections.
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeProperty(activeProperty.id)}
                  className="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  title="Remove this property"
                >
                  🗑️ Remove
                </button>
              </div>
            </div>

            {/* Property Value & Purchase History */}
            <div className="bg-purple-50 rounded-xl p-6">
              <h3 className="font-semibold text-purple-900 mb-2">
                🏡 Property Value & History
                {activeProperty.propertyIntent === 'looking-to-buy' && (
                  <span className="ml-2 text-sm font-normal text-purple-700">(Target Property)</span>
                )}
              </h3>
              <p className="text-purple-700 text-sm mb-4">
                {activeProperty.propertyIntent === 'existing' 
                  ? 'Current value and purchase history for equity growth analysis'
                  : 'Target property value and expected purchase details for planning'
                }
              </p>
              
              {/* Current Property Value */}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
                <div>
                  <label className="form-label">
                    {activeProperty.propertyIntent === 'existing' ? 'Current property value' : 'Target property value'}
                  </label>
                  <div className="relative">
                    <span className="form-currency-symbol">$</span>
                    <input
                      type="number"
                      value={activeProperty.value}
                      onChange={(e) => updateProperty(activeProperty.id, { value: parseInt(e.target.value) || 0 })}
                      className="form-input-currency-large"
                      placeholder="800,000"
                    />
                  </div>
                </div>
              </div>

              {/* Purchase History */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">
                    Purchase date (optional)
                  </label>
                  <input
                    type="date"
                    value={activeProperty.purchaseDate || ''}
                    onChange={(e) => updateProperty(activeProperty.id, { purchaseDate: e.target.value })}
                    className="form-input"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="form-label">
                    Purchase price (optional)
                  </label>
                  <div className="relative">
                    <span className="form-currency-symbol">$</span>
                    <input
                      type="number"
                      value={activeProperty.purchasePrice || ''}
                      onChange={(e) => updateProperty(activeProperty.id, { purchasePrice: parseInt(e.target.value) || undefined })}
                      className="form-input-currency-large"
                      placeholder="650,000"
                    />
                  </div>
                </div>
              </div>

              {/* Equity Growth Insights */}
              {activeProperty.purchaseDate && activeProperty.purchasePrice && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-900 mb-3">📊 Equity Growth Analysis</h4>
                  {(() => {
                    const growth = calculateEquityGrowth(activeProperty)
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Years owned</div>
                          <div className="font-bold text-purple-900">{growth.yearsOwned.toFixed(1)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Total growth</div>
                          <div className="font-bold text-green-600">
                            +${growth.totalGrowth.toLocaleString()} ({growth.totalGrowthPercentage?.toFixed(1)}%)
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Annual growth rate</div>
                          <div className="font-bold text-blue-600">{(growth.annualizedGrowthRate * 100).toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Projected retirement value</div>
                          <div className="font-bold text-purple-600">${(growth.projectedRetirementValue / 1000000).toFixed(1)}M</div>
                        </div>
                      </div>
                    )
                  })()}
                  
                  <div className="mt-3 p-2 bg-purple-50 rounded text-xs text-purple-700">
                    <strong>Future Growth Assumption:</strong> Based on historical performance, we're projecting {((calculateEquityGrowth(activeProperty).futureGrowthRate) * 100).toFixed(1)}% annual growth to retirement.
                    You can adjust this below if you prefer different assumptions.
                  </div>
                </div>
              )}

              {/* Custom Growth Rate Input */}
              <div className="mt-4">
                <label className="form-label">
                  Custom annual growth rate (optional)
                  <span className="text-gray-500 text-sm ml-1">- Override default assumptions</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={activeProperty.annualGrowthRate ? (activeProperty.annualGrowthRate * 100).toFixed(1) : ''}
                    onChange={(e) => updateProperty(activeProperty.id, { 
                      annualGrowthRate: e.target.value ? parseFloat(e.target.value) / 100 : undefined 
                    })}
                    className="form-input pr-8"
                    placeholder="5.0"
                    min="0"
                    max="15"
                    step="0.1"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
                </div>
              </div>
            </div>

            {/* Loan Details */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                💰 Loan Details
                {activeProperty.propertyIntent === 'looking-to-buy' && (
                  <span className="ml-2 text-sm font-normal text-gray-600">(Planned Loan)</span>
                )}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {activeProperty.propertyIntent === 'existing' 
                  ? 'Current loan information for repayment calculations'
                  : 'Planned loan details for borrowing capacity and repayment projections'
                }
              </p>

              {/* Loan Balance and Term */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="form-label">
                    {activeProperty.propertyIntent === 'existing' ? 'Current loan balance' : 'Planned loan amount'}
                  </label>
                  <div className="relative">
                    <span className="form-currency-symbol">$</span>
                    <input
                      type="number"
                      value={activeProperty.loanBalance}
                      onChange={(e) => updatePropertyWithRepayment(activeProperty.id, { loanBalance: parseInt(e.target.value) || 0 })}
                      className="form-input-currency-large"
                      placeholder={activeProperty.propertyIntent === 'existing' ? '600,000' : '640,000'}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">
                    {activeProperty.propertyIntent === 'existing' ? 'Remaining loan term' : 'Planned loan term'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={activeProperty.remainingLoanTermYears || ''}
                      onChange={(e) => updatePropertyWithRepayment(activeProperty.id, { remainingLoanTermYears: parseInt(e.target.value) || undefined })}
                      className="form-input pr-16"
                      placeholder={activeProperty.propertyIntent === 'existing' ? '25' : '30'}
                      min="1"
                      max="40"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">years</span>
                  </div>
                </div>
              </div>

              {/* Interest Rate and Loan Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="form-label">
                    Interest rate
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={activeProperty.interestRate}
                      onChange={(e) => updatePropertyWithRepayment(activeProperty.id, { interestRate: parseFloat(e.target.value) || 0 })}
                      className="form-input pr-8"
                      placeholder="5.5"
                      min="0"
                      max="15"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                  </div>
                </div>

                <div>
                  <label className="form-label">
                    Loan type
                  </label>
                  <select
                    value={activeProperty.loanType}
                    onChange={(e) => updatePropertyWithRepayment(activeProperty.id, { loanType: e.target.value as 'PI' | 'IO' })}
                    className="form-select"
                  >
                    <option value="PI">Principal & Interest</option>
                    <option value="IO">Interest Only</option>
                  </select>
                </div>
              </div>

              {/* Auto-calculated Monthly Repayment */}
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="form-label">
                    Monthly repayment
                    <span className="text-gray-500 text-sm ml-1">- Auto-calculated</span>
                  </label>
                  <div className="relative">
                    <span className="form-currency-symbol">$</span>
                    <input
                      type="number"
                      value={activeProperty.monthlyRepayment}
                      onChange={(e) => updateProperty(activeProperty.id, { monthlyRepayment: parseInt(e.target.value) || 0 })}
                      className="form-input-currency bg-blue-50 border-blue-200"
                      placeholder="Auto-calculated"
                      title="This is auto-calculated based on loan balance, term, and interest rate. You can override manually if needed."
                    />
                  </div>
                  {activeProperty.loanBalance && activeProperty.interestRate && activeProperty.remainingLoanTermYears && (
                    <div className="mt-2 text-xs text-blue-600">
                      ✓ Based on ${activeProperty.loanBalance.toLocaleString()} over {activeProperty.remainingLoanTermYears} years at {activeProperty.interestRate}% ({activeProperty.loanType})
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Investment Property Income & Expenses */}
            {activeProperty.propertyType === 'investment' && (
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="font-semibold text-green-900 mb-4">🏘️ Investment property income & costs</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="form-label">
                      Weekly rent
                    </label>
                    <div className="relative">
                      <span className="form-currency-symbol">$</span>
                      <input
                        type="number"
                        value={activeProperty.weeklyRent || 650}
                        onChange={(e) => updateProperty(activeProperty.id, { weeklyRent: parseInt(e.target.value) || 0 })}
                        className="form-input-currency"
                        placeholder="650"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Annual: ${((activeProperty.weeklyRent || 0) * 52).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="form-label">
                      Management fee
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={activeProperty.managementFee || 7}
                        onChange={(e) => updateProperty(activeProperty.id, { managementFee: parseFloat(e.target.value) || 0 })}
                        className="form-input-currency"
                        placeholder="7"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Annual: ${Math.round((activeMetrics.annualManagementFee || 0)).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="form-label">
                      Council rates
                    </label>
                    <div className="relative">
                      <span className="form-currency-symbol">$</span>
                      <input
                        type="number"
                        value={activeProperty.councilRates || 2500}
                        onChange={(e) => updateProperty(activeProperty.id, { councilRates: parseInt(e.target.value) || 0 })}
                        className="form-input-currency"
                        placeholder="2,500"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Per year</p>
                  </div>

                  <div>
                    <label className="form-label">
                      Insurance
                    </label>
                    <div className="relative">
                      <span className="form-currency-symbol">$</span>
                      <input
                        type="number"
                        value={activeProperty.insurance || 800}
                        onChange={(e) => updateProperty(activeProperty.id, { insurance: parseInt(e.target.value) || 0 })}
                        className="form-input-currency"
                        placeholder="800"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Per year</p>
                  </div>

                  <div>
                    <label className="form-label">
                      Maintenance
                    </label>
                    <div className="relative">
                      <span className="form-currency-symbol">$</span>
                      <input
                        type="number"
                        value={activeProperty.maintenance || 2000}
                        onChange={(e) => updateProperty(activeProperty.id, { maintenance: parseInt(e.target.value) || 0 })}
                        className="form-input-currency"
                        placeholder="2,000"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Per year</p>
                  </div>

                  <div>
                    <label className="form-label">
                      Vacancy
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={activeProperty.vacancy || 4}
                        onChange={(e) => updateProperty(activeProperty.id, { vacancy: parseInt(e.target.value) || 0 })}
                        className="form-input-currency"
                        placeholder="4"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">weeks</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Per year</p>
                  </div>
                </div>

                {/* Property Summary */}
                <div className="mt-6 p-4 bg-white rounded-lg border-2 border-green-200">
                  <h4 className="font-medium text-green-900 mb-3">Property investment summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Current equity</div>
                      <div className="font-bold text-green-700">${(activeMetrics.currentEquity || 0).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">LVR</div>
                      <div className="font-bold text-green-700">{(activeMetrics.loanToValue || 0).toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Gross yield</div>
                      <div className="font-bold text-green-700">{(activeMetrics.grossYield || 0).toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Net yield</div>
                      <div className="font-bold text-green-700">{(activeMetrics.netYield || 0).toFixed(1)}%</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Monthly cash flow:</span>
                      <span className={`font-bold ${(activeMetrics.monthlyCashFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(activeMetrics.monthlyCashFlow || 0) >= 0 ? '+' : ''}${(activeMetrics.monthlyCashFlow || 0).toFixed(0)}/month
                      </span>
                    </div>
                    {(activeMetrics.monthlyCashFlow || 0) < 0 && (
                      <p className="text-xs text-red-600 mt-1">
                        This property requires ${Math.abs(activeMetrics.monthlyCashFlow || 0).toFixed(0)}/month contribution
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between pt-6 border-t">
          {onPrevious && (
            <button
              onClick={onPrevious}
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
            >
              ← Previous
            </button>
          )}
          <button
            onClick={handleComplete}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors ml-auto"
          >
            {hasAnyProperty ? 'Next: Review your strategy →' : 'Next: Review your strategy →'}
          </button>
        </div>
      </div>
    </div>
  )
}