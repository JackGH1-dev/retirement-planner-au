/**
 * Claude Sub-Agent Router
 * Integrates orchestration config with Claude Code Task tool
 */

const fs = require('fs');
const path = require('path');

// Load orchestration configuration
const configPath = path.join(__dirname, 'orchestration-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

/**
 * Analyze user input and determine if sub-agent should be triggered
 */
function analyzeForAgentTrigger(userInput) {
  const input = userInput.toLowerCase();
  
  // Check auto-routing rules
  for (const [category, rule] of Object.entries(config.agentOrchestration.routingRules)) {
    if (rule.autoRoute) {
      const triggered = rule.triggers.some(trigger => 
        input.includes(trigger.toLowerCase())
      );
      
      if (triggered) {
        return {
          category,
          agent: rule.agent,
          model: rule.model,
          priority: rule.priority,
          autoRoute: true,
          confidence: calculateConfidence(input, rule.triggers)
        };
      }
    }
  }
  
  // Check manual gate rules
  for (const [category, rule] of Object.entries(config.agentOrchestration.manualGateRules)) {
    const triggered = rule.triggers.some(trigger => 
      input.includes(trigger.toLowerCase())
    );
    
    if (triggered) {
      return {
        category,
        agent: rule.agent,
        model: rule.model,
        priority: rule.priority,
        autoRoute: false,
        requiresApproval: rule.requiresApproval,
        confidence: calculateConfidence(input, rule.triggers)
      };
    }
  }
  
  return null;
}

function calculateConfidence(input, triggers) {
  const matches = triggers.filter(trigger => 
    input.toLowerCase().includes(trigger.toLowerCase())
  );
  return matches.length / triggers.length;
}

/**
 * Generate Task tool prompt for sub-agent
 */
function generateAgentPrompt(agentMatch, userInput, context = {}) {
  const agentPath = path.join(__dirname, 'agents', getAgentCategory(agentMatch.agent), `${agentMatch.agent}.md`);
  
  let agentSpec = '';
  try {
    agentSpec = fs.readFileSync(agentPath, 'utf8');
  } catch (error) {
    console.warn(`Agent spec not found: ${agentPath}`);
  }

  return {
    description: `${agentMatch.agent} agent activation`,
    prompt: `You are the ${agentMatch.agent} specialized agent for Australian retirement calculator development.

${agentSpec}

TASK: ${userInput}

CONTEXT: ${JSON.stringify(context, null, 2)}

ORCHESTRATION RULES:
- Priority: ${agentMatch.priority}
- Model: ${agentMatch.model}
- Category: ${agentMatch.category}
- Auto-route: ${agentMatch.autoRoute}

COMPLIANCE REQUIREMENTS:
- Australian retirement context required
- ASIC guidance compliance
- WCAG 2.2 accessibility standards
- Super fund pattern compliance

Please execute this task according to your specialized role and return detailed results.`,
    subagent_type: "general-purpose"
  };
}

function getAgentCategory(agentName) {
  const categoryMap = {
    'ux-copywriter-calculators': 'content',
    'seo-meta-optimizer': 'seo',
    'accessibility-auditor-finance': 'compliance',
    'test-author-runner': 'quality',
    'component-builder': 'development',
    'performance-budget-enforcer': 'quality',
    'pension-rules-module-engineer': 'calculation',
    'assumptions-policy-annotator': 'planning',
    'disclosure-disclaimer-writer': 'compliance',
    'projection-calculator-engineer': 'calculation',
    'retirement-domain-modeler': 'planning'
  };
  return categoryMap[agentName] || 'general';
}

module.exports = {
  analyzeForAgentTrigger,
  generateAgentPrompt,
  config
};