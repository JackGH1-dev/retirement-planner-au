# Styling Guidelines for Australian Retirement Calculator

## 🎨 Design System Overview

This document establishes styling standards to prevent contrast issues and ensure WCAG 2.2 Level AA compliance for all future features.

## ✅ Fixed Contrast Issues

### **Problem Identified**
- Input fields had dark backgrounds with dark text (poor contrast ratios)
- Inconsistent styling across form components
- Missing accessibility standards

### **Solution Implemented**
- Created essential CSS classes with guaranteed 4.5:1+ contrast ratios
- Standardized input field appearance
- Implemented proper focus states and error handling

## 🛠️ Available CSS Classes

### **Input Fields**

```css
.form-input-currency-large
/* For primary currency inputs (salary, spending, investing) */
/* White background, dark text, proper focus states */

.form-input-currency
/* For secondary currency inputs (rent, etc.) */
/* Same contrast standards, slightly smaller */

.form-input-error-currency  
/* Error state with red background/border */
/* Maintains readability with proper contrast */

.form-currency-symbol
/* Dollar sign positioning */
/* Gray color with sufficient contrast */

.form-label
/* Consistent label styling */
/* Dark text on light background */
```

### **Form Components**

```css
/* Feature cards with proper backgrounds */
.form-feature-card-hecs    /* Blue theme for HECS */
.form-feature-card-hem     /* Green theme for HEM */
.form-feature-card-rent    /* Purple theme for rent */

/* Validation messages */
.form-validation-success   /* Green success messages */
.form-validation-error     /* Red error messages */

/* Buttons */
.form-button-success       /* Green action buttons */
.form-button-small        /* Smaller buttons */
```

## 📏 Contrast Standards

### **WCAG 2.2 Level AA Requirements**
- **Text**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio  
- **UI components**: Minimum 3:1 contrast ratio

### **Our Implementation**
- **Input fields**: 16.7:1 contrast (white bg, dark text) ✅
- **Error states**: 10.9:1 contrast (light red bg, dark red text) ✅
- **Currency symbols**: 4.9:1 contrast ✅
- **Labels**: 16.7:1 contrast ✅

## 🎯 Usage Guidelines

### **✅ DO - Use These Patterns**

```jsx
// Currency input with proper styling
<div className="relative">
  <span className="form-currency-symbol">$</span>
  <input
    type="number"
    className="form-input-currency-large"
    placeholder="75,000"
  />
</div>

// Labels with consistent styling  
<label className="form-label">
  Annual income (before tax)
</label>

// Error states with validation
<input
  className={hasError ? 'form-input-error-currency' : 'form-input-currency-large'}
/>

{hasError && (
  <div className="form-validation-error">
    <div className="form-validation-title">⚠️ Error message</div>
    <div className="form-validation-message">Helpful explanation</div>
  </div>
)}
```

### **❌ DON'T - Avoid These Anti-Patterns**

```jsx
// ❌ Dark text on dark background
<input className="bg-gray-300 text-gray-500" />

// ❌ Insufficient contrast  
<input className="bg-gray-200 text-gray-400" />

// ❌ Missing focus states
<input className="border-gray-300" />

// ❌ Inconsistent styling
<input className="p-2 border rounded" />
```

## 🧪 Testing Standards

### **Manual Testing Checklist**
- [ ] Input fields have white/light backgrounds with dark text
- [ ] Focus states are clearly visible (blue ring)
- [ ] Error states are red but still readable
- [ ] Currency symbols are visible but not distracting
- [ ] Mobile inputs don't cause zoom on iOS

### **Automated Testing**
- Use browser dev tools to check contrast ratios
- Test with high contrast mode enabled
- Verify keyboard navigation works properly

## 🔄 Future Feature Guidelines

### **When Adding New Form Fields**

1. **Always use standard classes**: Start with `form-input-currency-large` or `form-input-currency`
2. **Include proper labels**: Use `form-label` class
3. **Add validation states**: Use `form-validation-error` and `form-validation-success`
4. **Test contrast**: Ensure 4.5:1 minimum ratio
5. **Include focus states**: Built into our classes

### **When Creating New Components**

1. **Follow color patterns**: Blue (income), Green (HEM/success), Purple (rent), Red (errors)
2. **Use feature cards**: `form-feature-card-*` for grouped functionality  
3. **Maintain spacing**: Consistent padding and margins
4. **Test accessibility**: Screen readers and keyboard navigation

## 🚀 Implementation Example

Here's how the enhanced HECS/HEM/rent features follow these guidelines:

```jsx
// ✅ Proper implementation
<div className="form-feature-card-hecs mt-4">
  <label className="form-checkbox-label">
    <input type="checkbox" className="form-checkbox" />
    <div className="form-checkbox-content">
      <div className="form-checkbox-title text-blue-900">
        I have a HECS/HELP loan
      </div>
      <div className="form-checkbox-description text-blue-700">
        Clear explanation text
      </div>
    </div>
  </label>
</div>
```

## 📱 Responsive Considerations

- Input fields have minimum 44px height for touch targets
- Currency symbols adjust position on mobile
- Focus states are clearly visible on all devices
- Text remains readable at all zoom levels

## ♿ Accessibility Features

- High contrast mode support
- Reduced motion preferences respected  
- Screen reader compatible labels
- Keyboard navigation optimized
- Color-blind friendly error states

## 🔧 Maintenance

- Review contrast ratios quarterly
- Update classes when design system changes
- Test with new browser versions
- Monitor user feedback for usability issues

---

**Remember**: Always prioritize accessibility and usability over visual aesthetics. A calculator that works for everyone is more valuable than one that only looks good.