<template>
  <div class="flex min-h-screen bg-zinc-50/40 dark:bg-zinc-950">
    <!-- Desktop Sidebar (shadcn / Linear style) -->
    <aside class="hidden lg:flex lg:flex-col lg:w-60 border-r border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/60 shrink-0">
      <!-- Brand Header -->
      <div class="flex items-center gap-2.5 px-5 h-14 border-b border-zinc-200/80 dark:border-zinc-800">
        <div class="w-6 h-6 rounded-md bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 font-bold text-xs tracking-tight">
          G
        </div>
        <div class="min-w-0 flex items-baseline gap-1.5">
          <span class="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Gondowangi</span>
          <span class="text-[11px] text-zinc-400 font-normal">Admin</span>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
          :class="route.path === item.path
            ? 'bg-zinc-200/70 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 shadow-2xs'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/40 dark:hover:bg-zinc-800/40'"
        >
          <UIcon :name="item.icon" class="w-4 h-4 shrink-0 text-zinc-500 dark:text-zinc-400" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- User Profile & Logout Section -->
      <div class="p-3 border-t border-zinc-200/80 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40">
        <div class="flex items-center justify-between mb-2 px-1">
          <div class="flex items-center gap-2 min-w-0">
            <div class="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-medium text-[10px] shrink-0">
              {{ userInitials }}
            </div>
            <div class="min-w-0">
              <p class="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {{ user?.name || 'User' }}
              </p>
              <p class="text-[11px] text-zinc-400 truncate">
                {{ user?.email }}
              </p>
            </div>
          </div>
          <span
            class="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded border shrink-0"
            :class="user?.role === 'ADMIN'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'"
          >
            {{ user?.role || 'STAFF' }}
          </span>
        </div>
        <UButton
          icon="i-heroicons-arrow-right-on-rectangle"
          color="gray"
          variant="ghost"
          block
          size="xs"
          :loading="isLoggingOut"
          class="text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          @click="handleLogout"
        >
          Keluar
        </UButton>
      </div>
    </aside>

    <!-- Mobile Slideover Drawer -->
    <USlideover v-model="isMobileDrawerOpen" side="left">
      <div class="flex flex-col h-full bg-white dark:bg-zinc-950">
        <div class="flex items-center justify-between px-5 h-14 border-b border-zinc-200/80 dark:border-zinc-800">
          <div class="flex items-center gap-2.5">
            <div class="w-6 h-6 rounded-md bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 font-bold text-xs">
              G
            </div>
            <span class="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Gondowangi Admin</span>
          </div>
          <UButton
            icon="i-heroicons-x-mark"
            color="gray"
            variant="ghost"
            size="xs"
            @click="isMobileDrawerOpen = false"
          />
        </div>

        <nav class="flex-1 px-3 py-4 space-y-0.5">
          <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors"
            :class="route.path === item.path
              ? 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800'"
            @click="isMobileDrawerOpen = false"
          >
            <UIcon :name="item.icon" class="w-4 h-4 text-zinc-500" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </nav>

        <div class="p-4 border-t border-zinc-200/80 dark:border-zinc-800">
          <div class="flex items-center justify-between mb-3">
            <div class="min-w-0">
              <p class="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">{{ user?.name }}</p>
              <p class="text-[11px] text-zinc-400 truncate">{{ user?.email }}</p>
            </div>
            <span
              class="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded border"
              :class="user?.role === 'ADMIN'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'"
            >
              {{ user?.role }}
            </span>
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
            Keluar
          </UButton>
        </div>
      </div>
    </USlideover>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top Header -->
      <header class="h-14 border-b border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-sm px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-10">
        <div class="flex items-center gap-3">
          <UButton
            class="lg:hidden"
            icon="i-heroicons-bars-3"
            color="gray"
            variant="ghost"
            size="xs"
            aria-label="Buka Menu"
            @click="isMobileDrawerOpen = true"
          />
          <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {{ currentPageTitle }}
          </h2>
        </div>

        <div class="flex items-center gap-2">
          <div class="flex items-center gap-2 px-2.5 py-1 rounded-md border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-600 dark:text-zinc-300">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span class="truncate max-w-[140px] sm:max-w-[200px]">{{ user?.email }}</span>
            <span class="text-[10px] uppercase font-semibold text-zinc-400">
              ({{ user?.role }})
            </span>
          </div>
        </div>
      </header>

      <!-- Main Body -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto overflow-y-auto">
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
  { label: 'Dashboard', path: '/', icon: 'i-heroicons-squares-2x2' },
  { label: 'Produk', path: '/products', icon: 'i-heroicons-cube' },
  { label: 'Pesanan', path: '/orders', icon: 'i-heroicons-shopping-bag' }
]

const currentPageTitle = computed(() => {
  if (route.path === '/') return 'Dashboard'
  if (route.path.startsWith('/products')) return 'Produk'
  if (route.path.startsWith('/orders')) return 'Pesanan'
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
      title: 'Berhasil Keluar',
      description: 'Sesi akun Anda telah berakhir',
      color: 'gray'
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
