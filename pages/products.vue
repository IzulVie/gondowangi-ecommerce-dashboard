<template>
  <div class="space-y-6">
    <!-- Header Page Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Manajemen Produk
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Kelola katalog produk Gondowangi, harga satuan, dan ketersediaan stok inventaris.
        </p>
      </div>

      <!-- Add Product Button (ADMIN Only) -->
      <div v-if="isAdmin">
        <UButton
          icon="i-heroicons-plus-circle"
          color="emerald"
          size="md"
          class="font-semibold shadow-sm"
          @click="openCreateModal"
        >
          Tambah Produk Baru
        </UButton>
      </div>
      <div v-else>
        <UBadge color="gray" variant="subtle" size="sm" class="text-xs">
          <UIcon name="i-heroicons-lock-closed" class="w-3.5 h-3.5 mr-1" />
          Akses Staf (Hanya Lihat)
        </UBadge>
      </div>
    </div>

    <!-- Filters & Search Toolbar -->
    <UCard :ui="{ body: { padding: 'p-4 sm:p-5' } }" class="shadow-sm">
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        <!-- Search Input -->
        <div class="sm:col-span-7">
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass"
            placeholder="Cari nama produk Gondowangi..."
            size="md"
            :ui="{ icon: { trailing: { pointer: '' } } }"
          >
            <template #trailing>
              <UButton
                v-if="searchQuery"
                color="gray"
                variant="link"
                icon="i-heroicons-x-mark"
                :padded="false"
                @click="searchQuery = ''"
              />
            </template>
          </UInput>
        </div>

        <!-- Category Filter -->
        <div class="sm:col-span-5 flex items-center gap-2">
          <span class="text-xs font-medium text-slate-500 shrink-0">Kategori:</span>
          <USelect
            v-model="selectedCategory"
            :options="categoryOptions"
            size="md"
            class="w-full"
          />
        </div>
      </div>
    </UCard>

    <!-- Products Table Card -->
    <UCard class="shadow-sm">
      <!-- Loading State -->
      <div v-if="pending" class="py-16 flex flex-col items-center justify-center text-slate-400">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-emerald-600 mb-3" />
        <p class="text-sm font-medium">Memuat katalog produk...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!filteredProducts || filteredProducts.length === 0" class="py-16 text-center text-slate-500">
        <UIcon name="i-heroicons-cube-transparent" class="w-14 h-14 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
        <p class="text-base font-semibold text-slate-800 dark:text-slate-200">Tidak ada produk ditemukan</p>
        <p class="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Tidak ada produk yang sesuai dengan filter pencarian atau kategori yang dipilih.
        </p>
        <div class="mt-4 flex justify-center gap-2">
          <UButton
            v-if="searchQuery || selectedCategory !== 'ALL'"
            color="gray"
            variant="outline"
            size="xs"
            @click="resetFilters"
          >
            Reset Filter
          </UButton>
          <UButton
            v-if="isAdmin"
            color="emerald"
            size="xs"
            icon="i-heroicons-plus"
            @click="openCreateModal"
          >
            Tambah Produk
          </UButton>
        </div>
      </div>

      <!-- Responsive Products Table -->
      <div v-else class="overflow-x-auto -mx-4 sm:-mx-6">
        <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
          <thead class="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th scope="col" class="py-3.5 px-4 sm:px-6">Nama Produk</th>
              <th scope="col" class="py-3.5 px-4 sm:px-6">Kategori</th>
              <th scope="col" class="py-3.5 px-4 sm:px-6">Harga Satuan</th>
              <th scope="col" class="py-3.5 px-4 sm:px-6">Stok Tersedia</th>
              <th v-if="isAdmin" scope="col" class="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
            <tr
              v-for="product in filteredProducts"
              :key="product.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <td class="py-3.5 px-4 sm:px-6 font-medium text-slate-900 dark:text-white">
                {{ product.name }}
              </td>
              <td class="py-3.5 px-4 sm:px-6">
                <UBadge color="gray" variant="subtle" size="xs">
                  {{ product.category }}
                </UBadge>
              </td>
              <td class="py-3.5 px-4 sm:px-6 font-semibold text-slate-900 dark:text-white">
                {{ formatCurrency(product.price) }}
              </td>
              <td class="py-3.5 px-4 sm:px-6">
                <UBadge
                  v-if="product.stock < 5"
                  color="amber"
                  variant="subtle"
                  size="xs"
                  class="font-semibold"
                >
                  <UIcon name="i-heroicons-exclamation-triangle" class="w-3.5 h-3.5 mr-1 text-amber-600" />
                  {{ product.stock }} (Menipis)
                </UBadge>
                <span v-else class="text-slate-700 dark:text-slate-300 font-medium">
                  {{ product.stock }} unit
                </span>
              </td>
              <!-- Action Buttons (ADMIN Only) -->
              <td v-if="isAdmin" class="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                <div class="flex items-center justify-end gap-1.5">
                  <UButton
                    icon="i-heroicons-pencil-square"
                    color="gray"
                    variant="ghost"
                    size="xs"
                    aria-label="Edit Produk"
                    @click="openEditModal(product)"
                  />
                  <UButton
                    icon="i-heroicons-trash"
                    color="red"
                    variant="ghost"
                    size="xs"
                    aria-label="Hapus Produk"
                    @click="openDeleteModal(product)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <!-- Create / Edit Product Modal (ADMIN Only) -->
    <UModal v-model="isFormModalOpen" :prevent-close="isSubmitting">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-slate-100 dark:divide-slate-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-slate-900 dark:text-white">
              {{ editingProductId ? 'Perbarui Produk' : 'Tambah Produk Baru' }}
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              :disabled="isSubmitting"
              @click="isFormModalOpen = false"
            />
          </div>
        </template>

        <form @submit.prevent="submitProductForm" class="space-y-4 py-2">
          <UFormGroup label="Nama Produk" name="name" required :error="formErrors.name">
            <UInput
              v-model="formData.name"
              placeholder="Contoh: Natur Hair Tonic Ginseng 90ml"
              :disabled="isSubmitting"
            />
          </UFormGroup>

          <UFormGroup label="Kategori" name="category" required :error="formErrors.category">
            <UInput
              v-model="formData.category"
              placeholder="Contoh: Haircare / Skincare / Bodycare"
              :disabled="isSubmitting"
            />
          </UFormGroup>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormGroup label="Harga Satuan (IDR)" name="price" required :error="formErrors.price">
              <UInput
                v-model="formData.price"
                type="number"
                min="1"
                step="1"
                placeholder="Contoh: 45000"
                :disabled="isSubmitting"
              />
            </UFormGroup>

            <UFormGroup label="Stok Inventaris" name="stock" required :error="formErrors.stock">
              <UInput
                v-model="formData.stock"
                type="number"
                min="0"
                step="1"
                placeholder="Contoh: 25"
                :disabled="isSubmitting"
              />
            </UFormGroup>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <UButton
              color="gray"
              variant="ghost"
              :disabled="isSubmitting"
              @click="isFormModalOpen = false"
            >
              Batal
            </UButton>
            <UButton
              type="submit"
              color="emerald"
              :loading="isSubmitting"
            >
              {{ editingProductId ? 'Simpan Perubahan' : 'Tambah Produk' }}
            </UButton>
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Delete Confirmation Modal (ADMIN Only) -->
    <UModal v-model="isDeleteModalOpen" :prevent-close="isDeleting">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-slate-100 dark:divide-slate-800' }">
        <template #header>
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-semibold text-slate-900 dark:text-white">
                Hapus Produk?
              </h3>
              <p class="text-xs text-slate-500">Konfirmasi penghapusan data dari katalog</p>
            </div>
          </div>
        </template>

        <div class="py-3 space-y-3">
          <p class="text-sm text-slate-700 dark:text-slate-300">
            Apakah Anda yakin ingin menghapus produk <strong>"{{ productToDelete?.name }}"</strong>?
          </p>
          <div class="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
            <p class="font-semibold flex items-center gap-1.5">
              <UIcon name="i-heroicons-shield-check" class="w-4 h-4" />
              Keamanan Riwayat Pesanan:
            </p>
            <p>
              Histori pesanan sebelumnya yang memuat produk ini akan tetap tersimpan secara utuh (nama produk, harga satuan, dan total belanja tidak akan rusak).
            </p>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              color="gray"
              variant="ghost"
              :disabled="isDeleting"
              @click="isDeleteModalOpen = false"
            >
              Batal
            </UButton>
            <UButton
              color="red"
              :loading="isDeleting"
              icon="i-heroicons-trash"
              @click="confirmDeleteProduct"
            >
              Hapus Produk
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { formatCurrency } from '~/utils/format'

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  createdAt: string
  updatedAt: string
}

