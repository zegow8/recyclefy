const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Hash password
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const hashedUserPassword = await bcrypt.hash('rainrain', 10);

  // 2. Buat Wilayah
  const wilayahData = [
    { namaWilayah: 'Kemayoran' },
    { namaWilayah: 'Sumur Batu' },
    { namaWilayah: 'Cempaka Putih' },
  ];

  console.log('📌 Creating wilayah...');
  const wilayah = await Promise.all(
    wilayahData.map((w) =>
      prisma.wilayah.upsert({
        where: { namaWilayah: w.namaWilayah },
        update: {},
        create: w,
      })
    )
  );

  // 3. Buat Super Admin
  console.log('👑 Creating Super Admin...');
  await prisma.user.upsert({
    where: { email: 'superadmin@recyclefy.com' },
    update: {},
    create: {
      email: 'superadmin@recyclefy.com',
      password: hashedPassword,
      nama: 'Super Admin',
      noHp: '081234567890',
      alamat: 'Jakarta Pusat',
      role: 'SUPER_ADMIN',
      koin: 0,
    },
  });

  // 4. Buat Admin Wilayah
  console.log('🏢 Creating Admin Wilayah...');
  const adminData = [
    { email: 'kemayoran@recyclefy.com', nama: 'Admin Kemayoran', wilayah: 'Kemayoran' },
    { email: 'sumurbatu@recyclefy.com', nama: 'Admin Sumur Batu', wilayah: 'Sumur Batu' },
    { email: 'cempakaputih@recyclefy.com', nama: 'Admin Cempaka Putih', wilayah: 'Cempaka Putih' },
  ];

  for (const admin of adminData) {
    const wilayahObj = wilayah.find((w) => w.namaWilayah === admin.wilayah);
    await prisma.user.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        email: admin.email,
        password: hashedPassword,
        nama: admin.nama,
        noHp: `08123456789${adminData.indexOf(admin) + 1}`,
        alamat: `${admin.wilayah}, Jakarta Pusat`,
        role: 'ADMIN',
        wilayahId: wilayahObj.id,
        koin: 0,
      },
    });
  }

  // 5. Buat User Demo
  console.log('👤 Creating Demo User...');
  await prisma.user.upsert({
    where: { email: 'rainawr@gmail.com' },
    update: {},
    create: {
      email: 'rainawr@gmail.com',
      password: hashedUserPassword,
      nama: 'Rain AWR',
      noHp: '081234567899',
      alamat: 'Jl. Contoh No. 123, Jakarta Pusat',
      role: 'USER',
      koin: 100,
    },
  });

  console.log('✅ Seeding selesai!');
  console.log('📋 Akun Default:');
  console.log('  Super Admin: superadmin@recyclefy.com / admin123');
  console.log('  Admin Kemayoran: kemayoran@recyclefy.com / admin123');
  console.log('  Admin Sumur Batu: sumurbatu@recyclefy.com / admin123');
  console.log('  Admin Cempaka Putih: cempakaputih@recyclefy.com / admin123');
  console.log('  User Demo: rainawr@gmail.com / rainrain');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });