<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-zinc-50/60 dark:bg-zinc-950">
    <div class="w-full max-w-sm">
      <!-- App Brand Header -->
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center w-8 h-8 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-sm tracking-tight mb-3">
          G
        </div>
        <h1 class="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Gondowangi Administration
        </h1>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Masuk untuk mengelola katalog produk dan pesanan
        </p>
      </div>

      <!-- Authentication Card (shadcn / Linear flat style) -->
      <div class="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-lg p-6 shadow-2xs">
        <!-- Error Alert -->
        <div
          v-if="errorMessage"
          class="mb-4 p-3 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 flex items-start justify-between gap-2"
        >
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4 shrink-0 text-rose-500" />
            <span>{{ errorMessage }}</span>
          </div>
          <button
            type="button"
            class="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200"
            @click="errorMessage = ''"
          >
            <UIcon name="i-heroicons-x-mark" class="w-3.5 h-3.5" />
          </button>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Alamat Email <span class="text-rose-500">*</span>
            </label>
            <UInput
              v-model="email"
              type="email"
              placeholder="admin@example.com"
              icon="i-heroicons-envelope"
              autocomplete="email"
              :disabled="isLoading"
              size="sm"
            />
            <p v-if="emailError" class="text-[11px] text-rose-500 mt-1">{{ emailError }}</p>
          </div>

          <div>
            <label class="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Kata Sandi <span class="text-rose-500">*</span>
            </label>
            <UInput
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••••••"
              icon="i-heroicons-lock-closed"
              autocomplete="current-password"
              :disabled="isLoading"
              size="sm"
              :ui="{ icon: { trailing: { pointer: '' } } }"
            >
              <template #trailing>
                <button
                  type="button"
                  class="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  tabindex="-1"
                  @click="showPassword = !showPassword"
                >
                  <UIcon :name="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="w-3.5 h-3.5" />
                </button>
              </template>
            </UInput>
            <p v-if="passwordError" class="text-[11px] text-rose-500 mt-1">{{ passwordError }}</p>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full mt-2 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-md text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <UIcon v-if="isLoading" name="i-heroicons-arrow-path" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ isLoading ? 'Memverifikasi...' : 'Masuk ke Dashboard' }}</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="relative my-5">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
          </div>
          <div class="relative flex justify-center text-[10px] uppercase">
            <span class="bg-white dark:bg-zinc-900 px-2 text-zinc-400 font-medium tracking-wider">
              Akun Evaluasi
            </span>
          </div>
        </div>

        <!-- Quick Demo Accounts Buttons (Clean Outline) -->
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            class="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
            @click="fillCredentials('admin')"
          >
            <UIcon name="i-heroicons-shield-check" class="w-3.5 h-3.5 text-zinc-500" />
            <span>Demo Admin</span>
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
            @click="fillCredentials('staff')"
          >
            <UIcon name="i-heroicons-user" class="w-3.5 h-3.5 text-zinc-500" />
            <span>Demo Staff</span>
          </button>
        </div>
      </div>

      <p class="text-[11px] text-center text-zinc-400 mt-4">
        Klik tombol Demo Admin / Demo Staff untuk pengujian instan.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const { fetch: refreshSession } = useUserSession()
const toast = useToast()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const emailError = ref('')
const passwordError = ref('')

function fillCredentials(type: 'admin' | 'staff') {
  errorMessage.value = ''
  emailError.value = ''
  passwordError.value = ''
  if (type === 'admin') {
    email.value = 'admin@example.com'
    password.value = 'AdminDemo123!'
  } else {
    email.value = 'staff@example.com'
    password.value = 'StaffDemo123!'
  }
}

async function handleLogin() {
  emailError.value = ''
  passwordError.value = ''
  errorMessage.value = ''

  if (!email.value) {
    emailError.value = 'Email wajib diisi'
    return
  }
  if (!password.value) {
    passwordError.value = 'Password wajib diisi'
    return
  }

  try {
    isLoading.value = true
    const res = await $fetch<{ success: boolean; user: any }>('/api/auth/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    })

    await refreshSession()

    toast.add({
      title: 'Selamat Datang',
      description: `Masuk sebagai ${res.user.name} (${res.user.role})`,
      color: 'gray'
    })

    navigateTo('/')
  } catch (error: any) {
    errorMessage.value = error?.statusMessage || error?.data?.statusMessage || 'Email atau password tidak sesuai'
    toast.add({
      title: 'Login Gagal',
      description: errorMessage.value,
      color: 'red'
    })
  } finally {
    isLoading.value = false
  }
}
</script>
