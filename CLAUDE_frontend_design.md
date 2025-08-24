# Optimise Frontend Architecture & Design

**Project:** Optimise - FIRE Calculator & Retirement Planning App  
**Version:** 1.2 - Frontend Architecture Design  
**Date:** 10 Aug 2025  
**Status:** Comprehensive Frontend Design Document

---

## 🎯 **Frontend Strategy Overview**

### **Hybrid Architecture Decision**
**Chosen Approach:** Strategy 1 - Hybrid Static + SPA  
**Migration Path:** Strategy 3 - Meta Framework (Next.js) when scale requires

### **Core Principles**
1. **SEO-First Marketing** - Static pages for discovery and conversion
2. **Premium SPA Experience** - Seamless authenticated user journey  
3. **Mobile-First Design** - Australian users primarily on mobile
4. **Performance Optimized** - Fast loading, smooth interactions
5. **Migration-Ready** - Architecture supports future framework transitions

---

## MVP Planner (6‑Approach) Scope
- **Wizard Step 1 — Goal Setter**
  - Inputs: currentAge, state, maritalStatus, dependentsCount, retireAge, targetIncomeYearly OR targetCapital, riskProfile, assumptionPreset (Conservative | Base | Optimistic)
  - Validation: retireAge > currentAge; reasonable bounds for target income/capital
- **Wizard Step 2 — Current Financials (tabbed)**
  - **Income/Expenses:** salary, bonus?, wageGrowthPct, expensesMonthly
  - **Super:** balance, SGRate (default AU), salarySacrificeMonthly, option (Balanced | Growth | HighGrowth), feePct, concessionalCapYearly (from Settings)
  - **Property:** value, loanBalance, ratePct, ioOrPi (IO | PI), termMonths, offsetBalance, rentPerWeek, mgmtFeePct (default 7%), insuranceYearly (default 500), councilRatesYearly (default 1800), maintenancePctOfRent (default 5%), vacancyPct (default 2%), extraRepaymentMonthly
  - **Portfolio (outside super):** startingBalance, dcaMonthly, allocationPreset (OneETF | TwoETF), weights { aus: 0.4, global: 0.6 } when TwoETF, feePct
  - **Buffers:** emergencyMonths (default 6), propertyMonths (default 6)
- **Planner Modules**
  - **Super:** salarySacrificeMonthly slider, option selector; concessional cap bar (success <90%, warning 90-99%, error >100%); contributions tax 15%; preservationAge = 60 (MVP)
  - **ETFs:** OneETF vs TwoETF toggle; dcaMonthly; bridge years = outsideSuperAtRetire / targetIncomeYearly for retireAge → age 60; buffer policy pauses DCA when cash < buffers
  - **Property:** IO vs PI toggle; extraRepaymentMonthly slider; stress test at 2% above current rate
- **Guardrails & Messages**
  - Super cap usage messages (approaching/over cap)
  - Bridge coverage callout when < 3 years coverage outside super
  - Property stress test results (can service loan at +2%?)

**Note:** MVP mode uses client‑side simulation only. Database persistence is optional and should store user inputs/presets, not per‑month results. Planned API endpoints and SQL schemas remain relevant for Phase 2/3 server‑side features (compare scenarios, batch runs).

### **Firestore Data Contract**
```json
{
  "users/{uid}/plannerScenarios/{id}": {
    "goal": { "retireAge": 65, "targetIncomeYearly": 60000, "assumptionPreset": "Base" },
    "incomeExpense": { "salary": 110000, "wageGrowthPct": 0.03, "expensesMonthly": 3500 },
    "super": { "balance": 180000, "SGRate": 0.11, "salarySacrificeMonthly": 800, "option": "Growth", "feePct": 0.007, "concessionalCapYearly": 27500 },
    "property": { "value": 750000, "loanBalance": 600000, "ratePct": 0.065, "ioOrPi": "PI", "termMonths": 300, "offsetBalance": 20000, "rentPerWeek": 650, "mgmtFeePct": 0.07, "insuranceYearly": 500, "councilRatesYearly": 1800, "maintenancePctOfRent": 0.05, "vacancyPct": 0.02, "extraRepaymentMonthly": 300 },
    "portfolio": { "startingBalance": 20000, "dcaMonthly": 1000, "allocationPreset": "TwoETF", "weights": { "aus": 0.4, "global": 0.6 }, "feePct": 0.0015 },
    "buffers": { "emergencyMonths": 6, "propertyMonths": 6 },
    "preservation": { "preservationAge": 60 },
    "createdAt": "...", "updatedAt": "..."
  }
}
```

