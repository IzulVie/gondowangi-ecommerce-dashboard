import type { H3Event } from 'h3'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'STAFF'
}

export async function requireAuth(event: H3Event): Promise<SessionUser> {
  const session = await getUserSession(event)
  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: Authentication required'
    })
  }
  return session.user as SessionUser
}

export async function requireAdmin(event: H3Event): Promise<SessionUser> {
  const user = await requireAuth(event)
  if (user.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Admin access required'
    })
  }
  return user
}

