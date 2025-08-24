/**
 * Progressive Disclosure Component
 * Shows/hides advanced options to keep UI beginner-friendly
 */

import React from 'react'

interface ProgressiveDisclosureProps {
  title: string
  subtitle?: string
  isExpanded: boolean
  onToggle: (expanded: boolean) => void
  children: React.ReactNode
}

export const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({
  title,
  subtitle,
  isExpanded,
  onToggle,
  children
}) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => onToggle(!isExpanded)}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-left"
      >
        <div>
          <div className="font-medium text-gray-700">{title}</div>
          {subtitle && (
            <div className="text-sm text-gray-500 mt-1">{subtitle}</div>
          )}
        </div>
        <div className={`transform transition-transform duration-200 ${
          isExpanded ? 'rotate-180' : 'rotate-0'
        }`}>
          <svg 
            className="w-5 h-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 9l-7 7-7-7" 
            />
          </svg>
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  )
}