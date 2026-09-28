import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Total User
    const totalUser = await prisma.user.count({
      where: { role: 'USER' }
    });

    // Total Admin
    const totalAdmin = await prisma.user.count({
      where: { role: 'ADMIN' }
    });

    // Barang Nunggu ACC (dari KirimanAdmin)
    const menungguAcc = await prisma.kirimanAdmin.count({
      where: { status: 'MENUNGGU_KONFIRMASI' }
    });

    // Total Stok
    const totalStok = await prisma.stokBarang.aggregate({
      _sum: { jumlahStok: true }
    });

    // Total Transaksi
    const totalTransaksi = await prisma.transaksiPembelian.count();

    // Total Koin semua user
    const totalKoin = await prisma.user.aggregate({
      _sum: { koin: true }
    });

    // Total Jenis Sampah
    const totalJenisSampah = await prisma.jenisSampah.count();

    // Total Resep
    const totalResep = await prisma.resepDaurUlang.count();

    // Status Pesanan
    const statusCount = {
      DIPESAN: await prisma.transaksiPembelian.count({ where: { status: 'DIPESAN' } }),
      DIKIRIM: await prisma.transaksiPembelian.count({ where: { status: 'DIKIRIM' } }),
      SELESAI: await prisma.transaksiPembelian.count({ where: { status: 'SELESAI' } }),
    };

    // 🔥 Kiriman dari Admin Wilayah (menunggu ACC)
    const kirimanPerWilayah = await prisma.kirimanAdmin.findMany({
      where: { status: 'MENUNGGU_KONFIRMASI' },
      include: {
        wilayah: true,
        admin: true,
        barangKiriman: {
          include: {
            barangDaurUlang: {
              include: {
                resep: true
              }
            }
          }
        }
      },
      orderBy: { tanggalKirim: 'asc' }
    });

    const formattedKiriman = kirimanPerWilayah.map(item => ({
      id: item.id,
      wilayah: item.wilayah?.namaWilayah || 'Unknown',
      admin: item.admin?.nama || 'Unknown',
      tanggalKirim: item.tanggalKirim,
      barang: item.barangKiriman.map(bk => ({
        nama: bk.barangDaurUlang?.resep?.namaBarang || 'Unknown',
        jumlah: bk.jumlah || 0
      }))
    }));

    return NextResponse.json({
      totalUser,
      totalAdmin,
      menungguAcc,
      totalStok: totalStok._sum.jumlahStok || 0,
      totalTransaksi,
      totalKoin: totalKoin._sum.koin || 0,
      totalJenisSampah,
      totalResep,
      statusCount,
      kirimanPerWilayah: formattedKiriman
    }, { status: 200 });

  } catch (error) {
    console.error('Error get superadmin dashboard:', error);
    return NextResponse.json({
      totalUser: 0,
      totalAdmin: 0,
      menungguAcc: 0,
      totalStok: 0,
      totalTransaksi: 0,
      totalKoin: 0,
      totalJenisSampah: 0,
      totalResep: 0,
      statusCount: { DIPESAN: 0, DIKIRIM: 0, SELESAI: 0 },
      kirimanPerWilayah: []
    }, { status: 200 });
  } finally {
    await prisma.$disconnect();
  }
}