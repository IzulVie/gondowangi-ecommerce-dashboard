import { z } from 'zod'

const productUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Nama produk wajib diisi'),
  category: z.string().trim().min(1, 'Kategori wajib diisi'),
  price: z.coerce.number().int('Harga harus berupa bilangan bulat').positive('Harga harus lebih dari 0'),
  stock: z.coerce.number().int('Stok harus berupa bilangan bulat').min(0, 'Stok tidak boleh negatif')
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID produk tidak ditemukan'
    })
  }

  const existingProduct = await prisma.product.findUnique({
    where: { id }
  })

  if (!existingProduct) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Produk tidak ditemukan'
    })
  }

  const body = await readBody(event)
  const validation = productUpdateSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.errors[0]?.message || 'Data produk tidak valid'
    })
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: validation.data
  })

  return {
    success: true,
    product: updatedProduct
  }
})

