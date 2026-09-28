import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'USER') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tanggal = searchParams.get('tanggal');

    const whereClause = {
      userId: session.user.id
    };

    if (tanggal) {
      const date = new Date(tanggal);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      whereClause.tanggalLapor = {
        gte: date,
        lt: nextDay
      };
    }

    const laporan = await prisma.laporanSampah.findMany({
      where: whereClause,
      include: {
        jenisSampah: true,
        wilayah: true
      },
      orderBy: { tanggalLapor: 'desc' }
    });

    // 🔥 GROUP PER TANGGAL + WAKTU (1 submit = 1 ID)
    const grouped = {};
    laporan.forEach(item => {
      const key = item.tanggalLapor.toISOString();
      if (!grouped[key]) {
        grouped[key] = {
          id: laporan.indexOf(item) + 1, // ID setoran (urutan)
          tanggal: item.tanggalLapor,
          wilayah: item.wilayah.namaWilayah,
          items: []
        };
      }
      grouped[key].items.push({
        jenis: item.jenisSampah.namaJenis,
        gambar: item.jenisSampah.gambarUrl || null,
        kuantitas: item.kuantitas,
        berat: item.berat,
        poin: item.koinDiberikan
      });
    });

    // Flatten jadi per item (tapi ID tetep sama per group)
    const formattedData = [];
    Object.values(grouped).forEach(group => {
      group.items.forEach((item, index) => {
        formattedData.push({
          id: group.id, // ID setoran sama untuk semua item dalam 1 submit
          tanggal: group.tanggal,
          wilayah: group.wilayah,
          jenis: item.jenis,
          gambar: item.gambar,
          kuantitas: item.kuantitas,
          berat: item.berat,
          poin: item.poin,
          isFirst: index === 0 // buat nandain baris pertama di group
        });
      });
    });

    return NextResponse.json(formattedData, { status: 200 });

  } catch (error) {
    console.error('Error get riwayat setor:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  } finally {
    // disconnect removed
  }
}