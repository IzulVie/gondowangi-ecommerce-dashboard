<template>
  <div class="space-y-5">
    <!-- Header Page Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Daftar Pesanan
        </h1>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Pantau riwayat transaksi pesanan, rincian produk yang dibeli, dan status pengiriman
        </p>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          icon="i-heroicons-arrow-path"
          color="gray"
          variant="outline"
          size="xs"
          :loading="pending"
          @click="refresh"
        >
          Muat Ulang
        </UButton>
      </div>
    </div>

    <!-- Filter Status Toolbar -->
    <div class="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-lg p-2.5 sm:p-3 shadow-2xs">
      <div class="flex flex-wrap items-center gap-1.5">
        <span class="text-xs font-medium text-zinc-400 mr-1.5">Status:</span>
        <button
          v-for="statusOption in statusFilterList"
          :key="statusOption.value"
          type="button"
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer"
          :class="selectedStatus === statusOption.value
            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800'"
          @click="selectedStatus = statusOption.value"
        >
          <span>{{ statusOption.label }}</span>
          <span v-if="statusCounts[statusOption.value] !== undefined" class="text-[10px] font-mono opacity-80">
            ({{ statusCounts[statusOption.value] }})
          </span>
        </button>
      </div>
    </div>

    <!-- Orders Table Card -->
    <div class="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-lg overflow-hidden shadow-2xs">
      <!-- Loading State -->
      <div v-if="pending" class="py-16 flex flex-col items-center justify-center text-zinc-400 text-xs">
        <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin text-zinc-500 mb-2" />
        <span>Memuat data pesanan...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="!filteredOrders || filteredOrders.length === 0" class="py-14 text-center text-xs text-zinc-500">
        <UIcon name="i-heroicons-shopping-bag" class="w-8 h-8 mx-auto text-zinc-400 mb-2" />
        <p class="font-medium text-zinc-700 dark:text-zinc-300">Tidak ada pesanan</p>
        <p class="text-zinc-400 mt-0.5">Tidak ditemukan pesanan dengan status "{{ selectedStatusLabel }}".</p>
        <div class="mt-3" v-if="selectedStatus !== 'ALL'">
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
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-zinc-200/80 dark:divide-zinc-800 text-left text-xs">
          <thead class="bg-zinc-50/70 dark:bg-zinc-900/70 text-zinc-500 uppercase tracking-wider font-medium text-[11px]">
            <tr>
              <th scope="col" class="py-2.5 px-4 sm:px-6 font-medium">No. Pesanan</th>
              <th scope="col" class="py-2.5 px-4 sm:px-6 font-medium">Nama Pelanggan</th>
              <th scope="col" class="py-2.5 px-4 sm:px-6 font-medium">Waktu Transaksi</th>
              <th scope="col" class="py-2.5 px-4 sm:px-6 font-medium">Total Nilai</th>
              <th scope="col" class="py-2.5 px-4 sm:px-6 font-medium">Status</th>
              <th v-if="isAdmin" scope="col" class="py-2.5 px-4 sm:px-6 font-medium">Ubah Status</th>
              <th scope="col" class="py-2.5 px-4 sm:px-6 text-right font-medium">Rincian</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-200/60 dark:divide-zinc-800/80">
            <tr
              v-for="order in filteredOrders"
              :key="order.id"
              class="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
            >
              <td class="py-3 px-4 sm:px-6 font-mono font-medium text-zinc-900 dark:text-zinc-100 tabular-nums">
                {{ order.orderNumber }}
              </td>
              <td class="py-3 px-4 sm:px-6 font-medium text-zinc-800 dark:text-zinc-200">
                {{ order.customerName }}
              </td>
              <td class="py-3 px-4 sm:px-6 text-zinc-500 text-[11px]">
                {{ formatDate(order.createdAt) }}
              </td>
              <td class="py-3 px-4 sm:px-6 font-medium text-zinc-900 dark:text-zinc-100 tabular-nums">
                {{ formatCurrency(order.total) }}
              </td>
              <td class="py-3 px-4 sm:px-6">
                <span
                  class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border"
                  :class="getOrderStatusBadge(order.status).bgClass"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="getOrderStatusBadge(order.status).dotClass"></span>
                  {{ getOrderStatusBadge(order.status).label }}
                </span>
              </td>

              <!-- Quick Status Update (ADMIN Only) -->
              <td v-if="isAdmin" class="py-3 px-4 sm:px-6">
                <select
                  class="text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 py-1 px-2 focus:ring-1 focus:ring-zinc-900 focus:outline-none cursor-pointer"
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
              <td class="py-3 px-4 sm:px-6 text-right whitespace-nowrap">
                <button
                  type="button"
                  class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  @click="openOrderDetails(order)"
                >
                  <UIcon name="i-heroicons-eye" class="w-3.5 h-3.5 text-zinc-400" />
                  <span>Detail</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Order Details Modal -->
    <UModal v-model="isDetailsModalOpen" :ui="{ width: 'sm:max-w-xl' }">
      <div v-if="activeOrder" class="bg-white dark:bg-zinc-900 rounded-lg overflow-hidden border border-zinc-200/80 dark:border-zinc-800 shadow-lg">
        <div class="px-5 py-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                {{ activeOrder.orderNumber }}
              </span>
              <span
                class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border"
                :class="getOrderStatusBadge(activeOrder.status).bgClass"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="getOrderStatusBadge(activeOrder.status).dotClass"></span>
                {{ getOrderStatusBadge(activeOrder.status).label }}
              </span>
            </div>
            <p class="text-[11px] text-zinc-400 mt-0.5">
              {{ activeOrder.customerName }} • {{ formatDate(activeOrder.createdAt) }}
            </p>
          </div>
          <button
            type="button"
            class="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            @click="isDetailsModalOpen = false"
          >
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
          </button>
        </div>

        <div class="p-5 space-y-4">
          <!-- Order Metadata Bar -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-zinc-50/70 dark:bg-zinc-800/40 rounded-md border border-zinc-200/70 dark:border-zinc-800 text-xs">
            <div>
              <span class="text-zinc-400 block text-[10px] uppercase font-medium">No. Pesanan</span>
              <span class="font-mono font-medium text-zinc-900 dark:text-zinc-100 tabular-nums">{{ activeOrder.orderNumber }}</span>
            </div>
            <div>
              <span class="text-zinc-400 block text-[10px] uppercase font-medium">Pembeli</span>
              <span class="font-medium text-zinc-900 dark:text-zinc-100">{{ activeOrder.customerName }}</span>
            </div>
            <div>
              <span class="text-zinc-400 block text-[10px] uppercase font-medium">Tanggal</span>
              <span class="text-zinc-600 dark:text-zinc-300 text-[11px]">{{ formatDate(activeOrder.createdAt) }}</span>
            </div>
            <div>
              <span class="text-zinc-400 block text-[10px] uppercase font-medium">Status</span>
              <span class="font-medium text-zinc-800 dark:text-zinc-200">{{ getOrderStatusBadge(activeOrder.status).label }}</span>
            </div>
          </div>

          <!-- Line Items Table -->
          <div>
            <h4 class="text-xs font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight mb-2">
              Daftar Produk Pesanan
            </h4>
            <div class="border border-zinc-200/80 dark:border-zinc-800 rounded-md overflow-hidden">
              <table class="min-w-full divide-y divide-zinc-200/80 dark:divide-zinc-800 text-left text-xs">
                <thead class="bg-zinc-50/70 dark:bg-zinc-900/70 text-zinc-500 font-medium text-[11px] uppercase tracking-wider">
                  <tr>
                    <th scope="col" class="py-2 px-3">Nama Produk</th>
                    <th scope="col" class="py-2 px-3 text-center">Qty</th>
                    <th scope="col" class="py-2 px-3 text-right">Harga</th>
                    <th scope="col" class="py-2 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-200/60 dark:divide-zinc-800">
                  <tr v-for="item in activeOrder.items" :key="item.id">
                    <td class="py-2.5 px-3 font-medium text-zinc-900 dark:text-zinc-100">
                      {{ item.productName }}
                      <span v-if="!item.productId" class="block text-[10px] text-zinc-400 italic">
                        (Master produk dihapus dari katalog)
                      </span>
                    </td>
                    <td class="py-2.5 px-3 text-center text-zinc-600 dark:text-zinc-400 tabular-nums">
                      {{ item.quantity }}x
                    </td>
                    <td class="py-2.5 px-3 text-right text-zinc-600 dark:text-zinc-400 tabular-nums">
                      {{ formatCurrency(item.unitPrice) }}
                    </td>
                    <td class="py-2.5 px-3 text-right font-medium text-zinc-900 dark:text-zinc-100 tabular-nums">
                      {{ formatCurrency(item.unitPrice * item.quantity) }}
                    </td>
                  </tr>
                </tbody>
                <tfoot class="bg-zinc-50/60 dark:bg-zinc-900/60 font-medium border-t border-zinc-200/80 dark:border-zinc-800">
                  <tr>
                    <td colspan="3" class="py-2.5 px-3 text-right text-zinc-500">
                      Total Pesanan:
                    </td>
                    <td class="py-2.5 px-3 text-right text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                      {{ formatCurrency(activeOrder.total) }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Admin Quick Status Change within Modal -->
          <div v-if="isAdmin" class="p-3 bg-zinc-50/70 dark:bg-zinc-800/40 rounded-md border border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span class="text-zinc-600 dark:text-zinc-300 font-medium">
              Perbarui Status:
            </span>
            <select
              class="text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 py-1 px-2.5 focus:ring-1 focus:ring-zinc-900 focus:outline-none"
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

        <div class="px-5 py-3 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-200/80 dark:border-zinc-800 flex justify-end">
          <UButton
            color="gray"
            variant="outline"
            size="xs"
            @click="isDetailsModalOpen = false"
          >
            Tutup
          </UButton>
        </div>
      </div>
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

    if (activeOrder.value && activeOrder.value.id === order.id) {
      activeOrder.value.status = res.order.status
    }

    toast.add({
      title: 'Status Diperbarui',
      description: `Pesanan ${order.orderNumber} diubah ke status "${getOrderStatusBadge(newStatus).label}"`,
      color: 'gray'
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
