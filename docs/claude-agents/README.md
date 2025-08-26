# Claude Sub-Agents for Retirement Planning Calculator

## Overview
Production-ready Claude sub-agents tailored for Australian retirement planning calculator with clear roles, triggers, artifacts, and guardrails.

## Agent Architecture

### Core Principles
- **Isolated Context**: Each agent has specific scope and tools
- **Structured Artifacts**: Clean hand-offs via JSON/CSV/MD
- **Australian Compliance**: Aligned with super funds and ASIC patterns
- **Auto-routing**: Routine tasks automated, sensitive steps manual
- **Quality Gates**: Release checklist with compliance artifacts

### Orchestration Pattern
```
Auto Route: UX/Copy/Meta/Tests → Fast Models
Manual Gate: Pension Rules/Assumptions/Disclaimers → Premium Models
Artifact Flow: schema.json → calc.ts → pension.ts → components → tests
```

## Agent Definitions

### 1. Planning & Product Agents

#### Retirement Domain Modeler
- **Trigger**: "define inputs/outputs", "schema for projections", "partner scenario model"
- **Role**: Designs data model for Australian retirement calculator
- **Tools**: Code editor, schema validator, JSON formatter
- **Artifacts**: `schema.json`, `sample-payloads.json`, `domain-model.ts`
- **Context**: Super balances, contribution types, Age Pension flags, partner scenarios

#### Assumptions & Policy Annotator  
- **Trigger**: "policy assumptions", "Age Pension rules", "contribution caps", "bring-forward limits"
- **Role**: Encodes adjustable assumptions with Australian compliance context
- **Tools**: Research, policy documents, markdown editor
- **Artifacts**: `assumptions.md`, `policy-toggles.json`, `edge-cases.yaml`
- **Context**: Concessional caps, co-contribution eligibility, pension tests

### 2. Calculation Engine Agents

#### Projection Calculator Engineer
- **Trigger**: "projection logic", "accumulation drawdown", "scenario branching", "sensitivity analysis"
- **Role**: Implements core calculation engine with deterministic runs
- **Tools**: Code editor, test runner, calculation validator
- **Artifacts**: `calc.ts`, `projection-tests.ts`, `scenarios.json`
- **Context**: Extra contributions, lump sums, retirement age variations

#### Pension Rules Module Engineer
- **Trigger**: "Age Pension logic", "income assets test", "pension eligibility module"
- **Role**: Injectable Age Pension module with assumption flags
- **Tools**: Code editor, unit tests, government data APIs
- **Artifacts**: `pension.ts`, `pension-interface.ts`, `test-vectors.json`
- **Context**: Income/assets tests, taper rates, partner scenarios

### 3. Compliance & Trust Agents

#### Accessibility Auditor (WCAG Finance)
- **Trigger**: "WCAG review", "form accessibility", "keyboard navigation", "ARIA labels"
- **Role**: Reviews financial UI for WCAG 2.2 compliance
- **Tools**: Code viewer, accessibility scanner, audit checklist
- **Artifacts**: `a11y-report.md`, `wcag-checklist.json`, `aria-recommendations.md`
- **Context**: Financial form patterns, error states, calculator UX

#### Disclosure & Disclaimer Writer
- **Trigger**: "disclaimer content", "scope limitations", "assumptions disclosure", "super fund patterns"
- **Role**: Drafts compliant disclaimers matching industry standards
- **Tools**: Legal templates, super fund examples, content editor
- **Artifacts**: `disclaimer.md`, `inline-microcopy.yaml`, `legal-requirements.md`
- **Context**: ASIC guidance, super fund calculator patterns

### 4. UX & Content Agents

#### UX Copywriter (Calculators)
- **Trigger**: "field labels", "helper text", "error messages", "calculator copy"
- **Role**: Writes calculator-specific copy in Australian context
- **Tools**: Content editor, A/B test tracker, copy reviewer
- **Artifacts**: `copy.yaml`, `component-labels.json`, `error-messages.md`
- **Context**: Super terminology, Age Pension language, user guidance

#### Results Explainer & Scenario Coach
- **Trigger**: "results summary", "scenario comparison", "what changed explanation", "next steps guidance"
- **Role**: Human-readable outcome summaries and coaching
- **Tools**: Content editor, chart analyzer, user flow mapper
- **Artifacts**: `result-notes.md`, `comparison-blocks.yaml`, `coaching-prompts.json`
- **Context**: Projection interpretation, scenario analysis, action recommendations

### 5. SEO & Structure Agents

#### IA & Schema Architect
- **Trigger**: "sitemap structure", "schema.org markup", "calculator IA", "FAQ organization"
- **Role**: Information architecture and structured data
- **Tools**: Sitemap generator, schema validator, SEO analyzer
- **Artifacts**: `sitemap.json`, `schema-snippets.html`, `ia-structure.md`
- **Context**: Calculator pages, guides, FAQs, results structure

#### SEO Meta Optimizer
- **Trigger**: "meta titles descriptions", "FAQ snippets", "internal linking", "retirement keywords"
- **Role**: SEO optimization for retirement calculator content
- **Tools**: Keyword research, meta generator, link analyzer
- **Artifacts**: `meta.csv`, `faq.md`, `internal-links.json`
- **Context**: Australian retirement search intent, calculator SEO

### 6. Frontend & Design Agents

