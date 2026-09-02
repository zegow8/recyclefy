const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding stok barang...');

  const resep = await prisma.resepDaurUlang.findMany();

  for (const r of resep) {
    const existing = await prisma.stokBarang.findUnique({
      where: { resepId: r.id }
    });

    if (!existing) {
      await prisma.stokBarang.create({
        data: {
          resepId: r.id,
          jumlahStok: 0
        }
      });
      console.log(`✅ Stok dibuat untuk ${r.namaBarang}`);
    } else {
      console.log(`⏩ Stok sudah ada untuk ${r.namaBarang}`);
    }
  }

  console.log('✅ Seeding stok selesai!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());