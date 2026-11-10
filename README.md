# Gondowangi E-Commerce Administration Dashboard

[![Nuxt 3](https://img.shields.io/badge/Nuxt-3.15-00DC82?style=for-the-badge&logo=nuxt.js&logoColor=white)](https://nuxt.com)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Cloud-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

A responsive, enterprise-grade full-stack administration dashboard built with **Nuxt 3**, **@nuxt/ui**, **Prisma ORM**, and **Cloud PostgreSQL (Neon / Supabase)** for managing Gondowangi e-commerce products, sales metrics, and customer order fulfillment.

---

## 📌 Demo Credentials

The database seeder pre-configures two evaluation accounts with distinct Role-Based Access Control (RBAC) privileges:

| Peran (Role) | Email | Password | Hak Akses Utama |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@example.com` | `AdminDemo123!` | Akses Penuh: Dashboard, Kelola Produk (Tambah, Edit, Hapus), Ubah Status Pesanan |
| **STAFF** | `staff@example.com` | `StaffDemo123!` | Hanya Lihat: Dashboard, Katalog Produk, dan Rincian Pesanan (Aksi mutasi disembunyikan & diblokir HTTP 403) |

> 💡 **Quick Login:** Halaman login menyediakan tombol **"Demo Admin"** dan **"Demo Staff"** untuk mengisi kredensial pengujian secara otomatis hanya dengan satu klik.

---

## 🚀 Fitur Utama & Arsitektur Sistem

### 1. Autentikasi & Dual-Layer Role-Based Access Control (RBAC)
- **Session Manajemen:** Menggunakan `nuxt-auth-utils` dengan *encrypted HTTP-only session cookie* yang aman dan otomatis bertahan (*persistent*) saat halaman di-*refresh*.
- **Client-Side Guarding:** 
  - `middleware/auth.global.ts` memastikan rute terlindungi dari akses tanpa login dan mengarahkan pengguna login langsung ke dashboard.
  - UI secara kondisional menyembunyikan tombol *Tambah Produk*, tombol *Edit*, tombol *Hapus*, dan kontrol *Ubah Status Pesanan* untuk role `STAFF`.
- **Server-Side Enforcement (Nitro Routes):**
  - `requireAuth(event)` melempar `HTTP 401 Unauthorized` jika unauthenticated.
  - `requireAdmin(event)` melempar `HTTP 403 Forbidden` jika pengguna dengan role `STAFF` mencoba memanggil API mutasi (`POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`, `PATCH /api/orders/:id/status`).

### 2. Preservasi Riwayat Pesanan saat Produk Dihapus (Data Integrity)
- **Aturan Bisnis Kritis:** Menghapus produk dari katalog inventaris **tidak boleh merusak riwayat transaksi** pelanggan yang telah terjadi.
- **Implementasi Database:**
  - Relasi `OrderItem.productId` menggunakan `onDelete: SetNull`.
  - Tabel `OrderItem` menyimpan kolom *snapshot* mandiri: `productName` dan `unitPrice` saat order dibuat.
  - Saat Admin menghapus produk master, riwayat pesanan, rincian produk, harga beli, subtotal, dan grand total pesanan tetap 100% utuh tanpa kesalahan *foreign key* atau missing record.

### 3. Ringkasan Dashboard Real-Time (`/`)
- 4 Kartu Metrik Utama:
  - **Total Produk:** Jumlah keseluruhan produk aktif dalam database.
  - **Total Pesanan:** Total kuantitas transaksi order yang tercatat.
  - **Pendapatan Selesai:** Agregasi nilai transaksi berstatus `completed` diformat dalam Rupiah (`IDR`).
  - **Stok Menipis (`< 5`):** Jumlah produk yang membutuhkan *restock* segera dengan indikator peringatan visual.
- Tabel 5 transaksi pesanan terbaru dengan badge status berwarna kontras tinggi.

### 4. Manajemen Produk (`/products`)
- Pencarian *live* berdasarkan nama produk dan filter kategori dinamis (`Haircare`, `Skincare`, `Bodycare`).
- Modal Tambah & Edit Produk dengan validasi *schema* Zod di sisi klien dan server:
  - Nama & Kategori wajib diisi.
  - Harga wajib bilangan bulat positif (`> 0`).
  - Stok wajib bilangan bulat non-negatif (`>= 0`).
- Modal Konfirmasi Hapus Produk yang transparan menginformasikan keamanan riwayat pesanan.

### 5. Manajemen Pesanan (`/orders`)
- Filter pesanan berdasarkan status: `Semua`, `Menunggu` (pending), `Diproses` (processing), `Selesai` (completed), dan `Dibatalkan` (cancelled).
- Pengubahan status pesanan secara instan (khusus `ADMIN`).
- Modal Rincian Pesanan (Order Details) yang menampilkan data pembeli, waktu pemesanan, dan tabel *line items* terperinci (Nama Produk, Qty, Harga Satuan, Subtotal, dan Grand Total IDR).

### 6. Desain Responsif & Modern UI/UX
- Dibangun dengan `@nuxt/ui` dan Tailwind CSS.
- Navigasi *sidebar* permanen pada layar desktop dan *drawer slideover* halus pada layar *mobile/smartphone*.
- Dilengkapi dengan *loading skeleton/spinner*, *empty state*, pesan validasi form, dan *toast notifications* (`useToast`).

---

## 🛠️ Tech Stack

- **Framework:** Nuxt 3 (v3.15+, Vue 3 Composition API, `<script setup lang="ts">`, Nitro Server Engine)
- **UI & Styling:** `@nuxt/ui` (Tailwind CSS, Headless UI, Heroicons)
- **Database:** Cloud PostgreSQL (Neon.tech / Supabase)
- **ORM:** Prisma ORM (`prisma`, `@prisma/client`)
- **Authentication:** `nuxt-auth-utils` + `bcryptjs`
- **Validation:** `zod` (Form & API payload validation)
- **Deployment Platform:** Vercel (Serverless Edge)

---

## 📋 Struktur Direktori Proyek

```text
├── layouts/
│   └── default.vue              # Responsive desktop sidebar & mobile slideover drawer
├── middleware/
│   └── auth.global.ts           # Route guard global untuk proteksi halaman
├── pages/
│   ├── index.vue                # Halaman Dashboard & 4 metrik agregasi
│   ├── login.vue                # Halaman Login dengan tombol Demo Credentials
│   ├── products.vue             # Manajemen Produk (CRUD, filter, modal)
│   └── orders.vue               # Manajemen Pesanan (Filter status, detail modal)
├── prisma/
│   ├── schema.prisma            # Skema database PostgreSQL (User, Product, Order, OrderItem)
│   └── seed.ts                  # Idempotent seeder (2 akun, 11 produk, 8 pesanan)
├── server/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login.post.ts    # Otentikasi login & inisialisasi session
│   │   │   └── logout.post.ts   # Pembersihan session pengguna
│   │   ├── dashboard.get.ts     # Agregasi metrik & 5 pesanan terbaru
│   │   ├── orders/
│   │   │   ├── index.get.ts     # Daftar pesanan dengan filter status
│   │   │   └── [id]/status.patch.ts # Ubah status pesanan (ADMIN only)
│   │   └── products/
│   │       ├── index.get.ts     # Daftar produk (search & kategori)
│   │       ├── index.post.ts    # Tambah produk (ADMIN only)
│   │       ├── [id].put.ts      # Edit produk (ADMIN only)
│   │       └── [id].delete.ts   # Hapus produk (ADMIN only)
│   └── utils/
│       ├── auth.ts              # RBAC helpers: requireAuth & requireAdmin
│       └── prisma.ts            # Singleton PrismaClient untuk serverless
├── utils/
│   └── format.ts                # Format mata uang Rupiah & tanggal Indonesia
├── nuxt.config.ts               # Konfigurasi module Nuxt (@nuxt/ui, nuxt-auth-utils)
├── package.json                 # Skrip build, postinstall, dependencies
└── README.md                    # Dokumentasi lengkap proyek
```

---

## ⚙️ Panduan Menjalankan Proyek Secara Lokal

### 1. Prasyarat
- Node.js versi `>= 20.x`
- npm versi `>= 10.x`
- Akun Cloud PostgreSQL (dapat dibuat gratis di [Neon.tech](https://neon.tech) atau [Supabase](https://supabase.com))

### 2. Kloning & Instalasi Dependensi
```bash
# Clone repository
git clone <URL_REPOSITORY_ANDA>
cd <NAMA_DIREKTORI>

# Install semua dependensi
npm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi variabel lingkungan di `.env` dengan kredensial database PostgreSQL Anda:
```ini
# PostgreSQL connection string dengan connection pooling (Port 6543 / 5432)
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Direct connection string untuk migrasi Prisma
DIRECT_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Kunci enkripsi session (minimal 32 karakter acak)
NUXT_SESSION_PASSWORD="gondowangi_super_secret_session_key_2026_production_32chars!"
```

### 4. Sinkronisasi Database & Seeding Data
Jalankan skrip berikut untuk membuat tabel di cloud database dan mengisi data awal:
```bash
# Push skema Prisma ke cloud database
npx prisma db push

# Jalankan idempotent seeder
npm run seed
```

### 5. Jalankan Development Server
```bash
npm run dev
```
Buka browser pada alamat `http://localhost:3000`.

---

## 🌐 Panduan Deployment ke Vercel

1. **Push ke GitHub:** Pastikan repository diatur ke status **Public**.
2. **Import ke Vercel:** Hubungkan akun GitHub dan pilih repository proyek ini.
3. **Environment Variables di Vercel:** Masukkan 3 variabel wajib di menu *Settings > Environment Variables*:
   - `DATABASE_URL`: Connection string Cloud PostgreSQL Anda.
   - `DIRECT_URL`: Direct connection string Cloud PostgreSQL Anda.
   - `NUXT_SESSION_PASSWORD`: Kunci enkripsi minimal 32 karakter acak.
4. **Build & Output Settings:** Vercel secara otomatis mendeteksi preset Nuxt.
5. **Deploy:** Klik tombol **Deploy**. Proyek akan ter-compile dan aktif dalam beberapa detik.

---

## 🛡️ Daftar Endpoint API & Matriks Keamanan

| Endpoint | Method | Proteksi RBAC | Deskripsi |
| :--- | :---: | :---: | :--- |
| `/api/auth/login` | `POST` | Publik | Otentikasi email & password |
| `/api/auth/logout` | `POST` | Authenticated | Menghapus cookie session pengguna |
| `/api/dashboard` | `GET` | Authenticated (`ADMIN`, `STAFF`) | Mengambil 4 metrik ringkasan & 5 order terbaru |
| `/api/products` | `GET` | Authenticated (`ADMIN`, `STAFF`) | Mengambil katalog produk dengan search & kategori |
| `/api/products` | `POST` | **Wajib `ADMIN` (`403` jika STAFF)** | Menambah produk baru ke database |
| `/api/products/:id` | `PUT` | **Wajib `ADMIN` (`403` jika STAFF)** | Memperbarui data produk |
| `/api/products/:id` | `DELETE` | **Wajib `ADMIN` (`403` jika STAFF)** | Menghapus produk (riwayat order aman) |
| `/api/orders` | `GET` | Authenticated (`ADMIN`, `STAFF`) | Mengambil daftar pesanan beserta line items |
| `/api/orders/:id/status` | `PATCH` | **Wajib `ADMIN` (`403` jika STAFF)** | Memperbarui status pesanan |

---

## ❓ Known Issues & Incomplete Features

- **Known Issues:** Tidak ada bug yang diketahui. Seluruh fungsionalitas, RBAC, dan skema relasi telah diaudit dan terverifikasi berjalan lancar.
- **Incomplete Features:** Tidak ada. Seluruh kriteria dalam PRD telah diimplementasikan 100% tuntas.

---

## 🤖 AI Tools Used

Proyek ini dikembangkan dengan bantuan **Google Antigravity IDE** dan **Gemini**, yang digunakan untuk mempercepat *boilerplate scaffolding*, optimasi *responsive layouts*, dan audit kepatuhan keamanan *Role-Based Access Control* (RBAC). Seluruh arsitektur skema Prisma, validasi Zod, dan integrasi serverless diverifikasi secara sistematis.