**Note:** Do not store time series; recompute on demand.

---

## 🏗️ **Architecture Overview**

### **Application Boundaries**
```
📱 MARKETING SITE (Static/SEO)           🔐 AUTHENTICATED APP (SPA)
├── Landing page (/)                     ├── Dashboard (/app/dashboard)
├── Destinations (/destinations/*)       ├── Planner (/app/planner) [Primary]
├── Calculator (/app/calculator) [Alias to planner]
├── Calculators (/calculators/*)         ├── Profile (/app/profile)
├── Guides (/guides/*)                   ├── Scenarios (/app/scenarios)
└── Blog (/blog/*)                       └── Settings (/app/settings)

🌍 PUBLIC (Crawlable)                    🔒 PRIVATE (App Shell)
```

### **Tech Stack Separation**
```jsx
// Marketing Site (SEO-Optimized)
const marketingStack = {
  framework: 'Astro 4.x',           // Static site generation
  styling: 'Tailwind CSS v4',       // Shared design system
  components: 'Astro + React',      // Hybrid component approach
  deployment: 'Netlify Static',     // CDN optimization
  performance: 'Perfect Lighthouse scores'
}

// Authenticated App (SPA)
const appStack = {
  framework: 'React 19 + Vite',     // Existing optimized setup
  routing: 'React Router',          // Client-side navigation
  state: 'Firebase + Context',      // Real-time data sync
  deployment: 'Netlify SPA',        // Single page application
  performance: 'Code splitting + lazy loading'
}
```

---

## 📊 **User Journey & Routing Strategy**

### **User Flow Architecture**
```
🌐 Anonymous User Journey
Landing (/) → Destinations → Calculator → Auth Prompt → Dashboard

🔐 Authenticated User Journey  
Dashboard → Calculator → Results → Scenarios → Profile Updates

📱 Mobile-First Navigation
Sticky Header → Quick Actions → Context-Aware CTAs
```

### **Routing Implementation**
```jsx
// Public Routes (Static/SEO)
const publicRoutes = [
  '/',                              // Landing page
  '/destinations/bali',             // SEO destination pages
  '/destinations/thailand',         // Individual destination calculators
  '/destinations/portugal',
  '/calculators/compound',          // Standalone calculators
  '/calculators/superannuation',
  '/guides/fire-australia',        // Educational content
  '/blog/retirement-planning'       // Content marketing
]

// Private Routes (SPA)
const privateRoutes = [
  '/app',                          // Redirect to dashboard
  '/app/dashboard',                // Main user dashboard
  '/app/calculator',               // Enhanced opportunity cost calc
  '/app/profile',                  // User settings & financial profile
  '/app/scenarios',                // Retirement scenario management
  '/app/destinations',             // Personalized destination comparison
  '/app/settings'                  // Account settings
]

// Hybrid Routing Strategy
const routingConfig = {
  static: 'Serve pre-built HTML for SEO routes',
  spa: 'React Router for authenticated routes',
  fallback: 'Static 404 → SPA catch-all for /app/*'
}
```

---

## 🎨 **Dashboard Design Architecture**

### **Information Hierarchy**
```
┌─────────────────────────────────────────────────────────────┐
│ HEADER: Welcome back + Quick Actions                        │
├─────────────────────────────────────────────────────────────┤
│ HERO: Retirement Progress Overview                          │
│ ├─ Progress Ring (% to retirement goal)                   │
│ ├─ Key Metrics (savings, years left, monthly target)      │  
│ └─ Primary CTA (New Calculation)                          │
├─────────────────────────────────────────────────────────────┤
│ ACTION CARDS: Quick Access                                  │
│ ├─ Skip or Stack Calculator                               │
│ ├─ Explore Destinations                                   │
│ └─ Update Financial Profile                               │
├─────────────────────────────────────────────────────────────┤
│ INSIGHTS: Recent Activity                                   │
│ ├─ Recent Calculations (3 most recent)                    │
│ ├─ Smart Choices Impact (opportunity cost savings)        │
│ └─ Progress Trend (simple visualization)                  │
├─────────────────────────────────────────────────────────────┤
│ SCENARIOS: Active Retirement Plans                         │
│ ├─ Destination-based scenarios (cards)                    │
│ ├─ Progress tracking per scenario                         │
│ └─ Add new scenario CTA                                   │
└─────────────────────────────────────────────────────────────┘
```

