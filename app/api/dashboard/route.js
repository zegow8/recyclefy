import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    let data = {};

    if (session.user.role === 'USER') {
      // Data untuk user
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          laporanSampah: true,
          transaksiBeli: true
        }
      });

      const totalSetor = user.laporanSampah.length;
      const totalBerat = user.laporanSampah.reduce((sum, item) => sum + item.berat, 0);
      const totalTransaksi = user.transaksiBeli.length;
      const poinTerpakai = user.transaksiBeli.reduce((sum, item) => sum + item.totalKoin, 0);

      const statusCount = {
        DIPESAN: user.transaksiBeli.filter(t => t.status === 'DIPESAN').length,
        DIKIRIM: user.transaksiBeli.filter(t => t.status === 'DIKIRIM').length,
        SELESAI: user.transaksiBeli.filter(t => t.status === 'SELESAI').length,
      };

      data = {
        koin: user.koin,
        totalSetor,
        totalBerat: totalBerat.toFixed(1),
        totalTransaksi,
        poinTerpakai,
        statusCount
      };
    }

    if (session.user.role === 'ADMIN') {
      // Data untuk admin wilayah
      const admin = await prisma.user.findUnique({
        where: { id: session.user.id }
      });

      const wilayahId = admin.wilayahId;

      const sampahHariIni = await prisma.laporanSampah.aggregate({
        where: {
          wilayahId,
          tanggalLapor: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        },
        _sum: { berat: true }
      });

      const totalSampah = await prisma.laporanSampah.aggregate({
        where: { wilayahId },
        _sum: { berat: true }
      });

      const barangProduksi = await prisma.barangDaurUlang.count({
        where: { wilayahId, statusKirim: 'MENUNGGU' }
      });

      const menungguAcc = await prisma.kirimanAdmin.count({
        where: { wilayahId, status: 'MENUNGGU_KONFIRMASI' }
      });

      const sudahDiAcc = await prisma.kirimanAdmin.count({
        where: { wilayahId, status: 'DISETUJUI' }
      });

      data = {
        sampahHariIni: (sampahHariIni._sum.berat || 0).toFixed(1),
        totalSampah: (totalSampah._sum.berat || 0).toFixed(1),
        barangProduksi,
        menungguAcc,
        sudahDiAcc
      };
    }

    if (session.user.role === 'SUPER_ADMIN') {
      // Data untuk superadmin
      const totalUser = await prisma.user.count({
        where: { role: 'USER' }
      });

      const totalAdmin = await prisma.user.count({
        where: { role: 'ADMIN' }
      });

      const menungguAcc = await prisma.kirimanAdmin.count({
        where: { status: 'MENUNGGU_KONFIRMASI' }
      });

      const totalStok = await prisma.stokBarang.aggregate({
        _sum: { jumlahStok: true }
      });

      const totalTransaksi = await prisma.transaksiPembelian.count();

      const totalKoin = await prisma.user.aggregate({
        _sum: { koin: true }
      });

      const statusCount = {
        DIPESAN: await prisma.transaksiPembelian.count({ where: { status: 'DIPESAN' } }),
        DIKIRIM: await prisma.transaksiPembelian.count({ where: { status: 'DIKIRIM' } }),
        SELESAI: await prisma.transaksiPembelian.count({ where: { status: 'SELESAI' } }),
      };

      data = {
        totalUser,
        totalAdmin,
        menungguAcc,
        totalStok: totalStok._sum.jumlahStok || 0,
        totalTransaksi,
        totalKoin: totalKoin._sum.koin || 0,
        statusCount
      };
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Error get dashboard:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}