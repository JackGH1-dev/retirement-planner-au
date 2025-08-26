# Claude Code Configuration - SPARC Development Environment

## 🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT

**ABSOLUTE RULES**:
1. ALL operations MUST be concurrent/parallel in a single message
2. **NEVER save working files, text/mds and tests to the root folder**
3. ALWAYS organize files in appropriate subdirectories

### ⚡ GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"

**MANDATORY PATTERNS:**
- **TodoWrite**: ALWAYS batch ALL todos in ONE call (5-10+ todos minimum)
- **Task tool**: ALWAYS spawn ALL agents in ONE message with full instructions
- **File operations**: ALWAYS batch ALL reads/writes/edits in ONE message
- **Bash commands**: ALWAYS batch ALL terminal operations in ONE message
- **Memory operations**: ALWAYS batch ALL memory store/retrieve in ONE message

### 📁 File Organization Rules

**NEVER save to root folder. Use these directories:**
- `/src` - Source code files
- `/tests` - Test files
- `/docs` - Documentation and markdown files
- `/config` - Configuration files
- `/scripts` - Utility scripts
- `/examples` - Example code

## Project Overview

This project uses SPARC (Specification, Pseudocode, Architecture, Refinement, Completion) methodology with Claude-Flow orchestration for systematic Test-Driven Development.

## SPARC Commands

### Core Commands
- `npx claude-flow sparc modes` - List available modes
- `npx claude-flow sparc run <mode> "<task>"` - Execute specific mode
- `npx claude-flow sparc tdd "<feature>"` - Run complete TDD workflow
- `npx claude-flow sparc info <mode>` - Get mode details

### Batchtools Commands
- `npx claude-flow sparc batch <modes> "<task>"` - Parallel execution
- `npx claude-flow sparc pipeline "<task>"` - Full pipeline processing
- `npx claude-flow sparc concurrent <mode> "<tasks-file>"` - Multi-task processing

### Build Commands
- `npm run build` - Build project
- `npm run test` - Run tests
- `npm run lint` - Linting
- `npm run typecheck` - Type checking

## SPARC Workflow Phases

1. **Specification** - Requirements analysis (`sparc run spec-pseudocode`)
2. **Pseudocode** - Algorithm design (`sparc run spec-pseudocode`)
3. **Architecture** - System design (`sparc run architect`)
4. **Refinement** - TDD implementation (`sparc tdd`)
5. **Completion** - Integration (`sparc run integration`)

## Code Style & Best Practices

- **Modular Design**: Files under 500 lines
- **Environment Safety**: Never hardcode secrets
- **Test-First**: Write tests before implementation
- **Clean Architecture**: Separate concerns
- **Documentation**: Keep updated

## 🚀 Available Agents (54 Total)

### Core Development
`coder`, `reviewer`, `tester`, `planner`, `researcher`

### Swarm Coordination
`hierarchical-coordinator`, `mesh-coordinator`, `adaptive-coordinator`, `collective-intelligence-coordinator`, `swarm-memory-manager`

### Consensus & Distributed
`byzantine-coordinator`, `raft-manager`, `gossip-coordinator`, `consensus-builder`, `crdt-synchronizer`, `quorum-manager`, `security-manager`

### Performance & Optimization
`perf-analyzer`, `performance-benchmarker`, `task-orchestrator`, `memory-coordinator`, `smart-agent`

### GitHub & Repository
`github-modes`, `pr-manager`, `code-review-swarm`, `issue-tracker`, `release-manager`, `workflow-automation`, `project-board-sync`, `repo-architect`, `multi-repo-swarm`

### SPARC Methodology
`sparc-coord`, `sparc-coder`, `specification`, `pseudocode`, `architecture`, `refinement`

### Specialized Development
`backend-dev`, `mobile-dev`, `ml-developer`, `cicd-engineer`, `api-docs`, `system-architect`, `code-analyzer`, `base-template-generator`

### Testing & Validation
`tdd-london-swarm`, `production-validator`

### Migration & Planning
`migration-planner`, `swarm-init`

## 🎯 Claude Code vs MCP Tools

### Claude Code Handles ALL:
- File operations (Read, Write, Edit, MultiEdit, Glob, Grep)
- Code generation and programming
- Bash commands and system operations
- Implementation work
- Project navigation and analysis
- TodoWrite and task management
- Git operations
- Package management
- Testing and debugging

