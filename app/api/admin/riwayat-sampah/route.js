import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { wilayah: true }
    });

    if (!admin || !admin.wilayahId) {
      return NextResponse.json(
        { message: 'Admin tidak memiliki wilayah' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const whereClause = {
      wilayahId: admin.wilayahId,
      OR: [
        { user: { nama: { contains: search, mode: 'insensitive' } } },
        { jenisSampah: { namaJenis: { contains: search, mode: 'insensitive' } } }
      ]
    };

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      whereClause.tanggalLapor = { gte: start };
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereClause.tanggalLapor = { ...whereClause.tanggalLapor, lte: end };
    }

    const laporan = await prisma.laporanSampah.findMany({
      where: whereClause,
      include: {
        user: true,
        jenisSampah: true,
        fotoSampah: true
      },
      orderBy: { tanggalLapor: 'desc' }
    });

    // Group by tanggal untuk menampilkan multiple jenis per setor
    const groupedByTanggal = {};
    laporan.forEach(item => {
      const key = item.tanggalLapor.toISOString().split('T')[0];
      if (!groupedByTanggal[key]) {
        groupedByTanggal[key] = {
          tanggal: item.tanggalLapor,
          user: item.user.nama,
          items: [],
          totalBerat: 0,
          totalPoin: 0
        };
      }
      groupedByTanggal[key].items.push({
        jenis: item.jenisSampah.namaJenis,
        berat: item.berat,
        kuantitas: item.kuantitas,
        poin: item.koinDiberikan,
        foto: item.fotoSampah?.imageUrl || null
      });
      groupedByTanggal[key].totalBerat += item.berat;
      groupedByTanggal[key].totalPoin += item.koinDiberikan;
    });

    const formattedData = Object.values(groupedByTanggal).map(group => ({
      tanggal: group.tanggal,
      user: group.user,
      jenisList: group.items.map(i => i.jenis).join(', '),
      totalBerat: group.totalBerat,
      totalPoin: group.totalPoin,
      items: group.items
    }));

    return NextResponse.json(formattedData, { status: 200 });

  } catch (error) {
    console.error('Error get riwayat sampah:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}