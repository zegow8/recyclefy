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
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const skip = (page - 1) * limit;

    // 🔥 Ambil stok yang > 0
    const whereClause = {
      jumlahStok: { gt: 0 },
      resep: {
        namaBarang: { contains: search, mode: 'insensitive' }
      }
    };

    let orderBy = { updatedAt: 'desc' };
    if (sort === 'termurah') {
      orderBy = { resep: { hargaKoin: 'asc' } };
    } else if (sort === 'termahal') {
      orderBy = { resep: { hargaKoin: 'desc' } };
    }

    const [stok, total] = await Promise.all([
      prisma.stokBarang.findMany({
        where: whereClause,
        include: {
          resep: true
        },
        skip,
        take: limit,
        orderBy
      }),
      prisma.stokBarang.count({ where: whereClause })
    ]);

    const formattedData = stok.map(item => ({
      id: item.id,
      resepId: item.resepId,
      nama: item.resep.namaBarang,
      gambar: item.resep.gambarBarang || null,
      deskripsi: item.resep.deskripsi || '',
      harga: item.resep.hargaKoin,
      stok: item.jumlahStok
    }));

    return NextResponse.json({
      data: formattedData,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }, { status: 200 });

  } catch (error) {
    console.error('Error get toko:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  } finally {
    // disconnect removed
  }
}