### **Component Architecture**
```jsx
// Dashboard Component Hierarchy
<Dashboard>
  <DashboardHeader user={user} />
  <ProgressHero metrics={calculatedMetrics} />
  <ActionCards onNavigate={handleNavigation} />
  <InsightsSection 
    recentCalculations={recentCalcs}
    opportunityCostSummary={summaryData}
  />
  <RetirementScenarios 
    scenarios={userScenarios}
    onScenarioSelect={handleScenarioView}
  />
</Dashboard>

// Responsive Design Breakpoints
const responsiveLayout = {
  mobile: '< 768px - Single column, stacked layout',
  tablet: '768px - 1024px - 2-column grid with sidebar', 
  desktop: '> 1024px - 3-column layout with expanded metrics'
}
```

### **Data Integration Pattern**
```jsx
// Real-time Dashboard Data Flow
const useDashboardData = (userId) => {
  const [dashboardState, setDashboardState] = useState({
    profile: null,
    recentCalculations: [],
    retirementScenarios: [],
    opportunityCosts: [],
    loading: true
  })

  useEffect(() => {
    // Set up Firebase real-time listeners
    const unsubscribers = []
    
    // User profile data
    const profileUnsub = onSnapshot(
      doc(db, 'userProfiles', userId), 
      (doc) => updateDashboardState('profile', doc.data())
    )
    
    // Recent calculations  
    const calculationsUnsub = onSnapshot(
      query(
        collection(db, 'users', userId, 'opportunityCosts'),
        orderBy('createdAt', 'desc'),
        limit(10)
      ),
      (snapshot) => updateDashboardState('recentCalculations', snapshot.docs)
    )
    
    return () => unsubscribers.forEach(unsub => unsub())
  }, [userId])

  // Calculate derived metrics
  const calculatedMetrics = useMemo(() => {
    return calculateProgressMetrics(dashboardState)
  }, [dashboardState])

  return { dashboardState, calculatedMetrics }
}
```

---

## 🎯 **SEO Architecture & Content Strategy**

### **High-Value SEO Pages**
```jsx
const seoPages = [
  {
    route: '/destinations/bali',
    title: 'Retire in Bali Calculator - Cost & FIRE Planning | Optimise',
    keywords: 'Bali retirement calculator, Indonesia cost living',
    searchVolume: 1900,
    content: 'Interactive calculator + destination guide'
  },
  {
    route: '/calculators/superannuation-vs-investing',
    title: 'Super vs Investing Calculator - Australia 2025 | Optimise',
    keywords: 'superannuation calculator, super vs investing Australia',
    searchVolume: 8100,
    content: 'Tax comparison calculator + educational content'
  },
  {
    route: '/guides/fire-calculator-australia',
    title: 'Complete FIRE Calculator Guide for Australians | Optimise',
    keywords: 'FIRE calculator Australia, financial independence',
    searchVolume: 2400,
    content: 'Comprehensive guide + embedded calculators'
  }
]
```

### **Technical SEO Implementation**
```jsx
// SEO-Optimized Page Template
const SEOPage = ({ seoData, children }) => (
  <html lang="en-AU">
    <head>
      <title>{seoData.title}</title>
      <meta name="description" content={seoData.description} />
      <meta name="keywords" content={seoData.keywords} />
      <link rel="canonical" href={`https://optimise.app${seoData.path}`} />
      
      {/* Open Graph */}
      <meta property="og:title" content={seoData.title} />
      <meta property="og:description" content={seoData.description} />
      <meta property="og:image" content={seoData.ogImage} />
      <meta property="og:type" content="website" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoData.title} />
      <meta name="twitter:description" content={seoData.description} />
      
      {/* Schema.org Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(seoData.schema)}
      </script>
      
      {/* Australian Localization */}
      <meta name="geo.region" content="AU" />
      <meta name="geo.country" content="Australia" />
      <meta name="currency" content="AUD" />
    </head>
    <body>{children}</body>
  </html>
)

