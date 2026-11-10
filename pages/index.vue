<template>
  <div class="space-y-8">
    <!-- Header Page Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Ringkasan Dashboard
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Pantau metrik penjualan, inventaris produk, dan pesanan terbaru Gondowangi secara real-time.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <UButton
          icon="i-heroicons-arrow-path"
          color="gray"
          variant="outline"
          size="sm"
          :loading="pending"
          @click="refreshDashboard"
        >
          Muat Ulang
        </UButton>
      </div>
    </div>

    <!-- Error State -->
    <UAlert
      v-if="error"
      icon="i-heroicons-exclamation-circle"
      color="red"
      variant="subtle"
      title="Gagal Memuat Data Dashboard"
      :description="error.message || 'Terjadi kesalahan saat mengambil metrik.'"
    />

    <!-- Metric Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <!-- Total Products -->
      <UCard class="relative overflow-hidden shadow-sm hover:shadow transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Produk
            </p>
            <div class="mt-2 flex items-baseline">
              <span v-if="pending" class="text-2xl font-bold text-slate-300 animate-pulse">...</span>
              <span v-else class="text-3xl font-bold text-slate-900 dark:text-white">
                {{ data?.totalProducts ?? 0 }}
              </span>
              <span class="ml-2 text-xs text-slate-500">item terdaftar</span>
            </div>
          </div>
          <div class="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <UIcon name="i-heroicons-cube" class="w-6 h-6" />
          </div>
        </div>
      </UCard>

      <!-- Total Orders -->
      <UCard class="relative overflow-hidden shadow-sm hover:shadow transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Pesanan
            </p>
            <div class="mt-2 flex items-baseline">
              <span v-if="pending" class="text-2xl font-bold text-slate-300 animate-pulse">...</span>
              <span v-else class="text-3xl font-bold text-slate-900 dark:text-white">
                {{ data?.totalOrders ?? 0 }}
              </span>
              <span class="ml-2 text-xs text-slate-500">transaksi</span>
            </div>
          </div>
          <div class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <UIcon name="i-heroicons-shopping-bag" class="w-6 h-6" />
          </div>
        </div>
      </UCard>

      <!-- Revenue (Completed Orders) -->
      <UCard class="relative overflow-hidden shadow-sm hover:shadow transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pendapatan Selesai
            </p>
            <div class="mt-2 flex items-baseline">
              <span v-if="pending" class="text-xl font-bold text-slate-300 animate-pulse">...</span>
              <span v-else class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {{ formatCurrency(data?.completedOrdersValue ?? 0) }}
              </span>
            </div>
          </div>
          <div class="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <UIcon name="i-heroicons-banknotes" class="w-6 h-6" />
          </div>
        </div>
      </UCard>

      <!-- Low Stock Warning (< 5) -->
      <UCard
        class="relative overflow-hidden shadow-sm hover:shadow transition-shadow"
        :class="(data?.lowStockCount ?? 0) > 0 ? 'border-amber-300 dark:border-amber-800' : ''"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Stok Menipis (&lt; 5)
            </p>
            <div class="mt-2 flex items-baseline">
              <span v-if="pending" class="text-2xl font-bold text-slate-300 animate-pulse">...</span>
              <span
                v-else
                class="text-3xl font-bold"
                :class="(data?.lowStockCount ?? 0) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'"
              >
                {{ data?.lowStockCount ?? 0 }}
              </span>
              <span class="ml-2 text-xs text-slate-500">perlu restock</span>
            </div>
          </div>
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center"
            :class="(data?.lowStockCount ?? 0) > 0 ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'"
          >
            <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6" />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Recent Orders Table Section -->
    <UCard class="shadow-sm">
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-semibold text-slate-900 dark:text-white">
              5 Pesanan Terbaru
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Daftar transaksi pesanan terakhir yang masuk ke dalam sistem.
            </p>
          </div>
          <UButton
            to="/orders"
            color="emerald"
            variant="ghost"
            size="sm"
            trailing-icon="i-heroicons-arrow-right"
          >
            Lihat Semua Pesanan
          </UButton>
        </div>
      </template>

      <!-- Loading State -->
      <div v-if="pending" class="py-12 flex flex-col items-center justify-center text-slate-400">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-emerald-600 mb-3" />
        <p class="text-sm">Memuat data pesanan terbaru...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!data?.recentOrders || data.recentOrders.length === 0" class="py-12 text-center text-slate-500">
        <UIcon name="i-heroicons-inbox" class="w-12 h-12 mx-auto text-slate-400 mb-2" />
        <p class="font-medium text-slate-700 dark:text-slate-300">Belum ada pesanan</p>
        <p class="text-xs text-slate-400 mt-1">Data pesanan akan tampil di sini setelah transaksi terjadi.</p>
      </div>

      <!-- Orders Table -->
      <div v-else class="overflow-x-auto -mx-4 sm:-mx-6">
        <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
          <thead class="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th scope="col" class="py-3 px-4 sm:px-6">No. Pesanan</th>
              <th scope="col" class="py-3 px-4 sm:px-6">Nama Pelanggan</th>
              <th scope="col" class="py-3 px-4 sm:px-6">Waktu Transaksi</th>
              <th scope="col" class="py-3 px-4 sm:px-6">Total Nilai</th>
              <th scope="col" class="py-3 px-4 sm:px-6">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
            <tr
              v-for="order in data.recentOrders"
              :key="order.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <td class="py-3.5 px-4 sm:px-6 font-mono font-medium text-slate-900 dark:text-white">
                {{ order.orderNumber }}
              </td>
              <td class="py-3.5 px-4 sm:px-6 text-slate-700 dark:text-slate-300">
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
                  class="capitalize font-medium"
                >
                  {{ getOrderStatusBadge(order.status).label }}
                </UBadge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
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

