<template>
  <div class="space-y-6">
    <!-- Header Page Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Ringkasan Dashboard
        </h1>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Ikhtisar metrik inventaris, performa penjualan, dan pesanan terbaru
        </p>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          icon="i-heroicons-arrow-path"
          color="gray"
          variant="outline"
          size="xs"
          :loading="pending"
          @click="refreshDashboard"
        >
          Muat Ulang
        </UButton>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-if="error"
      class="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2"
    >
      <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4 text-rose-500 shrink-0" />
      <span>{{ error.message || 'Terjadi kesalahan saat memuat metrik dashboard.' }}</span>
    </div>

    <!-- 4 Summary Metric Cards (shadcn / Linear flat style) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 1. Total Products -->
      <div class="p-4 sm:p-5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Total Produk
          </span>
          <UIcon name="i-heroicons-cube" class="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
        </div>
        <div class="mt-3">
          <div v-if="pending" class="h-8 w-16 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse"></div>
          <div v-else class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 tabular-nums">
            {{ data?.totalProducts ?? 0 }}
          </div>
          <p class="text-[11px] text-zinc-400 mt-1">Item aktif terdaftar</p>
        </div>
      </div>

      <!-- 2. Total Orders -->
      <div class="p-4 sm:p-5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Total Pesanan
          </span>
          <UIcon name="i-heroicons-shopping-bag" class="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
        </div>
        <div class="mt-3">
          <div v-if="pending" class="h-8 w-16 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse"></div>
          <div v-else class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 tabular-nums">
            {{ data?.totalOrders ?? 0 }}
          </div>
          <p class="text-[11px] text-zinc-400 mt-1">Seluruh riwayat pesanan</p>
        </div>
      </div>

      <!-- 3. Completed Orders Revenue -->
      <div class="p-4 sm:p-5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Pendapatan Selesai
          </span>
          <UIcon name="i-heroicons-banknotes" class="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
        </div>
        <div class="mt-3">
          <div v-if="pending" class="h-8 w-28 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse"></div>
          <div v-else class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 tabular-nums">
            {{ formatCurrency(data?.completedOrdersValue ?? 0) }}
          </div>
          <p class="text-[11px] text-zinc-400 mt-1">Dari pesanan berstatus selesai</p>
        </div>
      </div>

      <!-- 4. Low Stock Products (< 5) -->
      <div
        class="p-4 sm:p-5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs"
        :class="(data?.lowStockCount ?? 0) > 0 ? 'border-amber-300/80 dark:border-amber-800/80' : ''"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Stok Menipis (&lt; 5)
          </span>
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="w-4 h-4"
            :class="(data?.lowStockCount ?? 0) > 0 ? 'text-amber-500' : 'text-zinc-400 dark:text-zinc-500'"
          />
        </div>
        <div class="mt-3">
          <div v-if="pending" class="h-8 w-16 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse"></div>
          <div
            v-else
            class="text-2xl font-bold tracking-tight tabular-nums"
            :class="(data?.lowStockCount ?? 0) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-900 dark:text-zinc-100'"
          >
            {{ data?.lowStockCount ?? 0 }}
          </div>
          <p class="text-[11px] text-zinc-400 mt-1">Perlu restock inventaris</p>
        </div>
      </div>
    </div>

    <!-- Recent Orders Section (Clean Flat Table) -->
    <div class="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-lg overflow-hidden shadow-2xs">
      <div class="p-4 sm:px-6 sm:py-3.5 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            5 Pesanan Terbaru
          </h2>
          <p class="text-[11px] text-zinc-400">
            Transaksi pesanan yang baru masuk ke sistem
          </p>
        </div>
        <UButton
          to="/orders"
          color="gray"
          variant="ghost"
          size="xs"
          trailing-icon="i-heroicons-arrow-right"
        >
          Lihat Semua
        </UButton>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="py-12 flex flex-col items-center justify-center text-zinc-400 text-xs">
        <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin text-zinc-500 mb-2" />
        <span>Memuat data pesanan...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="!data?.recentOrders || data.recentOrders.length === 0" class="py-12 text-center text-xs text-zinc-500">
        <UIcon name="i-heroicons-inbox" class="w-8 h-8 mx-auto text-zinc-400 mb-2" />
        <p class="font-medium text-zinc-700 dark:text-zinc-300">Belum ada pesanan</p>
        <p class="text-zinc-400 mt-0.5">Data pesanan akan tampil di sini setelah transaksi terjadi.</p>
      </div>

      <!-- Orders Table -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-zinc-200/80 dark:divide-zinc-800 text-left text-xs">
          <thead class="bg-zinc-50/70 dark:bg-zinc-900/70 text-zinc-500 uppercase tracking-wider font-medium text-[11px]">
            <tr>
              <th scope="col" class="py-2.5 px-4 sm:px-6 font-medium">No. Pesanan</th>
              <th scope="col" class="py-2.5 px-4 sm:px-6 font-medium">Pelanggan</th>
              <th scope="col" class="py-2.5 px-4 sm:px-6 font-medium">Waktu Transaksi</th>
              <th scope="col" class="py-2.5 px-4 sm:px-6 font-medium">Total Nilai</th>
              <th scope="col" class="py-2.5 px-4 sm:px-6 font-medium">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-200/60 dark:divide-zinc-800/80">
            <tr
              v-for="order in data.recentOrders"
              :key="order.id"
              class="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
            >
              <td class="py-3 px-4 sm:px-6 font-mono font-medium text-zinc-900 dark:text-zinc-100 tabular-nums">
                {{ order.orderNumber }}
              </td>
              <td class="py-3 px-4 sm:px-6 text-zinc-700 dark:text-zinc-300">
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
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatCurrency, formatDate, getOrderStatusBadge } from '~/utils/format'

interface DashboardData {
  totalProducts: number
  totalOrders: number
  completedOrdersValue: number
  lowStockCount: number
  recentOrders: any[]
}

const { data, pending, error, refresh } = await useFetch<DashboardData>('/api/dashboard', {
  lazy: false
})

function refreshDashboard() {
  refresh()
}
</script>
