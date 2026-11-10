import { OrderStatus } from '@prisma/client'
import { z } from 'zod'

const statusUpdateSchema = z.object({
  status: z.nativeEnum(OrderStatus, {
    errorMap: () => ({ message: 'Status harus bernilai pending, processing, completed, atau cancelled' })
  })
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID order tidak ditemukan'
    })
  }

  const existingOrder = await prisma.order.findUnique({
    where: { id }
  })

  if (!existingOrder) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Order tidak ditemukan'
    })
  }

  const body = await readBody(event)
  const validation = statusUpdateSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.errors[0]?.message || 'Status tidak valid'
    })
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: {
      status: validation.data.status
    },
    include: {
      items: true
    }
  })

  return {
    success: true,
    order: updatedOrder
  }
})

