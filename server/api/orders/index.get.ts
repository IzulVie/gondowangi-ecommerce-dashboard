import { OrderStatus, Prisma } from '@prisma/client'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const statusParam = typeof query.status === 'string' ? query.status.trim() : ''

  const where: Prisma.OrderWhereInput = {}

  if (statusParam && statusParam !== 'ALL' && Object.values(OrderStatus).includes(statusParam as OrderStatus)) {
    where.status = statusParam as OrderStatus
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      items: true
    }
  })

  return {
    orders
  }
})