// Structured Data for Calculators
const calculatorSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Optimise FIRE Calculator",
  "description": "Australian retirement and FIRE planning calculator",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "AUD"
  },
  "featureList": [
    "Compound interest calculation",
    "Retirement destination comparison", 
    "Superannuation vs investing analysis",
    "Opportunity cost tracking"
  ]
}
```

---

## 📱 **Responsive Design System**

### **Mobile-First Implementation** 
```jsx
// Tailwind CSS v4 Responsive Strategy
const responsiveDesign = {
  // Mobile (< 640px) - Primary experience
  mobile: {
    layout: 'Single column, stacked components',
    navigation: 'Bottom tab bar with key actions',
    hero: 'Large progress ring, simplified metrics',
    cards: 'Full-width action cards with icons',
    spacing: 'Generous touch targets (44px minimum)'
  },
  
  // Tablet (640px - 1024px) - Enhanced experience  
  tablet: {
    layout: '2-column grid with flexible sidebar',
    navigation: 'Top navigation with breadcrumbs',
    hero: 'Horizontal layout with expanded metrics',
    cards: '2x2 grid of action cards',
    spacing: 'Balanced desktop/mobile patterns'
  },
  
  // Desktop (> 1024px) - Full experience
  desktop: {
    layout: '3-column layout with detailed sidebar',
    navigation: 'Full navigation with all options',
    hero: 'Comprehensive dashboard with all metrics',
    cards: '3-across action cards with descriptions', 
    spacing: 'Dense information display'
  }
}
```

### **Component Responsiveness**
```jsx
// Responsive Dashboard Components
const ResponsiveDashboard = () => (
  <div className="
    px-4 py-6 space-y-6                    // Mobile: Simple stacked layout
    md:px-6 md:py-8 md:space-y-8          // Tablet: More breathing room  
    lg:px-8 lg:py-12 lg:max-w-7xl lg:mx-auto lg:space-y-12  // Desktop: Constrained width
  ">
    
    {/* Progress Hero - Responsive Layout */}
    <div className="
      dashboard-card text-center           // Mobile: Center-aligned
      md:text-left                        // Tablet: Left-aligned
      lg:flex lg:items-center lg:justify-between  // Desktop: Horizontal
    ">
      <ProgressRing size="mobile md:large lg:xl" />
      <MetricsGrid layout="stacked md:grid lg:horizontal" />
    </div>
    
    {/* Action Cards - Responsive Grid */}
    <div className="
      space-y-4                           // Mobile: Stacked
      md:grid md:grid-cols-2 md:gap-6 md:space-y-0  // Tablet: 2x2 grid
      lg:grid-cols-3                     // Desktop: 3-across
    ">
      {actionCards.map(card => <ActionCard key={card.id} {...card} />)}
    </div>
    
  </div>
)

// Responsive Navigation
const Navigation = () => (
  <>
    {/* Mobile: Bottom Tab Bar */}
    <div className="
      fixed bottom-0 left-0 right-0 bg-white border-t z-50
      md:hidden
    ">
      <BottomTabs />
    </div>
    
    {/* Tablet/Desktop: Top Navigation */}
    <div className="
      hidden md:block sticky top-0 bg-white/90 backdrop-blur-sm border-b z-40
    ">
      <TopNavigation />
    </div>
  </>
)
```

---

## ⚡ **Performance Optimization Strategy**

### **Code Splitting Architecture**
```jsx
// Route-based Code Splitting
const routes = [
  {
    path: '/',
    component: lazy(() => import('./pages/Landing')),
    preload: true  // Critical landing page
  },
  {
    path: '/app/dashboard', 
    component: lazy(() => import('./components/Dashboard')),
    preload: 'authenticated'  // Preload after login
  },
  {
    path: '/app/calculator',
    component: lazy(() => import('./components/Calculator')),
    preload: false  // Load on demand
  },
  {
    path: '/destinations/:slug',
    component: lazy(() => import('./pages/Destination')),
    preload: false  // SEO pages load separately
  }
]

