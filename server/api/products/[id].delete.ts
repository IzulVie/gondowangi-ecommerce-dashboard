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

  // Deleting product will set OrderItem.productId = null due to onDelete: SetNull in Prisma schema
  // productName and unitPrice snapshots in OrderItem remain completely preserved
  await prisma.product.delete({
    where: { id }
  })

  return {
    success: true,
    message: 'Produk berhasil dihapus. Histori pesanan terkait tetap tersimpan dengan aman.'
  }
})