### MCP Tools ONLY:
- Coordination and planning
- Memory management
- Neural features
- Performance tracking
- Swarm orchestration
- GitHub integration

**KEY**: MCP coordinates, Claude Code executes.

## 🚀 Quick Setup

```bash
# Add Claude Flow MCP server
claude mcp add claude-flow npx claude-flow@alpha mcp start
```

## MCP Tool Categories

### Coordination
`swarm_init`, `agent_spawn`, `task_orchestrate`

### Monitoring
`swarm_status`, `agent_list`, `agent_metrics`, `task_status`, `task_results`

### Memory & Neural
`memory_usage`, `neural_status`, `neural_train`, `neural_patterns`

### GitHub Integration
`github_swarm`, `repo_analyze`, `pr_enhance`, `issue_triage`, `code_review`

### System
`benchmark_run`, `features_detect`, `swarm_monitor`

## 📋 Agent Coordination Protocol

### Every Agent MUST:

**1️⃣ BEFORE Work:**
```bash
npx claude-flow@alpha hooks pre-task --description "[task]"
npx claude-flow@alpha hooks session-restore --session-id "swarm-[id]"
```

**2️⃣ DURING Work:**
```bash
npx claude-flow@alpha hooks post-edit --file "[file]" --memory-key "swarm/[agent]/[step]"
npx claude-flow@alpha hooks notify --message "[what was done]"
```

**3️⃣ AFTER Work:**
```bash
npx claude-flow@alpha hooks post-task --task-id "[task]"
npx claude-flow@alpha hooks session-end --export-metrics true
```

## 🎯 Concurrent Execution Examples

### ✅ CORRECT (Single Message):
```javascript
[BatchTool]:
  // Initialize swarm
  mcp__claude-flow__swarm_init { topology: "mesh", maxAgents: 6 }
  mcp__claude-flow__agent_spawn { type: "researcher" }
  mcp__claude-flow__agent_spawn { type: "coder" }
  mcp__claude-flow__agent_spawn { type: "tester" }
  
  // Spawn agents with Task tool
  Task("Research agent: Analyze requirements...")
  Task("Coder agent: Implement features...")
  Task("Tester agent: Create test suite...")
  
  // Batch todos
  TodoWrite { todos: [
    {id: "1", content: "Research", status: "in_progress", priority: "high"},
    {id: "2", content: "Design", status: "pending", priority: "high"},
    {id: "3", content: "Implement", status: "pending", priority: "high"},
    {id: "4", content: "Test", status: "pending", priority: "medium"},
    {id: "5", content: "Document", status: "pending", priority: "low"}
  ]}
  
  // File operations
  Bash "mkdir -p app/{src,tests,docs}"
  Write "app/src/index.js"
  Write "app/tests/index.test.js"
  Write "app/docs/README.md"
```

### ❌ WRONG (Multiple Messages):
```javascript
Message 1: mcp__claude-flow__swarm_init
Message 2: Task("agent 1")
Message 3: TodoWrite { todos: [single todo] }
Message 4: Write "file.js"
// This breaks parallel coordination!
```

## Performance Benefits

- **84.8% SWE-Bench solve rate**
- **32.3% token reduction**
- **2.8-4.4x speed improvement**
- **27+ neural models**

## Hooks Integration

### Pre-Operation
- Auto-assign agents by file type
- Validate commands for safety
- Prepare resources automatically
- Optimize topology by complexity
- Cache searches

### Post-Operation
- Auto-format code
- Train neural patterns
- Update memory
- Analyze performance
- Track token usage

### Session Management
- Generate summaries
- Persist state
- Track metrics
- Restore context
- Export workflows

## Advanced Features (v2.0.0)

- 🚀 Automatic Topology Selection
- ⚡ Parallel Execution (2.8-4.4x speed)
- 🧠 Neural Training
- 📊 Bottleneck Analysis
- 🤖 Smart Auto-Spawning
- 🛡️ Self-Healing Workflows
- 💾 Cross-Session Memory
- 🔗 GitHub Integration

## Integration Tips

1. Start with basic swarm init
2. Scale agents gradually
3. Use memory for context
4. Monitor progress regularly
5. Train patterns from success
6. Enable hooks automation
7. Use GitHub tools first

## Support

- Documentation: https://github.com/ruvnet/claude-flow
- Issues: https://github.com/ruvnet/claude-flow/issues