// Component-level Splitting
const Dashboard = lazy(() => 
  import('./Dashboard').then(module => ({ 
    default: module.Dashboard 
  }))
)

const AdvancedCharts = lazy(() => 
  import('./charts/AdvancedCharts')
)
```

### **Loading Strategy**
```jsx
// Progressive Loading Implementation
const LoadingStrategy = {
  // Critical (< 1s)
  immediate: [
    'Landing page shell',
    'Navigation components', 
    'Authentication modal',
    'Basic calculator'
  ],
  
  // Important (< 3s)  
  deferred: [
    'Dashboard components',
    'User profile data',
    'Recent calculations',
    'Progress visualizations'
  ],
  
  // Nice-to-have (< 5s)
  lazy: [
    'Advanced charts',
    'Destination details',
    'Historical data',
    'Export functionality'
  ]
}

// Implementation with Suspense
const App = () => (
  <Suspense fallback={<AppSkeleton />}>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/app/*" element={
        <Suspense fallback={<DashboardSkeleton />}>
          <AuthenticatedApp />
        </Suspense>
      } />
    </Routes>
  </Suspense>
)
```

### **Bundle Optimization**
```jsx
// Webpack Bundle Analysis
const bundleOptimization = {
  // Target Bundle Sizes
  initial: '<300KB',      // Critical path
  dashboard: '<200KB',    // Main app functionality
  calculator: '<100KB',   // Core calculator
  destinations: '<150KB', // Destination pages
  
  // Optimization Techniques
  treeshaking: 'Remove unused Firebase modules',
  compression: 'Brotli + Gzip compression',
  chunking: 'Vendor chunks + route chunks',
  preloading: 'Critical resource preloading'
}

// Vite Configuration
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          charts: ['framer-motion', 'lucide-react']
        }
      }
    }
  }
})
```

---

## 🔄 **Migration Strategy: Hybrid → Meta Framework**

### **Migration Timeline & Readiness**
```jsx
const migrationReadiness = {
  // Decision Triggers
  performance: 'Core Web Vitals consistently poor',
  seo: 'Static generation insufficient for SEO needs',
  complexity: 'Dual codebase maintenance burden',
  team: 'Advanced framework expertise developed',
  scale: 'Traffic outgrows current architecture',
  
  // Estimated Timeline
  evaluation: '1-2 weeks',   // Assess current performance
  planning: '2-3 weeks',     // Migration strategy development  
  migration: '4-6 weeks',    // Incremental migration execution
  optimization: '2-3 weeks', // Performance tuning
  
  // Total: 9-14 weeks depending on complexity
}
```

### **Migration-Friendly Architecture Patterns**
```jsx
// Component Design for Migration
const MigrationFriendlyComponent = ({
  data,      // Accept data as props (server or client)
  children,  // Composition over configuration
  className, // Style flexibility
  ...props   // Forward compatibility
}) => {
  // Avoid framework-specific patterns
  // Use standard React patterns
  // Keep business logic separate from framework concerns
  
  return (
    <div className={cn('base-styles', className)} {...props}>
      {children}
    </div>
  )
}

// Data Fetching Abstraction
const useUserData = (userId) => {
  // Abstract data fetching for easy server-side migration
  return useSWR(`/api/users/${userId}`, getUserProfile)
}

// Route-agnostic Navigation
const useNavigation = () => {
  // Abstract navigation for framework independence
  const router = useRouter() // React Router initially
  return {
    navigate: router.navigate,
    back: router.back,
    replace: router.replace
  }
}
```

### **Component Compatibility Matrix**
```jsx
const compatibilityMatrix = {
  // High Compatibility (95%+ portable)
  highCompat: [
    'UI Components (pure React)',
    'Business Logic (JavaScript functions)',
    'Utility Functions (formatters, validators)',
    'Constants & Configuration',
    'Tailwind CSS Classes'
  ],
  
  // Medium Compatibility (80% portable)  
  mediumCompat: [
    'Data Fetching Hooks',
    'Authentication Context',
    'Form Components',
    'Navigation Components',
    'State Management'
  ],
  
  // Low Compatibility (50% portable)
  lowCompat: [
    'Route Configuration',
    'Server State Management', 
    'Build Configuration',
    'Deployment Scripts'
  ]
}
```

---

## 🎯 **Implementation Roadmap**

### **Phase 1: Hybrid Foundation (4 weeks)**
```
Week 1: Set up Astro for marketing site
├── Initialize Astro project structure
├── Create shared component library
├── Implement basic SEO pages (/, /destinations/bali)
└── Set up Tailwind CSS design system

Week 2: SEO Content Pages
├── Destination calculator pages
├── Educational content (FIRE guides)
├── Structured data implementation
└── Open Graph optimization

Week 3: SPA Integration
├── Update existing React app for /app/* routes
├── Implement dashboard components
├── Real-time Firebase integration
└── Authentication flow refinement

Week 4: Performance & Testing
├── Code splitting optimization
├── Loading state implementation
├── Mobile responsive testing
└── SEO validation & analytics setup
```

### **Phase 2: Dashboard Enhancement (2 weeks)**
```
Week 5: Dashboard Core Features
├── Progress visualization components
├── Action cards with navigation
├── Recent activity display
└── Retirement scenarios grid

Week 6: Advanced Dashboard Features  
├── Real-time data synchronization
├── Performance optimizations
├── Accessibility improvements
└── Analytics event tracking
```

### **Phase 3: Content & SEO (2 weeks)**
```
Week 7: High-Value SEO Content
├── Superannuation calculator page
├── FIRE planning guides
├── Destination comparison tools
└── Content optimization for search

Week 8: Launch Preparation
├── Performance audit & optimization
├── SEO testing & validation
├── User acceptance testing
└── Production deployment
```

---

## 📈 **Success Metrics & KPIs**

### **Performance Targets**
```jsx
const performanceKPIs = {
  // Core Web Vitals
  LCP: '<2.5s',          // Largest Contentful Paint
  FID: '<100ms',         // First Input Delay  
  CLS: '<0.1',           // Cumulative Layout Shift
  
  // User Experience
  timeToInteractive: '<3s',
  firstByte: '<200ms',
  navigationSpeed: '<100ms',
  
  // Business Metrics
  bounceRate: '<40%',
  sessionDuration: '>3min',
  conversionRate: '>5%',  // Anonymous → Signed up
  retentionRate: '>60%'   // Weekly active users
}
```

### **SEO Success Metrics**
```jsx
const seoKPIs = {
  // 6-month targets
  organicTraffic: '2,000+ monthly visitors',
  keywordRankings: {
    'FIRE calculator Australia': 'Top 3',
    'Superannuation calculator': 'Top 5', 
    'Bali retirement cost': 'Top 3',
    'Australia retirement planning': 'Top 5'
  },
  
  // Content performance
  averagePosition: '<5',
  clickThroughRate: '>3%',
  organicConversions: '100+ monthly signups'
}
```

---

## ✅ **Architecture Summary**

### **Strategic Benefits**
1. **SEO Foundation** - Marketing pages optimized for organic discovery
2. **Premium User Experience** - Seamless SPA for authenticated users
3. **Performance Optimized** - Fast loading with progressive enhancement
4. **Scalable Architecture** - Clear migration path to advanced frameworks
5. **Mobile-First Design** - Optimized for primary user device

### **Technical Excellence**
- **Component Reusability** - Shared components across marketing and app
- **Real-time Data** - Firebase integration with optimistic updates
- **Responsive Design** - Mobile, tablet, desktop optimized
- **Code Splitting** - Optimized bundle sizes and loading strategies
- **Migration Ready** - Architecture patterns support future framework changes

### **Business Impact**
- **User Acquisition** - SEO-driven organic traffic growth
- **User Retention** - Premium dashboard experience drives engagement  
- **Conversion Optimization** - Seamless anonymous to authenticated journey
- **Scalability** - Architecture supports growth without technical debt

This frontend architecture positions Optimise for sustainable growth with excellent user experience and strong SEO foundation! 🚀

---

## 🚀 **MVP Planner Implementation Roadmap**

### **Phase 1: Foundation (Week 1)**
1. **Settings & Constants**
   - Create SettingsContext with Firestore persistence
   - Default values: concessionalCap 27500, HighGrowth super, 40/60 ETF weights
   - Add /app/settings UI with concessional cap editor (FY label)

2. **Routing & Auth**
   - Add /app/planner route to private routes  
   - Reuse existing AuthContext integration
   - Gate behind authentication with redirect flow

3. **Types & Validation**
   - Define TypeScript interfaces for PlannerInput, ScenarioResult, AppSettings
   - Create Zod schemas with defaults for all form inputs
   - Implement form-level and pre-simulation validation

### **Phase 2: Core Planner (Week 2)**
4. **Wizard Foundation**
   - Step 1: GoalSetter with assumption presets (Conservative/Base/Optimistic)
   - Step 2: CurrentFinancials with tabbed interface
   - Form state management with persistence between steps

5. **Financial Input Modules**
   - Income/Expenses tab with salary, wage growth, expenses
   - Super tab with balance, SG rate, salary sacrifice, option selector
   - Property tab with all fields including extraRepaymentMonthly slider
   - Portfolio tab with OneETF/TwoETF toggle and weight editor
   - Buffers tab with emergency/property months sliders

### **Phase 3: Simulation Engine (Week 2-3)**
6. **Web Worker Implementation** 
   - Pure runScenario function with all calculation modules
   - Taxes (simplified AU), Super (cap enforcement), ETFs (DCA + pausing), Property (amortization + stress), Buffers (cash runway)
   - Performance: math in cents, debounced inputs, minimal postMessage
   - Unit tests for amortization, cap logic, buffer pausing, bridge calculation

7. **Planner Modules UI**
   - SuperPlanner: cap bar with traffic light states, helper text for FY limits
   - ETFPlanner: allocation toggle, DCA slider, bridge coverage chip, buffer pause banner  
   - PropertyPlanner: stress test display, extra repayment impacts
   - Real-time simulation with debounced slider updates

### **Phase 4: Results & Polish (Week 3-4)**
8. **Results Dashboard**
   - KPIs: net worth at retirement, super/outside-super balances, bridge years
   - 3 core charts: net worth over time, super vs portfolio, property equity/LVR
   - CSV export functionality (client-generated, not persisted)

9. **Persistence & Analytics**
   - Firestore service for plannerScenarios CRUD (inputs only)
   - Scenario save/load with recompute-on-demand approach
   - Analytics events integration (30+ events from CLAUDE_MCPs.md)

10. **Accessibility & Polish**
    - aria-labels for cap usage, bridge coverage, stress test results
    - aria-live regions for dynamic warnings and pause notifications  
    - Keyboard navigation, focus management, screen reader testing
    - Performance optimization: code splitting, lazy loading, Suspense fallbacks

### **Exact Implementation Labels & Defaults**
```typescript
// Settings defaults (editable)
const DEFAULTS = {
  concessionalCapYearly: 27500,
  capLabel: "Concessional cap (FY 2025–26)",
  defaultSuperOption: 'HighGrowth',
  twoETFDefaultWeights: { aus: 0.4, global: 0.6 },
  
  // Fixed in MVP
  preservationAge: 60,
  defaultBuffers: { emergencyMonths: 6, propertyMonths: 6 },
  
  // Property defaults  
  mgmtFeePct: 0.07,
  insuranceYearly: 500,
  councilRatesYearly: 1800,
  maintenancePctOfRent: 0.05,
  vacancyPct: 0.02
}
```

### **Success Criteria**
- ✅ Client-side simulation <200ms for 40-year projections
- ✅ UI responsiveness <50ms slider lag  
- ✅ Bundle sizes within targets (Planner <150KB, Worker <100KB)
- ✅ All 30+ analytics events implemented
- ✅ Accessibility compliance (WCAG 2.1 AA)
- ✅ No time-series persistence (inputs only)
- ✅ Firestore security rules implemented

---

**Document Status:** Complete Frontend Architecture Design + MVP Implementation Roadmap  
**Last Updated:** 24 Aug 2025  
**Next Phase:** MVP Planner Implementation (4 weeks)