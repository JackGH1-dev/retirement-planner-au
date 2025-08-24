**List of MCPs Used**

1. Github - connect and view repos
2. Playwright - view browser and console (More than just testing)
3. Future (not yet implemented) - email SMTP

**List of other plugins used**
1. Mermaid.js (diagram visualiser)

---

## MVP Planner Analytics Events

### Core User Journey Events
```javascript
// Planner engagement
'planner_opened' // when /app/planner loads
'wizard_step_completed' // { step: 1 | 2, section?: string }
'assumption_preset_changed' // { from: string, to: string }

// Module interactions
'super_slider_adjusted' // { salarySacrificeMonthly: number, capUsagePercent: number }
'etf_allocation_changed' // { preset: 'OneETF' | 'TwoETF', weights?: { aus: number, global: number } }
'property_extra_payment_set' // { extraRepaymentMonthly: number }
'buffer_months_adjusted' // { type: 'emergency' | 'property', months: number }

// Guardrails and warnings
'cap_warning_shown' // { capUsagePercent: number, suggestedMonthly: number }
'bridge_coverage_warning' // { bridgeYears: number, targetYears: number }
'property_stress_test_failed' // { currentRate: number, stressRate: number }
'dca_paused_for_buffers' // { bufferType: 'emergency' | 'property', monthsShort: number }
'dca_resumed_after_buffer_recovery' // { bufferType: string }

// Scenario management
'scenario_saved' // { scenarioId: string, name: string }
'scenario_loaded' // { scenarioId: string }
'scenario_duplicated' // { fromScenarioId: string, toScenarioId: string }

// Export and sharing
'csv_exported' // { scenarioId: string, dataPoints: number }
'results_shared' // { method: 'link' | 'screenshot' }
```

### Performance Monitoring Events
```javascript
// Simulation performance
'simulation_started' // { inputHash: string }
'simulation_completed' // { duration: number, dataPoints: number }
'simulation_error' // { error: string, inputContext: object }

// UI responsiveness  
'planner_load_time' // { duration: number, componentsLoaded: number }
'slider_interaction_lag' // { component: string, lagMs: number }
'chart_render_time' // { chartType: string, dataPoints: number, renderMs: number }

// Bundle and loading
'web_worker_load_time' // { duration: number }
'settings_load_time' // { duration: number }
'scenario_load_time' // { scenarioId: string, duration: number }
```

### User Behavior Insights
```javascript
// Feature adoption
'first_time_planner_user' // user opens planner for first time
'advanced_feature_used' // { feature: 'extraRepayments' | 'stressTest' | 'customWeights' }
'preset_preference' // { mostUsedPreset: 'Conservative' | 'Base' | 'Optimistic' }

// Engagement patterns
'planner_session_duration' // { durationMinutes: number, adjustmentsMade: number }
'settings_customization' // { concessionalCapChanged: boolean, defaultsChanged: boolean }
'multiple_scenarios_created' // { totalScenarios: number }
```

### MVP Performance Requirements
- **Simulation latency:** <200ms for standard scenarios (<40 years projection)
- **UI responsiveness:** Slider interactions <50ms lag
- **Bundle size targets:** 
  - Main planner component: <150KB
  - Web Worker simulation: <100KB
  - Settings context: <20KB
- **Memory usage:** <50MB total for planner session with 3 scenarios
- **Chart rendering:** <500ms for standard time series (480 data points)