<template>
  <div class="space-y-6">
    <!-- Header Page Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Manajemen Pesanan (Orders)
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Pantau status pesanan pelanggan, rincian produk yang dibeli, dan riwayat transaksi e-commerce.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          icon="i-heroicons-arrow-path"
          color="gray"
          variant="outline"
          size="sm"
          :loading="pending"
          @click="refresh"
        >
          Muat Ulang
        </UButton>
      </div>
    </div>

    <!-- Filter Status Toolbar -->
    <UCard :ui="{ body: { padding: 'p-3 sm:p-4' } }" class="shadow-sm">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-2">
          Filter Status:
        </span>
        <UButton
          v-for="statusOption in statusFilterList"
          :key="statusOption.value"
          size="xs"
          :color="selectedStatus === statusOption.value ? 'emerald' : 'gray'"
          :variant="selectedStatus === statusOption.value ? 'solid' : 'ghost'"
          class="font-medium"
          @click="selectedStatus = statusOption.value"
        >
          {{ statusOption.label }}
          <span v-if="statusCounts[statusOption.value] !== undefined" class="ml-1 opacity-80 text-[10px]">
            ({{ statusCounts[statusOption.value] }})
          </span>
        </UButton>
      </div>
    </UCard>

    <!-- Orders Table Card -->
    <UCard class="shadow-sm">
      <!-- Loading State -->
      <div v-if="pending" class="py-16 flex flex-col items-center justify-center text-slate-400">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-emerald-600 mb-3" />
        <p class="text-sm font-medium">Memuat data pesanan...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!filteredOrders || filteredOrders.length === 0" class="py-16 text-center text-slate-500">
        <UIcon name="i-heroicons-shopping-cart" class="w-14 h-14 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
        <p class="text-base font-semibold text-slate-800 dark:text-slate-200">Tidak ada pesanan</p>
        <p class="text-xs text-slate-400 mt-1">
          Tidak ditemukan pesanan dengan status "{{ selectedStatusLabel }}".
        </p>
        <div class="mt-4" v-if="selectedStatus !== 'ALL'">
          <UButton
            color="gray"
            variant="outline"
            size="xs"
            @click="selectedStatus = 'ALL'"
          >
            Lihat Semua Status
          </UButton>
        </div>
      </div>

      <!-- Responsive Orders Table -->
      <div v-else class="overflow-x-auto -mx-4 sm:-mx-6">
        <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
          <thead class="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th scope="col" class="py-3.5 px-4 sm:px-6">No. Pesanan</th>
              <th scope="col" class="py-3.5 px-4 sm:px-6">Nama Pelanggan</th>
              <th scope="col" class="py-3.5 px-4 sm:px-6">Waktu Pesanan</th>
              <th scope="col" class="py-3.5 px-4 sm:px-6">Total Nilai</th>
              <th scope="col" class="py-3.5 px-4 sm:px-6">Status Saat Ini</th>
              <th v-if="isAdmin" scope="col" class="py-3.5 px-4 sm:px-6">Ubah Status</th>
              <th scope="col" class="py-3.5 px-4 sm:px-6 text-right">Rincian</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
            <tr
              v-for="order in filteredOrders"
              :key="order.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <td class="py-3.5 px-4 sm:px-6 font-mono font-medium text-slate-900 dark:text-white">
                {{ order.orderNumber }}
              </td>
              <td class="py-3.5 px-4 sm:px-6 text-slate-700 dark:text-slate-300 font-medium">
                {{ order.customerName }}
              </td>
              <td class="py-3.5 px-4 sm:px-6 text-slate-500 dark:text-slate-400 text-xs">
                {{ formatDate(order.createdAt) }}
              </td>
              <td class="py-3.5 px-4 sm:px-6 font-semibold text-slate-900 dark:text-white">
                {{ formatCurrency(order.total) }}
              </td>
              <td class="py-3.5 px-4 sm:px-6">
                <UBadge
                  :color="getOrderStatusBadge(order.status).color"
                  variant="subtle"
                  size="xs"
                  class="font-medium"
                >
                  {{ getOrderStatusBadge(order.status).label }}
                </UBadge>
              </td>

              <!-- Quick Status Update (ADMIN Only) -->
              <td v-if="isAdmin" class="py-3.5 px-4 sm:px-6">
                <select
                  class="text-xs font-medium rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-1 px-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer"
                  :value="order.status"
                  :disabled="updatingOrderId === order.id"
                  @change="handleStatusChange(order, ($event.target as HTMLSelectElement).value)"
                >
                  <option value="pending">Menunggu</option>
                  <option value="processing">Diproses</option>
                  <option value="completed">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </td>

              <!-- View Details Button -->
              <td class="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                <UButton
                  icon="i-heroicons-eye"
                  color="gray"
                  variant="outline"
                  size="xs"
                  @click="openOrderDetails(order)"
                >
                  Detail
                </UButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <!-- Order Details Modal -->
    <UModal v-model="isDetailsModalOpen" :ui="{ width: 'sm:max-w-2xl' }">
      <UCard v-if="activeOrder" :ui="{ ring: '', divide: 'divide-y divide-slate-100 dark:divide-slate-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <UIcon name="i-heroicons-receipt-percent" class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-900 dark:text-white">
                  Rincian Pesanan #{{ activeOrder.orderNumber }}
                </h3>
                <p class="text-xs text-slate-500">
                  Dipesan oleh {{ activeOrder.customerName }} • {{ formatDate(activeOrder.createdAt) }}
                </p>
              </div>
            </div>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="isDetailsModalOpen = false"
            />
          </div>
        </template>

        <div class="space-y-5 py-2">
          <!-- Order Metadata Bar -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs">
            <div>
              <span class="text-slate-400 block mb-0.5">No. Pesanan</span>
              <span class="font-mono font-bold text-slate-800 dark:text-slate-200">{{ activeOrder.orderNumber }}</span>
            </div>
            <div>
              <span class="text-slate-400 block mb-0.5">Nama Pembeli</span>
              <span class="font-medium text-slate-800 dark:text-slate-200">{{ activeOrder.customerName }}</span>
            </div>
            <div>
              <span class="text-slate-400 block mb-0.5">Waktu Transaksi</span>
              <span class="font-medium text-slate-800 dark:text-slate-200">{{ formatDate(activeOrder.createdAt) }}</span>
            </div>
            <div>
              <span class="text-slate-400 block mb-0.5">Status Pesanan</span>
              <UBadge
                :color="getOrderStatusBadge(activeOrder.status).color"
                variant="subtle"
                size="xs"
                class="font-medium"
              >
                {{ getOrderStatusBadge(activeOrder.status).label }}
              </UBadge>
            </div>
          </div>

          <!-- Line Items Table -->
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Daftar Produk Pesanan (Line Items)
            </h4>
            <div class="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
                <thead class="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th scope="col" class="py-2.5 px-3">Nama Produk</th>
                    <th scope="col" class="py-2.5 px-3 text-center">Qty</th>
                    <th scope="col" class="py-2.5 px-3 text-right">Harga Satuan</th>
                    <th scope="col" class="py-2.5 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  <tr v-for="item in activeOrder.items" :key="item.id">
                    <td class="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                      {{ item.productName }}
                      <span v-if="!item.productId" class="block text-[10px] text-slate-400 italic">
                        (Produk master telah dihapus dari katalog)
                      </span>
                    </td>
                    <td class="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400 font-medium">
                      {{ item.quantity }}x
                    </td>
                    <td class="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">
                      {{ formatCurrency(item.unitPrice) }}
                    </td>
                    <td class="py-2.5 px-3 text-right font-semibold text-slate-800 dark:text-slate-200">
                      {{ formatCurrency(item.unitPrice * item.quantity) }}
                    </td>
                  </tr>
                </tbody>
                <tfoot class="bg-slate-50 dark:bg-slate-800/50 font-semibold border-t border-slate-200 dark:border-slate-800">
                  <tr>
                    <td colspan="3" class="py-3 px-3 text-right text-slate-600 dark:text-slate-300">
                      Total Pembayaran:
                    </td>
                    <td class="py-3 px-3 text-right text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {{ formatCurrency(activeOrder.total) }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Admin Quick Status Change within Modal -->
          <div v-if="isAdmin" class="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg flex items-center justify-between">
            <span class="text-xs font-medium text-slate-600 dark:text-slate-400">
              Perbarui Status Pesanan Ini:
            </span>
            <div class="flex items-center gap-2">
              <select
                class="text-xs font-medium rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-1.5 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                :value="activeOrder.status"
                :disabled="updatingOrderId === activeOrder.id"
                @change="handleStatusChange(activeOrder, ($event.target as HTMLSelectElement).value)"
              >
                <option value="pending">Menunggu</option>
                <option value="processing">Diproses</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end">
            <UButton
              color="gray"
              variant="solid"
              size="sm"
              @click="isDetailsModalOpen = false"
            >
              Tutup
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { formatCurrency, formatDate, getOrderStatusBadge } from '~/utils/format'

