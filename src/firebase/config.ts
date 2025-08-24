/**
 * Firebase Configuration - Demo/Mock Setup
 * Replace with actual Firebase config for production
 */

// Mock Firebase app for demo purposes
export const app = {
  name: 'demo-app',
  options: {
    projectId: 'demo-project'
  }
}

// Mock Firestore database
export const db = {
  collection: () => ({
    doc: () => ({
      get: async () => ({ exists: false, data: () => ({}) }),
      set: async () => {},
      update: async () => {}
    })
  })
}

// Mock analytics
export const analytics = null

export default app