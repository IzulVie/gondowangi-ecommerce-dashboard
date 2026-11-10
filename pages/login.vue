<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900">
    <div class="w-full max-w-md">
      <!-- App Brand Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600 text-white font-black text-2xl shadow-lg shadow-emerald-600/20 mb-3">
          G
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Gondowangi E-Commerce
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Administration Dashboard Panel
        </p>
      </div>

      <UCard class="shadow-xl ring-1 ring-slate-900/5 dark:ring-slate-800">
        <template #header>
          <div>
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Masuk ke Akun</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Silakan masukkan kredensial akun administrator atau staf Anda.
            </p>
          </div>
        </template>

        <!-- Error Alert -->
        <UAlert
          v-if="errorMessage"
          icon="i-heroicons-exclamation-triangle"
          color="red"
          variant="subtle"
          :title="errorMessage"
          class="mb-5"
          :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'red', variant: 'link' }"
          @close="errorMessage = ''"
        />

        <form @submit.prevent="handleLogin" class="space-y-4">
          <UFormGroup label="Email" name="email" required :error="emailError">
            <UInput
              v-model="email"
              type="email"
              placeholder="admin@example.com"
              icon="i-heroicons-envelope"
              autocomplete="email"
              :disabled="isLoading"
            />
          </UFormGroup>

          <UFormGroup label="Password" name="password" required :error="passwordError">
            <UInput
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••••••"
              icon="i-heroicons-lock-closed"
              autocomplete="current-password"
              :disabled="isLoading"
              :ui="{ icon: { trailing: { pointer: '' } } }"
            >
              <template #trailing>
                <UButton
                  color="gray"
                  variant="link"
                  icon="i-heroicons-eye"
                  :padded="false"
                  tabindex="-1"
                  @click="showPassword = !showPassword"
                />
              </template>
            </UInput>
          </UFormGroup>

          <UButton
            type="submit"
            color="emerald"
            block
            size="lg"
            :loading="isLoading"
            class="mt-2 font-semibold shadow-sm"
          >
            Masuk Sekarang
          </UButton>
        </form>

        <template #footer>
          <div class="space-y-3">
            <div class="relative flex py-1 items-center">
              <div class="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span class="flex-shrink mx-3 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Akun Demo Penguji
              </span>
              <div class="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            <div class="grid grid-cols-2 gap-2.5">
              <UButton
                type="button"
                color="purple"
                variant="soft"
                size="sm"
                block
                icon="i-heroicons-shield-check"
                @click="fillCredentials('admin')"
              >
                Demo Admin
              </UButton>
              <UButton
                type="button"
                color="gray"
                variant="soft"
                size="sm"
                block
                icon="i-heroicons-user"
                @click="fillCredentials('staff')"
              >
                Demo Staff
              </UButton>
            </div>
            <p class="text-[11px] text-center text-slate-400">
              Klik salah satu tombol demo di atas untuk mengisi kredensial evaluasi secara otomatis.
            </p>
          </div>
        </template>
      </UCard>
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

    // Refresh nuxt-auth-utils client state
    await refreshSession()

    toast.add({
      title: 'Selamat Datang!',
      description: `Berhasil masuk sebagai ${res.user.name} (${res.user.role})`,
      color: 'green'
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

