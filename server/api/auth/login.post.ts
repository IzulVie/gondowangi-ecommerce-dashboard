import bcrypt from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi')
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validation = loginSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.errors[0]?.message || 'Validasi gagal'
    })
  }

  const { email, password } = validation.data

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Email atau password salah'
    })
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
  if (!isPasswordValid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Email atau password salah'
    })
  }

  const sessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as 'ADMIN' | 'STAFF'
  }

  await setUserSession(event, {
    user: sessionUser
  })

  return {
    success: true,
    user: sessionUser
  }
})

