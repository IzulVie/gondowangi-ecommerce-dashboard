import { Prisma } from '@prisma/client'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const search = typeof query.search === 'string' ? query.search.trim() : ''
  const category = typeof query.category === 'string' ? query.category.trim() : ''

  const where: Prisma.ProductWhereInput = {}

  if (search) {
    where.name = {
      contains: search,
      mode: 'insensitive'
    }
  }

  if (category && category !== 'ALL') {
    where.category = category
  }

  const [products, distinctCategories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' }
    })
  ])

  return {
    products,
    categories: distinctCategories.map((c) => c.category)
  }
})

