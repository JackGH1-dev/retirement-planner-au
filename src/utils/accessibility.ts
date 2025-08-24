/**
 * Accessibility utilities for the retirement planner
 * Provides screen reader support, keyboard navigation, and WCAG compliance
 */

/**
 * Announce changes to screen readers
 */
export const announceToScreenReader = (message: string): void => {
  // Create temporary element for screen reader announcement
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Announce urgent changes to screen readers
 */
export const announceUrgent = (message: string): void => {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', 'assertive')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Focus management for wizard steps
 */
export const focusElement = (selector: string, fallback?: string): void => {
  const element = document.querySelector(selector) as HTMLElement
  if (element && element.focus) {
    element.focus()
    return
  }
  
  // Try fallback
  if (fallback) {
    const fallbackElement = document.querySelector(fallback) as HTMLElement
    if (fallbackElement && fallbackElement.focus) {
      fallbackElement.focus()
    }
  }
}

/**
 * Trap focus within a modal or dialog
 */
export class FocusTrap {
  private element: HTMLElement
  private focusableElements: NodeListOf<HTMLElement>
  private firstFocusableElement: HTMLElement
  private lastFocusableElement: HTMLElement
  private previouslyFocusedElement: HTMLElement | null

  constructor(element: HTMLElement) {
    this.element = element
    this.previouslyFocusedElement = document.activeElement as HTMLElement
    
    const focusableSelector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ')
    
    this.focusableElements = element.querySelectorAll(focusableSelector)
    this.firstFocusableElement = this.focusableElements[0]
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1]
  }

  activate(): void {
    this.element.addEventListener('keydown', this.handleKeyDown)
    
    // Focus first element
    if (this.firstFocusableElement) {
      this.firstFocusableElement.focus()
    }
  }

  deactivate(): void {
    this.element.removeEventListener('keydown', this.handleKeyDown)
    
    // Return focus to previously focused element
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus()
    }
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === this.firstFocusableElement) {
          event.preventDefault()
          this.lastFocusableElement.focus()
        }
      } else {
        // Tab
        if (document.activeElement === this.lastFocusableElement) {
          event.preventDefault()
          this.firstFocusableElement.focus()
        }
      }
    } else if (event.key === 'Escape') {
      // Allow escape key handling by parent
      event.stopPropagation()
    }
  }
}

/**
 * Add skip links for keyboard navigation
 */
export const addSkipLinks = (): void => {
  const skipLinksContainer = document.createElement('div')
  skipLinksContainer.className = 'skip-links'
  skipLinksContainer.innerHTML = `
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <a href="#planner-form" class="skip-link">Skip to planner form</a>
    <a href="#results" class="skip-link">Skip to results</a>
  `
  
  // Insert at beginning of body
  document.body.insertBefore(skipLinksContainer, document.body.firstChild)
}

/**
 * Validate form accessibility
 */
export const validateFormAccessibility = (form: HTMLFormElement): string[] => {
  const issues: string[] = []
  
  // Check for labels
  const inputs = form.querySelectorAll('input, textarea, select')
  inputs.forEach((input, index) => {
    const id = input.getAttribute('id')
    const ariaLabel = input.getAttribute('aria-label')
    const ariaLabelledBy = input.getAttribute('aria-labelledby')
    
    if (!id || (!ariaLabel && !ariaLabelledBy)) {
      const label = form.querySelector(`label[for="${id}"]`)
      if (!label) {
        issues.push(`Input ${index + 1} missing proper label`)
      }
    }
  })
  
  // Check for fieldsets in groups
  const radioGroups = form.querySelectorAll('input[type="radio"]')
  const radioGroupNames = new Set<string>()
  radioGroups.forEach(radio => {
    const name = radio.getAttribute('name')
    if (name) radioGroupNames.add(name)
  })
  
  radioGroupNames.forEach(groupName => {
    const radios = form.querySelectorAll(`input[type="radio"][name="${groupName}"]`)
    if (radios.length > 1) {
      const fieldset = (radios[0] as Element).closest('fieldset')
      if (!fieldset) {
        issues.push(`Radio group "${groupName}" missing fieldset`)
      }
    }
  })
  
  // Check for required field indicators
  const requiredFields = form.querySelectorAll('[required]')
  requiredFields.forEach((field, index) => {
    const ariaRequired = field.getAttribute('aria-required')
    if (!ariaRequired) {
      issues.push(`Required field ${index + 1} missing aria-required`)
    }
  })
  
  return issues
}

/**
 * Add live region for dynamic content updates
 */
