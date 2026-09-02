import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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

    const wilayah = await prisma.wilayah.findMany({
      include: {
        users: {
          where: { role: 'ADMIN' }
        },
        laporanSampah: true,
        barangDaurUlang: true,
        kirimanAdmin: {
          where: { status: 'MENUNGGU_KONFIRMASI' }
        }
      },
      orderBy: { namaWilayah: 'asc' }
    });

    const formattedData = wilayah.map(w => ({
      id: w.id,
      namaWilayah: w.namaWilayah,
      totalAdmin: w.users.length,
      totalSampah: w.laporanSampah.reduce((sum, item) => sum + item.berat, 0),
      totalProduksi: w.barangDaurUlang.length,
      totalKiriman: w.kirimanAdmin.length,
      totalPending: w.kirimanAdmin.length
    }));

    return NextResponse.json(formattedData, { status: 200 });

  } catch (error) {
    console.error('Error get wilayah:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}