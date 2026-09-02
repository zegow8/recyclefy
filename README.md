# ♻️ Recyclefy - Platform Pengelolaan Sampah

**Recyclefy** adalah aplikasi web berbasis komunitas untuk pengelolaan sampah di Jakarta Pusat. Aplikasi ini memungkinkan masyarakat untuk menyetorkan sampah, mendapatkan poin, dan menukarkannya dengan produk daur ulang berkualitas.

![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black?style=flat&logo=next.js)
![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2D3748?style=flat&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat&logo=postgresql)
![NextAuth](https://img.shields.io/badge/NextAuth.js-4.24.15-000000?style=flat&logo=next.js)

---

## 📋 Daftar Isi

- [Tentang Recyclefy](#-tentang-recyclefy)
- [Fitur Utama](#-fitur-utama)
- [Struktur Database](#-struktur-database)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Instalasi](#-instalasi)
- [Cara Menjalankan](#-cara-menjalankan)
- [Akun Demo](#-akun-demo)
- [Screenshot](#-screenshot)
- [Kontributor](#-kontributor)

---

## 🌱 Tentang Recyclefy

Recyclefy lahir dari keprihatinan terhadap masalah sampah di Jakarta Pusat, khususnya di wilayah **Sumur Batu**, **Kemayoran**, dan **Cempaka Putih**. Aplikasi ini bertujuan untuk mengubah kebiasaan masyarakat dalam mengelola sampah dengan pendekatan **ekonomi sirkular**.

Dengan sistem **tukar sampah jadi poin**, masyarakat didorong untuk memilah dan menyetorkan sampahnya ke admin wilayah. Sampah-sampah ini kemudian didaur ulang menjadi produk bernilai ekonomis yang bisa dibeli kembali oleh masyarakat.

---

## 🚀 Fitur Utama

### 👤 User (Masyarakat)
- 📝 Registrasi & Login
- 🗑️ Setor sampah ke wilayah tertentu
- 🪙 Dapatkan poin dari setiap setoran
- 🛍️ Tukar poin dengan produk daur ulang
- 📊 Pantau aktivitas & riwayat transaksi
- 👤 Kelola profile pribadi

### 🏢 Admin Wilayah
- 📥 Lihat sampah masuk dari user
- 📦 Kelola stok sampah
- 🔨 Produksi barang daur ulang
- 📤 Kirim barang ke Superadmin
- 📋 Pantau riwayat produksi

### 👑 Super Admin
- 👥 Kelola user & admin wilayah
- 🗑️ Kelola jenis sampah
- 📋 Kelola resep daur ulang
- 📦 Manajemen stok produk
- ✅ Konfirmasi kiriman admin
- 💰 Pantau transaksi & poin

---

## 🗃️ Struktur Database

### 13 Tabel dengan Relasi:

| No | Tabel | Fungsi |
|----|-------|--------|
| 1 | `User` | Data pengguna (USER/ADMIN/SUPER_ADMIN) |
| 2 | `Wilayah` | Data wilayah (Kemayoran, Sumur Batu, Cempaka Putih) |
| 3 | `JenisSampah` | Data kategori sampah |
| 4 | `LaporanSampah` | Data setoran sampah user |
| 5 | `FotoSampah` | Foto bukti laporan (One-to-One) |
| 6 | `ResepDaurUlang` | Resep produk daur ulang |
| 7 | `BahanBakuResep` | Tabel penghubung (Many-to-Many) |
| 8 | `BarangDaurUlang` | Hasil produksi admin |
| 9 | `KirimanAdmin` | Kiriman admin ke superadmin |
| 10 | `BarangKiriman` | Detail kiriman |
| 11 | `StokBarang` | Stok produk di toko |
| 12 | `TransaksiPembelian` | Riwayat pembelian user |
| 13 | `RiwayatKoin` | Audit trail perubahan poin |


---

## 🛠️ Teknologi yang Digunakan

| Teknologi | Keterangan |
|-----------|------------|
| **Next.js 14** | Framework React dengan App Router |
| **Prisma 5** | ORM untuk database |
| **PostgreSQL** | Database utama |
| **NextAuth.js** | Autentikasi (Login/Register) |
| **React Hook Form** | Validasi form |
| **React Hot Toast** | Notifikasi pop-up |

---

## 💻 Instalasi

### Persyaratan:
- Node.js (v18+)
- PostgreSQL (v15+)
- npm atau yarn

### Langkah Instalasi:

```bash
# 1. Clone repository
git clone https://github.com/zegow8/recyclefy.git
cd recyclefy

# 2. Install dependensi
npm install

# 3. Setup environment variables
cp .env.example .env

# 4. Edit .env dengan konfigurasi database:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/recyclefy"
# NEXTAUTH_SECRET="your-secret-key"
# NEXTAUTH_URL="http://localhost:3000"

# 5. Setup database
npx prisma migrate dev --name init
npx prisma generate

# 6. Seed database (akun default)
npx prisma db seed

# 7. Jalankan aplikasi
npm run dev

👤 Akun Demo
Role	Email	Password
👑 Super Admin	superadmin@recyclefy.com	admin123
🏢 Admin Kemayoran	kemayoran@recyclefy.com	admin123
🏢 Admin Sumur Batu	sumurbatu@recyclefy.com	admin123
🏢 Admin Cempaka Putih	cempakaputih@recyclefy.com	admin123
👤 User Demo	lytayay@gmail.com lytayay

👨‍💻 Kontributor
Nama	Peran
Earlyta Dwi Anggraeni	Full Stack Developer