#### Component Builder
- **Trigger**: "form components", "accessible inputs", "results charts", "comparison tables"
- **Role**: Builds accessible UI components for calculator
- **Tools**: Component editor, accessibility tester, design tokens
- **Artifacts**: `components/`, `ui-tokens.json`, `component-docs.md`
- **Context**: Numeric inputs, sliders, date pickers, results visualization

#### Performance Budget Enforcer
- **Trigger**: "bundle size check", "LCP INP targets", "lazy loading", "performance budget"
- **Role**: Monitors and enforces performance standards
- **Tools**: Bundle analyzer, performance monitor, lighthouse
- **Artifacts**: `perf-report.md`, `bundle-analysis.json`, `optimization-plan.md`
- **Context**: Calculator load times, chart rendering, mobile performance

### 7. Quality & Safety Agents

#### Test Author & Runner
- **Trigger**: "unit tests", "integration tests", "calculation validation", "accessibility tests"
- **Role**: Comprehensive test coverage for calculator logic
- **Tools**: Test runner, coverage reporter, validation framework
- **Artifacts**: `test-suites/`, `test-report.md`, `coverage-report.html`
- **Context**: Calculation paths, Age Pension toggles, input validation

#### Data Validation & Input Guard
- **Trigger**: "input validation", "contribution caps", "bring-forward limits", "user-friendly errors"
- **Role**: Input bounds enforcement with clear error messages
- **Tools**: Validation framework, error message generator, bounds checker
- **Artifacts**: `validation.ts`, `validation-cases.json`, `error-catalog.md`
- **Context**: Salary vs caps, age restrictions, partner data validation

### 8. Analytics & Iteration Agents

#### Event Taxonomy & Analytics Planner
- **Trigger**: "event schema", "projection tracking", "funnel metrics", "privacy compliance"
- **Role**: Defines analytics strategy for calculator usage
- **Tools**: Analytics configurator, privacy checker, event validator
- **Artifacts**: `analytics-spec.json`, `privacy-notes.md`, `event-taxonomy.yaml`
- **Context**: Input changes, scenario comparisons, conversion tracking

#### Feedback Loop & Experimenter
- **Trigger**: "A/B experiments", "copy testing", "layout experiments", "success metrics"
- **Role**: Designs and manages calculator optimization experiments
- **Tools**: Experiment designer, metrics tracker, rollout planner
- **Artifacts**: `experiment-plan.md`, `success-metrics.json`, `rollout-strategy.md`
- **Context**: Conversion optimization, user experience improvements

### 9. Deployment & Governance Agents

#### Release Checklist & Artifact Gatekeeper
- **Trigger**: "release readiness", "compliance check", "artifact validation", "deployment gate"
- **Role**: Ensures all required artifacts meet quality thresholds
- **Tools**: Checklist validator, artifact scanner, quality gate
- **Artifacts**: `release-checklist.md`, `compliance-report.md`, `deployment-status.json`
- **Context**: Pre-deployment validation, compliance verification

#### Model & Cost Router
- **Trigger**: "agent routing", "model assignment", "cost optimization", "latency management"
- **Role**: Optimizes model usage across agent types
- **Tools**: Usage tracker, cost analyzer, performance monitor
- **Artifacts**: `routing.json`, `cost-analysis.md`, `model-assignments.yaml`
- **Context**: Fast models for routine tasks, premium for complex logic

## Implementation Structure

```
.claude/
├── agents/
│   ├── planning/
│   │   ├── domain-modeler.md
│   │   └── policy-annotator.md
│   ├── calculation/
│   │   ├── projection-engineer.md
│   │   └── pension-rules-engineer.md
│   ├── compliance/
│   │   ├── accessibility-auditor.md
│   │   └── disclaimer-writer.md
│   ├── content/
│   │   ├── ux-copywriter.md
│   │   └── results-explainer.md
│   ├── seo/
│   │   ├── ia-architect.md
│   │   └── meta-optimizer.md
│   ├── frontend/
│   │   ├── component-builder.md
│   │   └── performance-enforcer.md
│   ├── quality/
│   │   ├── test-author.md
│   │   └── validation-guard.md
│   ├── analytics/
│   │   ├── analytics-planner.md
│   │   └── experimenter.md
│   └── deployment/
│       ├── release-gatekeeper.md
│       └── cost-router.md
└── artifacts/
    ├── schema.json
    ├── assumptions.md
    ├── disclaimer.md
    ├── copy.yaml
    ├── meta.csv
    └── release-checklist.md
```

## Usage Patterns

### Auto-routing Examples
```
User: "update field labels for super contributions"
→ Auto-routes to UX Copywriter (Calculators)

User: "generate meta descriptions for calculator pages"  
→ Auto-routes to SEO Meta Optimizer

User: "run accessibility audit on form components"
→ Auto-routes to Accessibility Auditor (WCAG Finance)
```

### Manual Gate Examples
```
User: "implement Age Pension income test logic"
→ Requires explicit routing to Pension Rules Module Engineer

User: "update disclaimer for new super rules"
→ Requires explicit routing to Disclosure & Disclaimer Writer

User: "validate projection assumptions against ASIC guidance"
→ Requires explicit routing to Assumptions & Policy Annotator
```

## Next Steps
1. Generate agent stub files with detailed prompts
2. Create skeleton artifact files
3. Set up orchestration routing logic
4. Implement quality gates and compliance checks
5. Configure model assignments for cost optimization