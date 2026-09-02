-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "StatusLaporan" AS ENUM ('MENUNGGU', 'DIPROSES', 'SELESAI');

-- CreateEnum
CREATE TYPE "StatusKirim" AS ENUM ('MENUNGGU', 'DIKIRIM', 'DITERIMA');

-- CreateEnum
CREATE TYPE "StatusKiriman" AS ENUM ('MENUNGGU_KONFIRMASI', 'DISETUJUI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "StatusTransaksi" AS ENUM ('DIPESAN', 'DIKIRIM', 'SELESAI', 'DIBATALKAN');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "noHp" TEXT NOT NULL,
    "alamat" TEXT,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "koin" INTEGER NOT NULL DEFAULT 0,
    "fotoProfile" TEXT,
    "wilayahId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wilayah" (
    "id" TEXT NOT NULL,
    "namaWilayah" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wilayah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jenis_sampah" (
    "id" TEXT NOT NULL,
    "namaJenis" TEXT NOT NULL,
    "gambarUrl" TEXT,
    "beratPerUnit" DOUBLE PRECISION,
    "poinPerUnit" INTEGER NOT NULL DEFAULT 0,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jenis_sampah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "laporan_sampah" (
    "id" TEXT NOT NULL,
    "berat" DOUBLE PRECISION NOT NULL,
    "tanggalLapor" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "jenisSampahId" TEXT NOT NULL,
    "wilayahId" TEXT NOT NULL,
    "koinDiberikan" INTEGER NOT NULL DEFAULT 0,
    "kuantitas" INTEGER NOT NULL DEFAULT 1,
    "status" "StatusLaporan" NOT NULL DEFAULT 'MENUNGGU',

    CONSTRAINT "laporan_sampah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foto_sampah" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "laporanId" TEXT NOT NULL,

    CONSTRAINT "foto_sampah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resep_daur_ulang" (
    "id" TEXT NOT NULL,
    "namaBarang" TEXT NOT NULL,
    "deskripsi" TEXT,
    "gambarBarang" TEXT,
    "hargaKoin" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resep_daur_ulang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bahan_baku_resep" (
    "id" TEXT NOT NULL,
    "resepId" TEXT NOT NULL,
    "jenisSampahId" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,

    CONSTRAINT "bahan_baku_resep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barang_daur_ulang" (
    "id" TEXT NOT NULL,
    "resepId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "wilayahId" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL DEFAULT 1,
    "tanggalProduksi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusKirim" "StatusKirim" NOT NULL DEFAULT 'MENUNGGU',

    CONSTRAINT "barang_daur_ulang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kiriman_admin" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "wilayahId" TEXT NOT NULL,
    "tanggalKirim" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggalKonfirmasi" TIMESTAMP(3),
    "status" "StatusKiriman" NOT NULL DEFAULT 'MENUNGGU_KONFIRMASI',
    "catatan" TEXT,
    "catatanSuper" TEXT,

    CONSTRAINT "kiriman_admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barang_kiriman" (
    "id" TEXT NOT NULL,
    "kirimanId" TEXT NOT NULL,
    "barangDaurUlangId" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,

    CONSTRAINT "barang_kiriman_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stok_barang" (
    "id" TEXT NOT NULL,
    "resepId" TEXT NOT NULL,
    "jumlahStok" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stok_barang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaksi_pembelian" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resepId" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "totalKoin" INTEGER NOT NULL,
    "status" "StatusTransaksi" NOT NULL DEFAULT 'DIPESAN',
    "tanggalBeli" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggalUpdate" TIMESTAMP(3) NOT NULL,
    "alamatKirim" TEXT,
    "noHpPenerima" TEXT,
    "namaPenerima" TEXT,

    CONSTRAINT "transaksi_pembelian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "riwayat_koin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "keterangan" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "riwayat_koin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_noHp_key" ON "users"("noHp");

-- CreateIndex
CREATE UNIQUE INDEX "wilayah_namaWilayah_key" ON "wilayah"("namaWilayah");

-- CreateIndex
CREATE UNIQUE INDEX "jenis_sampah_namaJenis_key" ON "jenis_sampah"("namaJenis");

-- CreateIndex
CREATE UNIQUE INDEX "foto_sampah_laporanId_key" ON "foto_sampah"("laporanId");

-- CreateIndex
CREATE UNIQUE INDEX "bahan_baku_resep_resepId_jenisSampahId_key" ON "bahan_baku_resep"("resepId", "jenisSampahId");

-- CreateIndex
CREATE UNIQUE INDEX "stok_barang_resepId_key" ON "stok_barang"("resepId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_wilayahId_fkey" FOREIGN KEY ("wilayahId") REFERENCES "wilayah"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laporan_sampah" ADD CONSTRAINT "laporan_sampah_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laporan_sampah" ADD CONSTRAINT "laporan_sampah_jenisSampahId_fkey" FOREIGN KEY ("jenisSampahId") REFERENCES "jenis_sampah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laporan_sampah" ADD CONSTRAINT "laporan_sampah_wilayahId_fkey" FOREIGN KEY ("wilayahId") REFERENCES "wilayah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foto_sampah" ADD CONSTRAINT "foto_sampah_laporanId_fkey" FOREIGN KEY ("laporanId") REFERENCES "laporan_sampah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bahan_baku_resep" ADD CONSTRAINT "bahan_baku_resep_resepId_fkey" FOREIGN KEY ("resepId") REFERENCES "resep_daur_ulang"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bahan_baku_resep" ADD CONSTRAINT "bahan_baku_resep_jenisSampahId_fkey" FOREIGN KEY ("jenisSampahId") REFERENCES "jenis_sampah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barang_daur_ulang" ADD CONSTRAINT "barang_daur_ulang_resepId_fkey" FOREIGN KEY ("resepId") REFERENCES "resep_daur_ulang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barang_daur_ulang" ADD CONSTRAINT "barang_daur_ulang_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barang_daur_ulang" ADD CONSTRAINT "barang_daur_ulang_wilayahId_fkey" FOREIGN KEY ("wilayahId") REFERENCES "wilayah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kiriman_admin" ADD CONSTRAINT "kiriman_admin_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kiriman_admin" ADD CONSTRAINT "kiriman_admin_wilayahId_fkey" FOREIGN KEY ("wilayahId") REFERENCES "wilayah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barang_kiriman" ADD CONSTRAINT "barang_kiriman_kirimanId_fkey" FOREIGN KEY ("kirimanId") REFERENCES "kiriman_admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barang_kiriman" ADD CONSTRAINT "barang_kiriman_barangDaurUlangId_fkey" FOREIGN KEY ("barangDaurUlangId") REFERENCES "barang_daur_ulang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stok_barang" ADD CONSTRAINT "stok_barang_resepId_fkey" FOREIGN KEY ("resepId") REFERENCES "resep_daur_ulang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_pembelian" ADD CONSTRAINT "transaksi_pembelian_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_pembelian" ADD CONSTRAINT "transaksi_pembelian_resepId_fkey" FOREIGN KEY ("resepId") REFERENCES "resep_daur_ulang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riwayat_koin" ADD CONSTRAINT "riwayat_koin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

