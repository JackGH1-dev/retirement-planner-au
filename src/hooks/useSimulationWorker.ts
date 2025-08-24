/**
 * Custom hook for managing the Web Worker simulation engine
 * Provides easy interface for running retirement planning simulations
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import type { PlannerState } from '../types/planner'

interface SimulationResults {
  success: boolean
  simulation?: {
    years: number[]
    superBalance: number[]
    etfPortfolio: number[]
    propertyValue: number[]
    totalAssets: number[]
    annualIncome: number[]
    monthlyIncome: number[]
    bufferBalance: number[]
  }
  metrics?: {
    canRetire: boolean
    finalAssets: number
    finalAnnualIncome: number
    finalMonthlyIncome: number
    incomeReplacement: number
    targetIncome: number
    shortfall: number
    assetBreakdown: {
      super: number
      etf: number
      property: number
      buffer: number
    }
    totalContributions: {
      super: number
      etf: number
      property: number
      buffer: number
    }
    yearsToRetirement: number
    projectedRetirementAge: number
  }
  error?: string
  timestamp: string
}

interface UseSimulationWorkerReturn {
  runSimulation: (plannerState: PlannerState) => Promise<SimulationResults>
  isRunning: boolean
  lastResults: SimulationResults | null
  error: string | null
  workerStatus: 'initializing' | 'ready' | 'error' | 'terminated'
}

export const useSimulationWorker = (): UseSimulationWorkerReturn => {
  const workerRef = useRef<Worker | null>(null)
  const messageIdRef = useRef(0)
  const pendingRequestsRef = useRef<Map<number, {
    resolve: (value: SimulationResults) => void
    reject: (error: Error) => void
  }>>(new Map())

  const [isRunning, setIsRunning] = useState(false)
  const [lastResults, setLastResults] = useState<SimulationResults | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [workerStatus, setWorkerStatus] = useState<'initializing' | 'ready' | 'error' | 'terminated'>('initializing')

  // Initialize worker
  useEffect(() => {
    if (typeof Worker === 'undefined') {
      setError('Web Workers are not supported in this browser')
      setWorkerStatus('error')
      return
    }

    try {
      // Create worker from public path
      workerRef.current = new Worker('/workers/simulationWorker.js')
      
      // Handle worker messages
      workerRef.current.onmessage = (e) => {
        const { type, payload, id } = e.data

        switch (type) {
          case 'WORKER_READY':
            setWorkerStatus('ready')
            setError(null)
            break

          case 'SIMULATION_COMPLETE':
            handleSimulationComplete(id, payload)
            break

          case 'ERROR':
            handleWorkerError(id, payload.error)
            break

          case 'PONG':
            // Health check response
            console.log('Worker health check: OK')
            break

          default:
            console.warn(`Unknown worker message type: ${type}`)
        }
      }

      // Handle worker errors
      workerRef.current.onerror = (error) => {
        console.error('Worker error:', error)
        setError(`Worker error: ${error.message}`)
        setWorkerStatus('error')
        setIsRunning(false)
      }

      // Handle worker termination
      workerRef.current.onmessageerror = (error) => {
        console.error('Worker message error:', error)
        setError('Worker message error')
        setWorkerStatus('error')
      }

    } catch (err) {
      console.error('Failed to create worker:', err)
      setError('Failed to initialize simulation engine')
      setWorkerStatus('error')
    }

    // Cleanup on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
        setWorkerStatus('terminated')
      }
      
      // Reject any pending requests
      pendingRequestsRef.current.forEach(({ reject }) => {
        reject(new Error('Worker terminated'))
      })
      pendingRequestsRef.current.clear()
    }
  }, [])

  const handleSimulationComplete = useCallback((id: number, results: SimulationResults) => {
    const request = pendingRequestsRef.current.get(id)
    if (request) {
      pendingRequestsRef.current.delete(id)
      setLastResults(results)
      setIsRunning(false)
      setError(null)
      request.resolve(results)
    }
  }, [])

  const handleWorkerError = useCallback((id: number, errorMessage: string) => {
    const request = pendingRequestsRef.current.get(id)
    if (request) {
      pendingRequestsRef.current.delete(id)
      setError(errorMessage)
      setIsRunning(false)
      request.reject(new Error(errorMessage))
    }
  }, [])

  const runSimulation = useCallback(async (plannerState: PlannerState): Promise<SimulationResults> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker not initialized'))
        return
      }

      if (workerStatus !== 'ready') {
        reject(new Error('Worker not ready'))
        return
      }

      // Validate planner state
      if (!plannerState) {
        reject(new Error('Planner state is required'))
        return
      }

      const requiredFields = ['goalSetter', 'income', 'super', 'portfolio', 'property', 'buffers']
      for (const field of requiredFields) {
        if (!plannerState[field as keyof PlannerState]) {
          reject(new Error(`Missing required field: ${field}`))
          return
        }
      }

      // Generate unique message ID
      const messageId = ++messageIdRef.current
      
      // Store the promise handlers
      pendingRequestsRef.current.set(messageId, { resolve, reject })
      
      // Set running state
      setIsRunning(true)
      setError(null)

      // Send simulation request to worker
      try {
        workerRef.current.postMessage({
          type: 'SIMULATE_RETIREMENT',
          payload: plannerState,
          id: messageId
        })
      } catch (err) {
        // Clean up on send error
        pendingRequestsRef.current.delete(messageId)
        setIsRunning(false)
        reject(new Error(`Failed to send simulation request: ${err}`))
      }

      // Set timeout for long-running simulations
      setTimeout(() => {
        const request = pendingRequestsRef.current.get(messageId)
        if (request) {
          pendingRequestsRef.current.delete(messageId)
          setIsRunning(false)
          reject(new Error('Simulation timeout - took longer than 30 seconds'))
        }
      }, 30000)
    })
  }, [workerStatus])

  // Health check function
  const healthCheck = useCallback(() => {
    if (workerRef.current && workerStatus === 'ready') {
      workerRef.current.postMessage({
        type: 'PING',
        payload: {},
        id: 0
      })
    }
  }, [workerStatus])

  // Periodic health check
  useEffect(() => {
    const interval = setInterval(healthCheck, 60000) // Every minute
    return () => clearInterval(interval)
  }, [healthCheck])

  return {
    runSimulation,
    isRunning,
    lastResults,
    error,
    workerStatus
  }
}