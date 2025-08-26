# Claude Sub-Agents Usage Examples

## Quick Start Guide

### Setting Up Agent Routing
```bash
# Place agent definitions in project .claude/agents directory
mkdir -p .claude/agents/{planning,calculation,compliance,content,seo,frontend,quality,analytics,deployment}

# Copy agent definition files
cp docs/claude-agents/agents/* .claude/agents/ -R

# Configure orchestration
cp docs/claude-agents/orchestration-config.json .claude/
```

### Basic Usage Patterns

## Auto-Routed Tasks (Fast, Routine)

### Content Updates
```
User: "update field labels for super contributions form"
→ Auto-routes to: UX Copywriter (Calculators)
→ Model: claude-3-haiku (fast, cost-effective)
→ Output: copy.yaml with updated labels
```

### SEO Optimization  
```
User: "generate meta descriptions for calculator pages"
→ Auto-routes to: SEO Meta Optimizer
→ Model: claude-3-haiku
→ Output: meta.csv with optimized titles/descriptions
```

### Accessibility Review
```
User: "run WCAG audit on retirement calculator forms"
→ Auto-routes to: Accessibility Auditor (WCAG Finance)
→ Model: claude-3-sonnet (more thorough analysis)
→ Output: a11y-report.md with compliance status
```

### Component Building
```
User: "create accessible super balance input component"
→ Auto-routes to: Component Builder
→ Model: claude-3-sonnet  
→ Output: SuperBalanceInput.tsx with ARIA labels
```

### Test Generation
```
User: "write unit tests for Age Pension calculation edge cases"
→ Auto-routes to: Test Author & Runner
→ Model: claude-3-haiku
→ Output: pension-calculation.test.ts
```

## Manual Gate Tasks (Critical, Compliance)

### Pension Logic Implementation
```
User: "implement Age Pension income test logic for couples"
→ Manual Gate: Pension Rules Module Engineer
→ Model: claude-3-opus (highest accuracy for compliance)
→ Approval Required: Yes
→ Output: pension-income-test.ts with comprehensive test vectors
```

### Policy Assumptions Update
```
User: "update super contribution caps for 2024-25 financial year"
→ Manual Gate: Assumptions & Policy Annotator  
→ Model: claude-3-opus
→ Compliance Check: Required
→ Output: assumptions.md with current caps and edge cases
```

### Disclaimer Content
```
User: "draft calculator disclaimer matching ASIC guidance"
→ Manual Gate: Disclosure & Disclaimer Writer
→ Model: claude-3-opus
→ Legal Review: Required  
→ Output: disclaimer.md with compliant language
```

### Calculation Engine Updates
```
User: "implement compound growth projection with fee impact"
→ Manual Gate: Projection Calculator Engineer
→ Model: claude-3-opus
→ Accuracy Check: Required
→ Output: calc.ts with deterministic math functions
```

## Multi-Agent Workflows

### New Calculator Feature Development
```
1. "design data model for partner retirement scenarios"
   → Retirement Domain Modeler (Manual Gate)
   → Output: schema.json, partner-model.ts

2. "implement calculation logic for couple Age Pension"  
   → Pension Rules Module Engineer (Manual Gate)
   → Input: schema.json from step 1
   → Output: pension.ts with couple assessment

3. "create accessible form components for partner details"
   → Component Builder (Auto Route)
   → Input: schema.json, pension.ts
   → Output: PartnerDetailsForm.tsx

4. "write field labels and help text for partner form"
   → UX Copywriter (Auto Route) 
   → Input: PartnerDetailsForm.tsx
   → Output: copy.yaml with partner-specific content

5. "generate comprehensive test suite for partner scenarios"
   → Test Author & Runner (Auto Route)
   → Input: All previous artifacts
   → Output: partner-scenarios.test.ts
```

### Pre-Release Quality Gate
```
1. "run full accessibility audit before release"
   → Accessibility Auditor (Auto Route)
   → Output: a11y-report.md

2. "validate all disclaimer and assumption content"  
   → Disclosure & Disclaimer Writer (Manual Gate)
   → Output: Updated disclaimer.md

3. "check performance budget compliance"
   → Performance Budget Enforcer (Auto Route)  
   → Output: perf-report.md

4. "verify release checklist completion"
   → Release Checklist Gatekeeper (Manual Gate)
   → Input: All quality reports
   → Output: release-checklist.md with approval/blocks
```

## Practical Examples with Context

### Scenario: HECS/HELP Integration Enhancement

