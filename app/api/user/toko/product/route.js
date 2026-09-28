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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'ID produk wajib diisi' },
        { status: 400 }
      );
    }

    // 🔥 Cari stok berdasarkan resepId
    const stok = await prisma.stokBarang.findUnique({
      where: { resepId: id },
      include: {
        resep: true
      }
    });

    if (!stok) {
      return NextResponse.json(
        { message: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: stok.id,
      resepId: stok.resepId,
      namaBarang: stok.resep.namaBarang,
      gambarBarang: stok.resep.gambarBarang || null,
      deskripsi: stok.resep.deskripsi || '',
      hargaKoin: stok.resep.hargaKoin,
      stok: stok.jumlahStok
    }, { status: 200 });

  } catch (error) {
    console.error('Error get product:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  } finally {
    // disconnect removed
  }
}