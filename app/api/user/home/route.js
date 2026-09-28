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

    // Statistik global
    const totalUser = await prisma.user.count({ where: { role: 'USER' } });
    const totalSampah = await prisma.laporanSampah.aggregate({
      _sum: { berat: true }
    });
    const totalBarang = await prisma.stokBarang.aggregate({
      _sum: { jumlahStok: true }
    });
    const totalWilayah = await prisma.wilayah.count();

    // Top 3 Jenis Sampah (paling banyak disetor)
    const topJenisRaw = await prisma.laporanSampah.groupBy({
      by: ['jenisSampahId'],
      _sum: { kuantitas: true },
      orderBy: { _sum: { kuantitas: 'desc' } },
      take: 3
    });

    const topJenis = await Promise.all(topJenisRaw.map(async (item) => {
      const jenis = await prisma.jenisSampah.findUnique({
        where: { id: item.jenisSampahId }
      });
      return jenis;
    }));

    // Top 3 Produk (paling banyak stoknya)
    const topProdukRaw = await prisma.stokBarang.findMany({
      where: { jumlahStok: { gt: 0 } },
      orderBy: { jumlahStok: 'desc' },
      take: 3,
      include: { resep: true }
    });

    const topProduk = topProdukRaw.map(item => item.resep);

    // Leaderboard
    const leaderboard = await prisma.user.findMany({
      where: { role: 'USER' },
      orderBy: { koin: 'desc' },
      take: 5,
      select: {
        nama: true,
        koin: true
      }
    });

    return NextResponse.json({
      totalUser,
      totalSampah: totalSampah._sum.berat || 0,
      totalBarang: totalBarang._sum.jumlahStok || 0,
      totalWilayah,
      topJenis: topJenis.filter(Boolean),
      topProduk: topProduk.filter(Boolean),
      leaderboard
    }, { status: 200 });

  } catch (error) {
    console.error('Error get home data:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}