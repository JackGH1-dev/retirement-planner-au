/**
 * Simplified Planner Schemas for Demo
 */

import { z } from 'zod'

// App Settings Schema
export const appSettingsSchema = z.object({
  concessionalCap: z.number().default(27500),
  preservationAge: z.number().default(60),
  sgRate: z.number().default(0.11)
})

export type AppSettings = z.infer<typeof appSettingsSchema>

export const createDefaultSettings = (): AppSettings => ({
  concessionalCap: 27500,
  preservationAge: 60,
  sgRate: 0.11
})

// Basic validation function
export const validatePlannerState = (data: any) => {
  return {
    success: true,
    data: data
  }
}