```
User: "I need to add HECS loan repayment calculation to the income section"

→ Agent Router Analysis:
   - Involves calculation logic (Manual Gate territory)  
   - Requires government policy accuracy (Compliance sensitive)
   - Needs form updates (Auto-routable components)

→ Suggested Workflow:
1. Manual Gate: "update policy assumptions for HECS thresholds 2024-25"
   → Assumptions & Policy Annotator
   → Output: hecs-thresholds.json, assumptions.md update

2. Manual Gate: "implement HECS repayment calculation module"  
   → Projection Calculator Engineer
   → Input: hecs-thresholds.json
   → Output: hecs-calculator.ts with test vectors

3. Auto Route: "create HECS checkbox and input components"
   → Component Builder  
   → Input: hecs-calculator.ts interface
   → Output: HECSInput.tsx component

4. Auto Route: "write helper text explaining HECS calculations"
   → UX Copywriter (Calculators)
   → Input: HECSInput.tsx
   → Output: copy.yaml with HECS explanations

5. Auto Route: "generate unit tests for HECS edge cases"
   → Test Author & Runner
   → Input: hecs-calculator.ts
   → Output: hecs-calculation.test.ts
```

### Scenario: Accessibility Compliance Review

```
User: "We need to ensure our calculator meets WCAG 2.2 AA standards"

→ Auto-Routed Workflow:
1. "audit keyboard navigation through all calculator steps"
   → Accessibility Auditor (WCAG Finance)
   → Output: keyboard-audit.md

2. "check color contrast on all form elements and charts"  
   → Accessibility Auditor (WCAG Finance)
   → Output: contrast-report.md

3. "validate ARIA labels and screen reader compatibility"
   → Accessibility Auditor (WCAG Finance)  
   → Output: aria-compliance.md

4. "review mobile touch target sizes and spacing"
   → Accessibility Auditor (WCAG Finance)
   → Output: mobile-a11y.md

→ Consolidated Output: a11y-report.md with all findings and remediation plan
```

### Scenario: Performance Optimization

```
User: "The calculator is loading slowly on mobile devices"

→ Auto-Routed Analysis:
1. "analyze current bundle size and identify largest components"
   → Performance Budget Enforcer
   → Output: bundle-analysis.json

2. "audit lazy loading opportunities for charts and results"
   → Performance Budget Enforcer  
   → Output: lazy-loading-plan.md

3. "check LCP and INP metrics for calculator workflow"
   → Performance Budget Enforcer
   → Output: web-vitals-report.md

4. "optimize component re-renders during input changes"
   → Component Builder
   → Input: Performance reports
   → Output: Optimized components with React.memo

→ Result: perf-report.md with specific optimization recommendations
```

## Agent Communication Patterns

### Artifact Handoff Example
```yaml
# schema.json from Domain Modeler
interface RetirementInput:
  personal:
    currentAge: number
    retirementAge: number  
  financial:
    salary: number
    superBalance: number
    hasHECS: boolean

# Consumed by Pension Rules Engineer
function calculateAgePension(input: RetirementInput): PensionResult

# Used by Component Builder  
<SuperBalanceInput 
  value={input.financial.superBalance}
  onChange={handleSuperChange}
/>

# Referenced by UX Copywriter
superBalance:
  label: "Current super balance"
  help: "Total across all your super accounts"
```

### Quality Gate Integration
```typescript
// Release checklist validation
interface ReleaseArtifacts {
  required: [
    'assumptions.md',    // Policy Annotator
    'disclaimer.md',     // Disclaimer Writer  
    'a11y-report.md',   // Accessibility Auditor
    'perf-report.md',   // Performance Enforcer
    'test-report.md'    // Test Author
  ]
  
  thresholds: {
    testCoverage: 90,
    accessibilityScore: 95,
    performanceBudget: 100KB,
    lcpTarget: 2.5s
  }
}

// Gatekeeper validates before deployment
const releaseApproval = validateReleaseArtifacts(artifacts)
```

## Cost Optimization Examples

### Model Assignment Strategy
```json
{
  "routine_tasks": {
    "model": "claude-3-haiku",
    "estimated_cost": "$0.10/hour",
    "use_cases": ["copy updates", "basic SEO", "simple tests"]
  },
  
  "analysis_tasks": {
    "model": "claude-3-sonnet", 
    "estimated_cost": "$0.50/hour",
    "use_cases": ["accessibility audits", "component building", "performance analysis"]
  },
  
  "critical_tasks": {
    "model": "claude-3-opus",
    "estimated_cost": "$2.00/hour", 
    "use_cases": ["pension calculations", "compliance content", "complex domain modeling"]
  }
}
```

### Usage Monitoring
```
Daily Agent Usage:
- UX Copywriter: 12 tasks (Haiku) - $1.20
- Component Builder: 8 tasks (Sonnet) - $4.00  
- Accessibility Auditor: 3 tasks (Sonnet) - $1.50
- Pension Engineer: 1 task (Opus) - $2.00
Total: $8.70/day for comprehensive AI assistance
```

This sub-agent system provides structured, Australian-focused assistance for retirement calculator development while maintaining cost efficiency and compliance standards.