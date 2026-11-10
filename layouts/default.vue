<template>
  <div class="flex min-h-screen">
    <!-- Desktop Sidebar (Hidden on mobile) -->
    <aside class="hidden lg:flex lg:flex-col lg:w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
      <div class="flex items-center gap-3 px-6 h-16 border-b border-slate-200 dark:border-slate-800">
        <div class="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
          G
        </div>
        <div>
          <h1 class="text-base font-semibold leading-tight text-slate-900 dark:text-white">Gondowangi</h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">Admin Dashboard</p>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          :class="route.path === item.path
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'"
        >
          <UIcon :name="item.icon" class="w-5 h-5" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- User Profile & Logout -->
      <div class="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-semibold text-xs shrink-0">
              {{ userInitials }}
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium text-slate-900 dark:text-white truncate">
                {{ user?.name || 'User' }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
                {{ user?.email }}
              </p>
            </div>
          </div>
          <UBadge
            :color="user?.role === 'ADMIN' ? 'purple' : 'gray'"
            variant="subtle"
            size="xs"
            class="font-semibold uppercase tracking-wider shrink-0"
          >
            {{ user?.role || 'STAFF' }}
          </UBadge>
        </div>
        <UButton
          icon="i-heroicons-arrow-right-on-rectangle"
          color="gray"
          variant="ghost"
          block
          size="sm"
          :loading="isLoggingOut"
          @click="handleLogout"
        >
          Keluar (Logout)
        </UButton>
      </div>
    </aside>

    <!-- Mobile Drawer (USlideover) -->
    <USlideover v-model="isMobileDrawerOpen" side="left">
      <div class="flex flex-col h-full bg-white dark:bg-slate-900">
        <div class="flex items-center justify-between px-6 h-16 border-b border-slate-200 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              G
            </div>
            <span class="font-semibold text-slate-900 dark:text-white">Gondowangi Admin</span>
          </div>
          <UButton
            icon="i-heroicons-x-mark"
            color="gray"
            variant="ghost"
            size="sm"
            @click="isMobileDrawerOpen = false"
          />
        </div>

        <nav class="flex-1 px-4 py-6 space-y-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
            :class="route.path === item.path
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'"
            @click="isMobileDrawerOpen = false"
          >
            <UIcon :name="item.icon" class="w-5 h-5" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </nav>

        <div class="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div class="flex items-center justify-between mb-3">
            <div class="min-w-0">
              <p class="text-sm font-medium text-slate-900 dark:text-white truncate">
                {{ user?.name }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
                {{ user?.email }}
              </p>
            </div>
            <UBadge
              :color="user?.role === 'ADMIN' ? 'purple' : 'gray'"
              variant="subtle"
              size="xs"
              class="font-semibold uppercase"
            >
              {{ user?.role }}
            </UBadge>
          </div>
          <UButton
            icon="i-heroicons-arrow-right-on-rectangle"
            color="gray"
            variant="ghost"
            block
            size="sm"
            :loading="isLoggingOut"
            @click="handleLogout"
          >
            Keluar (Logout)
          </UButton>
        </div>
      </div>
    </USlideover>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top Header -->
      <header class="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-3">
          <!-- Mobile Menu Toggle Button -->
          <UButton
            class="lg:hidden"
            icon="i-heroicons-bars-3"
            color="gray"
            variant="ghost"
            aria-label="Buka Menu"
            @click="isMobileDrawerOpen = true"
          />
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
            {{ currentPageTitle }}
          </h2>
        </div>

        <div class="flex items-center gap-3">
          <!-- User info quick pill on desktop header -->
          <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{{ user?.email }}</span>
            <UBadge
              :color="user?.role === 'ADMIN' ? 'purple' : 'gray'"
              variant="solid"
              size="xs"
              class="ml-1 uppercase text-[10px]"
            >
              {{ user?.role }}
            </UBadge>
          </div>
        </div>
      </header>

      <!-- Main Body -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const toast = useToast()
const { user, clear } = useUserSession()

const isMobileDrawerOpen = ref(false)
const isLoggingOut = ref(false)

const navItems = [
  { label: 'Dashboard', path: '/', icon: 'i-heroicons-home' },
  { label: 'Produk', path: '/products', icon: 'i-heroicons-cube' },
  { label: 'Pesanan (Orders)', path: '/orders', icon: 'i-heroicons-shopping-bag' }
]

const currentPageTitle = computed(() => {
  if (route.path === '/') return 'Ringkasan Dashboard'
  if (route.path.startsWith('/products')) return 'Manajemen Produk'
  if (route.path.startsWith('/orders')) return 'Manajemen Pesanan'
  return 'Gondowangi Admin'
})

const userInitials = computed(() => {
  if (!user.value?.name) return 'U'
  return user.value.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
})

async function handleLogout() {
  try {
    isLoggingOut.value = true
    await $fetch('/api/auth/logout', { method: 'POST' })
    await clear()
    toast.add({
      title: 'Sampai Jumpa',
      description: 'Anda telah berhasil keluar dari akun',
      color: 'green'
    })
    navigateTo('/login')
  } catch (error: any) {
    toast.add({
      title: 'Gagal Logout',
      description: error?.statusMessage || 'Terjadi kesalahan saat logout',
      color: 'red'
    })
  } finally {
    isLoggingOut.value = false
  }
}
</script>

