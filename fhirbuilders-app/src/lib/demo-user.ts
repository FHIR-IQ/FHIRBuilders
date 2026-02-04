/**
 * Demo User utilities
 *
 * Provides a sentinel user for anonymous/demo generations.
 * The demo user is lazily created on first anonymous request.
 */

import { prisma } from './prisma'

export const DEMO_USER_ID = 'demo-anonymous-user'
const DEMO_USER_EMAIL = 'demo@fhirbuilders.local'

/**
 * Ensure the demo user exists in the database.
 * Uses upsert to avoid race conditions.
 */
export async function ensureDemoUser(): Promise<string> {
  await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: {},
    create: {
      id: DEMO_USER_ID,
      name: 'Demo User',
      email: DEMO_USER_EMAIL,
    },
  })
  return DEMO_USER_ID
}
