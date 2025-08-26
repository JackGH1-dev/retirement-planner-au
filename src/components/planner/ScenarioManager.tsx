/**
 * Scenario Manager Component
 * Provides UI for saving, loading, and managing property planning scenarios
 */

import React, { useState, useEffect } from 'react'
import {
  getSavedScenarios,
  saveScenario,
  loadScenario,
  deleteScenario,
  duplicateScenario,
  exportScenarios,
  importScenarios,
  getScenarioSummary,
  getAutoSavedScenario,
  type PropertyScenario
} from '../../utils/scenarioManager'

interface ScenarioManagerProps {
  plannerState: any
  onLoadScenario: (plannerState: any) => void
  onScenarioSaved?: () => void
  className?: string
}

export const ScenarioManager: React.FC<ScenarioManagerProps> = ({
  plannerState,
  onLoadScenario,
  onScenarioSaved,
  className = ''
}) => {
  const [scenarios, setScenarios] = useState<PropertyScenario[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saveDescription, setSaveDescription] = useState('')
  const [selectedScenario, setSelectedScenario] = useState<PropertyScenario | null>(null)
  const [importData, setImportData] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  // Load scenarios on component mount
  useEffect(() => {
    refreshScenarios()
  }, [])

  const refreshScenarios = () => {
    try {
      const loadedScenarios = getSavedScenarios()
      console.log('[ScenarioManager] Loaded scenarios:', loadedScenarios.length, loadedScenarios)
      setScenarios(loadedScenarios)
    } catch (error) {
      console.error('[ScenarioManager] Error loading scenarios:', error)
      setScenarios([])
    }
  }

  const handleSave = async () => {
    try {
      if (!saveName.trim()) {
        alert('Please enter a scenario name')
        return
      }

      await saveScenario(saveName, plannerState, saveDescription)
      refreshScenarios()
      setShowSaveDialog(false)
      setSaveName('')
      setSaveDescription('')
      onScenarioSaved?.()
      alert('Scenario saved successfully!')
    } catch (error: any) {
      alert(error.message || 'Failed to save scenario')
    }
  }

  const handleLoad = (scenario: PropertyScenario) => {
    if (window.confirm(`Load "${scenario.name}"? This will replace your current property data.`)) {
      onLoadScenario(scenario.plannerState)
      setShowLoadDialog(false)
      setSelectedScenario(null)
    }
  }

  const handleDelete = (scenario: PropertyScenario) => {
    if (window.confirm(`Delete "${scenario.name}"? This action cannot be undone.`)) {
      deleteScenario(scenario.id)
      refreshScenarios()
    }
  }

  const handleDuplicate = (scenario: PropertyScenario) => {
    const newName = prompt(`Enter name for duplicate:`, `${scenario.name} (Copy)`)
    if (newName?.trim()) {
      duplicateScenario(scenario.id, newName.trim())
      refreshScenarios()
    }
  }

  const handleExport = (scenarioIds?: string[]) => {
    try {
      const jsonData = exportScenarios(scenarioIds)
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `property-scenarios-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error: any) {
      alert(error.message || 'Failed to export scenarios')
    }
  }

  const handleImport = () => {
    try {
      if (!importData.trim()) {
        alert('Please paste the JSON data to import')
        return
      }

      const result = importScenarios(importData, true)
      refreshScenarios()
      setShowImportDialog(false)
      setImportData('')
      
      let message = `Import completed!\n• Imported: ${result.imported} scenarios`
      if (result.skipped > 0) message += `\n• Skipped: ${result.skipped} scenarios`
      if (result.errors.length > 0) message += `\n• Errors: ${result.errors.length}`
      
      alert(message)
    } catch (error: any) {
      alert(error.message || 'Failed to import scenarios')
    }
  }

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImportData(e.target?.result as string || '')
      }
      reader.readAsText(file)
    }
  }

  const autoSaved = getAutoSavedScenario()

  if (!isExpanded) {
    return (
      <div className={`bg-indigo-50 border border-indigo-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💾</span>
            <div>
              <h3 className="font-semibold text-indigo-900">Retirement Plan Manager</h3>
              <p className="text-indigo-700 text-sm">Save and load complete retirement plans</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
          >
Manage Plans
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-indigo-50 border border-indigo-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">💾</span>
          <h3 className="font-semibold text-indigo-900">Retirement Plan Manager</h3>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-indigo-600 hover:text-indigo-800 text-xl"
        >
          ✕
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <button
          onClick={() => setShowSaveDialog(true)}
          className="p-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
        >
          💾 Save Plan
        </button>
        <button
          onClick={() => setShowLoadDialog(true)}
          className="p-3 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
        >
          📂 Load Plan
        </button>
        <button
          onClick={() => handleExport()}
          className="p-3 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
        >
          📤 Export All
        </button>
        <button
          onClick={() => setShowImportDialog(true)}
          className="p-3 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
        >
          📥 Import
        </button>
      </div>

      {/* Auto-saved Scenario */}
      {autoSaved && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-yellow-800">🔄 Auto-saved Session</div>
              <div className="text-yellow-700 text-xs">
                Last saved: {new Date(autoSaved.lastModified).toLocaleString()}
              </div>
            </div>
            <button
              onClick={() => handleLoad(autoSaved)}
              className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
            >
              Restore
            </button>
          </div>
        </div>
      )}

      {/* Recent Scenarios */}
      {scenarios.length > 0 && (
        <div>
          <h4 className="font-medium text-indigo-900 mb-3">Saved Plans ({scenarios.length})</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {scenarios.slice(0, 5).map((scenario) => {
              const summary = getScenarioSummary(scenario)
              return (
                <div key={scenario.id} className="bg-white border border-indigo-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{scenario.name}</div>
                      <div className="text-gray-600 text-xs">
                        {new Date(scenario.lastModified).toLocaleDateString()} • {summary.propertyCount} properties
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleLoad(scenario)}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        title="Load scenario"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDuplicate(scenario)}
                        className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                        title="Duplicate scenario"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => handleDelete(scenario)}
                        className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                        title="Delete scenario"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  {summary.totalEquity > 0 && (
                    <div className="text-xs text-gray-600">
                      Equity: ${(summary.totalEquity / 1000).toFixed(0)}k • 
                      Loans: ${(summary.totalLoanBalance / 1000).toFixed(0)}k
                      {summary.monthlyRentalIncome > 0 && (
                        <> • Rent: ${Math.round(summary.monthlyRentalIncome)}/month</>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Save Retirement Plan</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Plan Name *</label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="w-full p-2 bg-white border border-gray-300 rounded text-gray-900 placeholder-gray-500"
                  placeholder="e.g., Conservative Retirement Plan, Aggressive Growth Plan..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Description (Optional)</label>
                <textarea
                  value={saveDescription}
                  onChange={(e) => setSaveDescription(e.target.value)}
                  className="w-full p-2 bg-white border border-gray-300 rounded h-20 text-gray-900 placeholder-gray-500"
                  placeholder="Brief description of this retirement plan..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 bg-green-600 text-white p-2 rounded hover:bg-green-700"
              >
                Save Plan
              </button>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-auto">
            <h3 className="text-lg font-bold mb-4">Load Retirement Plan</h3>
            {scenarios.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No saved scenarios found.</p>
            ) : (
              <div className="space-y-3">
                {scenarios.map((scenario) => {
                  const summary = getScenarioSummary(scenario)
                  return (
                    <div key={scenario.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{scenario.name}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(scenario.lastModified).toLocaleString()}
                          </div>
                          {scenario.description && (
                            <div className="text-sm text-gray-500 mt-1">{scenario.description}</div>
                          )}
                        </div>
                        <button
                          onClick={() => handleLoad(scenario)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Load
                        </button>
                      </div>
                      <div className="text-xs text-gray-600">
                        {summary.propertyCount} properties • Equity: ${(summary.totalEquity / 1000).toFixed(0)}k • Loans: ${(summary.totalLoanBalance / 1000).toFixed(0)}k
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowLoadDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Import Retirement Plans</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Upload JSON File</label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="w-full p-2 bg-white border border-gray-300 rounded text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Or Paste JSON Data</label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  className="w-full p-2 bg-white border border-gray-300 rounded h-32 text-gray-900 placeholder-gray-500"
                  placeholder="Paste exported retirement plan JSON here..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleImport}
                className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
              >
                Import
              </button>
              <button
                onClick={() => setShowImportDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}