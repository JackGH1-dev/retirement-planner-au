# Claude Code Sub-Agent Integration Guide

## 🚀 Integration Methods

### Method 1: Direct Task Tool Usage (Available Now)

**How to trigger sub-agents:**

```javascript
// In Claude Code session, when user requests agent work:

// AUTO-ROUTED AGENTS (trigger immediately):
if (userInput.includes("field labels") || userInput.includes("helper text")) {
  Task({
    description: "UX Copywriter agent activation",
    prompt: `You are the UX Copywriter specialized for Australian retirement calculators.
    
    TASK: ${userInput}
    
    SPECIALIZATION:
    - Australian terminology (super, Centrelink, HECS)  
    - Calculator-specific copy and helper text
    - Error messages and validation copy
    - Progressive disclosure patterns
    - Financial literacy friendly language
    
    DELIVERABLE: Updated copy.yaml with new content`,
    subagent_type: "general-purpose"
  });
}

// MANUAL GATE AGENTS (require explicit activation):
if (userInput.includes("Age Pension") && userInput.includes("calculation")) {
  // Require user confirmation first
  console.log("🔒 MANUAL GATE: This requires Pension Rules Engineer (Claude Opus)");
  console.log("⚠️  Critical calculation logic - requires approval");
  
  // Then activate if approved:
  Task({
    description: "Pension Rules Engineer activation", 
    prompt: `You are the Pension Rules Module Engineer specialized in Age Pension calculations.
    
    CRITICAL TASK: ${userInput}
    
    REQUIREMENTS:
    - Services Australia alignment
    - Income test and assets test accuracy
    - Current fortnightly rates (2024-25)
    - Taper rate precision
    - Deeming rate application
    
    VALIDATION REQUIRED: All calculations must be verified against official sources.
    
    DELIVERABLE: Production-ready pension calculation module`,
    subagent_type: "general-purpose" 
  });
}
```

### Method 2: Orchestration Wrapper Function

Create a helper function that Claude Code can use:

```javascript
function routeToAgent(userInput, context = {}) {
  const agentMatch = analyzeForAgentTrigger(userInput);
  
  if (!agentMatch) {
    return null; // No agent needed
  }
  
  if (agentMatch.autoRoute) {
    // Automatically spawn agent
    const taskPrompt = generateAgentPrompt(agentMatch, userInput, context);
    return {
      action: "spawn_agent",
      ...taskPrompt
    };
  } else {
    // Manual gate - require approval
    return {
      action: "request_approval",
      agent: agentMatch.agent,
      priority: agentMatch.priority,
      message: `🔒 Manual Gate Required: ${agentMatch.agent} (${agentMatch.model})`
    };
  }
}
```

### Method 3: Integration with CLAUDE.md Instructions

Add to CLAUDE.md project instructions:

```markdown
## 🤖 Sub-Agent Activation Protocol

### Auto-Triggered Agents:
- **Content requests** → UX Copywriter
- **SEO tasks** → Meta Optimizer  
- **Accessibility** → WCAG Auditor
- **Testing** → Test Author
- **Performance** → Budget Enforcer

### Manual Gate Agents (Require Approval):
- **Pension logic** → Pension Rules Engineer (Opus)
- **Legal content** → Disclaimer Writer (Opus)
- **Core calculations** → Projection Engineer (Opus)
- **Architecture** → Domain Modeler (Opus)

### Usage Pattern:
1. Detect agent triggers in user input
2. Auto-route or request manual approval
3. Spawn Task tool with specialized prompt
4. Agent delivers specialized output
5. Integrate results into main codebase
```

## 🎯 Current Implementation Strategy

### Phase 1: Manual Agent Spawning (Immediate)
- Claude Code manually detects agent triggers
- Uses Task tool with pre-built agent prompts
- Integrates agent outputs back to main session

### Phase 2: Automated Orchestration (Future) 
- Hook into Claude Code's processing pipeline
- Automatic trigger detection and routing
- Background agent coordination

### Phase 3: Full Integration (Advanced)
- Native Claude Code sub-agent support
- Cross-session agent memory
- Agent workflow orchestration

## 📋 Quick Reference

### Trigger Phrases for Auto-Routing:

**UX Copy:** "field labels", "helper text", "error messages"
**SEO:** "meta titles", "descriptions", "FAQ snippets"  
**Accessibility:** "WCAG review", "accessibility audit", "ARIA"
**Testing:** "unit tests", "test coverage", "validation"
**Components:** "form components", "UI components"
**Performance:** "bundle size", "LCP", "performance budget"

### Manual Gate Triggers:

**Pension:** "Age Pension", "income test", "pension eligibility"
**Policy:** "contribution caps", "super rules", "ASIC guidance"
**Legal:** "disclaimer", "legal content", "scope limitations"
**Calculations:** "projection logic", "calculation engine"
**Architecture:** "data model", "schema design", "domain modeling"

## ✅ Ready to Use

The sub-agent system is now ready for integration with Claude Code sessions through the Task tool mechanism.