---

Remember: **Claude Flow coordinates, Claude Code creates!**

## 🏠 Property & Real Estate System - COMPLETED v8.2

### ✅ **Full Implementation Status: PRODUCTION READY**

[Previous content remains the same...]

## 📊 Enhanced Planner Income & Spending - COMPLETED v8.3

### ✅ **Australian Tax & Expense Integration: PRODUCTION READY**

#### **🎯 Enhanced Features (v8.3 - Aug 2025)**

##### **1. HECS/HELP Loan Integration**
- **File**: `src/components/planner/CurrentFinancialsSimple.tsx` - Enhanced with 2024-25 ATO thresholds
- **Automatic Calculation**: Uses progressive HECS rates (1% to 10%) based on income brackets
- **Minimum Threshold**: $54,435 for 2024-25 financial year
- **Monthly Display**: Real-time monthly HECS repayment calculation
- **Take-home Impact**: Accurately reduces available income after HECS deductions

##### **2. HEM (Household Expenditure Measure) Integration**
- **Current 2024 HEM Data**: 
  - Single: $2,850/month basic living expenses
  - Couple: $4,200/month basic living expenses  
  - Family with Kids: $5,400/month basic living expenses
- **One-Click Autofill**: "Use HEM estimate" button for instant expense population
- **Household Type Selection**: Visual buttons for different family compositions
- **Dynamic Estimates**: Real-time HEM amounts displayed on household type selectors

##### **3. Rent Separation & Conditional Inputs**
- **Smart Rent Checkbox**: "I'm renting" option with conditional visibility
- **Dedicated Rent Field**: Separate input that only appears when renting is selected
- **Context-Aware Labels**: Changes expense descriptions based on rental status
- **Expense Calculation**: Automatically adjusts total living expenses to account for rent separation

##### **4. Enhanced Investment Validation**
- **Available Funds Calculation**: Real-time calculation of funds available for investing
- **Formula**: Take-home Pay - HECS - All Living Expenses = Available for Investment
- **Visual Validation**: Red borders and warnings when exceeding available capacity
- **Quick Fix Button**: One-click "Set to maximum available" for easy correction
- **Real-time Display**: Shows exact amount available for investing

##### **5. Enhanced User Experience**
- **Blue Checkbox Styling**: Custom CSS matching the overall blue design theme
- **Progressive Disclosure**: Simple initial view with advanced details available on demand
- **Smart State Management**: Form maintains state across interactions
- **Visual Feedback**: Color-coded success/warning/error states throughout
- **Context-Aware Messaging**: Help text and labels adapt to user selections

#### **🏗️ Technical Implementation Details**

##### **HECS Calculation Engine:**
```javascript
// 2024-25 ATO HECS/HELP Thresholds
const HECS_THRESHOLDS = [
  { min: 54435, max: 62850, rate: 0.01 },   // 1%
  { min: 62851, max: 66620, rate: 0.02 },   // 2%
  // ... progressive rates up to 10%
  { min: 159664, max: Infinity, rate: 0.1 } // 10%
]
```

##### **HEM Data Integration:**
```javascript
// Current Household Expenditure Measure (2024)
const HEM_ESTIMATES = {
  single: { basic: 2850 },
  couple: { basic: 4200 },
  familyWithKids: { basic: 5400 }
}
```

##### **Investment Validation Logic:**
```javascript
const availableForInvesting = takehomeAfterHECS - totalMonthlyExpenses
const exceedsAvailable = monthlyInvesting > availableForInvesting
```

#### **📊 Enhanced Data Structure**

##### **Updated IncomeExpense Interface:**
```typescript
interface IncomeExpenseState {
  salary: number
  monthlyExpenses: number
  hasHECS: boolean
  hecsRepayment: number
  isRenting: boolean
  monthlyRent: number
  householdType: 'single' | 'couple' | 'familyWithKids'
  wageGrowthPct: number
}
```

#### **🎯 User Experience Enhancements**

##### **For Australian Users:**
1. **HECS Checkbox**: Simple checkbox that auto-calculates repayments using current ATO rates
2. **HEM Autofill**: One-click population of realistic living expenses based on household type
3. **Rent Separation**: Clear distinction between rent and other living expenses
4. **Investment Guardrails**: Prevents over-investing beyond financial capacity

