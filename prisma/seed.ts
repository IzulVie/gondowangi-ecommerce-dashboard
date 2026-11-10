import { PrismaClient, Role, OrderStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database reset & seeding...')

  // 1. Clean up existing database records in foreign-key safe order
  console.log('🧹 Cleaning up existing database records...')
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()
  console.log('✨ All old records cleared successfully.')

  // 2. Seed Demo Users
  const adminPasswordHash = await bcrypt.hash('AdminDemo123!', 10)
  const staffPasswordHash = await bcrypt.hash('StaffDemo123!', 10)

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin Gondowangi',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN
    }
  })

  const staff = await prisma.user.create({
    data: {
      email: 'staff@example.com',
      name: 'Staff Gondowangi',
      passwordHash: staffPasswordHash,
      role: Role.STAFF
    }
  })

  console.log(`✅ Seeded users: ${admin.email} (ADMIN), ${staff.email} (STAFF)`)

  // 3. Seed Products (11 products across Haircare, Skincare, Bodycare; 3 with stock < 5)
  const productData = [
    {
      name: 'Natur Hair Tonic Ginseng Extract 90ml',
      category: 'Haircare',
      price: 45000,
      stock: 25
    },
    {
      name: 'Natur Natural Extract Shampoo Aloe Vera 140ml',
      category: 'Haircare',
      price: 32000,
      stock: 3 // Low stock (< 5)
    },
    {
      name: 'Natur Hair Mask Nutritive Treatment 150g',
      category: 'Haircare',
      price: 28000,
      stock: 18
    },
    {
      name: 'Natur Hair Serum Protecting & Nourishing 60ml',
      category: 'Haircare',
      price: 75000,
      stock: 2 // Low stock (< 5)
    },
    {
      name: 'Natur Miracle Face Oil Serum Revitalizing 30ml',
      category: 'Skincare',
      price: 120000,
      stock: 12
    },
    {
      name: 'Natur Purifying Facial Wash with Tea Tree 100ml',
      category: 'Skincare',
      price: 42000,
      stock: 20
    },
    {
      name: 'Natur Clarifying Face Toner Ginseng & Cica 120ml',
      category: 'Skincare',
      price: 58000,
      stock: 8
    },
    {
      name: 'Natur Hydrating Day Cream with SPF 30 50g',
      category: 'Skincare',
      price: 85000,
      stock: 14
    },
    {
      name: 'Gondowangi Herbal Body Scrub Bengkoang 250g',
      category: 'Bodycare',
      price: 38000,
      stock: 30
    },
    {
      name: 'Gondowangi Nourishing Body Lotion Olive Oil 200ml',
      category: 'Bodycare',
      price: 65000,
      stock: 16
    },
    {
      name: 'Gondowangi Relaxing Herbal Body Wash Aromatherapy 250ml',
      category: 'Bodycare',
      price: 48000,
      stock: 4 // Low stock (< 5)
    }
  ]

  const createdProducts: Record<string, any> = {}

  for (const item of productData) {
    const created = await prisma.product.create({
      data: item
    })
    createdProducts[item.name] = created
  }

  console.log(`✅ Seeded ${Object.keys(createdProducts).length} products`)

  // 4. Seed Orders (8 orders across pending, processing, completed, cancelled)
  const orderData = [
    {
      orderNumber: 'ORD-20261110-001',
      customerName: 'Budi Santoso',
      status: OrderStatus.completed,
      items: [
        { productName: 'Natur Hair Tonic Ginseng Extract 90ml', quantity: 2 },
        { productName: 'Natur Natural Extract Shampoo Aloe Vera 140ml', quantity: 1 }
      ]
    },
    {
      orderNumber: 'ORD-20261110-002',
      customerName: 'Siti Rahmawati',
      status: OrderStatus.processing,
      items: [
        { productName: 'Natur Miracle Face Oil Serum Revitalizing 30ml', quantity: 1 },
        { productName: 'Natur Hydrating Day Cream with SPF 30 50g', quantity: 1 }
      ]
    },
    {
      orderNumber: 'ORD-20261110-003',
      customerName: 'Dewi Lestari',
      status: OrderStatus.pending,
      items: [
        { productName: 'Gondowangi Herbal Body Scrub Bengkoang 250g', quantity: 2 },
        { productName: 'Gondowangi Nourishing Body Lotion Olive Oil 200ml', quantity: 1 }
      ]
    },
    {
      orderNumber: 'ORD-20261110-004',
      customerName: 'Ahmad Fauzi',
      status: OrderStatus.cancelled,
      items: [
        { productName: 'Natur Hair Serum Protecting & Nourishing 60ml', quantity: 1 }
      ]
    },
    {
      orderNumber: 'ORD-20261110-005',
      customerName: 'Rina Kusuma',
      status: OrderStatus.completed,
      items: [
        { productName: 'Natur Purifying Facial Wash with Tea Tree 100ml', quantity: 2 },
        { productName: 'Natur Clarifying Face Toner Ginseng & Cica 120ml', quantity: 1 },
        { productName: 'Natur Miracle Face Oil Serum Revitalizing 30ml', quantity: 1 }
      ]
    },
    {
      orderNumber: 'ORD-20261110-006',
      customerName: 'Hendra Gunawan',
      status: OrderStatus.processing,
      items: [
        { productName: 'Natur Hair Mask Nutritive Treatment 150g', quantity: 3 }
      ]
    },
    {
      orderNumber: 'ORD-20261110-007',
      customerName: 'Putri Handayani',
      status: OrderStatus.pending,
      items: [
        { productName: 'Gondowangi Relaxing Herbal Body Wash Aromatherapy 250ml', quantity: 2 },
        { productName: 'Gondowangi Nourishing Body Lotion Olive Oil 200ml', quantity: 2 }
      ]
    },
    {
      orderNumber: 'ORD-20261110-008',
      customerName: 'Eko Prasetyo',
      status: OrderStatus.completed,
      items: [
        { productName: 'Natur Hair Tonic Ginseng Extract 90ml', quantity: 1 },
        { productName: 'Natur Hair Serum Protecting & Nourishing 60ml', quantity: 1 }
      ]
    }
  ]

  for (const o of orderData) {
    let total = 0
    const itemsToCreate = []

    for (const item of o.items) {
      const prod = createdProducts[item.productName]
      const unitPrice = prod ? prod.price : 50000
      total += unitPrice * item.quantity
      itemsToCreate.push({
        productId: prod ? prod.id : null,
        productName: item.productName,
        unitPrice,
        quantity: item.quantity
      })
    }

    await prisma.order.create({
      data: {
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        status: o.status,
        total,
        items: {
          create: itemsToCreate
        }
      }
    })
  }

  console.log(`✅ Seeded ${orderData.length} orders with items and calculated totals`)
  console.log('🎉 Reset and seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
