import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { AuthProvider } from './contexts/AuthContext'
import { SettingsProvider } from './contexts/SettingsContextSimple'
import Planner from './pages/Planner'
import Landing from './pages/Landing'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SettingsProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/app/planner" element={<Planner />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App