##### **Enhanced Accuracy:**
1. **Real-time Validation**: Immediate feedback on affordability and available funds
2. **Government Compliance**: Uses current 2024-25 HECS thresholds and HEM data
3. **Smart Calculations**: Accounts for all deductions in available fund calculations
4. **Visual Indicators**: Clear color-coded feedback for all validation states

#### **🧪 Testing Status: FULLY VERIFIED**
- ✅ **HECS Calculation**: Accurate for all income brackets using 2024-25 ATO rates
- ✅ **HEM Integration**: Correct household expenditure estimates for all family types  
- ✅ **Rent Separation**: Proper conditional display and expense calculation
- ✅ **Investment Validation**: Accurate available funds calculation and warnings
- ✅ **Visual Design**: Blue checkboxes matching overall theme
- ✅ **User Experience**: Intuitive progressive disclosure and helpful messaging

#### **🎉 Production Ready Benefits:**
- **Australian Government Compliance**: Current HECS thresholds and HEM data
- **Enhanced User Experience**: Smart autofill and validation features  
- **Accurate Financial Planning**: Realistic expense estimates and investment capacity
- **Professional Design**: Consistent blue theme and polished interactions

### ✅ **Full Implementation Status: PRODUCTION READY**

#### **🎯 Core Features (v8.1 - Initial Implementation)**
- **5-Step Personalization Wizard**: Complete demographic and financial data collection
- **Australian Government Schemes**: NSW/VIC/QLD/WA/SA/TAS/ACT/NT state grants integration
- **Real-time Affordability Analysis**: Borrowing capacity, deposit requirements, timeline calculations
- **Location Intelligence**: Integration with AUSTRALIAN_CITIES data for market insights
- **SEO Optimization**: Complete meta tags, structured data, and social sharing

#### **🚀 Advanced Features (v8.2 - Normalized Architecture)**

##### **1. Normalized Data Architecture (COMPLETED)**
- **Single Source of Truth**: Personal demographics stored in `userProfile` collection
- **Data Separation**: Property-specific data in goal `metadata`, personal data in profile
- **Bidirectional Sync**: PropertyRealEstate ↔ Goals seamless integration
- **No Data Duplication**: Clean, maintainable architecture with proper normalization

##### **2. Enhanced Profile Management**
- **File**: `src/firebase/userProfile.js` - Enhanced with Australian demographics
- **New Fields**: `monthlyDebts`, `propertyPreferences`, complete demographics structure
- **Utility Functions**: Demographics management, government scheme eligibility
- **Data Validation**: Comprehensive validation for Australian residency and income requirements

##### **3. Property Goals Service (NEW)**
- **File**: `src/firebase/propertyGoals.js` - Complete normalized integration service
- **Key Functions**: 
  - `createOrUpdatePropertyGoal()` - Main integration function
  - `findExistingPropertyGoal()` - Goal detection and editing
  - `goalToPersonalizationData()` - Bidirectional data conversion
  - `recalculatePropertyGoal()` - Auto-updates when profile changes

##### **4. Cross-System Navigation**
- **PropertyRealEstate → Goals**: "View My Goals Dashboard" navigation
- **Goals → PropertyRealEstate**: Special 🏠 navigation button for HOME_DEPOSIT goals
- **Smart State Detection**: Existing goal detection with update vs create flows
- **Visual Indicators**: Property goal badges and helpful navigation notes

##### **5. Enhanced "Save Your Plan" Experience**
- **Clear Intent**: "💾 Save Your Personalized Plan" section with detailed explanation
- **Profile Data Preview**: Shows exactly what personal details will be saved
- **Two-Step Process Visualization**: 
  1. Update Your Profile (demographics, financial, preferences)
  2. Create/Update Your Goal (trackable savings target)
- **Enhanced Success Messaging**: Detailed confirmation of both profile updates AND goal creation
- **Smart Button UX**: "Save My Details & Create Goal" with context-aware messaging

#### **🏗️ Technical Architecture**

##### **File Structure:**
```
/src/pages/PropertyRealEstate.jsx     - Main wizard component (2000+ lines)
/src/firebase/propertyGoals.js        - Normalized data integration service
/src/firebase/userProfile.js          - Enhanced profile management
/src/pages/Goals.jsx                  - Enhanced with property goal navigation
```

