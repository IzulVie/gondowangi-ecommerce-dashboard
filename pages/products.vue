<template>
  <div class="space-y-5">
    <!-- Header Page Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Katalog Produk
        </h1>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Kelola daftar produk Gondowangi, harga satuan, dan pemantauan stok inventaris
        </p>
      </div>

      <!-- Add Product Button (ADMIN Only) -->
      <div v-if="isAdmin">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors shadow-2xs cursor-pointer"
          @click="openCreateModal"
        >
          <UIcon name="i-heroicons-plus" class="w-3.5 h-3.5" />
          <span>Tambah Produk</span>
        </button>
      </div>
      <div v-else>
        <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 text-xs">
          <UIcon name="i-heroicons-lock-closed" class="w-3.5 h-3.5" />
          <span>Hanya Lihat (Staf)</span>
        </div>
      </div>
    </div>

    <!-- Filters & Search Toolbar -->
    <div class="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-lg p-3 sm:p-4 shadow-2xs">
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <!-- Search Input -->
        <div class="sm:col-span-8">
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass"
            placeholder="Cari nama produk..."
            size="sm"
            :ui="{ icon: { trailing: { pointer: '' } } }"
          >
            <template #trailing>
              <button
                v-if="searchQuery"
                type="button"
                class="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                @click="searchQuery = ''"
              >
                <UIcon name="i-heroicons-x-mark" class="w-3.5 h-3.5" />
              </button>
            </template>
          </UInput>
        </div>

        <!-- Category Filter -->
        <div class="sm:col-span-4 flex items-center gap-2">
          <span class="text-xs text-zinc-400 shrink-0">Kategori:</span>
          <USelect
            v-model="selectedCategory"
            :options="categoryOptions"
            size="sm"
            class="w-full"
          />
        </div>
      </div>
    </div>

    <!-- Products Table Card -->
    <div class="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-lg overflow-hidden shadow-2xs">
      <!-- Loading State -->
      <div v-if="pending" class="py-16 flex flex-col items-center justify-center text-zinc-400 text-xs">
        <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin text-zinc-500 mb-2" />
        <span>Memuat katalog produk...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="!filteredProducts || filteredProducts.length === 0" class="py-14 text-center text-xs text-zinc-500">
        <UIcon name="i-heroicons-cube" class="w-8 h-8 mx-auto text-zinc-400 mb-2" />
        <p class="font-medium text-zinc-700 dark:text-zinc-300">Tidak ada produk ditemukan</p>
        <p class="text-zinc-400 mt-0.5">Tidak ada produk yang cocok dengan pencarian atau filter kategori saat ini.</p>
        <div class="mt-3 flex justify-center gap-2">
          <UButton
            v-if="searchQuery || selectedCategory !== 'ALL'"
            color="gray"
            variant="outline"
            size="xs"
            @click="resetFilters"
          >
            Reset Filter
          </UButton>
          <button
            v-if="isAdmin"
            type="button"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 transition-colors"
            @click="openCreateModal"
          >
            <UIcon name="i-heroicons-plus" class="w-3.5 h-3.5" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      <!-- Responsive Products Table -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-zinc-200/80 dark:divide-zinc-800 text-left text-xs">
          <thead class="bg-zinc-50/70 dark:bg-zinc-900/70 text-zinc-500 uppercase tracking-wider font-medium text-[11px]">
            <tr>
              <th scope="col" class="py-2.5 px-4 sm:px-6 font-medium">Nama Produk</th>
              <th scope="col" class="py-2.5 px-4 sm:px-6 font-medium">Kategori</th>
              <th scope="col" class="py-2.5 px-4 sm:px-6 font-medium">Harga Satuan</th>
              <th scope="col" class="py-2.5 px-4 sm:px-6 font-medium">Stok Inventaris</th>
              <th v-if="isAdmin" scope="col" class="py-2.5 px-4 sm:px-6 text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-200/60 dark:divide-zinc-800/80">
            <tr
              v-for="product in filteredProducts"
              :key="product.id"
              class="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
            >
              <td class="py-3 px-4 sm:px-6 font-medium text-zinc-900 dark:text-zinc-100">
                {{ product.name }}
              </td>
              <td class="py-3 px-4 sm:px-6">
                <span class="inline-block text-[11px] px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 font-medium">
                  {{ product.category }}
                </span>
              </td>
              <td class="py-3 px-4 sm:px-6 font-medium text-zinc-900 dark:text-zinc-100 tabular-nums">
                {{ formatCurrency(product.price) }}
              </td>
              <td class="py-3 px-4 sm:px-6">
                <span
                  v-if="product.stock < 5"
                  class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span class="tabular-nums font-mono font-medium">{{ product.stock }}</span> unit (Menipis)
                </span>
                <span v-else class="text-zinc-700 dark:text-zinc-300 tabular-nums font-medium">
                  {{ product.stock }} unit
                </span>
              </td>
              <!-- Action Buttons (ADMIN Only) -->
              <td v-if="isAdmin" class="py-3 px-4 sm:px-6 text-right whitespace-nowrap">
                <div class="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    class="p-1.5 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    aria-label="Edit Produk"
                    @click="openEditModal(product)"
                  >
                    <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    class="p-1.5 rounded text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    aria-label="Hapus Produk"
                    @click="openDeleteModal(product)"
                  >
                    <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create / Edit Product Modal (ADMIN Only) -->
    <UModal v-model="isFormModalOpen" :prevent-close="isSubmitting">
      <div class="bg-white dark:bg-zinc-900 rounded-lg overflow-hidden border border-zinc-200/80 dark:border-zinc-800 shadow-lg">
        <div class="px-5 py-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {{ editingProductId ? 'Perbarui Produk' : 'Tambah Produk Baru' }}
            </h3>
            <p class="text-[11px] text-zinc-400 mt-0.5">
              {{ editingProductId ? 'Ubah informasi detail produk di katalog' : 'Masukkan informasi produk baru ke dalam katalog' }}
            </p>
          </div>
          <button
            type="button"
            class="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            :disabled="isSubmitting"
            @click="isFormModalOpen = false"
          >
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="submitProductForm" class="p-5 space-y-4">
          <div>
            <label class="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Nama Produk <span class="text-rose-500">*</span>
            </label>
            <UInput
              v-model="formData.name"
              placeholder="Contoh: Natur Hair Tonic Ginseng 90ml"
              :disabled="isSubmitting"
              size="sm"
            />
            <p v-if="formErrors.name" class="text-[11px] text-rose-500 mt-1">{{ formErrors.name }}</p>
          </div>

          <div>
            <label class="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Kategori <span class="text-rose-500">*</span>
            </label>
            <UInput
              v-model="formData.category"
              placeholder="Contoh: Haircare / Skincare / Bodycare"
              :disabled="isSubmitting"
              size="sm"
            />
            <p v-if="formErrors.category" class="text-[11px] text-rose-500 mt-1">{{ formErrors.category }}</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Harga Satuan (IDR) <span class="text-rose-500">*</span>
              </label>
              <UInput
                v-model="formData.price"
                type="number"
                min="1"
                step="1"
                placeholder="Contoh: 45000"
                :disabled="isSubmitting"
                size="sm"
              />
              <p v-if="formErrors.price" class="text-[11px] text-rose-500 mt-1">{{ formErrors.price }}</p>
            </div>

            <div>
              <label class="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Stok Inventaris <span class="text-rose-500">*</span>
              </label>
              <UInput
                v-model="formData.stock"
                type="number"
                min="0"
                step="1"
                placeholder="Contoh: 25"
                :disabled="isSubmitting"
                size="sm"
              />
              <p v-if="formErrors.stock" class="text-[11px] text-rose-500 mt-1">{{ formErrors.stock }}</p>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200/80 dark:border-zinc-800">
            <UButton
              color="gray"
              variant="ghost"
              size="xs"
              :disabled="isSubmitting"
              @click="isFormModalOpen = false"
            >
              Batal
            </UButton>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <UIcon v-if="isSubmitting" name="i-heroicons-arrow-path" class="w-3.5 h-3.5 animate-spin" />
              <span>{{ editingProductId ? 'Simpan Perubahan' : 'Tambah Produk' }}</span>
            </button>
          </div>
        </form>
      </div>
    </UModal>

    <!-- Delete Confirmation Modal (ADMIN Only) -->
    <UModal v-model="isDeleteModalOpen" :prevent-close="isDeleting">
      <div class="bg-white dark:bg-zinc-900 rounded-lg overflow-hidden border border-zinc-200/80 dark:border-zinc-800 shadow-lg">
        <div class="p-5 border-b border-zinc-200/80 dark:border-zinc-800">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Konfirmasi Hapus Produk
              </h3>
              <p class="text-xs text-zinc-400">Tindakan ini akan menghapus produk dari katalog master</p>
            </div>
          </div>
        </div>

        <div class="p-5 space-y-3">
          <p class="text-xs text-zinc-600 dark:text-zinc-300">
            Apakah Anda yakin ingin menghapus produk <strong>"{{ productToDelete?.name }}"</strong>?
          </p>

          <div class="p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 rounded-md text-[11px] text-zinc-600 dark:text-zinc-300 space-y-0.5">
            <p class="font-medium flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100">
              <UIcon name="i-heroicons-shield-check" class="w-3.5 h-3.5 text-emerald-600" />
              Keamanan Histori Pesanan Terjamin
            </p>
            <p class="text-zinc-500 dark:text-zinc-400">
              Semua transaksi pesanan lama yang memuat produk ini tetap tersimpan utuh berkat sistem snapshot data mandiri.
            </p>
          </div>
        </div>

        <div class="px-5 py-3.5 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-200/80 dark:border-zinc-800 flex justify-end gap-2">
          <UButton
            color="gray"
            variant="ghost"
            size="xs"
            :disabled="isDeleting"
            @click="isDeleteModalOpen = false"
          >
            Batal
          </UButton>
          <button
            type="button"
            :disabled="isDeleting"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 transition-colors disabled:opacity-50 cursor-pointer"
            @click="confirmDeleteProduct"
          >
            <UIcon v-if="isDeleting" name="i-heroicons-arrow-path" class="w-3.5 h-3.5 animate-spin" />
            <UIcon v-else name="i-heroicons-trash" class="w-3.5 h-3.5" />
            <span>Hapus Produk</span>
          </button>
        </div>
      </div>
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
        color: 'gray'
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
        color: 'gray'
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
      color: 'gray'
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
