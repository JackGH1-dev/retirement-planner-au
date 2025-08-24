/**
 * Landing Page - Welcome and introduction to the planner
 */

import React from 'react'
import { Link } from 'react-router-dom'

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="px-4 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-600">
            Optimise
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/planner" className="text-gray-600 hover:text-blue-600 transition-colors">
              Planner
            </Link>
            <Link 
              to="/planner" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Build Your Retirement Plan
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
              Simple, Australian-focused retirement planning. No jargon, no complexity—just clear steps to build your financial future.
            </p>
            <Link
              to="/planner"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Start Planning Free
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Beginner-Friendly
              </h3>
              <p className="text-gray-600">
                No financial jargon or complex calculations. Plain English explanations with helpful tips along the way.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🇦🇺</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Australian-Focused
              </h3>
              <p className="text-gray-600">
                Built for Australians with accurate super rules, government schemes, and local investment options.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Personalized Results
              </h3>
              <p className="text-gray-600">
                Get a customized retirement projection based on your goals, income, and investment preferences.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-12">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="relative">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Set Your Goals</h3>
                <p className="text-gray-600">Choose your retirement age and target lifestyle</p>
              </div>

              <div className="relative">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Current Situation</h3>
                <p className="text-gray-600">Enter your income, super, and existing investments</p>
              </div>

              <div className="relative">
                <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Choose Strategy</h3>
                <p className="text-gray-600">Select your investment approach for super, ETFs, and property</p>
              </div>

              <div className="relative">
                <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  4
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Get Your Plan</h3>
                <p className="text-gray-600">See your personalized retirement projection and next steps</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Plan Your Retirement?</h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of Australians who have built their retirement plan with Optimise
            </p>
            <Link
              to="/planner"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl"
            >
              Start Your Plan Now
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-8 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-2xl font-bold text-blue-600 mb-4">Optimise</div>
          <p className="text-gray-600 mb-4">
            Retirement planning made simple for Australians
          </p>
          <p className="text-sm text-gray-500">
            This tool provides educational information only and is not personal financial advice.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Landing