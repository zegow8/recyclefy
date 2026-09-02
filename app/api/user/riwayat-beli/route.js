import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
      whereClause.tanggalBeli = {
        gte: date,
        lt: nextDay
      };
    }

    const transaksi = await prisma.transaksiPembelian.findMany({
      where: whereClause,
      include: {
        resep: true
      },
      orderBy: { tanggalBeli: 'desc' }
    });

    const formattedData = transaksi.map(item => ({
      id: item.id,
      tanggal: item.tanggalBeli,
      produk: item.resep.namaBarang,
      gambar: item.resep.gambarBarang || null,
      jumlah: item.jumlah,
      totalPoin: item.totalKoin,
      status: item.status
    }));

    return NextResponse.json(formattedData, { status: 200 });

  } catch (error) {
    console.error('Error get riwayat beli:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}