/**
 * Currency Input Component - Australian dollar formatting
 * Handles number parsing and display with $ symbol
 */

import React, { useState, useCallback, useEffect } from 'react'

interface CurrencyInputProps {
  value: number
  onChange: (value: number) => void
  placeholder?: string
  min?: number
  max?: number
  className?: string
  disabled?: boolean
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  placeholder,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  className = '',
  disabled = false
}) => {
  const [displayValue, setDisplayValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  // Format number for display
  const formatForDisplay = useCallback((num: number): string => {
    if (num === 0) return ''
    return num.toLocaleString()
  }, [])

  // Parse display value back to number
  const parseDisplayValue = useCallback((str: string): number => {
    const cleaned = str.replace(/[,$]/g, '')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : Math.max(min, Math.min(max, parsed))
  }, [min, max])

  // Update display value when prop value changes
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatForDisplay(value))
    }
  }, [value, isFocused, formatForDisplay])

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    // Show raw number when focused for easier editing
    setDisplayValue(value === 0 ? '' : value.toString())
  }, [value])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    const parsedValue = parseDisplayValue(displayValue)
    
    // Update formatted display
    setDisplayValue(formatForDisplay(parsedValue))
    
    // Call onChange if value actually changed
    if (parsedValue !== value) {
      onChange(parsedValue)
    }
  }, [displayValue, value, parseDisplayValue, formatForDisplay, onChange])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setDisplayValue(newValue)

    // If user clears the field, immediately update to 0
    if (newValue === '') {
      onChange(0)
    }
  }, [onChange])

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow digits, backspace, delete, tab, escape, enter
    if (!/[\d\b\t]|Delete|Escape|Enter|ArrowLeft|ArrowRight/.test(e.key)) {
      e.preventDefault()
    }
  }, [])

  const baseClassName = `
    px-4 py-3 border-2 border-gray-200 rounded-lg text-lg 
    focus:border-blue-500 focus:outline-none transition-colors
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
  `.trim()

  return (
    <div className="relative">
      <span className="absolute left-4 top-3 text-lg text-gray-500 pointer-events-none">
        $
      </span>
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        className={`${baseClassName} ${className} pl-10`}
        inputMode="numeric"
      />
    </div>
  )
}