export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const [
    totalProducts,
    totalOrders,
    completedOrdersAggregate,
    lowStockCount,
    recentOrders
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { status: 'completed' },
      _sum: { total: true }
    }),
    prisma.product.count({
      where: { stock: { lt: 5 } }
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { items: true }
    })
  ])

  const completedOrdersValue = completedOrdersAggregate._sum.total ?? 0

  return {
    totalProducts,
    totalOrders,
    completedOrdersValue,
    lowStockCount,
    recentOrders
  }
})

