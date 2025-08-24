/**
 * Authentication Context - Simplified for demo purposes
 * In production, integrate with Firebase Auth
 */

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  uid: string
  email: string
  displayName?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate auth check
    const timer = setTimeout(() => {
      // For demo purposes, we'll have a guest user
      setUser({
        uid: 'demo-user',
        email: 'demo@example.com',
        displayName: 'Demo User'
      })
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('Sign in:', email, password)
    // Simulate sign in
    setUser({
      uid: 'demo-user',
      email,
      displayName: 'Demo User'
    })
  }

  const signUp = async (email: string, password: string) => {
    console.log('Sign up:', email, password)
    // Simulate sign up
    setUser({
      uid: 'demo-user',
      email,
      displayName: 'Demo User'
    })
  }

  const signOut = async () => {
    setUser(null)
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}