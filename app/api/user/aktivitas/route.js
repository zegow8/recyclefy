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
        { message: 'Unauthorized - Silakan login terlebih dahulu' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'USER') {
      return NextResponse.json(
        { message: 'Access denied - Hanya untuk user' },
        { status: 403 }
      );
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        laporanSampah: {
          include: {
            jenisSampah: true,
            wilayah: true,
          },
        },
        transaksiBeli: {
          include: {
            resep: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Hitung total poin
    const totalPoin = user.koin || 0;
    const poinTerpakai = user.transaksiBeli.reduce(
      (sum, t) => sum + t.totalKoin,
      0
    );

    // 🔥 HITUNG TOTAL SETORAN (ID) - Group by tanggal + waktu (per submit)
    const setoranMap = new Map();
    user.laporanSampah.forEach((item) => {
      const key = item.tanggalLapor.toISOString();
      if (!setoranMap.has(key)) {
        setoranMap.set(key, {
          tanggal: item.tanggalLapor,
          items: [],
        });
      }
      setoranMap.get(key).items.push(item);
    });

    const totalSetor = setoranMap.size; // jumlah ID setoran

    // 🔥 HITUNG TOTAL UNIT SAMPAH
    const totalUnitSampah = user.laporanSampah.reduce(
      (sum, item) => sum + item.kuantitas,
      0
    );

    const totalBerat = user.laporanSampah.reduce(
      (sum, item) => sum + item.berat,
      0
    );

    const statusCount = {
      DIPESAN: user.transaksiBeli.filter((t) => t.status === 'DIPESAN').length,
      DIKIRIM: user.transaksiBeli.filter((t) => t.status === 'DIKIRIM').length,
      SELESAI: user.transaksiBeli.filter((t) => t.status === 'SELESAI').length,
    };

    // Recent aktivitas (5 terakhir)
    const recentAktivitas = user.laporanSampah.slice(0, 5).map((item) => ({
      jenis: item.jenisSampah.namaJenis,
      berat: item.berat,
      kuantitas: item.kuantitas,
      poin: item.koinDiberikan,
      wilayah: item.wilayah.namaWilayah,
      tanggal: item.tanggalLapor,
    }));

    return NextResponse.json(
      {
        totalPoin,
        poinTerpakai,
        totalSetor, // 🔥 jumlah ID setoran
        totalUnitSampah, // 🔥 total unit sampah
        totalBerat: totalBerat.toFixed(1),
        statusCount,
        recentAktivitas,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error get aktivitas:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server', error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}