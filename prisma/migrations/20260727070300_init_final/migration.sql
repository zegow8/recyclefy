/*
  Warnings:

  - You are about to drop the column `kirimanAdminId` on the `barang_daur_ulang` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "barang_daur_ulang" DROP CONSTRAINT "barang_daur_ulang_kirimanAdminId_fkey";

-- AlterTable
ALTER TABLE "barang_daur_ulang" DROP COLUMN "kirimanAdminId";

-- CreateTable
CREATE TABLE "barang_kiriman" (
    "id" TEXT NOT NULL,
    "kirimanId" TEXT NOT NULL,
    "barangDaurUlangId" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,

    CONSTRAINT "barang_kiriman_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "barang_kiriman" ADD CONSTRAINT "barang_kiriman_kirimanId_fkey" FOREIGN KEY ("kirimanId") REFERENCES "kiriman_admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barang_kiriman" ADD CONSTRAINT "barang_kiriman_barangDaurUlangId_fkey" FOREIGN KEY ("barangDaurUlangId") REFERENCES "barang_daur_ulang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