export const createLiveRegion = (id: string, politeness: 'polite' | 'assertive' = 'polite'): HTMLElement => {
  let liveRegion = document.getElementById(id)
  
  if (!liveRegion) {
    liveRegion = document.createElement('div')
    liveRegion.id = id
    liveRegion.setAttribute('aria-live', politeness)
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.className = 'sr-only'
    document.body.appendChild(liveRegion)
  }
  
  return liveRegion
}

/**
 * Update live region content
 */
export const updateLiveRegion = (id: string, message: string): void => {
  const liveRegion = document.getElementById(id)
  if (liveRegion) {
    liveRegion.textContent = message
  }
}

/**
 * Format currency for screen readers
 */
export const formatCurrencyForScreenReader = (amount: number): string => {
  if (amount === 0) return 'zero dollars'
  
  const formatted = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
  
  // Make it more natural for screen readers
  return formatted
    .replace('$', 'dollars ')
    .replace(',', ' thousand ')
    .replace('000', '')
    .trim()
}

/**
 * Format percentage for screen readers
 */
export const formatPercentageForScreenReader = (percent: number): string => {
  return `${percent.toFixed(1)} percent`
}

/**
 * Add progress indicators for multi-step forms
 */
export const updateStepProgress = (currentStep: number, totalSteps: number, stepName: string): void => {
  const progressText = `Step ${currentStep} of ${totalSteps}: ${stepName}`
  
  // Update page title
  document.title = `${progressText} - Retirement Planner`
  
  // Update progress indicator
  let progressIndicator = document.getElementById('step-progress')
  if (!progressIndicator) {
    progressIndicator = createLiveRegion('step-progress', 'polite')
  }
  
  updateLiveRegion('step-progress', progressText)
  
  // Update progress bar aria-valuenow
  const progressBar = document.querySelector('[role="progressbar"]')
  if (progressBar) {
    progressBar.setAttribute('aria-valuenow', currentStep.toString())
    progressBar.setAttribute('aria-valuemax', totalSteps.toString())
    progressBar.setAttribute('aria-valuetext', progressText)
  }
}

/**
 * Add keyboard shortcuts
 */
export const addKeyboardShortcuts = (): void => {
  document.addEventListener('keydown', (event) => {
    // Alt + number keys for step navigation
    if (event.altKey && event.key >= '1' && event.key <= '4') {
      event.preventDefault()
      const stepNumber = parseInt(event.key)
      const stepButton = document.querySelector(`[data-step="${stepNumber}"]`) as HTMLElement
      if (stepButton && stepButton.click) {
        stepButton.click()
        announceToScreenReader(`Navigated to step ${stepNumber}`)
      }
    }
    
    // Ctrl + S to save (if available)
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault()
      const saveButton = document.querySelector('[data-action="save"]') as HTMLElement
      if (saveButton && saveButton.click) {
        saveButton.click()
        announceToScreenReader('Saving your plan')
      }
    }
    
    // Ctrl + E to export (if available)
    if (event.ctrlKey && event.key === 'e') {
      event.preventDefault()
      const exportButton = document.querySelector('[data-action="export"]') as HTMLElement
      if (exportButton && exportButton.click) {
        exportButton.click()
        announceToScreenReader('Exporting your plan')
      }
    }
  })
}

/**
 * Enhance error messages for accessibility
 */
export const enhanceErrorMessage = (
  inputId: string,
  errorMessage: string,
  errorId?: string
): void => {
  const input = document.getElementById(inputId)
  if (!input) return
  
  const finalErrorId = errorId || `${inputId}-error`
  
  // Create or update error element
  let errorElement = document.getElementById(finalErrorId)
  if (!errorElement) {
    errorElement = document.createElement('div')
    errorElement.id = finalErrorId
    errorElement.className = 'error-message'
    errorElement.setAttribute('role', 'alert')
    errorElement.setAttribute('aria-atomic', 'true')
    
    // Insert after input
    input.parentNode?.insertBefore(errorElement, input.nextSibling)
  }
  
  errorElement.textContent = errorMessage
  
  // Link input to error
  input.setAttribute('aria-describedby', finalErrorId)
  input.setAttribute('aria-invalid', 'true')
  
  // Announce error
  announceUrgent(`Error: ${errorMessage}`)
}

/**
 * Clear error state
 */
export const clearErrorState = (inputId: string): void => {
  const input = document.getElementById(inputId)
  if (!input) return
  
  input.removeAttribute('aria-invalid')
  
  const errorId = input.getAttribute('aria-describedby')
  if (errorId) {
    const errorElement = document.getElementById(errorId)
    if (errorElement) {
      errorElement.remove()
    }
    input.removeAttribute('aria-describedby')
  }
}