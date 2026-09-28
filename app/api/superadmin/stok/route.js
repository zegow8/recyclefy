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

    // Ambil semua stok barang dengan relasi resep
    const stok = await prisma.stokBarang.findMany({
      include: {
        resep: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Hitung terjual dari transaksi (total yang sudah dibeli)
    const stokWithSales = await Promise.all(stok.map(async (item) => {
      const terjual = await prisma.transaksiPembelian.aggregate({
        where: { resepId: item.resepId },
        _sum: { jumlah: true }
      });

      return {
        id: item.id,
        resepId: item.resepId,
        jumlahStok: item.jumlahStok,
        updatedAt: item.updatedAt,
        resep: item.resep,
        terjual: terjual._sum.jumlah || 0
      };
    }));

    return NextResponse.json(stokWithSales, { status: 200 });

  } catch (error) {
    console.error('Error get stok:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}