interface OrderItem {
  id: string
  orderId: string
  productId: string | null
  productName: string
  unitPrice: number
  quantity: number
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  total: number
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

interface OrdersResponse {
  orders: Order[]
}

const { user } = useUserSession()
const toast = useToast()

const isAdmin = computed(() => user.value?.role === 'ADMIN')

const selectedStatus = ref('ALL')
const updatingOrderId = ref<string | null>(null)

// Details modal state
const isDetailsModalOpen = ref(false)
const activeOrder = ref<Order | null>(null)

const statusFilterList = [
  { label: 'Semua Status', value: 'ALL' },
  { label: 'Menunggu', value: 'pending' },
  { label: 'Diproses', value: 'processing' },
  { label: 'Selesai', value: 'completed' },
  { label: 'Dibatalkan', value: 'cancelled' }
]

const { data, pending, refresh } = await useFetch<OrdersResponse>('/api/orders', {
  lazy: false
})

const statusCounts = computed(() => {
  const counts: Record<string, number> = { ALL: 0, pending: 0, processing: 0, completed: 0, cancelled: 0 }
  if (data.value?.orders) {
    counts.ALL = data.value.orders.length
    for (const o of data.value.orders) {
      if (counts[o.status] !== undefined) {
        counts[o.status]++
      }
    }
  }
  return counts
})

const selectedStatusLabel = computed(() => {
  return statusFilterList.find((s) => s.value === selectedStatus.value)?.label || selectedStatus.value
})

const filteredOrders = computed(() => {
  if (!data.value?.orders) return []
  if (selectedStatus.value === 'ALL') return data.value.orders
  return data.value.orders.filter((o) => o.status === selectedStatus.value)
})

function openOrderDetails(order: Order) {
  activeOrder.value = order
  isDetailsModalOpen.value = true
}

async function handleStatusChange(order: Order, newStatus: string) {
  if (order.status === newStatus) return

  try {
    updatingOrderId.value = order.id
    const res = await $fetch<{ success: boolean; order: Order }>(`/api/orders/${order.id}/status`, {
      method: 'PATCH',
      body: { status: newStatus }
    })

    // Update in-memory active order if modal is currently open
    if (activeOrder.value && activeOrder.value.id === order.id) {
      activeOrder.value.status = res.order.status
    }

    toast.add({
      title: 'Status Diperbarui',
      description: `Pesanan ${order.orderNumber} diubah ke status "${getOrderStatusBadge(newStatus).label}"`,
      color: 'green'
    })

    await refresh()
  } catch (error: any) {
    toast.add({
      title: 'Gagal Mengubah Status',
      description: error?.statusMessage || error?.data?.statusMessage || 'Terjadi kesalahan saat mengubah status order',
      color: 'red'
    })
  } finally {
    updatingOrderId.value = null
  }
}
</script>