interface ProductsResponse {
  products: Product[]
  categories: string[]
}

const { user } = useUserSession()
const toast = useToast()

const isAdmin = computed(() => user.value?.role === 'ADMIN')

const searchQuery = ref('')
const selectedCategory = ref('ALL')

// Fetch Products from Server
const { data, pending, refresh } = await useFetch<ProductsResponse>('/api/products', {
  lazy: false
})

const categoryOptions = computed(() => {
  const options = [{ label: 'Semua Kategori', value: 'ALL' }]
  if (data.value?.categories) {
    for (const cat of data.value.categories) {
      options.push({ label: cat, value: cat })
    }
  }
  return options
})

const filteredProducts = computed(() => {
  if (!data.value?.products) return []
  return data.value.products.filter((p) => {
    const matchesSearch = !searchQuery.value || p.name.toLowerCase().includes(searchQuery.value.toLowerCase().trim())
    const matchesCategory = selectedCategory.value === 'ALL' || p.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

function resetFilters() {
  searchQuery.value = ''
  selectedCategory.value = 'ALL'
}

// Create / Edit Modal State
const isFormModalOpen = ref(false)
const isSubmitting = ref(false)
const editingProductId = ref<string | null>(null)
const formData = reactive({
  name: '',
  category: '',
  price: 0,
  stock: 0
})
const formErrors = reactive({
  name: '',
  category: '',
  price: '',
  stock: ''
})

function clearFormErrors() {
  formErrors.name = ''
  formErrors.category = ''
  formErrors.price = ''
  formErrors.stock = ''
}

function openCreateModal() {
  editingProductId.value = null
  formData.name = ''
  formData.category = ''
  formData.price = 50000
  formData.stock = 10
  clearFormErrors()
  isFormModalOpen.value = true
}

function openEditModal(product: Product) {
  editingProductId.value = product.id
  formData.name = product.name
  formData.category = product.category
  formData.price = product.price
  formData.stock = product.stock
  clearFormErrors()
  isFormModalOpen.value = true
}

async function submitProductForm() {
  clearFormErrors()
  let hasError = false

  if (!formData.name.trim()) {
    formErrors.name = 'Nama produk wajib diisi'
    hasError = true
  }
  if (!formData.category.trim()) {
    formErrors.category = 'Kategori wajib diisi'
    hasError = true
  }
  if (!formData.price || formData.price <= 0) {
    formErrors.price = 'Harga harus lebih dari 0'
    hasError = true
  }
  if (formData.stock === null || formData.stock === undefined || formData.stock < 0) {
    formErrors.stock = 'Stok tidak boleh negatif'
    hasError = true
  }

  if (hasError) return

  try {
    isSubmitting.value = true
    if (editingProductId.value) {
      await $fetch(`/api/products/${editingProductId.value}`, {
        method: 'PUT',
        body: {
          name: formData.name.trim(),
          category: formData.category.trim(),
          price: Number(formData.price),
          stock: Number(formData.stock)
        }
      })
      toast.add({
        title: 'Berhasil',
        description: 'Produk berhasil diperbarui',
        color: 'green'
      })
    } else {
      await $fetch('/api/products', {
        method: 'POST',
        body: {
          name: formData.name.trim(),
          category: formData.category.trim(),
          price: Number(formData.price),
          stock: Number(formData.stock)
        }
      })
      toast.add({
        title: 'Berhasil',
        description: 'Produk baru berhasil ditambahkan',
        color: 'green'
      })
    }

    isFormModalOpen.value = false
    await refresh()
  } catch (error: any) {
    toast.add({
      title: 'Operasi Gagal',
      description: error?.statusMessage || error?.data?.statusMessage || 'Terjadi kesalahan saat menyimpan produk',
      color: 'red'
    })
  } finally {
    isSubmitting.value = false
  }
}

// Delete Modal State
const isDeleteModalOpen = ref(false)
const isDeleting = ref(false)
const productToDelete = ref<Product | null>(null)

function openDeleteModal(product: Product) {
  productToDelete.value = product
  isDeleteModalOpen.value = true
}

async function confirmDeleteProduct() {
  if (!productToDelete.value) return

  try {
    isDeleting.value = true
    await $fetch(`/api/products/${productToDelete.value.id}`, {
      method: 'DELETE'
    })
    toast.add({
      title: 'Produk Dihapus',
      description: `Produk "${productToDelete.value.name}" telah dihapus. Histori pesanan tetap aman.`,
      color: 'green'
    })
    isDeleteModalOpen.value = false
    await refresh()
  } catch (error: any) {
    toast.add({
      title: 'Gagal Menghapus',
      description: error?.statusMessage || error?.data?.statusMessage || 'Terjadi kesalahan saat menghapus produk',
      color: 'red'
    })
  } finally {
    isDeleting.value = false
  }
}
</script>

