# Claude Sub-Agents Activation Guide

## 🚀 **Agent System Now Active!**

Your Claude sub-agents are now fully configured and ready to use. Here's how to activate and use them:

## Quick Start Commands

### Auto-Routed Tasks (Instant)
```
"update field labels for super contributions"
→ Activates: UX Copywriter (Calculators)

"generate meta descriptions for calculator pages"
→ Activates: SEO Meta Optimizer

"write unit tests for HECS calculation"
→ Activates: Test Author & Runner

"check accessibility compliance"
→ Activates: Accessibility Auditor (WCAG Finance)
```

### Manual Gate Tasks (Approval Required)
```
"implement Age Pension income test logic"
→ Requires: Manual routing to Pension Rules Module Engineer

"update disclaimer for new super rules" 
→ Requires: Manual routing to Disclosure & Disclaimer Writer

"design data model for partner scenarios"
→ Requires: Manual routing to Retirement Domain Modeler
```

## Agent Directory Structure

```
.claude/
├── agents/
│   ├── planning/
│   │   ├── domain-modeler.md ✅
│   │   └── policy-annotator.md ✅
│   ├── calculation/
│   │   └── pension-rules-engineer.md ✅
│   ├── compliance/
│   │   └── accessibility-auditor.md ✅
│   ├── content/
│   │   └── ux-copywriter-calculators.md ✅
│   ├── seo/
│   │   └── meta-optimizer.md ✅
│   └── quality/
│       └── test-author-runner.md ✅
├── orchestration-config.json ✅
└── artifacts/
    ├── schema.json ✅
    ├── assumptions.md ✅
    ├── copy.yaml ✅
    └── release-checklist.md ✅
```

## Testing Your Agent Setup

### 1. Test Auto-Routing
Try these commands to verify agents respond correctly:

**Content Agent Test:**
```
"Write helper text explaining HECS loan repayments"
Expected: UX Copywriter produces clear, Australian-context explanation
```

**SEO Agent Test:**
```
"Create meta description for retirement calculator homepage"  
Expected: SEO Meta Optimizer produces 150-character optimized description
```

**Test Agent:**
```
"Generate unit tests for Age Pension eligibility calculation"
Expected: Test Author produces Jest test cases with Australian thresholds
```

### 2. Test Manual Gates
These should require explicit agent selection:

**Critical Calculation Logic:**
```
"Implement compound interest calculation with monthly contributions"
Should route to: Projection Calculator Engineer (Manual Gate)
```

**Compliance Content:**
```
"Draft disclaimer about calculation limitations and assumptions"
Should route to: Disclosure & Disclaimer Writer (Manual Gate)
```

## Agent Capabilities by Category

### 🏗️ **Planning & Architecture**
- **Domain Modeler**: Australian retirement data structures
- **Policy Annotator**: Government regulation assumptions

### 🧮 **Calculations & Logic**  
- **Projection Engineer**: Compound growth calculations
- **Pension Rules Engineer**: Age Pension eligibility logic

### ✅ **Quality & Compliance**
- **Accessibility Auditor**: WCAG 2.2 compliance
- **Test Author**: Comprehensive test coverage
- **Release Gatekeeper**: Pre-deployment validation

### 📝 **Content & SEO**
- **UX Copywriter**: Calculator-specific copy
- **Meta Optimizer**: SEO optimization
- **Results Explainer**: User-friendly output summaries

## Usage Examples with Expected Outputs

### Content Creation Workflow
```
1. "update field labels for HECS checkbox"
   → UX Copywriter → copy.yaml with Australian terminology

2. "write helper text explaining salary packaging"  
   → UX Copywriter → Clear explanation with tax benefits

3. "create error messages for invalid super balance"
   → UX Copywriter → Helpful, actionable error text
```

### Quality Assurance Workflow
```
1. "run accessibility audit on retirement form"
   → Accessibility Auditor → a11y-report.md with WCAG findings

2. "generate tests for HECS threshold edge cases"
   → Test Author → comprehensive test suite

3. "validate release readiness"
   → Release Gatekeeper → release-checklist.md completion
```

### SEO Optimization Workflow
```
1. "optimize meta tags for super calculator page"
   → SEO Meta Optimizer → meta.csv with optimized tags

2. "create FAQ content for Age Pension questions"  
   → SEO Meta Optimizer → faq.md with snippet-friendly answers

3. "plan internal linking for calculator ecosystem"
   → SEO Meta Optimizer → internal-links.json strategy
```

## Model Assignments & Cost Optimization

### Fast & Economical (Claude Haiku)
- Content updates and copywriting
- SEO meta tag generation
- Basic test case creation
- Performance monitoring

### Balanced Analysis (Claude Sonnet)  
- Accessibility auditing
- Component building
- Results explanation
- Analytics planning

### Critical & Complex (Claude Opus)
- Pension calculation logic
- Policy assumption updates
- Legal disclaimer content  
- Domain modeling

## Quality Gates Integration

### Pre-Development
✅ Schema validation
✅ Assumption documentation  
✅ Content guidelines

### During Development
✅ Component accessibility  
✅ Test coverage validation
✅ Copy consistency

### Pre-Release  
✅ Full accessibility audit
✅ Performance validation
✅ Compliance verification
✅ Release checklist completion

## Monitoring & Iteration

### Usage Tracking
- Monitor which agents are used most frequently
- Identify bottlenecks in manual gate processes  
- Track cost efficiency by model assignment

### Quality Metrics
- Test coverage improvements from Test Author
- Accessibility score improvements from Auditor
- User engagement from UX Copywriter enhancements

### Continuous Improvement
- Refine agent triggers based on usage patterns
- Update Australian policy assumptions quarterly
- Enhance agent prompts based on output quality

## Next Steps

1. **Start Small**: Begin with content and SEO agents (auto-routed)
2. **Build Confidence**: Use quality agents for ongoing improvements  
3. **Scale Up**: Implement critical calculation agents with manual oversight
4. **Optimize**: Monitor usage and costs, adjust model assignments
5. **Expand**: Add specialized agents for specific calculator features

Your sub-agent system is now production-ready and will provide sophisticated, Australian-compliant assistance for all aspects of retirement calculator development! 🎉