##### **Data Flow Architecture:**
```
PropertyRealEstate Wizard Input
         ↓
    Personal Demographics → userProfile collection (single source of truth)
    Property Preferences  → userProfile.propertyPreferences
    Financial Data        → userProfile financial fields
         ↓
    Property-Specific Data → usergoals.metadata.property
         ↓
    Goals Dashboard Display & Tracking
```

##### **Key Integration Points:**
- **Authentication**: Full integration with existing `useAuth` context
- **Goal System**: Native integration with `userGoals.js` and goal templates
- **Profile System**: Enhanced `userProfile.js` with Australian-specific fields
- **Navigation**: Seamless routing between `/property-real-estate` and `/goals`
- **State Management**: Sophisticated form state with validation and persistence

#### **🎯 User Experience Highlights**

##### **For New Users:**
1. Complete 5-step property personalization wizard
2. See comprehensive "Save Your Plan" section showing exactly what will be saved
3. Click "Save My Details & Create Goal" to create both profile and trackable goal
4. Navigate to Goals dashboard to monitor progress

##### **For Existing Users:**
1. System detects existing property goals automatically
2. "Update My Details & Goal" flow preserves existing data
3. Cross-navigation between Goals and PropertyRealEstate for easy editing
4. Visual indicators show property goals with special 🏠 navigation buttons

#### **🔧 Recent Enhancements (v8.2)**

##### **Save Your Plan Section:**
- **Profile Data Summary**: Real-time preview of all form data that will be saved
- **Process Visualization**: Step-by-step explanation of profile update → goal creation
- **Enhanced Messaging**: Clear success confirmations with specific amounts and details
- **Smart State Detection**: Different experience for new vs existing property goals

##### **Goals Dashboard Integration:**
- **Property Goal Badges**: Special indicators for HOME_DEPOSIT goals
- **🏠 Navigation Button**: Direct link to PropertyRealEstate for editing
- **Helpful Notes**: "Use Property Calculator to modify location, property type..." guidance

#### **📊 Testing Status: FULLY VERIFIED**
- ✅ **Complete Wizard Flow**: All 5 steps with form validation
- ✅ **Profile Data Saving**: Demographics, financial, preferences correctly stored
- ✅ **Goal Creation**: Property goals created with proper metadata structure
- ✅ **Cross-System Navigation**: Seamless flow between PropertyRealEstate ↔ Goals
- ✅ **Existing Goal Detection**: Proper update vs create flows
- ✅ **Government Scheme Calculations**: Accurate FHG, FHSS, state grant eligibility
- ✅ **Authentication Integration**: Proper signed-in vs guest experiences

#### **🎉 Production Ready Features:**
- **Complete Australian Property Journey**: From research to goal creation to tracking
- **Government Compliance**: Accurate 2025 schemes, grants, and eligibility rules
- **Data Architecture**: Production-grade normalized database design
- **User Experience**: Intuitive, transparent, and educational property planning
- **Technical Integration**: Seamless with existing Goals, Profile, and Auth systems

## 📋 Development Standards & Architecture Guidelines

### **Data Architecture Principles:**
1. **Normalized Design**: Personal data in userProfile, goal-specific data in metadata
2. **Single Source of Truth**: Demographics stored once, referenced across systems
3. **Bidirectional Integration**: Systems work seamlessly together with cross-navigation
4. **Australian Compliance**: Government schemes, currency, terminology specific to Australia

### **User Experience Standards:**
1. **Transparency**: Always show users exactly what will be saved where
2. **Progressive Disclosure**: Step-by-step information revelation
3. **Visual Process Indicators**: Clear steps and progress visualization
4. **Smart State Management**: Different experiences for new vs existing users
5. **Comprehensive Success Messaging**: Detailed confirmations with specific amounts

### **Technical Implementation:**
1. **Component Organization**: Large components (2000+ lines) acceptable for complex wizards
2. **Service Layer**: Dedicated services for cross-system integration (propertyGoals.js)
3. **Enhanced Schemas**: Profile schemas enhanced with domain-specific fields
4. **Navigation Patterns**: Cross-system navigation with visual indicators and helpful notes

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
Never save working files, text/mds and tests to the root folder.

- Documentation edits for Planner MVP must batch updates to existing files only (no new MDs). Group related sections per file and commit them together.
- Do not write simulation outputs to root or Firestore; only scenario inputs/presets may be persisted under /users/{uid}/plannerScenarios/*.
